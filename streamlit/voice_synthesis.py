import os
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from elevenlabs import play

load_dotenv()

client = ElevenLabs(
    api_key="sk_048dd5dd98470ba9cae52030962899379b88d190fd16aa76",
)

def get_voice_list():
    voices = client.voices.get_all()
    return voices["voices"]

def synthesize_ssml(ssml, voice_id="21m00Tcm4TlvDq8ikWAM", model="eleven_monolingual_v1", output_format="mp3_44100_128"):
    print(ssml)
    response = client.text_to_speech.convert(
        text=ssml,
        voice_id="JBFqnCBsd6RMkjVDRZzb",
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128"
    )
    return response

if __name__ == "__main__":
    audio = synthesize_ssml("Hello there.")
    with open("output.mp3", "wb") as out:
        out.write(audio)
    play(audio)
