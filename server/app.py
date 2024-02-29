import base64
import json
import logging
import threading
import regex as re
import os

from flask import Flask, render_template, session, request
from flask_sock import Sock
import requests

import json

import firebase_admin
from firebase_admin import credentials, messaging


import google.auth.transport.requests

from SpeechClientBridge import SpeechClientBridge
from google.cloud.speech import RecognitionConfig, StreamingRecognitionConfig
from google.oauth2 import service_account

PROJECT_ID = 'shascam-92eb8'
BASE_URL = 'https://fcm.googleapis.com'
FCM_ENDPOINT = 'v1/projects/' + PROJECT_ID + '/messages:send'
FCM_URL = BASE_URL + '/' + FCM_ENDPOINT
SCOPES = ['https://www.googleapis.com/auth/firebase.messaging']

def _get_access_token():
  """Retrieve a valid access token that can be used to authorize requests.

  :return: Access token.
  """
  credentials = service_account.Credentials.from_service_account_file(
    'shascam-92eb8-firebase-adminsdk-46vh5-49c54f35dd.json', scopes=SCOPES)
  request = google.auth.transport.requests.Request()
  credentials.refresh(request)
  return credentials.token

def _send_fcm_message(fcm_message):
  """Send HTTP request to FCM with given message.

  Args:
    fcm_message: JSON object that will make up the body of the request.
  """
  # [START use_access_token]
  headers = {
    'Authorization': 'Bearer ' + _get_access_token(),
    'Content-Type': 'application/json; UTF-8',
  }
  # [END use_access_token]
  resp = requests.post(FCM_URL, data=json.dumps(fcm_message), headers=headers)

  if resp.status_code == 200:
    print('Message sent to Firebase for delivery, response:')
    print(resp.text)
  else:
    print('Unable to send message to Firebase')
    print(resp.text)

def _build_common_message(title, message):
  """Construct common notifiation message.

  Construct a JSON object that will be used to define the
  common parts of a notification message that will be sent
  to any app instance subscribed to the news topic.
  """
  return {
    'message': {
      'token': os.environ.get('FCM_TOKEN'),
      'notification': {
        'title': title,
        'body': message
      }
    }
  }


global lastMessages, numMessages, infResponse
lastMessages = []
numMessages = 0
infResponse = None

app = Flask(__name__)
sockets = Sock(app)

HTTP_SERVER_PORT = 8080

config = RecognitionConfig(
    encoding=RecognitionConfig.AudioEncoding.MULAW,
    sample_rate_hertz=8000,
    language_code="en-US",
    model="phone_call"
)

_send_fcm_message(_build_common_message("", "Server started")) # TODO: remove this

streaming_config = StreamingRecognitionConfig(config=config, interim_results=True)


@app.route('/stream', methods=['POST'])
def stream():
    # pnumber = request.values.get("pnumber")
    # return render_template("templates/streams.xml", pnumber=pnumber)
    return render_template("streams.xml")

def on_transcription_response(response):
    global lastMessages, numMessages, infResponse
    
    if not response.results:
        return

    result = response.results[0]
    if not result.alternatives:
        return

    transcription = result.alternatives[0].transcript.strip()
    if len(lastMessages) == 0:
        lastMessages.append(transcription)
    if transcription.startswith(lastMessages[-1]):
        lastMessages[-1] = transcription
    elif lastMessages[-1].startswith(transcription):
        pass
    else:
        lastMessages.append(transcription)
    totalMessages = len(" ".join(lastMessages).split(" "))
    if totalMessages - numMessages >= 12:
        message = " ".join(lastMessages)
        numMessages = totalMessages
        print("TRANSCRIPT:", message)
        infResponse = generate(message)
        print(infResponse)
        category = infResponse.split("\n")[0]
        if "Likely" in category or "Very Likely" in category:
            curr_message = "🧌 Beware! Scam likely!"
            msg = _build_common_message("", curr_message)
            _send_fcm_message(msg)
            # send_notification(
            #     token="enIW2ENhekvnvEys077CkM:APA91bG0Zbqgl7r_BY7VX3RmNPbyMmL7qvQXy_vPx8bb3n_UL7jtrGu8K6y_ZccceXsxCTegUbvj_fDtCUAVywyf5tcY15eBsBdJcmXo1HDnw2_LQhM1blorUpHjDk9UfWO3jrDXQUps",
            #     # TODO: make env variable
            #     # token="cJFlg2RjXENShemCj0klZZ:APA91bED_Czt--ZpMynY5pMmrT2Owfj6fNaHBFtiFNMJYjXeVmPs00UznYpUtrzs8kETLKzwVPRyCTbo8K1-SI610C7UK1wFOEto975h8AgPVi9Fzbz9SVfcZEXzBLI0EUx4nHBl8-FW",
            #     title="", 
            #     message=curr_message
            # )
                

        
@app.route('/scam_detect', methods=['GET'])
def scam_detect():
    global infResponse
    if infResponse != None and infResponse != "":
        print("infresponse: ", infResponse)
        fields = re.split(r"\n+", infResponse.strip())
        print(fields)
        category = fields[0]
        if "Likely" in category:
            json_res = {
                "category": fields[0],
                "justify": fields[1],
                "action": fields[2]
            }
        else:
            json_res = {
                "category": fields[0],
                "justify": fields[1],
                "action": None
            }
        return json.dumps(json_res)
    else:
        return json.dumps({"category": None})

@sockets.route('/media')
def echo(ws):
    global lastMessages, numMessages, infResponse
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
            lastMessages = []
            numMessages = 0
            infResponse = "" # not sure if this will break it
            break

    bridge.terminate()
    print("WS connection closed")


# @app.route('/generate', methods=['GET', 'POST'])
def generate(curr_text):
    input_ = """
```system
You are an AI assistant tasked with classifying cell phone conversations as scam calls.
I will provide you examples of scam call topics and patterns, the format in which you should respond, and finally the transcript of the call in question.
I want you to analyze the transcript and decide whether the transcript describes a scam call or a normal call.
On one line, state 1 of the 4 following categories: "Very Likely Scam", "Likely Scam", "Unlikely Scam", "Very Unlikely Scam." 
On the next line, add a 2-3 sentence justification for your decision.
If the category is Unlikely or Very Unlikely, then you are done. However, if the category is Very Likely or Likely, provide an instruction for the user on the third line. Examples of instructions are "You should hang up immediately.", "Do NOT give any personal information.", "You should ask why they need this information.", or "You should ask for identification."
Remember, the category, justification, and instruction (if applicable) should be on their own separate lines. Do not allocate more than one line each for any category, justification, or instruction.
However, be SURE not to identify false positive scams. Casual conversations between friends are not likely to be scams.
```

```scam_examples
- Illegitimate/fake company names ('Windows service center' or 'US Grants and Treasury Department')
- Giving 2 options (no option to decline): ex. Appointment for home improvement technician: spammer asks if the customers prefers 2:30pm or 4pm.
- Make promises throughout the call (ex. free estimate with no obligation, easy cancellation, a lifetime warranty)
- Introducing a threatening scenario such as “your computer is getting infected” or “your air duct system is badly contaminated”
- Convincing the customer to make a payment (ex. by giving credit card information or home address for the bill)
```

```response_example
Likely Scam
The caller's sudden change of topic to asking for a credit card number, the use of informal language, and the lack of a clear reason for needing the credit card number are all strong indicators of a scam call.
Try asking, "Why do you need my credit card number? Can you explain the reason for this request?"
```

```transcript
""" + curr_text + """
```

```assistant
"""
    url = "https://api.together.xyz/v1/completions"
    payload = {
        # "model": "meta-llama/Llama-2-13b-chat-hf",
        "model": "mistralai/Mixtral-8x7B-Instruct-v0.1",
        "prompt": input_,
        "max_tokens": 256,
        "stop": ["```"],
        "temperature": 0.1,
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
    print(res)
    return res["choices"][0]["text"]


# def send_notification(token, title, message, ):
#     api_accesskey = "AAAAQzwz1Ns:APA91bElRlZYgYMVD7uysJVuH0szueLgH3BJBuw8DIjJiD0FQJIVtclj-b033EcgiEcKedmxaJttVwbs8lm5Vi4hsrUXNHx_l3jWH7fgU0Rwom7bU2-0xTzBFQKX67v0RcaE5-ISeJ83"
#     # url = 'https://fcm.googleapis.com/fcm/send'
#     url = "https://fcm.googleapis.com/v1/projects/shascam-92eb8/messages:send"
#     headers = {
#         'Authorization': 'key=' + api_accesskey,
#         'Content-Type': 'application/json'
#     }
#     data = {
#         'notification': {
#             'title': title,
#             'body': message,
#             'icon': 'myIcon',  # Customize as needed
#             'sound': 'mySound'  # Customize as needed
#         },
#         'to': token
#     }
#     response = requests.post(url, headers=headers, data=json.dumps(data))
#     if response.status_code == 200:
#         print("Notification sent successfully.")
#     else:
#         print("Failed to send notification. Status code:", response.status_code)






if __name__ == '__main__':
    app.logger.setLevel(logging.DEBUG)
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler

    server = pywsgi.WSGIServer(('', HTTP_SERVER_PORT), app, handler_class=WebSocketHandler)
    print("Server listening on: http://localhost:" + str(HTTP_SERVER_PORT))
    server.serve_forever()