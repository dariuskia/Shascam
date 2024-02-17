import base64
import json
import logging
import threading

from flask import Flask, render_template, session
from flask_sock import Sock

from SpeechClientBridge import SpeechClientBridge
from google.cloud.speech import RecognitionConfig, StreamingRecognitionConfig


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
    if not response.results:
        return

    result = response.results[0]
    if not result.alternatives:
        return

    transcription = result.alternatives[0].transcript
    print("Transcription: " + transcription)

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
            print(data)
            media = data["media"]
            chunk = base64.b64decode(media["payload"])
            bridge.add_request(chunk, media["track"])
        if data["event"] == "stop":
            print(f"Media WS: Received event 'stop': {message}")
            print("Stopping...")
            ws.close()
            break

    bridge.terminate()
    print("WS connection closed")


        



if __name__ == '__main__':
    app.logger.setLevel(logging.DEBUG)
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler

    server = pywsgi.WSGIServer(('', HTTP_SERVER_PORT), app, handler_class=WebSocketHandler)
    print("Server listening on: http://localhost:" + str(HTTP_SERVER_PORT))
    server.serve_forever()
