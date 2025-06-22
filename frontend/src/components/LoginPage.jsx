import React from "react";
import LoginForm from "./LoginForm";
import GoogleAuth from "./GoogleAuth";
// Optional: Add a logo
// import YourLogo from './path/to/your-logo.svg'; // Example

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Optional: Logo */}
        {/* <img className="mx-auto h-12 w-auto" src={YourLogo} alt="Your Company" /> */}
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{' '}
          {/* This part can be dynamic later if you separate signup page */}
          <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
            start your 14-day free trial
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl ring-1 ring-black ring-opacity-5 sm:rounded-lg sm:px-10">
          <LoginForm />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleAuth />
            </div>
          </div>
        </div>
      </div>
      <footer className="mt-12 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LoginPage;