from fastapi import FastAPI
import uvicorn
from pymongo import MongoClient
import hashlib
import os
from fastapi_jwt_auth import AuthJWT
from fastapi_jwt_auth.exceptions import AuthJWTException
from fastapi import HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
import re
from pydantic import Field
from fastapi.middleware.cors import CORSMiddleware
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from dotenv import load_dotenv
import base64
import pickle
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request  
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from email.mime.text import MIMEText
from pathlib import Path
import requests
import json
from bson import ObjectId
import random
import PyPDF2
import threading
import time
import json
from contextlib import asynccontextmanager
import pdfplumber
import io
import fitz
from typing import List
from datetime import timedelta, datetime




CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = "http://localhost:5173/auth/callback"
TOKEN_URL = "https://oauth2.googleapis.com/token"

# Gmail API Scopes
SCOPES = "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar"


BASE_DIR = Path.cwd() / "tickle"
BASE_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv()

mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client['hr_management_system']
hrs = db['hrs']
jobposts = db['jobposts']
pdf_matches = db['pdf_matches']
candidates = db['candidates']
ranking = db['ranking']
screening = db['screening']
SLOTS_DB = db['slots']

class Settings(BaseModel):
    authjwt_secret_key: str = Field(default="your_secret_key")

    class Config:
        str_strip_whitespace = True  # Updated for Pydantic v2

@AuthJWT.load_config
def get_config():
    return Settings()

def hash_password(password: str) -> str:
    salt = os.urandom(32)
    password_salt = password.encode('utf-8') + salt
    hashed_password = hashlib.sha256(password_salt).hexdigest()
    return salt.hex() + ':' + hashed_password

def check_password(stored_hash: str, password: str) -> bool:
    salt, hashed_password = stored_hash.split(':')
    salt = bytes.fromhex(salt)
    password_salt = password.encode('utf-8') + salt
    new_hashed_password = hashlib.sha256(password_salt).hexdigest()
    return new_hashed_password == hashed_password

@asynccontextmanager
async def lifespan(app: FastAPI):
    threading.Thread(target=process_emails_and_match_jobs, daemon=True).start()
    print("✅ Background email processor started.")
    yield  # Allows the app to continue running
    print("⏹️ Background email processor stopped.")

app = FastAPI(lifespan=lifespan, title="HR Management System", description="This is a HR Management System API", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





@app.get(
    "/status",
    summary="Get the status of the API",
    description="This endpoint can be used to get the status of the API",
    tags=["Health Check"]
)
def get_status():
    return {"status": "running"}


@app.get(
    "/root",
    summary="Welcome to HR Management System",
    description="This is the root endpoint of the API",
    tags=["Root"]
)
def welcome():
    # Count total number of hrs, jobposts, and candidates
    total_hrs = hrs.count_documents({})
    total_jobposts = jobposts.count_documents({})
    total_candidates = candidates.count_documents({})
    #print(total_hrs, total_jobposts, total_candidates)

    return {
        "message": "Welcome to HR Management System",
        "total_hrs": total_hrs,
        "total_jobposts": total_jobposts,
        "total_candidates": total_candidates
    }



class SignupRequest(BaseModel):
    email: str 
    password: str 


@app.post(
    "/signup", 
    summary="Register a new user",
    description="This endpoint can be used to register a new user",
    tags=["Authentication"]
)
def signup(request: SignupRequest, Authorize: AuthJWT = Depends()):
    if hrs.find_one({"email": request.email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    
    hashed_password = hash_password(request.password)
    hr = {"email": request.email, "password": hashed_password, "user_type": "email"}
    hrs.insert_one(hr)
    token = Authorize.create_access_token(subject=request.email)

    return {"message": "User registered successfully", "token": token, "userId": str(hr['_id'])}


@app.post(
    "/signin",
    summary="Login to the system",
    description="This endpoint can be used to login to the system",
    tags=["Authentication"]
)
def login(request: SignupRequest, Authorize: AuthJWT = Depends()):
    hr = hrs.find_one({"email": request.email})
    if not hr:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if not check_password(hr['password'], request.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    token = Authorize.create_access_token(subject=request.email)
    return {"message": "Login successful", "token": token, "userId": str(hr['_id'])}


class GoogleAuthRequest(BaseModel):
    token: str

@app.post(
    "/google-auth",
    summary="Authenticate using Google",
    description="This endpoint can be used to authenticate using Google",
    tags=["Authentication"]
)
def google_auth(data: GoogleAuthRequest, Authorize: AuthJWT = Depends()):
    token = data.token
    #print(token)
    try:
        id_info = id_token.verify_oauth2_token(token, google_requests.Request(), os.getenv('GOOGLE_CLIENT_ID'))
        email = id_info.get('email')
        if not email:
            raise HTTPException(status_code=400, detail="Email not found in token")
        
        user = hrs.find_one({"email": email})
        if not user:
            user = {
                "name": id_info.get('name', ''), 
                "email": email, 
                "picture": id_info.get('picture', ''), 
                "user_type": "google" 
            }
            insert_result = hrs.insert_one(user)
            user_id = str(insert_result.inserted_id)
            message = "User signed up successfully"
        else:
            user_id = str(user["_id"])
            message = "Login successful"
        
        jwt_token = Authorize.create_access_token(subject=email)
        return {
            "message": message, 
            "token": jwt_token, 
            "userId": user_id, 
            "user": {"email": email, "name": id_info.get('name', ''), "picture": id_info.get('picture', '')}
        }
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")




@app.get(
    "/authenticate-url/",
    summary="Get the Google OAuth URL",
    description="This endpoint can be used to get the Google OAuth URL where the user can authenticate",
    tags=["Email"]
)
def get_authenticate_url():
    """
    Returns the Google OAuth URL where the user can authenticate.
    """
    auth_url = (
        f"https://accounts.google.com/o/oauth2/auth?"
        f"response_type=code&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&"
        f"scope={SCOPES}&access_type=offline"
    )
    return {"auth_url": auth_url}



# 📌 Step 2: Exchange Authorization Code for Token and Save Credentials
class AuthData(BaseModel):
    userId: str
    code: str

@app.post(
    "/authenticate",
    summary="Authenticate user using Google OAuth",
    description="This endpoint can be used to authenticate the user using Google OAuth",
    tags=["Email"]
)
async def authenticate_user(auth_data: AuthData):
    userId = auth_data.userId
    code = auth_data.code
    #print(code)
    data = {
        "code": code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    response = requests.post(TOKEN_URL, data=data)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to obtain access token")

    creds_data = response.json()

    creds_data["client_id"] = CLIENT_ID
    creds_data["client_secret"] = CLIENT_SECRET

    creds = Credentials.from_authorized_user_info(creds_data)

    token_path = BASE_DIR / f"{userId}.pickle"
    with open(token_path, "wb") as token_file:
        pickle.dump(creds, token_file)

    hr = hrs.find_one({"_id": ObjectId(userId)})
    hr["google_auth"] = True

    hrs.update_one({"_id": ObjectId(userId)}, {"$set": hr})

    return {}



# 📌 Step 3: Retrieve Stored Credentials
def get_credentials(userId: str):
    file_path = BASE_DIR / f"{userId}.pickle"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Credentials not found. Authenticate first.")

    with open(file_path, "rb") as token:
        creds = pickle.load(token)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())

    return creds

# 📌 Step 4: Send Email using Gmail API
@app.post(
    "/send-email/",
    summary="Send an email",
    description="This endpoint can be used to send an email using Gmail API",
    tags=["Email"]
)
def send_email(userId: str, to_email: str, subject: str, body: str):
    """
    Send an email using Gmail API for the authenticated user.
    """
    creds = get_credentials(userId)
    service = build("gmail", "v1", credentials=creds)
    
    message = MIMEText(body)
    message["to"] = to_email
    message["subject"] = subject
    encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

    send_request = {"raw": encoded_message}
    sent_message = service.users().messages().send(userId="me", body=send_request).execute()
    
    return {"message": "Email sent!", "Message ID": sent_message['id']}


def extract_text_pymupdf(pdf_bytes):
    """
    Extract text from a PDF file using PyMuPDF (fitz).
    """
    try:
        with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
            text = "\n".join(page.get_text() for page in doc)
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting text: {str(e)}")

# 📌 Function to Fetch Emails & Extract PDF Attachments
def fetch_recent_emails(userId):
    """
    Fetch emails from the last 1.15 hours and extract text from any PDF attachments.
    """
    try:
        creds = get_credentials(userId)  # Ensure credentials exist
    except HTTPException as e:
        print(f"Skipping user {userId}: {e.detail}")
        return []  # Skip processing for this user

    service = build("gmail", "v1", credentials=creds)

    try:
        # ✅ Fetch emails from the last 1.15 hours
        time_limit = datetime.utcnow() - timedelta(hours=0, minutes=5)
        query = f"after:{int(time_limit.timestamp())}"

        results = service.users().messages().list(userId="me", q=query).execute()
        messages = results.get("messages", [])

        if not messages:
            print(f"No new emails found for user: {userId}")
            return []

        email_list = []
        for msg in messages:
            msg_detail = service.users().messages().get(userId="me", id=msg["id"]).execute()
            headers = msg_detail["payload"]["headers"]

            # ✅ Extract sender and subject
            subject = next((h["value"] for h in headers if h["name"] == "Subject"), "No Subject")
            sender = next((h["value"] for h in headers if h["name"] == "From"), "Unknown Sender")

            body = "No Body Found"
            pdf_text = None

            if "parts" in msg_detail["payload"]:
                for part in msg_detail["payload"]["parts"]:
                    if part["mimeType"] == "text/plain":
                        body = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8")

                    if "filename" in part and part["filename"].endswith(".pdf"):
                        if "attachmentId" in part["body"]:
                            attachment_id = part["body"]["attachmentId"]
                            attachment = service.users().messages().attachments().get(
                                userId="me", messageId=msg["id"], id=attachment_id
                            ).execute()

                            pdf_data = base64.urlsafe_b64decode(attachment["data"])

                            # ✅ Extract text using PyMuPDF (fitz)
                            pdf_text = extract_text_pymupdf(io.BytesIO(pdf_data))

            email_list.append({
                "From": sender,
                "Subject": subject,
                "Body": body,
                "PDF_Text": pdf_text
            })

        return email_list

    except Exception as error:
        print(f"An error occurred for user {userId}: {error}")
        return []

# 📌 Send job posts & extracted PDF text to Gemini for matching
def match_jobs_with_gemini(userId, extracted_text, email_subject):
    """
    Send extracted resume text and job posts to Gemini API for matching.
    """
    GEMINI_API_KEY = hrs.find_one({"_id": ObjectId(userId)}).get("gemini_api_key", "")
    GEMINI_MODEL = "gemini-2.0-flash"

    all_job_posts = list(jobposts.find({"created_by": userId}))

    # ✅ Construct prompt for Gemini
    prompt = f"""
    Here is the extracted text from the resume. Collect the data of the candidate and return a json format.

    **Resume Text:**
    {extracted_text}
    You must check experience, skills, projects, education, and location of the candidate. May be
    the information is not in the same order as mentioned above. You have to extract the information
    from the text may be they are disguised in the text.
    and here is email subject
    **Email Subject:**
    {email_subject} **It can be the filename if it is not relevant then focus on the extracted text**
    and all job posts:
    {all_job_posts} 
    identify the which job post is applied by the user and return jobpost id.

    here is the example of the data you should return in json format:
    ```json
    {{
        "candidate": {{
            "jobpost_id": "jobpost_id",
            "name": "John Doe",
            "email": "john@email.com",
            "skills": ["Python", "JavaScript", "React"],
            "experience": "5 years",
            "projects": ["Project 1", "Project 2"],
            "education": "Bachelor's Degree",
            "location": "San Francisco, CA"
            }}
    }}
    ```
    DO NOT CHANGE ANY NAME CONVENTION IN THE JSON FORMAT.
    YOU MUST RETURN A JSON FORMAT OF THE CANDIDATE DATA
    """

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    headers = {
        "Content-Type": "application/json",
    }
    data = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }]
    }

    response = requests.post(url, headers=headers, data=json.dumps(data))
    response.raise_for_status()
    response_json = response.json()

    generated_text = response_json["candidates"][0]["content"]["parts"][0]["text"]
    generated_text = generated_text.replace("```json", "").replace("```", "").strip()
    return json.loads(generated_text)



# 📌 Process Emails & Match Job Posts Every Hour
def process_emails_and_match_jobs():
    """
    Background task that fetches recent emails, extracts PDF text, 
    and matches it with job posts using Gemini AI.
    """
    while True:
        

        for user in hrs.find():
            userId = str(user["_id"])

            try:
                emails = fetch_recent_emails(userId)
            except HTTPException as e:
                print(f"Skipping user {userId}: {e.detail}")
                continue  # Skip this user if authentication is missing

            for email in emails:
                if email["PDF_Text"]:  # Process only if a PDF was found
                    matched_jobs = match_jobs_with_gemini(userId, email["PDF_Text"], email["Subject"])

                    if matched_jobs:
                        pdf_matches.insert_one({
                            "userId": userId,
                            "email": email["From"],
                            "pdf_text": email["PDF_Text"],
                            "candidate": matched_jobs
                        })
                        candidates.insert_one({
                            "userId": userId,
                            "email": email["From"],
                            "pdf_text": email["PDF_Text"],
                            "candidate": matched_jobs
                        })

        time.sleep(3600)  # Wait for 1 hour before next run


# 📌 Start Background Process
def start_email_matching():
    """
    Start a background thread to process emails and match job posts every hour.
    """
    threading.Thread(target=process_emails_and_match_jobs, daemon=True).start()

# 📌 API Endpoints
def fetch_emails(userId: str):
    """
    Manually fetch emails from the inbox.
    """
    return fetch_recent_emails(userId)

def get_matched_jobs(userId: str):
    """
    Retrieve matched job posts for a user based on resume parsing.
    """
    matches = list(pdf_matches.find({"userId": userId}, {"_id": 0}))
    return {"userId": userId, "matched_jobs": matches}

@app.get(
    "/home/{userId}",
    summary="Home page",
    description="Home page containing user details and job posts",
    tags=["Home"]
)
def home(userId: str):
    # ✅ Convert userId to ObjectId
    user = hrs.find_one({"_id": ObjectId(userId)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # ✅ Convert `ObjectId` to string before returning
    user["_id"] = str(user["_id"])
    user["google_auth"] = user.get("google_auth", False)
    
    # ✅ Check and Assign Gemini API Key if missing
    if not user.get("gemini_api_key"):
        with open("gemini_key.json") as f:
            gemini_keys = json.load(f)
        gemini_api_key = gemini_keys[str(random.randint(0, 2))]
        
        # ✅ Update the database with the new Gemini API key
        hrs.update_one({"_id": ObjectId(userId)}, {"$set": {"gemini_api_key": gemini_api_key}})
        user["gemini_api_key"] = gemini_api_key  # Add it to response
    
    alljobposts = []
    
    for jobpost in jobposts.find({"created_by": userId}):
        jobpost["_id"] = str(jobpost["_id"])  # ✅ Convert ObjectId to string
        alljobposts.append(jobpost)

    return {"user": user, "jobposts": alljobposts}  # ✅ Corrected return statement


class JobPostRequest(BaseModel):
    job_title: str
    job_description: str
    job_location: str
    job_type: str
    job_category: str
    job_salary: int

@app.post(
    "/create-jobpost/{userId}",
    summary="Create a job post",
    description="This endpoint can be used to create a job post",
    tags=["Job Post"]
)
def create_jobpost(userId: str, job: JobPostRequest):
    jobpost = job.dict()
    jobpost["created_by"] = userId

    # ✅ Insert job post into database
    jobposts.insert_one(jobpost)

    post_id = str(jobpost["_id"])

    # ✅ Fetch the Gemini API key for the user
    user = hrs.find_one({"_id": ObjectId(userId)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    GEMINI_API_KEY = user.get("gemini_api_key")

    # ✅ Generate job post using Gemini AI
    generate_job_post(jobpost, GEMINI_API_KEY, post_id)

    return {"message": "Job post created successfully", "job_post_id": post_id}


    

@app.post(
    "/upload_pdfs/{userId}",
    summary="Upload multiple PDF resumes",
    description="This endpoint allows users to upload multiple PDF resumes.",
    tags=["Resume"]
)
async def upload_pdfs(userId: str, files: List[UploadFile] = File(...)):
    """
    Upload multiple PDF resumes for parsing and matching with job posts.
    """
    matched_jobs_list = []

    for file in files:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail=f"Invalid file format: {file.filename}. Please upload only PDF files.")

        pdf_bytes = await file.read()
        pdf_text = extract_text_pymupdf(io.BytesIO(pdf_bytes))

        # Get Gemini response for job matching
        matched_jobs = match_jobs_with_gemini(userId, pdf_text, file.filename)

        if matched_jobs:
            pdf_matches.insert_one({
                "userId": userId,
                "email": "Uploaded PDF",
                "pdf_text": pdf_text,
                "candidate": matched_jobs
            })
            candidates.insert_one({
                "userId": userId,
                "email": "Uploaded PDF",
                "pdf_text": pdf_text,
                "candidate": matched_jobs
            })

        matched_jobs_list.append({
            "filename": file.filename,
            "matched_jobs": matched_jobs
        })

    return {
        "message": "PDFs uploaded successfully",
        "processed_files": matched_jobs_list
    }



def generate_job_post(jobpost, GEMINI_API_KEY, job_post_id):
    GEMINI_MODEL="gemini-2.0-flash"
    prompt = f"""Create a job post like a pro.
    Here is the details of the job post:
    {jobpost}

    Create job post that attracts the best candidates for the job.
    You should return a json format of the job post like below
    ```json
        //Gemerate Online platform standard
        "online_job_platform":
            {{
                "job_headline": "",//Generate it based on info and to attract candidates
                "job_title": "Software Engineer",
                "job_description": "We are looking for a software engineer with 5 years of experience.",
                "job_location": "Remote",
                "job_type": "Full-time",
                "job_category": "Engineering",
                "job_salary": 100000
            }},
        
        //Generate Facebook and LinkedIn standard
        "facebook_linkedin":
            {{
                "job_headline": "",//Generate it based on info and to attract candidates
                "job_title": "Software Engineer",
                "job_description": "We are looking for a software engineer with 5 years of experience.",
                "job_location": "Remote",
                "job_type": "Full-time",
                "job_category": "Engineering",
                "job_salary": 100000
            }},

        //Generate details of the job post
        "details":
            {{
                generate here details job post
                including field headline and description(inlcude necessary info in one field)
            }}

        
    ```
    """

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    headers = {
        "Content-Type": "application/json",
    }
    data = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }]
    }

    response = requests.post(url, headers=headers, data=json.dumps(data))
    response.raise_for_status()
    response_json = response.json()
    
    generated_text = response_json["candidates"][0]["content"]["parts"][0]["text"]
    generated_text = generated_text.replace("```json", "").replace("```", "").strip()
    
    generated_json_text = json.loads(generated_text)

    # Extract the generated job post
    online_job_platform = generated_json_text["online_job_platform"]
    facebook_linkedin = generated_json_text["facebook_linkedin"]
    details = generated_json_text["details"]

    # Update in joposts db
    jobposts.update_one({"_id": ObjectId(job_post_id)}, {"$set": {"online_job_platform": online_job_platform, "facebook_linkedin": facebook_linkedin, "details": details}})


@app.get(
    "/get-posts/{userId}",
    summary="Get matched job posts",
    description="This endpoint can be used to get matched job posts",
    tags=["Job Post"]
)
def get_posts(userId: str):
    all_posts = []
    for post in jobposts.find({"created_by": userId}):
        post["_id"] = str(post["_id"])
        all_posts.append(post)
    
    return {"job_posts": all_posts}

@app.get(
    "/get-single_post/{userId}/{post_id}",
    summary="Get single job post",
    description="This endpoint can be used to get a single job post",
    tags=["Job Post"]
)
def get_single_post(userId: str, post_id: str):
    post = jobposts.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Job post not found")
    
    post["_id"] = str(post["_id"])
    return {"job_post": post}



@app.get(
    "/get-canidates/{userId}/{job_post_id}",
    summary="Get matched candidates",
    description="This endpoint can be used to get matched candidates",
    tags=["Job Post"]
)

def get_candidates(userId: str, job_post_id: str):
    candidates_ = list(candidates.find({"candidate.candidate.jobpost_id": job_post_id}))

    # ✅ Convert `_id` to string
    for candidate in candidates_:
        candidate["_id"] = str(candidate["_id"])

    return {"candidates": candidates_}

@app.get(
    "/get-candidate/{userId}/{candidate_id}",
    summary="Get a single candidate",
    description="This endpoint can be used to get a single candidate",
    tags=["Job Post"]
)
def get_candidate(userId: str, candidate_id: str):

    user_obj_id = ObjectId(userId)

    if not hrs.find_one({"_id": user_obj_id}):
        raise HTTPException(status_code=404, detail="User not found")

    candidate_ = candidates.find_one({"_id": ObjectId(candidate_id)})
    if not candidate_:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    candidate_["_id"] = str(candidate_["_id"])
    return {"candidate": candidate_}


@app.get(
    "/screening/{userId}/{candidate_id}",
    summary="Screen candidate",
    description="This endpoint can be used to screen a candidate",
    tags=["Job Post"]
)

def screen_candidate(userId: str, candidate_id: str):
    """
    Screen a candidate based on their qualifications and experience.
    """
    candidate = candidates.find_one({"_id": ObjectId(candidate_id)})
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    job_post_id = candidate["candidate"]["candidate"]["jobpost_id"]
    job_post = jobposts.find_one({"_id": ObjectId(job_post_id)})
    if not job_post:
        raise HTTPException(status_code=404, detail="Job post not found")

    screening_data = generate_screening(candidate.get("candidate", {}), job_post, userId)

    if not screening_data:
        raise HTTPException(status_code=500, detail="Failed to generate screening")

    # ✅ Store screening in MongoDB and retrieve the inserted document's ID
    inserted_screening = screening.insert_one({
        "userId": userId,
        "candidate_id": candidate_id,
        "screening": screening_data
    })

    screening_id = str(inserted_screening.inserted_id)

    return {"screening_id": screening_id, "screening": screening_data}




def generate_ranking(candidates, job_post, userId):
    """
    Generate ranking of candidates based on their skills and experience.
    """
    GEMINI_API_KEY = hrs.find_one({"_id": ObjectId(userId)}).get("gemini_api_key", "")
    GEMINI_MODEL = "gemini-2.0-flash"

    # ✅ Convert MongoDB `ObjectId` to strings
    job_post["_id"] = str(job_post["_id"])  # Ensure `_id` is serializable

    candidates_serialized = []
    for candidate_id, candidate_data in candidates:
        candidate_data["_id"] = candidate_id  # ✅ Ensure candidate `_id` is string
        candidates_serialized.append(candidate_data)

    # ✅ Construct Prompt for Gemini
    prompt = f"""
    Here is the job post and candidates' information.
    **Job Post**:
    {json.dumps(job_post, indent=4)}

    **Candidates**:
    {json.dumps(candidates_serialized, indent=4)}

    Generate a ranking of the candidates based on their skills and experience.
    You should return a JSON format like below:

    ```json
    {{
        "ranking": [
            {{
                "_id": "candidate_id",
                "name": "John Doe",
                "email": "john@email.com",
                "metrics": "Reason why this candidate ranks in this position"
            }},
            {{
                "_id": "candidate_id",
                "name": "Jane Doe",
                "email": "jane@email.com",
                "metrics": "Reason why this candidate ranks in this position"
            }}
        ]
    }}
    ```
    """

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    data = {"contents": [{"parts": [{"text": prompt}]}]}

    response = requests.post(url, headers=headers, data=json.dumps(data))

    # ✅ Error Handling
    if response.status_code != 200:
        print(f"Gemini API Error: {response.text}")
        raise HTTPException(status_code=500, detail="Failed to generate ranking")

    response_json = response.json()

    try:
        # ✅ Ensure response contains valid text
        generated_text = response_json.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()

        if not generated_text:
            raise ValueError("Gemini response is empty")

        # ✅ Strip extra formatting & parse JSON
        generated_text = generated_text.replace("```json", "").replace("```", "").strip()
        ranking_data = json.loads(generated_text)

        return ranking_data.get("ranking", [])

    except (json.JSONDecodeError, KeyError, ValueError) as e:
        print(f"Error parsing ranking response: {e}")
        raise HTTPException(status_code=500, detail="Invalid response from Gemini AI")
         




@app.get(
    "/ranking/{userId}/{job_post_id}",
    summary="Rank candidates",
    description="This endpoint ranks candidates for a specific job post.",
    tags=["Job Post"]
)
def ranking_candidate(userId: str, job_post_id: str):
    """
    Rank candidates based on their qualifications and match with job post.
    """
    # ✅ Fetch candidates properly from nested structure
    candidates_ = [
        (str(candidate["_id"]), candidate["candidate"]["candidate"])
        for candidate in candidates.find(
            {"candidate.candidate.jobpost_id": job_post_id},
            {"_id": 1, "candidate.candidate": 1}  # ✅ Fetch only required fields
        ) if "candidate" in candidate and "candidate" in candidate["candidate"]  # ✅ Ensure nested structure exists
    ]

    if not candidates_:
        raise HTTPException(status_code=404, detail="No candidates found for this job post")

    # ✅ Fetch job post details
    job_post = jobposts.find_one({"_id": ObjectId(job_post_id)})
    if not job_post:
        raise HTTPException(status_code=404, detail="Job post not found")

    # ✅ Generate ranking
    ranking_ = generate_ranking(candidates_, job_post, userId)

    if not ranking_:
        raise HTTPException(status_code=500, detail="Failed to generate ranking")

    # ✅ Store ranking in MongoDB and retrieve the inserted document's ID
    inserted_ranking = ranking.insert_one({
        "userId": userId,
        "job_post_id": job_post_id,
        "ranking": ranking_
    })

    ranking_id = str(inserted_ranking.inserted_id)  # ✅ Convert ObjectId to string

    return {"ranking_id": ranking_id, "ranking": ranking_}


def generate_screening(candidate, job_post, userId):
    """
    Generate screening of candidates based on their qualifications and experience.
    """
    GEMINI_API_KEY = hrs.find_one({"_id": ObjectId(userId)}).get("gemini_api_key", "")
    GEMINI_MODEL = "gemini-2.0-flash"


    # ✅ Construct Prompt for Gemini
    prompt = f"""
    here is the candidate and job post information.
    **Candidate**:
    {candidate}

    **Job Post**:
    {job_post}

    Generate a screening of the candidate and give percentage value like below:
    
    ```json
    {{
        "screening": 
            {{
                "skills": "80",
                "experience": "90",
                "qualification": "70",
                "overall": "85"
                }}
    }}
    ```

    YOU MUST RETURN A JSON VALUE BASED ON THE JOB POST AND CANDIDATE INFO.
    """
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    headers = {
        "Content-Type": "application/json",
    }
    data = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }]
    }

    response = requests.post(url, headers=headers, data=json.dumps(data))
    response.raise_for_status()
    response_json = response.json()

    generated_text = response_json["candidates"][0]["content"]["parts"][0]["text"]
    generated_text = generated_text.replace("```json", "").replace("```", "").strip()
    return json.loads(generated_text)







def generate_email_body(userId):
    """
    Generate email body for inviting a candidate to an interview.
    """
    GEMINI_API_KEY = hrs.find_one({"_id": ObjectId(userId)}).get("gemini_api_key", "")
    GEMINI_MODEL = "gemini-2.0-flash"

    # ✅ Construct Prompt for Gemini
    prompt = f"""

    Generate an email body to invite the candidate for an interview.
    You should return a JSON format like below:

    ```json
    {{
        "email_body": "Email body content here..."
    }}
    ```
    """

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    headers = {
        "Content-Type": "application/json",
    }
    data = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }]
    }

    response = requests.post(url, headers=headers, data=json.dumps(data))
    response.raise_for_status()
    response_json = response.json()

    generated_text = response_json["candidates"][0]["content"]["parts"][0]["text"]
    generated_text = generated_text.replace("```json", "").replace("```", "").strip()
    return json.loads(generated_text)


from email.utils import formataddr

@app.get(
    "/invite-interview/{userId}/{candidate_id}",
    summary="Invite candidate for an interview",
    description="This endpoint can be used to invite a candidate for an interview",
    tags=["Job Post"]
)
def invite_interview(userId: str, candidate_id: str):
    """
    Invite a candidate for an interview by generating an email body.
    """
    # ✅ Fetch candidate document from MongoDB
    candidate_ = candidates.find_one({"_id": ObjectId(candidate_id)})
    if not candidate_:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # ✅ Extract and Validate Email
    email_address = candidate_.get("candidate", {}).get("candidate", {}).get("email")
    if not email_address or "@" not in email_address:
        raise HTTPException(status_code=400, detail="Invalid candidate email address")

    # ✅ Generate Email Body

    job_post_id = candidate_["candidate"]["candidate"]["jobpost_id"]
    job_post = jobposts.find_one({"_id": ObjectId(job_post_id)})
    job_title = job_post.get("job_title", "Job Title")
    
    email_body = f"""
    Dear {candidate_['candidate']['candidate']['name']},

    We are pleased to invite you for an interview for the position of {job_title} at our company.

    Please book a slot for the interview by visiting the following link: 
    
    [Interview Booking](http://localhost:5173/book-slot/{userId})

    Best Regards,
    HR Team
    """

    userId = "67d07897c1fcab866c006ba3"

    # ✅ Get Gmail Credentials
    creds = get_credentials(userId)
    service = build("gmail", "v1", credentials=creds)
    
    # ✅ Create and Format Email Message
    message = MIMEText(email_body)
    message["to"] = formataddr(("Candidate", email_address))  # Ensure Proper Email Formatting
    message["subject"] = "Invitation for Interview"
    encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

    send_request = {"raw": encoded_message}
    
    # ✅ Send Email
    try:
        sent_message = service.users().messages().send(userId="me", body=send_request).execute()
        return {"message": "Email sent!", "Message ID": sent_message['id'], "email_body": email_body}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")



class SlotCreateRequest(BaseModel):
    start_times: List[str] = Field(..., example=["2025-04-10T10:00:00", "2025-04-10T11:00:00"])
    duration: int = Field(default=60, example=60)

@app.post(
    "/users/{userId}/create-slots/",
    summary="Create available interview slots",
    description="This endpoint creates available interview slots.",
    tags=["Job Post"]
)
def create_slots(userId: str, slot_data: SlotCreateRequest):
    """
    The interviewer creates available slots. Candidates can later book these slots.
    """
    slots = []
    for start_time in slot_data.start_times:
        try:
            start = datetime.fromisoformat(start_time)
            end = start + timedelta(minutes=slot_data.duration)

            slot = {
                "userId": str(userId),  # ✅ Convert userId to string
                "start_time": start.isoformat(),
                "end_time": end.isoformat(),
                "available": True
            }
            
            inserted_id = SLOTS_DB.insert_one(slot).inserted_id  # ✅ Store ObjectId
            slot["_id"] = str(inserted_id)  # ✅ Convert ObjectId to string before returning

            slots.append(slot)

        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid date format: {start_time}")

    return {"message": "Slots created!", "slots": slots}

class BookSlotRequest(BaseModel):
    candidate_email: str
    selected_start_time: str

@app.post(
    "/users/{userId}/book-slot/",
    summary="Book an interview slot",
    description="This endpoint allows candidates to book an interview slot.",
    tags=["Job Post"]
)
def book_slot(userId: str, slot_data: BookSlotRequest):
    """
    Any candidate can book a slot from the available interview slots.
    """
    print(f"Booking slot for userId: {userId} at {slot_data.selected_start_time}")

    creds = get_credentials(userId)
    service = build("calendar", "v3", credentials=creds)

    # ✅ Query MongoDB for an available slot
    slot = SLOTS_DB.find_one({"userId": userId, "start_time": slot_data.selected_start_time, "available": True})

    if not slot:
        raise HTTPException(status_code=404, detail="Selected slot is not available or already booked.")

    start = datetime.fromisoformat(slot["start_time"])
    end = datetime.fromisoformat(slot["end_time"])

    # ✅ Generate unique Google Meet link
    event = {
        "summary": "Interview Meeting",
        "description": "Scheduled interview via API",
        "start": {"dateTime": start.isoformat(), "timeZone": "UTC"},
        "end": {"dateTime": end.isoformat(), "timeZone": "UTC"},
        "attendees": [{"email": slot_data.candidate_email}],
        "conferenceData": {
            "createRequest": {
                "conferenceSolutionKey": {"type": "hangoutsMeet"},
                "requestId": f"meet-{int(start.timestamp())}"
            }
        }
    }

    created_event = service.events().insert(
        calendarId="primary", body=event, conferenceDataVersion=1
    ).execute()

    # ✅ Extract Google Meet link
    meet_link = None
    if "conferenceData" in created_event:
        for entry in created_event["conferenceData"].get("entryPoints", []):
            if entry["entryPointType"] == "video":
                meet_link = entry["uri"]
                break  # Stop once we find the Google Meet link

    if not meet_link:
        meet_link = "Google Meet link not available"

    # ✅ Update MongoDB slot as booked
    SLOTS_DB.update_one(
        {"_id": slot["_id"]},
        {"$set": {"available": False, "candidate_email": slot_data.candidate_email, "meet_link": meet_link}}
    )

    # ✅ Send email to interviewer that slot is booked
    email_body = f"""
    Dear Interviewer,

    The slot for the interview has been successfully booked by the candidate with email: {slot_data.candidate_email}.
    The interview will be conducted via Google Meet. Here is the meeting link: {meet_link}
    Time: {start} - {end}

    Best Regards,
    HRM Team
    """

    # ✅ Get Interviewer's Email
    interviewer = hrs.find_one({"_id": ObjectId(userId)})
    if not interviewer:
        raise HTTPException(status_code=404, detail="Interviewer not found.")

    to_mail = interviewer.get("email")
    if not to_mail:
        raise HTTPException(status_code=400, detail="Interviewer email not found.")

    # ✅ Send Email
    try:
        userId = "67d018b407a307a21390ede1"
        creds = get_credentials(userId)
        service = build("gmail", "v1", credentials=creds)

        message = MIMEText(email_body)
        message["to"] = to_mail
        message["subject"] = "Interview Slot Booked"
        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

        send_request = {"raw": encoded_message}
        service.users().messages().send(userId="me", body=send_request).execute()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    return {
        "message": "Interview booked successfully!",
        "meet_link": meet_link,
        "event_id": created_event["id"]
    }


@app.get(
    "/users/{userId}/available-slots/",
    summary="Get available interview slots",
    description="This endpoint returns all available interview slots for a given user.",
    tags=["Job Post"]
)
def get_available_slots(userId: str):
    """
    Fetches all available interview slots for a specific user.
    """
    print(f"Fetching available slots for userId: {userId}")

    slots = list(SLOTS_DB.find({"userId": userId, "available": True}))

    # ✅ Convert ObjectId to string before returning
    for slot in slots:
        slot["_id"] = str(slot["_id"])

    return {"slots": slots}




if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

