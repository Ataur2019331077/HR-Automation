import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// A simple Google icon SVG for the button (optional, but nice)
const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 381.7 512 244 512 110.3 512 0 401.7 0 265.2S110.3 18.3 244 18.3c67.6 0 120.4 22.9 162.2 62.3l-66.3 64.4c-26.1-24.4-57.2-39.8-95.9-39.8-72.3 0-132.2 59.5-132.2 132.8s59.9 132.8 132.2 132.8c76.1 0 111.7-52.3 115.9-78.9H244V261.8h244z"></path>
    </svg>
);

const Home = () => {
    const userId = localStorage.getItem('userId');
    const [url, setUrl] = useState('');
    const [isShowAuthButton, setIsShowAuthButton] = useState(true);
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/home/${userId}`);
                setUserDetails(response.data.user);

                if (!response.data.user.google_auth) {
                    fetchAuthUrl();
                    setIsShowAuthButton(true);
                } else {
                    setIsShowAuthButton(false);
                }
            } catch (error) {
                console.error("Error fetching user details: ", error);
                // Optionally, set an error state here to display to the user
            } finally {
                setLoading(false);
            }
        };

        const fetchAuthUrl = async () => {
            try {
                const response = await axios.get('http://localhost:8000/authenticate-url/');
                setUrl(response.data.auth_url);
            } catch (error) {
                console.error("Error fetching auth URL: ", error);
            }
        };

        if (userId) {
            fetchUserDetails();
        } else {
            setLoading(false); // If no userId, nothing to load
            // Optionally, redirect to login or show a message
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <div className="text-xl font-semibold text-slate-700">Loading, please wait...</div>
                {/* You could add a spinner here */}
            </div>
        );
    }

    if (!userId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 text-center">
                <h1 className="text-3xl font-bold text-slate-800 mb-4">Access Denied</h1>
                <p className="text-slate-600 mb-6">Please log in to access the home page.</p>
                <Link
                    to="/login" // Assuming you have a login route
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition duration-150 ease-in-out"
                >
                    Go to Login
                </Link>
            </div>
        );
    }
    
    // Determine if the auth section should be shown
    // Show if: userDetails exists, google_auth is false, auth URL is available, and isShowAuthButton is true
    const showGoogleAuthSection = userDetails && !userDetails.google_auth && url && isShowAuthButton;

    return (
        <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto w-full bg-white shadow-xl rounded-lg p-8 space-y-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 text-center">
                        Dashboard Home
                    </h1>
                    {userDetails && (
                        <p className="mt-2 text-center text-lg text-slate-600">
                            Welcome to <span className="font-medium text-indigo-600">HRM</span>!
                        </p>
                    )}
                </div>

                {showGoogleAuthSection && (
                    <div className="border-t border-slate-200 pt-8">
                        <div className="bg-sky-50 border border-sky-200 p-6 rounded-lg text-center">
                            <h2 className="text-xl font-semibold text-sky-800 mb-3">Enhance Your Experience</h2>
                            <p className="text-sky-700 mb-6">
                                Connect your Google Account to enable additional features and streamline your workflow.
                            </p>
                            <a // Changed Link to <a> for external URL
                                href={url}
                                className="inline-flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 px-6 rounded-lg transition duration-150 ease-in-out shadow-md hover:shadow-lg"
                                target="_blank" // Good practice for external auth links
                                rel="noopener noreferrer"
                            >
                                <GoogleIcon />
                                Authenticate your account for email automation
                            </a>
                        </div>
                    </div>
                )}

                {userDetails && userDetails.google_auth && (
                     <div className="border-t border-slate-200 pt-8 text-center">
                        <p className="text-green-600 bg-green-50 border border-green-200 p-4 rounded-md inline-flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Google Account Connected
                        </p>
                    </div>
                )}

                <div className="border-t border-slate-200 pt-8 space-y-6">
                    <h2 className="text-xl font-semibold text-slate-700 text-center mb-2">Manage Job Postings</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link
                            to="/create-jobpost"
                            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 ease-in-out"
                        >
                            Create New Job Post
                        </Link>
                        <Link
                            to={`/jobposts/${userId}`}
                            className="w-full flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-lg text-indigo-700 bg-white hover:bg-slate-50 transition duration-150 ease-in-out"
                        >
                            View My Job Posts
                        </Link>
                    </div>
                </div>
            </div>

            <footer className="mt-12 text-center text-sm text-slate-500">
                <p>© {new Date().getFullYear()} Your Company. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;