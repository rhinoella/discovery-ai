import os
from flask import Flask, Response, request, jsonify
from supabase import create_client, Client
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from langchain.schema import Document
from langchain.retrievers.self_query.base import SelfQueryRetriever 
from langchain.chains.retrieval_qa.base import RetrievalQA
from langchain_openai.chat_models import ChatOpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from firebase_admin import storage
import firebase_admin
from firebase_admin import credentials, firestore
import tempfile
from pdf2image import convert_from_path
import pytesseract
import cv2
import base64
from openai import OpenAI
from flask_cors import CORS


client = create_client("https://htbkghbygiyuncrzxkhq.supabase.co", "..")
openAIEmbeddings = OpenAIEmbeddings(api_key="")
llm = ChatOpenAI(model="gpt-4o", api_key="")
vectorStore = SupabaseVectorStore(client, openAIEmbeddings, "documents")
cred = credentials.Certificate("")
firebase_admin.initialize_app(cred, {"storageBucket": ""})
openAIClient = OpenAI(api_key="")

db = firestore.client()


bucket = storage.bucket()
app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    message = ""
    if request.is_json:
        data = request.get_json()
        message = data.get('message', [])
    else:
        message = request.form.get("message")

    allData = []

    completion = openAIClient.chat.completions.create(model="gpt-4o", messages=[{"role": "system", "content": "Here is a list of all the evidence and technical analysis of it. Be able to answer any of the data and answer like a lawyer. Evidence: " + allData}, {"role": "user", "content": [
        {"type": "text", "text": message}
     ],
    }])

    return completion.choices[0].message.content


@app.route("/discovery", methods=["POST"])
def discover():

    if request.is_json:
        data = request.get_json()
        array = data.get('data', [])
    else:
        array = request.form.getlist('data')
    
    # Do something with the array
    print(array)
    discovery(array)
    
    return jsonify({"status": "success"})


def discovery(data):
    allData = {}
    for oneData in data:
        if (".png" in oneData):
            text, name = understandImage(oneData)
            # oneData = oneData.split(".")[0]
            print(oneData)
            print(name)
            db.collection("case").document(oneData).set({"type": "image", "description": ("Analysis: " + text), "name": name})
            allData[oneData] = "Evidence Analysis: " + text

        elif (".mp3" in oneData):
            transcription, analysis, name = understandAudio(oneData)
            # oneData = oneData.split(".")[0]
            db.collection("case").document(oneData).set({"type": "audio", "description": ("Transcription: " + transcription + ", Analysis: " + analysis), "name": name})
            allData[oneData] =  "Evidence Transcription: " + transcription + ", Analysis: " + analysis

        elif (".mp4" in oneData):
            text, name = understandVideo(oneData)
            # oneData = oneData.split(".")[0]
            db.collection("case").document(oneData).set({"type": "video", "description": ("Analysis: " + text), "name": name})
            allData[oneData] = "Evidence Analysis: " + text


        elif (".pdf" in oneData):
            text, analysis, name = understandPDF(oneData)
            # oneData = oneData.split(".")[0]
            db.collection("case").document(oneData).set({"type": "pdf", "description": ("Transcription: " + text + ", Analysis: " + analysis), "name": name})
            allData[oneData] = "Evidence Transcription: " + text
    
    
    completion = openAIClient.chat.completions.create(model="gpt-4o", messages=[{"role": "system", "content": "You are an amazing detective that is great at piecing together several evidences to create exhibits. Format the exhibits you create from the evidence provided like this, X is given the filename: X.pdf,X.mp3;X.mp4;X.pdf,X.pdf"}, {"role": "user", "content": [
        {"type": "text", "text": "Given X,Y,Z are example file names of evidence. Only return to me text like this, where each filename is seperated by a comma and each exhbit is seperated by a semicolon X,Y;Z;Z,Y"}, {"type": "text", "text": "Here is all the evidences: " + str(allData)}
     ],
    }])

    allExhibits = (completion.choices[0].message.content)
   
    allExhibits = allExhibits.split(";")

    alphabet = "abcdefghijklmnopqrstuvwxyz"
    for oneExhibit in range(len(allExhibits)):
        data = allExhibits[oneExhibit].split(",")
        print("Exhibits: " + str(allExhibits))
        print("Data: " + str(data))
        print("All Data: " + str(allData))
        allEvidenceText = ""

        for one in data:
            allEvidenceText += allData.get(one)
        completion = openAIClient.chat.completions.create(model="gpt-4o", messages=[{"role": "system", "content": "You are an amazing detective that is great at piecing together several evidences to create exhibits. Given this exhibit you generated, give me a 2 sentence summary of it and why it is relevant to the case."}, {"role": "user", "content": [
            {"type": "text", "text": "Here is all the evidences from this exhibit: " + allEvidenceText}
    ],
}])

        exhibitSumary = (completion.choices[0].message.content)
        db.collection("exhibits").document(alphabet[oneExhibit].upper()).set({"data": data, "summary": exhibitSumary})



def understandAudio(uri):
      
    tempFileURI = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
    tempFileURI.close() 

    blobURI = bucket.blob(uri)
    blobURI.download_to_filename(tempFileURI.name)

    audio = openAIClient.audio.transcriptions.create(
    model="whisper-1",
    file=open(tempFileURI.name, "rb"))
    completion = openAIClient.chat.completions.create(model="gpt-4o", messages=[{"role": "system", "content": "You are an amazing detective that is great at understanding audio transcriptions and analyzing them for evidence. Summarize these transcriptions and find important details that can be used in cour in 2 sentences."}, {"role": "user", "content": [
        {"type": "text", "text": f"The audio transcription is: {audio.text}"}
     ],
    }])
    completionName = openAIClient.chat.completions.create(model="gpt-4o", messages=[{"role": "system", "content": "You are an amazing detective that is great at understanding audio transcriptions and analyzing them for evidence."}, {"role": "user", "content": [
        {"type": "text", "text": f"Give me a good name for this audio transcription: {audio.text}"}
     ],
    }])
    return audio.text, completion.choices[0].message.content, completionName.choices[0].message.content 


def understandPDF(uri):
    
    tempFileURI = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
    tempFileURI.close() 

    blobURI = bucket.blob(uri)
    blobURI.download_to_filename(tempFileURI.name)

    extractedText = (extractTextWithOCR(tempFileURI.name))
    gptAnalysis, gptName = (askGPT(extractedText))
    # Delete the temporary file
    os.remove(tempFileURI.name)
    print(f'Temporary file {tempFileURI.name} deleted.')

    return extractedText, gptAnalysis, gptName

def extractTextWithOCR(pdf_path):
    text = ""
    try:
        images = convert_from_path(pdf_path)
        for image in images:
            text += pytesseract.image_to_string(image)
    except Exception as e:
        print(f"Error extracting text with OCR: {e}")
    return text    

# Function to extract frames
def extractFrames(video_path):
   # Open the video file
    video_capture = cv2.VideoCapture(video_path)
    encoded_frames = []
    frame_rate = video_capture.get(cv2.CAP_PROP_FPS)  # Frame rate of the video
    frame_interval = int(frame_rate)  # Number of frames to skip

    success, frame = video_capture.read()
    count = 0

    while success:
        if count % frame_interval == 0:
            # Encode frame as JPEG
            _, buffer = cv2.imencode('.jpg', frame)
            # Convert to base64
            encoded_frame = base64.b64encode(buffer).decode('utf-8')
            encoded_frames.append(encoded_frame)
        success, frame = video_capture.read()
        count += 1

    video_capture.release()
    return encoded_frames

def analyzeFrames(frames):
    allFrameContent = [{"type": "text", "text": "The following images are frames in the video. Analyze them as a whole and let me know what the video is about."}]

    for oneFrame in frames:
        allFrameContent.append({"type": "image_url", "image_url": {"url": f"data:image/png;base64," + oneFrame}})
    
    completion = openAIClient.chat.completions.create(model="gpt-4o", messages=[{"role": "system", "content": "You are an investigative detective that is amazing at giving accurate descriptions by understanding videos given frames of it. Provide me two sentences of evidence that can be used in court. The first section give me a description of what I'm watching. The second section give me an analysis of what is happening in the eyes of an detective." }, {"role": "user", "content": allFrameContent}])
    completionName = openAIClient.chat.completions.create(model="gpt-4o", messages=[{"role": "system", "content": "You are an investigative detective that is amazing at giving accurate descriptions by understanding of videos. Given this summary of the video please think of a name for it." }, {"role": "user", "content": "Here is the summary of the video. Please think of a name for it. Summary: " + completion.choices[0].message.content }])

    return completion.choices[0].message.content, completionName.choices[0].message.content 

def understandImage(uri):
    tempFileURI = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    tempFileURI.close() 

    blobURI = bucket.blob(uri)
    blobURI.download_to_filename(tempFileURI.name)
    with open(tempFileURI.name, "rb") as imageFile:
        encodedImage = base64.b64encode(imageFile.read()).decode('utf-8')
        allFrameContent = [{"type": "text", "text": "You are an investigative detective. Please look through these images and analyze them."}, {"type": "image_url", "image_url": {"url": f"data:image/png;base64," + encodedImage}}]

        completion = openAIClient.chat.completions.create(model="gpt-4o", messages=[{"role": "system", "content": "You are an investigative detective that is amazing at giving accurate descriptions by understanding of images. Provide me two sentences of evidence that can be used in court. The first section give me a description of what I'm looking at. The second section give me an analysis of what is happening in the eyes of an detective." }, {"role": "user", "content": allFrameContent}])

        completionName = openAIClient.chat.completions.create(model="gpt-4o", messages=[{"role": "system", "content": "You are an investigative detective that is amazing at giving accurate descriptions by understanding of images. Given this summary of the image please think of a name for it." }, {"role": "user", "content": "Here is the summary of the image. Please think of a name for it. Summary: " + completion.choices[0].message.content }])


        return completion.choices[0].message.content, completionName.choices[0].message.content

def understandVideo(uri):
    tempFileURI = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    tempFileURI.close() 

    blobURI = bucket.blob(uri)
    blobURI.download_to_filename(tempFileURI.name)

    frames = extractFrames(tempFileURI.name)
    return (analyzeFrames(frames))

def askGPT(question):
    messageHistory = [
    (
        "system",
        "You are a legal professional and a lawyer that is fully versed in the language of law. Please summarize and explain this document to provide a deep understanding with 3 sentences.",
    ),
    ("human", question),
    ]
    
    explain = llm.invoke(messageHistory).content
    
    nameMessageHistory = [
    (
        "system",
        "You are a legal professional and a lawyer that is fully versed in the language of law. Please give me a name for this pdf given the summary of it: " + explain,
    ),
    ("human", question),
    ]
    name = llm.invoke(nameMessageHistory).content
    return explain, name

app.run(debug=True)