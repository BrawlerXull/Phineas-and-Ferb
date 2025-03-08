import wave
import io
import re
import base64
import numpy as np
import streamlit as st
from streamlit.components.v1 import html

from voice_synthesis import synthesize_ssml
from text_generation import generate_text_v1

TESTING = True

st.set_page_config(
    page_title="Meditator",
    page_icon=":sun:",
    layout="centered",
    initial_sidebar_state="expanded" if TESTING else "collapsed",
    menu_items={
        'Report a bug': 'https://github.com/theevann/meditator/issues',
        'About': "https://github.com/theevann/meditator/"
    }
)

st.markdown(
    f"""
     <style>
     body .stApp {{
         background: url(data:image/png;base64,{base64.b64encode(open("images/background.png", "rb").read()).decode()});
         background-repeat: no-repeat;
         background-position: right 50% bottom 95%;
         background-size: cover;
         background-attachment: scroll;
     }}
     .stApp > div > section:first-child {{
         background-color: rgba(200, 200, 200, 0.7);
     }}
     .main > .block-container {{
            background-color: rgba(190, 190, 190, 0.65);
            border-radius: 10px;
            margin-top: 3.5em;
            padding-top: 1em;
            padding-bottom: 1em;
     }}
     header {{
            background-color: rgba(255, 255, 255, 0.5)!important;
     }}
     </style>
     """,
    unsafe_allow_html=True,
)

languages = {
    "en-US": "English (US)",
    "en-GB": "English (GB)",
    "fr-FR": "French",
    "es-ES": "Spanish",
    "it-IT": "Italian",
    "de-DE": "German",
    "ru-RU": "Russian",
}

musics = {
    "No Music": [None, 0],
    "Deep Sound": ["musics/music_1.wav", 0.5],
    "Water Sound": ["musics/music_2.wav", 0.25],
}

### Start of app

st.title("Meditator")

with st.form("my_form"):
    col1, col2, col3 = st.columns([1, 1, 1])
    gender = col3.radio("Select voice gender:", ["MALE", "FEMALE"])
    locale = col1.selectbox("Select language:", languages.keys(), format_func=lambda language: f"{languages[language]}")
    music = col2.selectbox("Select music:", list(musics.keys()), format_func=lambda music: f"{music}", index=1)
    text = st.text_input("Optional meditation theme:", max_chars=100, placeholder="What do you want this meditation to be about?", help="You can write for instance: Relaxation, Sleep, Peace, Joy, Sounds, Inner Child, etc.")
    clicked = st.form_submit_button("Generate!", type="primary", use_container_width=True)

with st.sidebar:
    st.title("Advanced options")
    st.header("Text generation")
    time = st.slider("Wanted duration (in minutes):", 1, 15, 5, 1)
    max_tokens = st.slider("Max tokens:", 10, 4000, 100, 10) if TESTING else 2000
    st.markdown("---")
    st.header("Voice generation")
    sentence_break_time = st.slider("Sentence break time (in seconds):", 1., 5., 1.5, 0.5)
    speaking_rate = st.slider("Speaking rate:", 0.5, 1.0, 0.75, 0.01)

if clicked:
    try:
        # Log input parameters
        st.write(f"Generating meditation with: text='{text}', time={time}, language='{languages[locale]}'")

        # Generate meditation text
        meditation_text = generate_text_v1(text, time=time, language=languages[locale])
        st.session_state.meditation = meditation_text
        st.write("Generated meditation text:", meditation_text[:500])  # Show preview of the text

        # Generate voice synthesis
        st.write(f"Synthesizing voice with model='eleven_multilingual_v2', locale='{locale}', speaking_rate={speaking_rate}")
        elevenlabs_voice_ids = {
            "en-US": "your_valid_voice_id_for_en_US",
            "en-GB": "your_valid_voice_id_for_en_GB",
            "fr-FR": "your_valid_voice_id_for_fr_FR",
            "es-ES": "your_valid_voice_id_for_es_ES",
            "it-IT": "your_valid_voice_id_for_it_IT",
            "de-DE": "your_valid_voice_id_for_de_DE",
            "ru-RU": "your_valid_voice_id_for_ru_RU",
        }

        voice_id = elevenlabs_voice_ids.get(locale, "21m00Tcm4TlvDq8ikWAM")  # Use a default voice if not found

        voice_data = synthesize_ssml(st.session_state.meditation, voice_id, locale, speaking_rate)


        # Log response type
        st.write(f"Voice data type: {type(voice_data)}")
        import types  # ✅ Add this at the top of your script

        if isinstance(voice_data, (bytes, bytearray)):
            st.session_state.voice = voice_data
        elif isinstance(voice_data, (list, tuple, io.BytesIO, types.GeneratorType)):  # ✅ Correct way to check for a generator
            st.session_state.voice = b"".join(voice_data)  # Convert generator output to bytes
        else:
            st.write("Error: Unexpected voice data format")
            st.session_state.voice = None


    except Exception as e:
        st.error(f"An error occurred: {e}")
        st.write("Error details:", str(e))

if st.session_state.get("voice", False):
    try:
        st.audio(st.session_state.voice, format="audio/wav")
        st.download_button("Download meditation", data=st.session_state.voice, file_name="meditation.wav", mime="audio/wav", use_container_width=True)
    except Exception as e:
        st.error(f"Error playing audio: {e}")
        st.write("Audio error details:", str(e))
