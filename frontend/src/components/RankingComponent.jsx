import React, { useEffect, useState } from "react";
import axios from "axios";

// --- Reusable Icons (Heroicons style) ---
const TrophyIcon = () => ( // For section title or rank
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

const UserCircleIcon = () => ( // For empty state
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16.5c2.57 0 4.948.684 6.879 1.304M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const RankingComponent = ({ userId, jobPostId }) => {
  const [rankingData, setRankingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRanking = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!userId || !jobPostId) {
          setError("User ID or Job Post ID is missing.");
          setIsLoading(false);
          return;
        }
        const response = await axios.get(`http://localhost:8000/ranking/${userId}/${jobPostId}`);
        // Ensure response.data.ranking is an array, fallback to empty array if not
        setRankingData(Array.isArray(response.data.ranking) ? response.data.ranking : []);
        console.log("Ranking Data:", response.data.ranking);
      } catch (err) {
        console.error("--- Full Axios Error Object (Ranking) ---", err);
        let displayErrorMessage = "An unexpected error occurred while fetching candidate rankings.";
        if (err.response) {
          const responseData = err.response.data;
          console.error("Error Response Data (Ranking):", responseData);
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
        setIsLoading(false);
      }
    };

    fetchRanking();
  }, [userId, jobPostId]);

  const renderRankBadge = (rank) => {
    let bgColor = 'bg-slate-200 text-slate-700';
    let icon = null;

    if (rank === 1) {
        bgColor = 'bg-amber-100 text-amber-700';
        icon = <TrophyIcon className="h-4 w-4 text-amber-500 inline-block mr-1" />;
    } else if (rank === 2) {
        bgColor = 'bg-slate-100 text-slate-600'; // Silver-ish
    } else if (rank === 3) {
        bgColor = 'bg-yellow-100 text-yellow-700'; // Bronze-ish
    }
    
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center justify-center min-w-[28px] ${bgColor}`}>
            {icon}{rank}
        </span>
    );
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600">Loading candidate rankings...</p>
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

    if (rankingData.length === 0) {
      return (
        <div className="text-center py-12 px-6 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <UserCircleIcon />
          <h3 className="mt-3 text-lg font-medium text-slate-700">No Ranking Data Available</h3>
          <p className="mt-1 text-sm text-slate-500">
            Candidate rankings for this job post are not yet available or no candidates match.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 bg-white">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-4 py-3.5 text-left text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wider">Rank</th>
              <th scope="col" className="px-4 py-3.5 text-left text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-4 py-3.5 text-left text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-4 py-3.5 text-left text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wider">Reason / Metrics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rankingData.map((candidate, index) => (
              <tr key={candidate._id || candidate.email || index} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 text-center">
                    {renderRankBadge(index + 1)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{candidate.name || "N/A"}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 break-all">{candidate.email || "N/A"}</td>
                <td className="px-4 py-4 whitespace-normal text-sm text-slate-600 max-w-xs xl:max-w-sm break-words">
                  {/* Assuming 'metrics' is a string. If it's an object, you'll need to format it. */}
                  {typeof candidate.metrics === 'object' ? JSON.stringify(candidate.metrics) : candidate.metrics || "No specific reason provided"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };


  return (
    // This component is often part of another page, so the outer container might be provided by the parent.
    // If it's standalone, wrap with the standard page layout. Here, assuming it's a section.
    <div className="bg-white shadow-xl rounded-lg">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center">
            <TrophyIcon className="h-6 w-6 mr-3 text-indigo-600" /> {/* Changed icon color */}
            <h2 className="text-xl font-semibold text-slate-800">
                Candidate Rankings
            </h2>
        </div>
        <div className="p-6">
            {renderContent()}
        </div>
    </div>
  );
};

export default RankingComponent;