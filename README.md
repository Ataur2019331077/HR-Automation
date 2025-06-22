# HR Management System (FastAPI & React)

This project is a comprehensive Human Resources Management System designed to streamline the entire recruitment lifecycle, from job posting and candidate sourcing to AI-powered screening, interview scheduling, and Google services integration. It features a Python FastAPI backend and a React frontend.

## Core Components

1.  **Backend (HR Management System API)**:
    *   Built with **FastAPI** (Python).
    *   Utilizes **MongoDB** for data storage.
    *   Integrates with **Google OAuth, Gmail, Google Calendar, and Google Gemini API**.
    *   Provides robust APIs for user management, job posting, AI-driven candidate screening, resume parsing, interview scheduling, and background email processing.
    *   [Detailed Backend README](./backend/README.md)

2.  **Frontend (HRM - Job Posting & Candidate Management Platform)**:
    *   Built with **React** and styled with **Tailwind CSS**.
    *   Consumes the backend APIs to offer a user-friendly interface for recruiters and hiring managers.
    *   Features include creating job posts, viewing AI-generated content, managing candidate lists, reviewing screening reports, and setting up interview slots.
    *   [Detailed Frontend README](./frontend/README.md)

## Key Features (Overall Application)

*   **End-to-End Recruitment Workflow**: Covers job creation to interview scheduling.
*   **AI-Powered Assistance**: Leverages Google Gemini for:
    *   Generating tailored job post content.
    *   Parsing resume details.
    *   Screening and ranking candidates.
*   **Google Ecosystem Integration**:
    *   Google OAuth for secure sign-up/sign-in.
    *   Gmail API for sending communications and fetching resumes from emails.
    *   Google Calendar API for scheduling interviews with Google Meet links.
*   **Automated Processes**:
    *   Background email fetching and resume parsing.
    *   Automatic candidate matching against job posts.
*   **User-Friendly Interface**: Modern, responsive UI for efficient HR operations.

## Tech Stack (Full Stack)

*   **Backend**: Python, FastAPI, Pydantic, MongoDB (PyMongo), Google API Client Libraries, Google Gemini API, `fastapi-jwt-auth`, PyMuPDF.
*   **Frontend**: React, React Router, Axios, Tailwind CSS, Recharts, React DatePicker.
*   **Development Tools**: Uvicorn (backend), Vite/Create React App dev server (frontend), `python-dotenv`.

## Prerequisites

*   Python 3.8+
*   Node.js (v16.x or higher) & npm/yarn
*   MongoDB instance (local or cloud)
*   Google Cloud Platform project with Gmail, Google Calendar APIs enabled, and OAuth 2.0 credentials.
*   Google Gemini API Key(s).
*   Git (for cloning)

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Astaiss/Automation-HRM.git
    cd Automation-HRM
    ```

2.  **Set up the Backend**:
    *   Navigate to the `backend` directory: `cd backend`
    *   Follow the detailed setup instructions in the [Backend README](./backend/README.md). This will include setting up a virtual environment, installing Python dependencies, configuring `.env` (for `MONGO_URI`, `GOOGLE_CLIENT_ID`), and placing your `gemini_key.json`.
    *   Start the backend server (typically `uvicorn main:app --reload --host 0.0.0.0 --port 8000`).

3.  **Set up the Frontend**:
    *   Navigate to the `frontend` directory: `cd ../frontend` (if you were in `backend`) or `cd frontend` (from the root).
    *   Follow the detailed setup instructions in the [Frontend README](./frontend/README.md). This will involve installing Node.js dependencies and configuring your `.env` file (e.g., `REACT_APP_API_BASE_URL=http://localhost:8000` to point to your running backend).
    *   Start the frontend development server (typically `npm start` or `yarn start`).

4.  **Accessing the Application**:
    *   **Backend API Docs (Swagger UI)**: `http://localhost:8000/docs` (or the port you configured for the backend).
    *   **Frontend Application**: `http://localhost:3000` (or the port configured for the frontend, e.g., 5173 for Vite).

    Ensure the frontend's API base URL correctly points to the running backend server.

## Project Structure

```
├── backend/
│ ├── main.py
│ ├── tickle/ # For storing pickled Google credentials
│ ├── gemini_key.json # (Gitignored ideally) Gemini API keys
│ ├── .env # (Gitignored) Backend environment variables
│ ├── requirements.txt
│ └── README.md # Detailed backend documentation
├── frontend/
│ ├── public/
│ ├── src/
│ ├── .env # (Gitignored) Frontend environment variables
│ ├── package.json
│ └── README.md # Detailed frontend documentation
├── .gitignore # (To be created at the root)
└── README.md # This file (Top-level project overview)
```

## Important Considerations

*   **Security of Credentials**:
    *   The `tickle/` directory in the backend stores pickled Google OAuth tokens. Ensure this directory is secured in a production environment. Consider more robust encrypted storage solutions.
    *   `gemini_key.json` and `.env` files contain sensitive API keys and credentials. **These should be included in your `.gitignore` file and managed securely (e.g., using environment variables in deployment, or a secrets manager).**
*   **Background Tasks**: The backend uses a simple background thread for email processing. For production, a dedicated task queue like Celery is recommended for scalability and reliability.

## Future Enhancements (Overall)

*   Transition credential storage to more secure solutions (e.g., HashiCorp Vault, AWS Secrets Manager, or encrypted database fields).
*   Implement a robust task queue system (e.g., Celery with Redis/RabbitMQ) for background processes.
*   Develop comprehensive unit and integration tests for both backend and frontend.
*   Containerize the application using Docker and Docker Compose for easier deployment and development setup.
*   Enhance UI/UX with more interactive elements and real-time updates.

## License

*(Specify the license for your project, e.g., [MIT, Apache 2.0](./LICENSE.md). If it's proprietary, you can state that. Example: "This project is licensed under the MIT License - see the LICENSE.md file for details" or "Proprietary Software.")*