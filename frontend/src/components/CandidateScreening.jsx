import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // Added Link
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";
import InterviewInvite from "./InterviewInvite"; // Assuming this component is styled or will be styled

// --- Reusable Icons (Heroicons style) ---
const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);

const ChartBarIcon = () => ( // For section title
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-md border border-slate-200">
        <p className="label font-semibold text-slate-700">{`${label} : ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

const ScoreCard = ({ title, score, bgColor = "bg-sky-500", textColor = "text-sky-100" }) => (
    <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 text-center">
        <h4 className="text-sm font-medium text-slate-500 mb-1">{title}</h4>
        <p className={`text-3xl font-bold ${score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
            {score}%
        </p>
        <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
          <div
            className={`${bgColor} h-2.5 rounded-full`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
    </div>
);


const CandidateScreening = () => {
  const { candidate_id } = useParams();
  const [screeningData, setScreeningData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");
  const [jobPostId, setJobPostId] = useState(null); // To navigate back to candidates list

  useEffect(() => {
    const fetchScreening = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:8000/screening/${userId}/${candidate_id}`);
        setScreeningData(response.data.screening); // screeningData is the outer object
        // Assuming response.data.screening.job_post_id contains the ID needed for navigation
        if (response.data.screening && response.data.screening.job_post_id) {
            setJobPostId(response.data.screening.job_post_id);
        }
        console.log("Full screening response:", response.data);
      } catch (err) {
        console.error("--- Full Axios Error Object (Screening) ---", err);
        let displayErrorMessage = "An unexpected error occurred while fetching screening data.";
        if (err.response) {
          const responseData = err.response.data;
          console.error("Error Response Data (Screening):", responseData);
          if (typeof responseData === 'string') displayErrorMessage = responseData;
          else if (responseData?.detail) displayErrorMessage = responseData.detail;
          else if (responseData?.message) displayErrorMessage = responseData.message;
          else if (err.message) displayErrorMessage = `Server error (${err.response.status}): ${err.message}`;
        } else if (err.request) {
          displayErrorMessage = "No response from server. Check network and server status.";
        } else {
          displayErrorMessage = err.message;
        }
        setError(displayErrorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (userId && candidate_id) {
      fetchScreening();
    } else {
        setError("User ID or Candidate ID is missing.");
        setLoading(false);
    }
  }, [userId, candidate_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="text-xl font-semibold text-slate-700">Loading screening results...</div>
        {/* You could add a spinner here */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
            {jobPostId && ( // Only show back to candidates if we have jobPostId
                <div className="mb-6">
                    <Link
                        to={`/get-candidates/${userId}/${jobPostId}`}
                        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        <BackArrowIcon />
                        Back to Candidates
                    </Link>
                </div>
            )}
            <div className="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-lg text-center">
                <p className="font-medium">Error!</p>
                <p>{error}</p>
            </div>
        </div>
      </div>
    );
  }
  // screeningData is the outer object, screeningData.screening is the inner one with scores
  if (!screeningData || !screeningData.screening) {
    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                 {jobPostId && (
                    <div className="mb-6">
                        <Link
                             to={`/get-candidates/${userId}/${jobPostId}`}
                            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                            <BackArrowIcon />
                            Back to Candidates
                        </Link>
                    </div>
                 )}
                <div className="text-center py-16 px-6 bg-white shadow-md rounded-lg">
                    <h3 className="mt-2 text-xl font-semibold text-slate-800">No Screening Data</h3>
                    <p className="mt-1 text-slate-500">
                        Screening data for this candidate is not available or could not be loaded.
                    </p>
                </div>
            </div>
        </div>
    );
  }

  // Correctly access the nested screening object
  const scores = screeningData.screening;
  const overallScore = parseInt(scores.overall) || 0;

  const chartData = [
    { name: "Skills", value: parseInt(scores.skills) || 0, fill: "#8884d8" },
    { name: "Experience", value: parseInt(scores.experience) || 0, fill: "#82ca9d" },
    { name: "Qualification", value: parseInt(scores.qualification) || 0, fill: "#ffc658" },
  ];
  // Colors for the bar chart segments, can be customized
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <div>
            <div className="mb-6">
                 <Link
                    to={jobPostId ? `/get-candidates/${userId}/${jobPostId}` : `/jobposts/${userId}`} // Fallback if jobPostId is not available
                    className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                    <BackArrowIcon />
                    {jobPostId ? "Back to Candidates" : "Back to Job Posts"}
                </Link>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
                Candidate Screening Report
            </h1>
            {screeningData.candidate_name && (
                <p className="mt-1 text-lg text-slate-600">
                    For: <span className="font-medium">{screeningData.candidate_name}</span>
                </p>
            )}
        </div>

        {/* Overall Score Section */}
        <div className="bg-white shadow-xl rounded-lg p-6">
            <h3 className="text-xl font-semibold text-slate-700 mb-1 text-center">Overall Match Score</h3>
            <p className="text-5xl font-bold text-center mb-3" style={{ color: overallScore >= 70 ? '#16a34a' : overallScore >= 40 ? '#ca8a04' : '#dc2626' }}>
                {overallScore}%
            </p>
            <div className="w-full bg-slate-200 rounded-full h-4 dark:bg-slate-700">
                <div
                    className="h-4 rounded-full text-xs font-medium text-blue-100 text-center p-0.5 leading-none"
                    style={{
                        width: `${overallScore}%`,
                        backgroundColor: overallScore >= 70 ? '#22c55e' : overallScore >= 40 ? '#f59e0b' : '#ef4444'
                    }}
                >
                </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
                This score reflects the candidate's overall fit based on skills, experience, and qualifications.
            </p>
        </div>

        {/* Detailed Scores & Chart */}
        <div className="bg-white shadow-xl rounded-lg">
            <div className="px-6 py-5 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-700 flex items-center">
                    <ChartBarIcon />
                    Score Breakdown
                </h3>
            </div>
            <div className="p-6">
                <div className="mb-8 h-80 sm:h-96"> {/* Fixed height for chart container */}
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(206, 206, 206, 0.2)'}}/>
                            {/* <Legend /> */}
                            <Bar dataKey="value" barSize={35} radius={[0, 5, 5, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <ScoreCard title="Skills Match" score={parseInt(scores.skills) || 0} bgColor="bg-blue-500" />
                    <ScoreCard title="Experience Match" score={parseInt(scores.experience) || 0} bgColor="bg-green-500" />
                    <ScoreCard title="Qualification Match" score={parseInt(scores.qualification) || 0} bgColor="bg-amber-500" />
                </div>
            </div>
        </div>


        {/* Interview Invite Section */}
        <div className="bg-white shadow-xl rounded-lg p-6">
             <h3 className="text-xl font-semibold text-slate-700 mb-4 text-center">Next Steps</h3>
            <InterviewInvite userId={userId} candidateId={candidate_id} /> {/* Ensure this component is styled */}
        </div>

      </div>
      <footer className="mt-12 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CandidateScreening;