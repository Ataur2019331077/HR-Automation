import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // For Call to Action buttons
import axios from 'axios'; // Using axios for consistency with other components

// --- Icons (Heroicons or similar style - you might need to install @heroicons/react or use SVGs) ---

// Example: UserGroupIcon (for HRs/Candidates)
const UserGroupIcon = ({ className = "h-10 w-10 text-indigo-500" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.084-1.268-.25-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.084-1.268.25-1.857m0 0a5.002 5.002 0 019.5 0m0 0a5.002 5.002 0 01-9.5 0M12 10a3 3 0 11-6 0 3 3 0 016 0zm12 7a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// Example: BriefcaseIcon (for Job Posts)
const BriefcaseIcon = ({ className = "h-10 w-10 text-indigo-500" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

// Example: CheckCircleIcon (for features)
const CheckCircleIcon = ({ className = "h-6 w-6 text-green-500" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// Example: ArrowRightIcon (for CTAs)
const ArrowRightIcon = ({ className = "ml-2 -mr-1 h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


const Landing = () => {
    const [totalHRs, setTotalHRs] = useState(0);
    const [totalJobPosts, setTotalJobPosts] = useState(0);
    const [totalCandidates, setTotalCandidates] = useState(0);
    const [loadingStats, setLoadingStats] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingStats(true);
            setFetchError(null);
            try {
                const response = await axios.get('http://localhost:8000/root'); // Using Axios
                setTotalHRs(response.data.total_hrs || 0);
                setTotalJobPosts(response.data.total_jobposts || 0);
                setTotalCandidates(response.data.total_candidates || 0);
            } catch (error) {
                console.error("Error fetching root data:", error.response?.data || error.message);
                setFetchError("Could not load platform statistics.");
            } finally {
                setLoadingStats(false);
            }
        };
        fetchData();
    }, []);

    const features = [
        { name: "Seamless Job Posting", description: "Create and distribute job openings across multiple platforms effortlessly.", icon: <BriefcaseIcon className="h-8 w-8 text-indigo-600" /> },
        { name: "Intelligent Candidate Matching", description: "Our AI-powered system ranks and matches candidates to your job requirements.", icon: <UserGroupIcon className="h-8 w-8 text-indigo-600" /> },
        { name: "Automated Screening", description: "Streamline your initial screening process with automated tools and assessments.", icon: <CheckCircleIcon className="h-8 w-8 text-green-500" /> },
        { name: "Simplified Interview Scheduling", description: "Coordinate and book interview slots with candidates hassle-free.", icon: <CheckCircleIcon className="h-8 w-8 text-green-500" /> },
        { name: "Google Integration", description: "Connect your Google account for enhanced productivity and calendar sync.", icon: <CheckCircleIcon className="h-8 w-8 text-green-500" /> },
        { name: "Comprehensive Analytics", description: "Gain insights into your recruitment pipeline and make data-driven decisions.", icon: <CheckCircleIcon className="h-8 w-8 text-green-500" /> },
    ];

    const StatCard = ({ icon, value, label, loading }) => (
        <div className="bg-white shadow-lg rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-300">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
                {icon}
            </div>
            {loading ? (
                <div className="h-8 bg-slate-200 rounded w-1/2 mx-auto animate-pulse"></div>
            ) : (
                <p className="text-4xl font-bold text-indigo-600">{value.toLocaleString()}</p>
            )}
            <p className="text-slate-500 mt-1">{label}</p>
        </div>
    );


    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navigation (Simplified for landing page, can be expanded) */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                {/* Replace with your logo */}
                                <svg className="h-8 w-auto text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                                </svg>
                                <span className="ml-2 text-xl font-bold text-slate-800">HRM Platform</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Link
                                to="/login"
                                className="whitespace-nowrap text-base font-medium text-slate-500 hover:text-slate-900 px-3 py-2"
                            >
                                Sign in
                            </Link>
                            <Link
                                to="/login" // Or a dedicated signup page
                                className="ml-4 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main>
                <div className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-50">
                     <div className="absolute inset-0">
                        {/* Optional: Subtle background pattern or image */}
                        {/* <div className="h-1/3 sm:h-2/3" /> */}
                    </div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl">
                                <span className="block">Streamline Your Hiring Process</span>
                                <span className="block text-indigo-600">With Our Intelligent HRM Platform</span>
                            </h1>
                            <p className="mt-6 max-w-md mx-auto text-lg text-slate-600 sm:text-xl md:mt-8 md:max-w-3xl">
                                From job posting to candidate ranking and interview scheduling, our comprehensive Human Resource Management platform empowers you to find and hire the best talent, faster.
                            </p>
                            <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                                <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                                    <Link
                                        to="/login" // Or a dedicated signup page
                                        className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                                    >
                                        Get Started Free
                                    </Link>
                                    <Link
                                        to="#features" // Link to features section
                                        className="flex items-center justify-center px-8 py-3 border border-indigo-600 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10"
                                    >
                                        Learn More
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Section */}
                <div className="py-16 bg-slate-100">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-12">
                            Trusted by Growing Teams
                        </h2>
                        {fetchError && (
                            <p className="text-center text-red-500 mb-8">{fetchError}</p>
                        )}
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                            <StatCard icon={<UserGroupIcon />} value={totalHRs} label="Active HR Professionals" loading={loadingStats} />
                            <StatCard icon={<BriefcaseIcon />} value={totalJobPosts} label="Job Posts Managed" loading={loadingStats} />
                            <StatCard icon={<UserGroupIcon className="h-10 w-10 text-indigo-500 transform scale-x-[-1]" />} value={totalCandidates} label="Candidates Processed" loading={loadingStats} />
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div id="features" className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:text-center">
                            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Our Features</h2>
                            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                Everything you need to hire efficiently
                            </p>
                            <p className="mt-4 max-w-2xl text-xl text-slate-500 lg:mx-auto">
                                Our platform is packed with features designed to save you time and help you make better hiring decisions.
                            </p>
                        </div>

                        <div className="mt-12">
                            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-3">
                                {features.map((feature) => (
                                    <div key={feature.name} className="relative p-6 bg-slate-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                        <dt>
                                            <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                                                {feature.icon}
                                            </div>
                                            <p className="ml-16 text-lg leading-6 font-medium text-slate-900">{feature.name}</p>
                                        </dt>
                                        <dd className="mt-2 ml-16 text-base text-slate-500">{feature.description}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                </div>

                 {/* Call to Action Section */}
                <div className="bg-slate-100">
                    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 sm:py-24 lg:px-8 lg:flex lg:items-center lg:justify-between">
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            <span className="block">Ready to transform your hiring?</span>
                            <span className="block text-indigo-600">Start your free trial today.</span>
                        </h2>
                        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                            <div className="inline-flex rounded-md shadow">
                                <Link
                                    to="/login" // Or signup page
                                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Get started
                                    <ArrowRightIcon />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-800" aria-labelledby="footer-heading">
                <h2 id="footer-heading" className="sr-only">Footer</h2>
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
                    <div className="text-center">
                        <p className="text-base text-slate-400">© {new Date().getFullYear()} HRM Platform. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;