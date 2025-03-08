from google import genai
import streamlit as st

client = genai.Client(api_key="AIzaSyD_AM1vtBozbFogrkUUoviWmljs78KBLkI")

system_prompt = """You are a meditation generator. You generate a meditation based on the user's input.
- The meditation should be about {time} minutes long.
- You can use the tag "emphasis" this way: <emphasis level="strong">This is an important announcement</emphasis> with level being one of: none, reduced, moderate, strong.
- The meditation will be read by a voice assistant, so pause for a few seconds between sentences using <break time="Xs"/>. You can only enter a time in seconds and lower than 5.
- Regularly make longer pauses using the [PAUSE=X] command to let the user relax for X seconds.
For long meditation, use the PAUSE command with to let the user relax for a few minutes, eg [PAUSE=60] for 1 minute.
RESPECT THE TIME: {time} minutes total.
"""

human_prompt = """Generate a meditation using the following prompt:
{user_input}

Make sure to add multiple breaks and pauses to respect the time: {time} minutes total.
Write the meditation in {language}."""


def generate_text_v1(input_text, time, language):
    prompt = system_prompt.format(time=time) + "\n\n" + human_prompt.format(user_input=input_text, language=language, time=time)

    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt
    )

    meditation = response.text

    with st.status("Generating text...", expanded=True) as status:
        placeholder = st.empty()
        placeholder.markdown(meditation + "▌")
        placeholder.markdown(meditation)
        status.update(label="Text generation complete!", state="complete", expanded=False)

    return meditation


def generate_text_v2():
    pass
