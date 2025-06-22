# HR Management System API

## Overview

The HR Management System API provides backend services for a comprehensive platform designed to streamline the job posting, candidate sourcing, screening, and interview scheduling processes. It leverages MongoDB for data storage, FastAPI for building robust and efficient APIs, and integrates with Google services (Gmail, Calendar, OAuth) for authentication and communication. The API also utilizes a Generative AI model (Google Gemini) for tasks like content generation and data extraction.

## Features

*   **User Authentication & Authorization:**
    *   Email/Password based user registration and login.
    *   Secure password hashing.
    *   Google OAuth 2.0 for user sign-up/sign-in.
    *   JWT-based authentication for securing API endpoints.
*   **Google Services Integration:**
    *   OAuth 2.0 flow to authorize access to user's Google account (Gmail, Calendar).
    *   Send emails via Gmail API (e.g., interview invitations).
    *   Fetch recent emails and parse PDF attachments (resumes) from Gmail.
    *   Create Google Calendar events with unique Google Meet links for interviews.
*   **Job Post Management:**
    *   Create, retrieve, and manage job posts.
    *   Utilize Google Gemini to automatically generate:
        *   Job post content tailored for different platforms (Online, Facebook/LinkedIn).
        *   Detailed job descriptions.
*   **Candidate Management & Resume Parsing:**
    *   Automated resume parsing from PDF attachments in emails or direct PDF uploads.
    *   Extract candidate information (name, email, skills, experience, etc.) using Google Gemini.
    *   Store and retrieve candidate profiles.
*   **AI-Powered Screening & Ranking:**
    *   Generate candidate screening reports with percentage scores for skills, experience, qualification, and overall match using Google Gemini.
    *   Rank candidates for a specific job post based on their profile and job requirements using Google Gemini.
*   **Interview Scheduling:**
    *   Allow HR users to define available interview slots (start time, duration).
    *   Enable candidates to book available interview slots.
    *   Automatically create Google Calendar events with Google Meet links upon successful booking.
    *   Notify the interviewer (HR user) via email when a slot is booked.
*   **Background Processing:**
    *   A background thread periodically fetches new emails, parses resumes, and matches them against job posts.
*   **API Health & Monitoring:**
    *   Status endpoint for health checks.
    *   Root endpoint providing basic system statistics.

## Tech Stack

*   **Framework:** FastAPI
*   **Language:** Python
*   **Database:** MongoDB (with `pymongo` driver)
*   **Authentication:** `fastapi-jwt-auth` (JWT), Google OAuth 2.0
*   **Google APIs:** `google-api-python-client`, `google-auth-oauthlib`, `google-auth`
    *   Gmail API
    *   Google Calendar API
*   **Generative AI:** Google Gemini API (via direct HTTP requests)
*   **PDF Processing:** PyMuPDF (`fitz`)
*   **Asynchronous Server:** Uvicorn
*   **Environment Management:** `python-dotenv`
*   **Data Validation:** Pydantic
*   **CORS:** FastAPI's `CORSMiddleware`

## Project Structure (Simplified)
```

|-- main.py 
|-- tickle/ 
| |-- [userId1].pickle
| |-- [userId2].pickle
| --  gemini_key.json
|-- .env  
|-- requirements.txt
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGO_URI="your_mongodb_connection_string"
GOOGLE_CLIENT_ID="your_google_cloud_project_client_id.apps.googleusercontent.com"
```

Additionally, ensure you have a gemini_key.json file in the root directory structured like:
```
[
  "YOUR_GEMINI_API_KEY_1",
  "YOUR_GEMINI_API_KEY_2",
  "YOUR_GEMINI_API_KEY_3"
]
```
The application randomly picks one of these keys for Gemini API calls for each user if not already assigned.

### Setup and Installation
1. Clone the repository:
    ```
    git clone https://github.com/Astaiss/Automation-HRM.git
    cd Automation-HRM
    ```


2. Create a virtual environment (recommended):
    ```
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3. Install dependencies:
    ```
    pip install -r requirements.txt
    ```

4. Set up MongoDB:
    - Ensure you have a MongoDB instance running and accessible. Update the MONGO_URI in your .env file.

5. Configure Google Cloud Project:
    - Create a project in the Google Cloud Console.
    - Enable the Gmail API and Google Calendar API.
    - Create OAuth 2.0 credentials (Client ID and Client Secret).
    - Set "Authorized JavaScript origins" to your frontend URL (e.g., http://localhost:5173).
    - Set "Authorized redirect URIs" to your frontend callback URL (e.g., http://localhost:5173/auth/callback).
    - Update CLIENT_ID, CLIENT_SECRET constants in main.py or move them to the .env file and load them.
    - Ensure the GOOGLE_CLIENT_ID in your .env file matches the one used for token verification in /google-auth.

6. Configure Google Gemini API:
    - Obtain API keys from Google AI Studio.
    - Populate gemini_key.json with your keys.

7. Run the application:
    ```
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```

The API will be available at `http://localhost:8000`. The interactive API documentation (Swagger UI) will be at `http://localhost:8000/docs`.

## API Endpoints
The API provides a range of endpoints categorized by tags in the documentation. Key endpoint groups include:

- **Authentication:** /signup, /signin, /google-auth
- **Email & Google OAuth:** /authenticate-url/, /authenticate, /send-email/
- **Job Post:** /create-jobpost/{userId}, /get-posts/{userId}, /get-single_post/{userId}/{post_id}, /get-candidates/{userId}/{job_post_id}, /screening/{userId}/{candidate_id}, /ranking/{userId}/{job_post_id}, /invite-interview/{userId}/{candidate_id}
- **Resume:** /upload_pdfs/{userId}
- **Interview Slots:** /users/{userId}/create-slots/, /users/{userId}/book-slot/, /users/{userId}/available-slots/
- **Home:** /home/{userId}

## A background thread 
- Iterate through all registered HR users.
- Fetch recent emails for each user (if Google authenticated).
- Extract text from PDF attachments in these emails.
- Use Google Gemini to match the extracted resume text with the user's job posts.
- Store matched candidates and their details in the database.
- This process is initiated when the FastAPI application starts (using lifespan context manager).

## Important Notes
- Google Credentials Storage: Google OAuth credentials (tokens) for each user are stored as pickled files in the tickle/ directory, named [userId].pickle. Ensure this directory is writable by the application and consider security implications for production environments.
- Gemini API Key Rotation: The application assigns a Gemini API key to users if they don't have one, picking randomly from gemini_key.json. This is a simple form of key rotation/distribution.
- Error Handling: Endpoints include error handling for common scenarios, returning appropriate HTTP status codes and detail messages.
- Scalability: For production, consider a more robust solution for background tasks (e.g., Celery with a message broker like RabbitMQ or Redis) instead of a simple threading.

## Future Enhancements
- Implement more sophisticated error handling and logging.
Transition credential storage from pickle files to a more secure and scalable solution (e.g., encrypted in the database or a dedicated secrets manager).
- Use a proper task queue (like Celery) for background email processing for better reliability and scalability.
- Add comprehensive unit and integration tests.
- Implement rate limiting and more advanced security measures.
- Refine AI prompts for even better accuracy in content generation and data extraction.
- Allow users to manage their own Gemini API keys.

## License
(Specify the license for your project, e.g., MIT, Apache 2.0, or state "Proprietary" if it's not open source.)