import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Added useNavigate if needed
import axios from "axios";

// --- Icons (assuming they are defined as in the previous example) ---
const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);
// ... (other icons: UserCircleIcon, MailIcon, BriefcaseIcon, AcademicCapIcon, DocumentTextIcon)
// These are the same as in the previous correct version. I'll omit them here for brevity but assume they are present.
const UserCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16.5c2.57 0 4.948.684 6.879 1.304M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v1H2a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2h-2V4a2 2 0 00-2-2H6zm8 2H6v1h8V4zm-2 5H8v2h4V9z" clipRule="evenodd" />
  </svg>
);
const AcademicCapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.056.19l-2.365 6.227A1 1 0 004 16h12a1 1 0 00.945-1.532l-2.365-6.227a1.001 1.001 0 01.057-.19l2.645-1.131a1 1 0 000-1.84l-7-3zM12 10a2 2 0 10-4 0 2 2 0 004 0z" />
    </svg>
);
const DocumentTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);


const CandidatesList = () => {
  const { userId, job_post_id } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [jobTitle, setJobTitle] = useState(''); // Optional for displaying job title

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      setError(null);
      try {
        // Using your original endpoint: "get-canidates"
        const response = await axios.get(`http://localhost:8000/get-canidates/${userId}/${job_post_id}`);
        
        // Log the entire response.data to check its structure in your console
        console.log("Full API response data:", response.data); 

        // Ensure response.data.candidates is an array, fallback to empty array if not
        setCandidates(Array.isArray(response.data.candidates) ? response.data.candidates : []);
        
        // Optional: Fetch job post details to get the title
        // const jobResponse = await axios.get(`http://localhost:8000/get-single_post/${userId}/${job_post_id}`);
        // setJobTitle(jobResponse.data.job_post?.job_title || 'Job Post');

      } catch (err) {
        // This is where the "Error fetching candidates: Object" was originating for the console log
        // The `err.response?.data` is the object.
        console.error("--- Full Axios Error Object ---", err); // Log the entire error object for full context

        let displayErrorMessage = "An unexpected error occurred while fetching candidates.";

        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Error Response Status:", err.response.status);
          console.error("Error Response Data (this is the 'Object' you saw):", err.response.data);

          const responseData = err.response.data;
          if (typeof responseData === 'string' && responseData.length > 0) {
            displayErrorMessage = responseData;
          } else if (responseData && typeof responseData.detail === 'string') { // Common in FastAPI
            displayErrorMessage = responseData.detail;
          } else if (responseData && typeof responseData.message === 'string') { // Common in many APIs
            displayErrorMessage = responseData.message;
          } else if (responseData && typeof responseData.error === 'string') { // Another common pattern
            displayErrorMessage = responseData.error;
          } else if (err.message) { // Fallback to Axios's error message
            displayErrorMessage = `Server error (${err.response.status}): ${err.message}`;
          }
        } else if (err.request) {
          // The request was made but no response was received (e.g., network error)
          console.error("Error Request Data (no response received):", err.request);
          displayErrorMessage = "No response from server. Please check your network connection and the server status.";
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Error Message (request setup issue):", err.message);
          displayErrorMessage = err.message;
        }
        setError(displayErrorMessage); // Ensure this is always a string
      } finally {
        setLoading(false);
      }
    };

    if (userId && job_post_id) {
      fetchCandidates();
    } else {
      setError("User ID or Job Post ID is missing from the URL.");
      setLoading(false);
    }
  }, [userId, job_post_id]);

  // The renderContent function and the main return structure remain the same as the
  // correctly styled version provided previously. The changes above are focused on
  // the data fetching and error handling logic within useEffect.

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600 text-lg">Loading candidates...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-lg text-center">
          <p className="font-medium">Error!</p>
          <p>{error}</p> {/* This will now display the extracted string message */}
        </div>
      );
    }

    // Your original code for candidate data access: candidate_.candidate.candidate.name
    // My previous code used: candidateEntry.candidate?.candidate;
    // Let's stick to your original confirmed structure for data access.
    // Ensure candidates itself is an array before mapping.
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return (
        <div className="text-center py-16 px-6 bg-white shadow-md rounded-lg">
          <UserCircleIcon className="mx-auto h-16 w-16 text-slate-400" />
          <h3 className="mt-4 text-xl font-semibold text-slate-800">No Candidates Found</h3>
          <p className="mt-1 text-slate-500">
            There are currently no matched candidates for this job post.
          </p>
          <div className="mt-6">
            <Link
              to={`/get-single-post/${userId}/${job_post_id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Job Post
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {candidates.map((candidateEntry) => { // candidateEntry is candidate_ from your original code
          // Assuming candidateEntry._id is the unique key for the outer object
          // And the candidate profile is deeply nested as candidateEntry.candidate.candidate
          const actualCandidateProfile = candidateEntry?.candidate?.candidate;

          if (!actualCandidateProfile) {
            console.warn("Skipping candidate entry due to missing profile data:", candidateEntry);
            return null; // Skip rendering this entry if the data structure is not as expected
          }
          
          return (
            <div key={candidateEntry._id || actualCandidateProfile.email} /* Use a reliable unique key */
                 className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4">
                    <h3 className="text-xl sm:text-2xl font-semibold text-indigo-700 hover:text-indigo-800 mb-2 sm:mb-0">
                        {actualCandidateProfile.name || "Unnamed Candidate"}
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm text-slate-700 mb-6">
                    <div className="flex items-center">
                        <MailIcon />
                        <a href={`mailto:${actualCandidateProfile.email}`} className="ml-2 hover:underline text-sky-600 break-all">
                            {actualCandidateProfile.email || "No email"}
                        </a>
                    </div>
                    <div className="flex items-center">
                        <BriefcaseIcon />
                        <span className="ml-2">{actualCandidateProfile.experience || 0} years experience</span>
                    </div>
                    <div className="flex items-start col-span-1 md:col-span-2">
                        <AcademicCapIcon />
                        <div className="ml-2">
                            <span className="font-medium">Skills:</span>
                            {actualCandidateProfile.skills && actualCandidateProfile.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-1">
                                {actualCandidateProfile.skills.map((skill, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-sky-100 text-sky-700 text-xs font-medium rounded-full">
                                    {skill}
                                    </span>
                                ))}
                                </div>
                            ) : (
                                <span className="ml-1 italic">No skills listed</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    to={`/screening/${userId}/${String(candidateEntry._id)}`} // Assuming candidateEntry._id is for the screening link
                    className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <DocumentTextIcon />
                    View Screening
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <Link
              to={`/get-single-post/${userId}/${job_post_id}`}
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <BackArrowIcon />
              Back to Job Post
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 text-center sm:text-left">
            Matched Candidates
            {/* {jobTitle && <span className="block text-lg font-normal text-slate-500 mt-1">for {jobTitle}</span>} */}
          </h1>
        </div>
        {renderContent()}
      </div>
      <footer className="mt-12 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CandidatesList;