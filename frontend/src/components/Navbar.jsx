// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // If you need to fetch user details for the navbar

// --- Icons (Heroicons or similar) ---
const UserCircleIcon = ({ className = "h-8 w-8 text-slate-500" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16.5c2.57 0 4.948.684 6.879 1.304M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const LogoutIcon = ({ className = "mr-2 h-5 w-5 text-slate-500 group-hover:text-indigo-600" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

// Simple Logo Icon (replace with your actual logo)
const LogoIcon = ({ className = "h-8 w-auto text-indigo-600" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
    </svg>
);


const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [userName, setUserName] = useState("User"); // Placeholder

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        setIsLoggedIn(!!token);

        // Optional: Fetch user details to display name
        const fetchUserDetails = async () => {
            if (token && userId) {
                try {
                    // Adjust this endpoint if needed
                    const response = await axios.get(`http://localhost:8000/user/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUserName(response.data.user?.username || response.data.user?.email || "User");
                } catch (error) {
                    console.error("Error fetching user details for navbar:", error);
                    // If token is invalid, log out
                    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                        handleLogout();
                    }
                }
            }
        };
        // fetchUserDetails(); // Uncomment if you want to fetch user details for display
    }, [location.pathname]); // Re-check on route change

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setIsLoggedIn(false);
        setDropdownOpen(false);
        navigate('/login');
    };

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    // Don't render navbar on landing and login pages
    if (location.pathname === '/' || location.pathname === '/login') {
        return null;
    }

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Main Navigation */}
                    <div className="flex items-center">
                        <Link to="/home" className="flex-shrink-0 flex items-center">
                            <LogoIcon />
                            <span className="ml-2 text-xl font-bold text-slate-800">HRM Platform</span>
                        </Link>
                        {/* Desktop Navigation Links (if any beyond home) */}
                        {isLoggedIn && (
                            <div className="hidden md:ml-10 md:flex md:items-baseline md:space-x-4">
                                <NavLinkItem to="/home">Dashboard</NavLinkItem>
                                {/* Add more main navigation links here if needed */}
                                {/* e.g., <NavLinkItem to="/reports">Reports</NavLinkItem> */}
                            </div>
                        )}
                    </div>

                    {/* Right side: User menu or Login/Signup */}
                    <div className="flex items-center">
                        {isLoggedIn ? (
                            <div className="relative ml-3">
                                <div>
                                    <button
                                        type="button"
                                        onClick={toggleDropdown}
                                        className="max-w-xs bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-1 hover:bg-slate-100"
                                        id="user-menu-button"
                                        aria-expanded={dropdownOpen}
                                        aria-haspopup="true"
                                    >
                                        <span className="sr-only">Open user menu</span>
                                        <UserCircleIcon />
                                        <span className="hidden sm:inline ml-2 text-sm font-medium text-slate-700">{userName}</span>
                                    </button>
                                </div>
                                {dropdownOpen && (
                                    <div
                                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="user-menu-button"
                                        tabIndex="-1"
                                    >
                                        {/* <Link
                                            to="/profile" // Example profile link
                                            onClick={() => setDropdownOpen(false)}
                                            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-indigo-600 group"
                                            role="menuitem"
                                            tabIndex="-1"
                                        >
                                            Your Profile
                                        </Link> */}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-indigo-600 group flex items-center"
                                            role="menuitem"
                                            tabIndex="-1"
                                        >
                                           <LogoutIcon />
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // This part might not be reached if navbar is hidden on /login
                            // but kept for completeness if logic changes
                            <div className="space-x-4">
                                <Link
                                    to="/login"
                                    className="text-base font-medium text-slate-600 hover:text-indigo-600"
                                >
                                    Sign in
                                </Link>
                            </div>
                        )}
                    </div>

                     {/* Mobile menu button (optional, if you add more nav links) */}
                    {/* <div className="-mr-2 flex items-center md:hidden">
                        <button type="button" className="bg-white inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" aria-controls="mobile-menu" aria-expanded="false">
                            <span className="sr-only">Open main menu</span>
                            Icon when menu is closed: MenuIcon
                            Icon when menu is open: XIcon
                        </button>
                    </div> */}
                </div>
            </div>

            {/* Mobile menu, show/hide based on menu state (optional) */}
            {/* <div className="md:hidden" id="mobile-menu">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <NavLinkItem to="/home" mobile>Dashboard</NavLinkItem>
                </div>
                {isLoggedIn && (
                    <div className="pt-4 pb-3 border-t border-slate-200">
                        <div className="flex items-center px-5">
                            <div className="flex-shrink-0">
                                <UserCircleIcon />
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-slate-800">{userName}</div>
                            </div>
                        </div>
                        <div className="mt-3 px-2 space-y-1">
                            <button
                                onClick={handleLogout}
                                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-white hover:bg-indigo-600"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                )}
            </div> */}
        </nav>
    );
};

// Helper component for Nav Links to handle active state (optional, but good for UX)
const NavLinkItem = ({ to, children, mobile = false }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    const baseClasses = mobile
        ? "block px-3 py-2 rounded-md text-base font-medium"
        : "px-3 py-2 rounded-md text-sm font-medium";
    
    const activeClasses = mobile
        ? "bg-indigo-600 text-white"
        : "bg-indigo-100 text-indigo-700";
    
    const inactiveClasses = mobile
        ? "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
        : "text-slate-700 hover:bg-slate-50 hover:text-indigo-600";

    return (
        <Link to={to} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {children}
        </Link>
    );
};


export default Navbar;