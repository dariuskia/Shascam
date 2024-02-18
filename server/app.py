import base64
import json
import logging
import threading

from flask import Flask, render_template, session, request
from flask_sock import Sock
import requests


from SpeechClientBridge import SpeechClientBridge
from google.cloud.speech import RecognitionConfig, StreamingRecognitionConfig

global lastMessages
lastMessages = []

app = Flask(__name__)
sockets = Sock(app)

HTTP_SERVER_PORT = 8080

config = RecognitionConfig(
    encoding=RecognitionConfig.AudioEncoding.MULAW,
    sample_rate_hertz=8000,
    language_code="en-US",
    model="phone_call"
)

streaming_config = StreamingRecognitionConfig(config=config, interim_results=True)


@app.route('/stream', methods=['POST'])
def stream():
    # pnumber = request.values.get("pnumber")
    # return render_template("templates/streams.xml", pnumber=pnumber)
    return render_template("streams.xml")

def on_transcription_response(response):
    global lastMessages
    
    if not response.results:
        return

    result = response.results[0]
    if not result.alternatives:
        return

    transcription = result.alternatives[0].transcript.strip()
    if len(lastMessages) == 0 or (not transcription.startswith(lastMessages[-1])):
        lastMessages.append(transcription)
    else:
        lastMessages[-1] = transcription
    print(lastMessages)

@sockets.route('/media')
def echo(ws):
    print("WS connection opened")
    bridge = SpeechClientBridge(streaming_config, on_transcription_response)
    t = threading.Thread(target=bridge.start)
    t.start()

    while True:
        message = ws.receive()
        if message is None:
            bridge.add_request(None, None)
            bridge.terminate()
            break

        data = json.loads(message)
        # print(data)
        if data["event"] in ("connected", "start"):
            print(f"Media WS: Received event '{data['event']}': {message}")
            continue
        if data["event"] == "media":
            media = data["media"]
            chunk = base64.b64decode(media["payload"])
            bridge.add_request(chunk)
        if data["event"] == "stop":
            print(f"Media WS: Received event 'stop': {message}")
            print("Stopping...")
            ws.close()
            break

    bridge.terminate()
    print("WS connection closed")


@app.route('/generate', methods=['GET', 'POST'])
def generate():
    curr_text = request.json["transcript"]
    input_ = """
    ```system
    You are an AI assistant tasked with classifying cell phone conversations as scam calls.
    I will provide you the general structure for scam calls, examples of scam call topics and patterns, and finally the transcript of the call in question. 
    I want you to analyze the transcript and decide whether the transcript describes a scam call or a normal call. 
    Respond only with 1 of the 5 following categories: "Very Likely Scam", "Likely Scam", "Meh", "Unlikely Scam", "Very Unlikely Scam."
    Do NOT give a justification or any other text after or before your decided category.

    ```timeline
    Greeting (e.g., 'Hello') 
    Self identification (Name of the call agent) 
    Company identification (Name of the business) 
    Warm up talk (e.g., 'How are you today?') 
    Statement of the reason of the call 
    Callee identity check (callee's name and attribute) 
    ```

    ```examples
    Illegitimate/fake company names ('Windows service center' or 'US Grants and Treasury Department')
    Giving 2 options (no option to decline): ex. Appointment for home improvement technician: spammer asks if the customers prefers 2:30pm or 4pm. 
    Make promises throughout the call (ex. free estimate with no obligation, easy cancellation, a lifetime warranty)
    Introducing a threatening scenario such as “your computer is getting infected” or “your air duct system is badly contaminated”
    Convincing the customer to make a payment (ex. by giving credit card information or home address for the bill)
    ```

    ```transcript 
    """ + curr_text + """
    ```

    ```assistant
    """

    url = "https://api.together.xyz/v1/completions"
    payload = {
        "model": "meta-llama/Llama-2-13b-chat-hf",
        "prompt": input_,
        "max_tokens": 16,
        "stop": ["```"],
        "temperature": 0.7,
        "top_p": 0.7,
        "top_k": 50,
        "repetition_penalty": 1,
        "n": 1
    }

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "Authorization": "Bearer 28b95c36819576c23c67342a36ea9a65584b477eef1cba12ae4778db4bea77b4"
    }

    response = requests.post(url, json=payload, headers=headers)
    res = json.loads(response.text)
    return res["choices"][0]["text"]


    # # data = request.get_json()
    # prompt = data.get("prompt", 
    # "transcript: Hello, is this Bob Smith? Yes, this is he. I’m John, calling from the Social Security Administration. It has come to our attention that there has been suspicious activity on your account spread out over the last six months. Due to participation in highly illicit activities, we have contacted law enforcement agencies to suspend your social security number effective immediately. What? I haven’t done anything illegal. Could my identity have gotten stolen? I was emailed about a breach in a government database recently... Tracing your account activity over the past 10 years, it does seem likely that this recent string of activity is due to someone else using your identity for their illicit activity -- timeline: Greeting (e.g., ’Hello’) \n Self identification (Name of the call agent) \n Company identification (Name of the business) \n Warm up talk (e.g., ’How are you today?’) \n Statement of the reason of the call \n Callee identity check (callee’s name and attribute) ")
    # max_length = data.get("max_length", 50)  # Default length, adjust as needed
    
    # Generate text
    # output = llama_pipeline(prompt, max_length=max_length, return_full_text=False)
    # return jsonify(output)




if __name__ == '__main__':
    app.logger.setLevel(logging.DEBUG)
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler

    server = pywsgi.WSGIServer(('', HTTP_SERVER_PORT), app, handler_class=WebSocketHandler)
    print("Server listening on: http://localhost:" + str(HTTP_SERVER_PORT))
    server.serve_forever()
