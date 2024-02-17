from flask import Flask, request
from twilio.twiml.voice_response import VoiceResponse, Dial
import json
from twilio.rest import Client
from flask import jsonify

app = Flask(__name__)

@app.route("/voice", methods=['GET', 'POST'])
def voice():
    """Respond to incoming phone calls with a 'Hello world' message"""
    # Start our TwiML response
    resp = VoiceResponse()

    # Read a message aloud to the caller
    resp.say("Hello world!")

    return str(resp)

@app.route("/incoming_call", methods=['GET', 'POST'])
def incoming_call():
    """Responds to incoming calls with a simple text-to-speech message."""
    resp = VoiceResponse()

    # Greet the caller with a message
    resp.say("Hello, thank you for calling! Please leave a message after the beep. Random stuff to make the call longerrrrrrr.", voice='alice')

    account_sid = "ACcec9701b439a57f835ebb6a94eed66b1"
    auth_token = "be43f5e825751dcdea2ef2ff268b657b"
    client = Client(account_sid, auth_token)
    dial = Dial()
    Dial().conference(
        'Final',
        start_conference_on_enter=True,
        end_conference_on_exit=True)
    caller_add = request.values['call_in']
    participant = client.conferences("Final").participants.create(
        from_="+18336814644",
        to=caller_add)

    return str(resp)

if __name__ == "__main__":
    app.run(debug=True, port=5002)
