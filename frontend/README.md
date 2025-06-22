# [HR Management] - Job Posting & Candidate Management Platform

## Overview

HRM is a modern web application designed to streamline the job posting and candidate management process. It allows users (recruiters/hiring managers) to create job posts, customize their appearance for various platforms, view matched candidates based on screening criteria, and manage interview schedules. The platform integrates with Google for authentication and potentially other Google services.

The frontend is built with React and styled using Tailwind CSS, offering a responsive and professional user interface. The backend (assumed, based on API calls) is expected to handle user authentication, job post data, candidate information, screening logic, and interview slot management.

## Features

*   **User Authentication:**
    *   Secure user login (details of method not specified, assumed).
    *   Google Account authentication for enhanced features.
*   **Job Post Management:**
    *   Create detailed job posts (title, description, location, type, category, salary).
    *   View a list of created job posts.
    *   View individual job post details.
    *   Automated generation of job post content tailored for:
        *   General Online Platforms
        *   Facebook & LinkedIn
*   **Candidate Sourcing & Screening:**
    *   View a list of candidates matched to a specific job post.
    *   View detailed screening reports for each candidate, including:
        *   Overall match score.
        *   Breakdown of scores (Skills, Experience, Qualification).
        *   Visual score representation with progress bars and charts.
*   **Interview Scheduling:**
    *   Create available interview time slots with specified durations.
    *   (Presumably) Invite candidates to selected time slots (via `InterviewInvite` component).
*   **Ranking System:**
    *   Display candidate ranking for a specific job post (`RankingComponent`).
*   **Responsive Design:**
    *   Professionally designed UI optimized for both desktop and mobile devices using Tailwind CSS.

## Tech Stack

**Frontend:**

*   **React:** JavaScript library for building user interfaces.
*   **React Router DOM:** For client-side routing.
*   **Axios:** Promise-based HTTP client for making API requests.
*   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
*   **Recharts:** A composable charting library for data visualization.
*   **React DatePicker:** For selecting dates and times.

**Backend (Assumed):**

*   **FastAPI**
*   **MongoDB**
*   API endpoints for:
    *   User authentication (`/home/:userId`, `/authenticate-url/`)
    *   Job posts (`/create-jobpost/:userId`, `/get-posts/:userId`, `/get-single_post/:userId/:postId`)
    *   Candidates (`/get-candidates/:userId/:jobPostId`)
    *   Screening (`/screening/:userId/:candidateId`)
    *   Interview Slots (`/users/:userId/create-slots/`)

## Project Structure (Frontend - Simplified)

```
/src
|-- /components
| |-- Home.jsx
| |-- CreateJobPost.jsx
| |-- JobPostsList.jsx
| |-- GetSingleJobPost.jsx
| |-- CandidatesList.jsx
| |-- CandidateScreening.jsx
| |-- CreateSlots.jsx
| |-- RankingComponent.jsx 
| |-- InterviewInvite.jsx 
| |-- custom-datepicker.css 
| |-- ... (other reusable components, icons)
|-- App.js 
|-- index.js 
|-- ... (other utility files, context, etc.)
public/
|-- index.html
...
|--tailwind.config.js // Tailwind CSS configuration
|--package.json
|--README.md
|--.env
```

## Getting Started

### Prerequisites

*   Node.js (v16.x or higher recommended)
*   npm or yarn
*   A running instance of the backend API service.

### Frontend Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Astaiss/Automation-HRM.git
    cd Automation-HRM
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root of the frontend project (if not already present and version controlled).
    Add any necessary environment variables, especially the base URL for your backend API.
    Example `.env` file:
    ```
    REACT_APP_API_BASE_URL=http://localhost:8000
    ```
    *(Note: Ensure your Axios calls use this environment variable, e.g., 
    ```
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/home/${userId}`))

    ```

4.  **Run the development server:**
    ```bash
    npm start
    # or
    yarn start
    ```
    This will typically start the React development server, and the application will be accessible at `http://localhost:3000` (or another port if 3000 is in use).

### Backend Setup

*(Provide brief instructions or a link to the backend repository's README if it's separate.)*

1.  Ensure the backend server is running and accessible (typically on `http://localhost:8000` as per API calls).
2.  Make sure the database is set up and seeded with any necessary initial data.

## API Endpoints (Frontend Consumption)

The frontend application interacts with the following (example) backend API endpoints:

*   `GET /home/:userId`: Fetches user details and Google authentication status.
*   `GET /authenticate-url/`: Retrieves the Google authentication URL.
*   `POST /create-jobpost/:userId`: Creates a new job post.
*   `GET /get-posts/:userId`: Fetches all job posts for a user.
*   `GET /get-single_post/:userId/:postId`: Fetches details of a single job post.
*   `GET /get-candidates/:userId/:jobPostId` (or `/get-canidates/...`): Fetches candidates for a job post.
*   `GET /screening/:userId/:candidateId`: Fetches screening data for a candidate.
*   `POST /users/:userId/create-slots/`: Creates interview slots for a user.

*(Note: Adjust endpoint paths and HTTP methods if they differ in your actual implementation.)*

## Key UI Components

*   **`Home.jsx`**: Dashboard/landing page after login. Displays user info and Google Auth link.
*   **`CreateJobPost.jsx`**: Form for creating new job postings.
*   **`JobPostsList.jsx`**: Displays a list of job posts created by the user.
*   **`GetSingleJobPost.jsx`**: Shows detailed information about a specific job post, including platform-specific views and links to candidates/ranking.
*   **`CandidatesList.jsx`**: Lists candidates matched for a particular job post.
*   **`CandidateScreening.jsx`**: Displays the screening report for a candidate with scores and charts.
*   **`CreateSlots.jsx`**: Interface for creating available interview time slots.
*   **`RankingComponent.jsx`**: (Functionality assumed) Displays candidate rankings.
*   **`InterviewInvite.jsx`**: (Functionality assumed) Handles inviting candidates for interviews.

## Future Enhancements / TODO

*   Implement full interview invitation and management flow.
*   Add candidate profile view and editing.
*   Implement user roles and permissions.
*   Add more sophisticated filtering and sorting for job posts and candidates.
*   Integrate with calendar services for interview scheduling.
*   Email notifications for new candidates, interview confirmations, etc.
*   Unit and integration tests.
*   CI/CD pipeline for automated deployment.

## Contributing

*(If this is an open project or you plan to have collaborators, add contribution guidelines here. Otherwise, you can omit this section or state that contributions are not currently sought.)*

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## License

*(Specify the license for your project, e.g., MIT, Apache 2.0, or state "Proprietary" if it's not open source.)*

Distributed under the [Your License Name] License. See `LICENSE.txt` for more information (if applicable).

---

**Contact**

[Astaiss] - [contact@astaiss.com]

