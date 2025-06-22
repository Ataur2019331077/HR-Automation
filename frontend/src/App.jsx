// src/App.jsx
import React from "react";
import { Routes, Route, BrowserRouter } from 'react-router-dom'; // Import BrowserRouter

import LoginPage from "./components/LoginPage";
import Home from "./components/Home";
import Landing from "./components/Landing";
import {AuthCallback, AuthRedirect} from './components/AuthComponents';
import CreateJobPost from "./components/CreateJobPost";
import GetSingleJobPost from "./components/GetSinglePost";
import JobPostsList from "./components/JobPostsList";
import CandidatesList from "./components/CandidatesList";
import CandidateScreening from "./components/CandidateScreening";
import CreateSlots from "./components/CreateSlots";
import BookSlot from "./components/BookSlot";
import Navbar from "./components/Navbar"; // Import the Navbar

import "./index.css"; // Your main Tailwind CSS import


const App = () => {
  return (
    // Wrap everything in BrowserRouter if it's not already done in index.js
    // If BrowserRouter is in index.js, you can remove it from here.
  
      <div> {/* This div can be removed if BrowserRouter is the top-level */}
        <Navbar /> {/* Navbar is placed here, it will internally decide if it should render */}
        <Routes>
          {/* Auth specific routes, Navbar will be hidden by its own logic */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/redirect" element={<AuthRedirect />} />
          
          {/* Routes where Navbar is hidden by its own logic */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Routes where Navbar will be visible */}
          <Route path="/home" element={<Home />} />
          <Route path="/create-jobpost" element={<CreateJobPost />} />
          <Route path="/get-single-post/:userId/:post_id" element={<GetSingleJobPost />} />
          <Route path="/jobposts/:userId" element={<JobPostsList />} />
          <Route path="/get-candidates/:userId/:job_post_id" element={<CandidatesList />} />
          <Route path="/screening/:userId/:candidate_id" element={<CandidateScreening />} /> {/* Corrected param name from candidate_id to :candidate_id */}
          <Route path="/create-slots/:userId" element={<CreateSlots />} />
          <Route path="/book-slot/:userId" element={<BookSlot />} />
        </Routes>
      </div>

  );
}

export default App;