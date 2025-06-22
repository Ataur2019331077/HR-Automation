import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import RankingComponent from "./RankingComponent"; // Assuming this component is styled or you'll style it separately

// --- Reusable Icons (Heroicons style) ---
const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const BriefcaseIcon = () => ( // For Job Type / Category
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v1H2a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2h-2V4a2 2 0 00-2-2H6zm8 2H6v1h8V4zm-2 5H8v2h4V9z" clipRule="evenodd" />
    </svg>
);

const DollarIcon = () => ( // For Salary
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-.567-.267z" />
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.743.557.75.75 0 00.49 1.358A3.035 3.035 0 0110 8.5v1.037a.75.75 0 001.409.543A4.535 4.535 0 0012.5 10.5h.083a1 1 0 100-2h-.083a2.5 2.5 0 01-1.917-1.082V5z" clipRule="evenodd" />
    </svg>
);

const UserGroupIcon = () => ( // For View Candidates
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
    </svg>
);

const CalendarIcon = () => ( // For Create Slots
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
);

const GlobeAltIcon = () => ( // For Online Platform
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
);

const ShareIcon = () => ( // For Social Media
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
);

// Reusable Card Component
const SectionCard = ({ title, icon, children, titleColor = "text-slate-700" }) => (
    <div className="bg-white shadow-xl rounded-lg">
        <div className={`px-6 py-5 border-b border-slate-200 ${title ? '' : 'hidden'}`}>
            <h3 className={`text-xl font-semibold ${titleColor} flex items-center`}>
                {icon && <span className="mr-3">{icon}</span>}
                {title}
            </h3>
        </div>
        <div className="p-6 space-y-4">
            {children}
        </div>
    </div>
);

const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start">
        {icon && <span className="mt-0.5 mr-3 flex-shrink-0">{icon}</span>}
        <div>
            <span className="font-medium text-slate-600">{label}:</span>
            <span className="ml-2 text-slate-800">{value}</span>
        </div>
    </div>
);


const GetSingleJobPost = () => {
  const { userId, post_id } = useParams();
  const navigate = useNavigate();
  const [jobPost, setJobPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:8000/get-single_post/${userId}/${post_id}`);
        setJobPost(response.data.job_post);
      } catch (err) {
        console.error("Error fetching job post:", err.response?.data || err.message);
        setError(err.response?.data?.detail || "Failed to fetch job post details.");
      } finally {
        setLoading(false);
      }
    };

    if (userId && post_id) {
      fetchJobPost();
    } else {
      setError("Missing user ID or post ID.");
      setLoading(false);
    }
  }, [userId, post_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="text-xl font-semibold text-slate-700">Loading job post details...</div>
        {/* You could add a spinner here */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link
                    to={`/jobposts/${userId}`} // Link back to the list of job posts for this user
                    className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                    <BackArrowIcon />
                    Back to My Job Posts
                </Link>
            </div>
            <div className="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-lg text-center">
                <p className="font-medium">Error!</p>
                <p>{error}</p>
            </div>
        </div>
      </div>
    );
  }

  if (!jobPost) {
    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                 <div className="mb-6">
                    <Link
                        to={`/jobposts/${userId}`}
                        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        <BackArrowIcon />
                        Back to My Job Posts
                    </Link>
                </div>
                <div className="text-center py-16 px-6 bg-white shadow-md rounded-lg">
                    <h3 className="mt-2 text-xl font-semibold text-slate-800">Job Post Not Found</h3>
                    <p className="mt-1 text-slate-500">
                        The job post you are looking for could not be found or may have been removed.
                    </p>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <div>
            <div className="mb-6">
                 <Link
                    to={`/jobposts/${userId}`}
                    className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                    <BackArrowIcon />
                    Back to My Job Posts
                </Link>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 break-words">
                {jobPost.job_title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
                Posted on: {new Date(jobPost.createdAt || Date.now()).toLocaleDateString()}
                {jobPost.user?.username && ` by ${jobPost.user.username}`}
            </p>
        </div>

        <SectionCard title="Job Details">
            <div className="prose prose-slate max-w-none">
                 <h4 className="font-semibold text-slate-700">Description:</h4>
                 <p className="text-slate-600 whitespace-pre-wrap">{jobPost.job_description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4 pt-4 border-t border-slate-200">
                <DetailItem icon={<LocationIcon />} label="Location" value={jobPost.job_location} />
                <DetailItem icon={<BriefcaseIcon />} label="Type" value={jobPost.job_type} />
                <DetailItem icon={<BriefcaseIcon />} label="Category" value={jobPost.job_category} />
                <DetailItem icon={<DollarIcon />} label="Salary" value={jobPost.job_salary ? `$${Number(jobPost.job_salary).toLocaleString()} per year` : "Not specified"} />
            </div>
        </SectionCard>

        {jobPost.online_job_platform && (jobPost.online_job_platform.job_headline || jobPost.online_job_platform.job_description) && (
            <SectionCard title="Online Platform View" icon={<GlobeAltIcon />} titleColor="text-sky-700">
                 {jobPost.online_job_platform.job_headline && (
                    <div>
                        <h4 className="font-semibold text-slate-700">Headline:</h4>
                        <p className="text-slate-600">{jobPost.online_job_platform.job_headline}</p>
                    </div>
                 )}
                 {jobPost.online_job_platform.job_description && (
                    <div className={jobPost.online_job_platform.job_headline ? "mt-4" : ""}>
                        <h4 className="font-semibold text-slate-700">Description:</h4>
                        <p className="text-slate-600 whitespace-pre-wrap">{jobPost.online_job_platform.job_description}</p>
                    </div>
                 )}
                 {jobPost.online_job_platform.job_type && (
                    <div className={jobPost.online_job_platform.job_headline ? "mt-4" : ""}>
                        <h4 className="font-semibold text-slate-700">Type:</h4>
                        <p className="text-slate-600 whitespace-pre-wrap">{jobPost.online_job_platform.job_type}</p>
                    </div>
                 )}
                 {jobPost.online_job_platform.job_salary && (
                    <div className={jobPost.online_job_platform.job_headline ? "mt-4" : ""}>
                        <h4 className="font-semibold text-slate-700">Salary:</h4>
                        <p className="text-slate-600 whitespace-pre-wrap">{jobPost.online_job_platform.job_salary}</p>
                    </div>
                 )}
            </SectionCard>
        )}

        {jobPost.facebook_linkedin && (jobPost.facebook_linkedin.job_headline || jobPost.facebook_linkedin.job_description) && (
            <SectionCard title="Facebook & LinkedIn View" icon={<ShareIcon />} titleColor="text-blue-700">
                {jobPost.facebook_linkedin.job_headline && (
                    <div>
                        <h4 className="font-semibold text-slate-700">Headline:</h4>
                        <p className="text-slate-600">{jobPost.facebook_linkedin.job_headline}</p>
                    </div>
                 )}
                 {jobPost.facebook_linkedin.job_description && (
                    <div className={jobPost.facebook_linkedin.job_headline ? "mt-4" : ""}>
                        <h4 className="font-semibold text-slate-700">Description:</h4>
                        <p className="text-slate-600 whitespace-pre-wrap">{jobPost.facebook_linkedin.job_description}</p>
                    </div>
                 )}
                 {jobPost.facebook_linkedin.job_type && (
                    <div className={jobPost.facebook_linkedin.job_headline ? "mt-4" : ""}>
                        <h4 className="font-semibold text-slate-700">Type:</h4>
                        <p className="text-slate-600 whitespace-pre-wrap">{jobPost.facebook_linkedin.job_type}</p>
                    </div>
                 )}
                 {jobPost.facebook_linkedin.job_salary && (
                    <div className={jobPost.facebook_linkedin.job_headline ? "mt-4" : ""}>
                        <h4 className="font-semibold text-slate-700">Salary:</h4>
                        <p className="text-slate-600 whitespace-pre-wrap">{jobPost.facebook_linkedin.job_salary}</p>
                    </div>
                 )}
            </SectionCard>
        )}
        
        <SectionCard title="Candidate Management & Scheduling">
             <div className="flex flex-col sm:flex-row sm:justify-center gap-4">
                <Link
                    to={`/get-candidates/${userId}/${post_id}`}
                    className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 ease-in-out"
                >
                    <UserGroupIcon />
                    View Candidates
                </Link>
                <Link
                    to={`/create-slots/${userId}`} // Assuming this is general for the user, not specific to post_id
                    className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-lg text-indigo-700 bg-white hover:bg-slate-50 transition duration-150 ease-in-out"
                >
                    <CalendarIcon />
                    Create Interview Slots
                </Link>
            </div>
        </SectionCard>

        <RankingComponent userId={userId} jobPostId={post_id} />


      </div>
       <footer className="mt-12 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default GetSingleJobPost;