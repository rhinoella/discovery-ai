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


client = create_client("https://htbkghbygiyuncrzxkhq.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0YmtnaGJ5Z2l5dW5jcnp4a2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkxMzYxNzIsImV4cCI6MjAzNDcxMjE3Mn0.2mEHWNDnAVEYEUUEE3fYKs-tDnG_zPEYK0tXIEXGdgE")
openAIEmbeddings = OpenAIEmbeddings(api_key="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")
llm = ChatOpenAI(model="gpt-4o", api_key="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")
vectorStore = SupabaseVectorStore(client, openAIEmbeddings, "documents")
cred = credentials.Certificate("discovery-ai-8a80a-firebase-adminsdk-31es3-437b4d795e.json")
firebase_admin.initialize_app(cred, {"storageBucket": "discovery-ai-8a80a.appspot.com"})
openAIClient = OpenAI(api_key="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")

db = firestore.client()


bucket = storage.bucket()
app = Flask(__name__)

@app.route("/chat", methods=["POST"])
def chat():
    if request.is_json:
        data = request.get_json()
        message = data.get('message', [])
    else:
        message = request.form.get("message")

    


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
    allData = []
    for oneData in data:
        if (".png" in oneData):
            text = understandImage(oneData)
            db.collection("case").document(oneData).set({"type": "image", "analysis": text})
            allData.append({oneData: "Evidence Analysis: " + text})

        elif (".mp3" in oneData):
            transcription, analysis = understandAudio(oneData)
            db.collection("case").document(oneData).set({"type": "audio", "transcription": transcription, "analysis": analysis})
            allData.append({oneData: "Evidence Transcription: " + transcription + ", Analysis: " + analysis})

        elif (".mp4" in oneData):
            text = understandVideo(oneData)
            db.collection("case").document(oneData).set({"type": "video", "analysis": text})
            allData.append({oneData: "Evidence Analysis: " + text})


        elif (".pdf" in oneData):
            text, analysis = understandPDF(oneData)
            db.collection("case").document(oneData).set({"type": "pdf", "transcription": text, "analysis": analysis})
            allData.append({oneData: "Evidence Transcription: " + text})
    
    
    completion = openAIClient.chat.completions.create(model="gpt-4o", messages=[{"role": "system", "content": "You are an amazing detective that is great at piecing together several evidences to create exhibits. Format the exhibits you create from the evidence provided like this, X is given the filename: X.pdf,X.mp3;X.mp4;X.pdf,X.pdf"}, {"role": "user", "content": [
        {"type": "text", "text": "Format the exhibits you create from the evidence provided like this, X is given the filename: X.pdf,X.mp3;X.mp4;X.pdf,X.pdf"}, {"type": "text", "text": "Here is all the evidences: " + allData}
     ],
    }])

    allExhibits = (completion.choices[0].message.content)
    allExhibits = allExhibits.split(";")
    alphabet = "abcdefghijklmnopqrstuvwxyz"
    for oneExhibit in range(len(allExhibits)):
        db.collection("exhibits").document(alphabet[oneExhibit].upper()).set({"data": allExhibits[oneExhibit].split(",")})



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

    return audio.text, completion.choices[0].message.content 


def understandPDF(uri):
    
    tempFileURI = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
    tempFileURI.close() 

    blobURI = bucket.blob(uri)
    blobURI.download_to_filename(tempFileURI.name)

    extractedText = (extractTextWithOCR(tempFileURI.name))
    gptAnalysis = (askGPT(extractedText))
    # Delete the temporary file
    os.remove(tempFileURI.name)
    print(f'Temporary file {tempFileURI.name} deleted.')

    return extractedText, gptAnalysis

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

    return completion.choices[0].message.content 

def understandImage(uri):
    tempFileURI = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    tempFileURI.close() 

    blobURI = bucket.blob(uri)
    blobURI.download_to_filename(tempFileURI.name)
    with open(tempFileURI.name, "rb") as imageFile:
        encodedImage = base64.b64encode(imageFile.read()).decode('utf-8')
        allFrameContent = [{"type": "text", "text": "You are an investigative detective. Please look throguh these images and analyze them."}, {"type": "image_url", "image_url": {"url": f"data:image/png;base64," + encodedImage}}]

        completion = openAIClient.chat.completions.create(model="gpt-4o", messages=[{"role": "system", "content": "You are an investigative detective that is amazing at giving accurate descriptions by understanding of images. Provide me two sentences of evidence that can be used in court. The first section give me a description of what I'm looking at. The second section give me an analysis of what is happening in the eyes of an detective." }, {"role": "user", "content": allFrameContent}])

        return completion.choices[0].message.content 

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
        "You are a legal professional and a lawyer that is fully versed in the language of law. Please summarize and explain this document to provide a deep understanding with a 3 bullet analysis.",
    ),
    ("human", question),
    ]
    return llm.invoke(messageHistory).content
    



app.run(host="localhost")