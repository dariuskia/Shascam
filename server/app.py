import base64
import json
import logging

from flask import Flask, render_template
from flask_sock import Sock

app = Flask(__name__)
sockets = Sock(app)

HTTP_SERVER_PORT = 8080

@app.route('/stream', methods=['POST'])
def stream():
    # pnumber = request.values.get("pnumber")
    # return render_template("templates/streams.xml", pnumber=pnumber)
    return render_template("streams.xml")

@sockets.route('/media')
def echo(ws):
    print("hello")
    app.logger.info("Connection accepted")
    # A lot of messages will be sent rapidly. We'll stop showing after the first one.
    while True:
        data = ws.receive()
        print(type(data), data)


if __name__ == '__main__':
    app.logger.setLevel(logging.DEBUG)
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler

    server = pywsgi.WSGIServer(('', HTTP_SERVER_PORT), app, handler_class=WebSocketHandler)
    print("Server listening on: http://localhost:" + str(HTTP_SERVER_PORT))
    server.serve_forever()
