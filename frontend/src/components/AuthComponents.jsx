import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const userId = localStorage.getItem('userId'); // Get userId from localStorage
    console.log('code:', code);

    if (code && userId) {
      const handleAuth = async () => {
        try {
            await axios.post('http://localhost:8000/authenticate', {
                userId,
                code,
            });
          console.log('Authentication successful');
          navigate('/home'); // Redirect after successful authentication
        } catch (error) {
          console.error('Authentication failed:', error);
          // Handle error (e.g., display an error message)
        }
      };
      handleAuth();
    } else {
      console.error('Missing code or userId');
      // Handle missing code or userId
    }
  }, [location, navigate]);

  return <div>Authenticating...</div>;
};

// Component to get the auth url and perform the redirect.
const AuthRedirect = () => {
    const navigate = useNavigate();
    useEffect(()=>{
        const fetchAuthUrl = async () => {
            try {
                const response = await axios.get('http://localhost:8000/authenticate-url/');
                window.location.href = response.data.auth_url;
            } catch (error) {
                console.error("Error fetching auth url: ", error);
            }
        };
        fetchAuthUrl();
    }, [navigate]);

    return (<div>Redirecting to google Auth...</div>);
};

export {AuthCallback, AuthRedirect};