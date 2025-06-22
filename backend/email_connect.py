import os
import base64
import pickle
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request  # Fix: Import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from email.mime.text import MIMEText


# Define the required OAuth 2.0 scopes
SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly"
]

def authenticate_gmail():
    """Authenticate user and return Gmail API service"""
    creds = None

    # Load previously saved token
    if os.path.exists("token.pickle"):
        with open("token.pickle", "rb") as token:
            creds = pickle.load(token)

    # If no valid credentials, request authorization
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            creds = flow.run_local_server(port=8080)

        # Save the credentials for future use
        with open("token.pickle", "wb") as token:
            pickle.dump(creds, token)

    return build("gmail", "v1", credentials=creds)

def send_email(to_email, subject, body):
    """Send an email using the Gmail API"""
    service = authenticate_gmail()
    
    message = MIMEText(body)
    message["to"] = to_email
    message["subject"] = subject
    encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

    send_request = {"raw": encoded_message}
    sent_message = service.users().messages().send(userId="me", body=send_request).execute()
    
    print(f"Email sent! Message ID: {sent_message['id']}")

def fetch_emails():
    """Fetch the latest 5 emails from the inbox"""
    service = authenticate_gmail()
    results = service.users().messages().list(userId="me", maxResults=5).execute()
    messages = results.get("messages", [])

    if not messages:
        print("No new emails found.")
        return

    for msg in messages:
        msg_detail = service.users().messages().get(userId="me", id=msg["id"]).execute()
        headers = msg_detail["payload"]["headers"]
        
        # Extract subject and sender
        subject = next((h["value"] for h in headers if h["name"] == "Subject"), "No Subject")
        sender = next((h["value"] for h in headers if h["name"] == "From"), "Unknown Sender")

        print(f"From: {sender}\nSubject: {subject}\n")

if __name__ == "__main__":
    print("1: Send Email")
    print("2: Fetch Emails")
    choice = input("Enter choice: ")

    if choice == "1":
        to = input("Enter recipient email: ")
        subject = input("Enter subject: ")
        body = input("Enter message body: ")
        send_email(to, subject, body)
    elif choice == "2":
        fetch_emails()
    else:
        print("Invalid choice.")
