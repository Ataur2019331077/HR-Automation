import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GoogleAuth = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Access environment variable for Vite
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "290222206660-dih3v4gjnq6g4m3j8go6smvnms8ghrf9.apps.googleusercontent.com"; // Fallback for development if .env is not set

  const handleSuccess = async (credentialResponse) => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const response = await axios.post("http://localhost:8000/google-auth", {
        token: credentialResponse.credential,
      });
      const jwtToken = response.data.token;
      localStorage.setItem("token", jwtToken);
      localStorage.setItem("userId", response.data.userId);

      navigate("/home");
    } catch (error) {
      console.error("Google Auth Error:", error.response?.data || error.message);
      const apiErrorMessage = error.response?.data?.message || error.response?.data?.detail || "Google Login Failed. Please try again.";
      setErrorMessage(apiErrorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleError = () => {
    setErrorMessage("Google Login Failed. Please ensure pop-ups are enabled or try again.");
    setIsSubmitting(false);
  };

  if (!googleClientId || googleClientId === "your_google_client_id_here_for_vite" || googleClientId === "290222206660-dih3v4gjnq6g4m3j8go6smvnms8ghrf9.apps.googleusercontent.com") { // Check if it's the default or placeholder
    const isDefaultID = googleClientId === "290222206660-dih3v4gjnq6g4m3j8go6smvnms8ghrf9.apps.googleusercontent.com";
    if (isDefaultID && import.meta.env.PROD) { // Only show severe error in production if default is used
        console.error("CRITICAL: Default Google Client ID is being used in production. Please set VITE_GOOGLE_CLIENT_ID.");
         return (
            <div className="text-center p-4 bg-red-100 border border-red-300 text-red-800 rounded-md">
                Google authentication is misconfigured (Production Error).
            </div>
        );
    }
    console.warn(
        isDefaultID 
        ? "Using default/placeholder Google Client ID. This is okay for local development if intended, but ensure VITE_GOOGLE_CLIENT_ID is set for deployment."
        : "Google Client ID is missing. Please set VITE_GOOGLE_CLIENT_ID environment variable."
    );
    // Allow to proceed with default ID for local dev, but show warning.
    // For a stricter approach, you could return the error div here always if it's not explicitly set.
  }


  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="flex flex-col items-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          theme="outline"
          shape="rectangular"
          size="large"
          width="300px" // Adjust as needed, or let it be responsive
          useOneTap={false}
          disabled={isSubmitting}
        />
        {errorMessage && (
          <p className="text-red-600 text-xs mt-2 text-center">{errorMessage}</p>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;