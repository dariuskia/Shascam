# import scrapetube
# from youtube_transcript_api import YouTubeTranscriptApi

# videos = scrapetube.get_channel(channel_url="https://www.youtube.com/@ToaoDotNet")
# videos = [video for video in videos]

from langchain.text_splitter import CharacterTextSplitter
from langchain_together import Together
from textwrap import dedent
import os

llm = Together(
    model="NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO",
    temperature=0.1,
    max_tokens=8192,
    top_k=1,
    together_api_key="8d95b7be50fb95563ac06056642c0c160a9c46424755c2ae9e5813f597dcc0d5",
)


PROMPT_TEMPLATE = dedent("""\
    ```system
    You are an AI assistant tasked with classifying cell phone conversations as scam calls.
    I will provide you the general structure for scam calls, examples of scam call topics and patterns, and finally the transcript of the call in question. 
    I want you to analyze the transcript and decide whether the transcript describes a scam call or a normal call. 
    Respond only with 1 of the 4 following categories: "Very Likely Scam", "Likely Scam", "Unlikely Scam", "Very Unlikely Scam." On a new line add a 2-3 sentence justification for each decision.
	Give the following extraneous information on a new line depending on the decided category:
        Very Likely: Provide an action for the user to do. For example, "Hang up immediately.", or "Do NOT give any personal information."
        Likely: Provide clarifying questions for the user to ask. For example, "Why do you need this information?"
        Unlikely: Do NOT provide any actions or questions for the user to do.
        Very Unlikely: Do NOT provide any actions or questions for the user to do.
    ```

    ```structure
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
    {curr_text}
    ```

    ```assistant\
""")

import pickle
from tqdm import tqdm

text_splitter = CharacterTextSplitter.from_tiktoken_encoder(chunk_size=4096, chunk_overlap=0)
transcript_fns = os.listdir("./transcripts")[0:150]
outputs = {
    "prompts": [],
    "outputs": []
}
for transcript_fn in tqdm(transcript_fns):
    transcript_txt = open(f"./transcripts/{transcript_fn}", "r").read()
    if not transcript_txt:
        continue
    text_splitter = CharacterTextSplitter.from_tiktoken_encoder(chunk_size=4096, chunk_overlap=0)
    transcript_txt = text_splitter.split_text(transcript_txt)
    prompt = PROMPT_TEMPLATE.format(curr_text=transcript_txt)
    output = llm.invoke(prompt, stop=["```"])
    outputs["prompts"].append(prompt)
    outputs["outputs"].append(output)
    pickle.dump(outputs, open("outputs.pkl", "wb"), protocol=pickle.HIGHEST_PROTOCOL)


pickle.dump(outputs, open("outputs.pkl", "wb"), protocol=pickle.HIGHEST_PROTOCOL)