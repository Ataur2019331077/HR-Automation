import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// --- Icons (Heroicons or similar style) ---
const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const SalaryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-.567-.267z" />
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.743.557.75.75 0 00.49 1.358A3.035 3.035 0 0110 8.5v1.037a.75.75 0 001.409.543A4.535 4.535 0 0012.5 10.5h.083a1 1 0 100-2h-.083a2.5 2.5 0 01-1.917-1.082V5z" clipRule="evenodd" />
    </svg>
);

const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v1H2a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2h-2V4a2 2 0 00-2-2H6zm8 2H6v1h8V4zm-2 5H8v2h4V9z" clipRule="evenodd" />
    </svg>
);


const JobPostsList = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:8000/get-posts/${userId}`);
        setJobPosts(response.data.job_posts || []); // Ensure job_posts is an array
      } catch (err) {
        console.error("Error fetching job posts:", err.response?.data || err.message);
        setError(err.response?.data?.detail || "Failed to fetch job posts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchJobPosts();
    } else {
      setError("User not identified. Please log in.");
      setLoading(false);
      // Optionally navigate to login: navigate('/login');
    }
  }, [userId]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600 text-lg">Loading job posts...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-lg text-center">
          <p className="font-medium">Error!</p>
          <p>{error}</p>
        </div>
      );
    }

    if (jobPosts.length === 0) {
      return (
        <div className="text-center py-16 px-6 bg-white shadow-md rounded-lg">
          <BriefcaseIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-xl font-semibold text-slate-800">No Job Posts Yet</h3>
          <p className="mt-1 text-slate-500">
            You haven't created any job posts. Get started by creating one now!
          </p>
          <div className="mt-6">
            <Link
              to="/create-jobpost"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Job Post
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {jobPosts.map((post) => (
          <div key={post._id} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-3">
                <h3 className="text-xl sm:text-2xl font-semibold text-indigo-700 hover:text-indigo-800 mb-2 sm:mb-0">
                  <Link to={`/get-single-post/${userId}/${post._id}`}>
                    {post.job_title}
                  </Link>
                </h3>
                {post.job_type && (
                    <span className="text-xs font-semibold inline-block py-1 px-2.5 uppercase rounded-full text-sky-600 bg-sky-100 last:mr-0 mr-1 whitespace-nowrap">
                        {post.job_type}
                    </span>
                )}
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {post.job_description.length > 150
                  ? `${post.job_description.substring(0, 150)}...`
                  : post.job_description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-slate-700 mb-5">
                <div className="flex items-center">
                  <LocationIcon />
                  <span>{post.job_location}</span>
                </div>
                {post.job_salary && (
                  <div className="flex items-center">
                    <SalaryIcon />
                    <span>${Number(post.job_salary).toLocaleString()} per year</span>
                  </div>
                )}
                {post.job_category && (
                  <div className="flex items-center">
                    <BriefcaseIcon /> {/* Re-using briefcase for category or create a new one */}
                    <span>{post.job_category}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => navigate(`/get-single-post/${userId}/${post._id}`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
             {/* Optional: Add a subtle footer to the card, e.g., date posted */}
            {post.createdAt && (
                <div className="bg-slate-50 px-6 py-3 text-xs text-slate-500 border-t border-slate-200">
                    Posted on: {new Date(post.createdAt).toLocaleDateString()}
                </div>
            )}
          </div>
        ))}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <Link
              to="/home" // Or your main dashboard route
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <BackArrowIcon />
              Back to Dashboard
            </Link>
            <Link
              to="/create-jobpost"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <PlusIcon />
              Create New
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 text-center sm:text-left">
            Your Job Posts
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

export default JobPostsList;