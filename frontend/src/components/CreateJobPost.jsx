import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Added Link for back button
import axios from "axios";

// Simple Back Arrow Icon
const BackArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const CreateJobPost = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null); // To display submission errors

  const [formData, setFormData] = useState({
    job_title: "",
    job_description: "",
    job_location: "",
    job_type: "", // Consider making this a select dropdown
    job_category: "", // Consider making this a select dropdown
    job_salary: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!userId) {
        setError("User not identified. Please log in again.");
        setIsSubmitting(false);
        // navigate('/login'); // Optionally redirect
        return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8000/create-jobpost/${userId}`,
        {
          ...formData,
          job_salary: formData.job_salary ? parseInt(formData.job_salary, 10) : null, // Ensure salary is an int or null
        }
      );

      console.log("Job post created successfully:", response.data);
      navigate(`/get-single-post/${userId}/${response.data.job_post_id}`);
    } catch (err) {
      console.error("Error creating job post:", err.response?.data || err.message);
      setError(err.response?.data?.detail || "Failed to create job post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define options for select dropdowns (example)
  const jobTypeOptions = ["Full-time", "Part-time", "Contract", "Internship", "Temporary"];
  const jobCategoryOptions = ["Technology", "Marketing", "Sales", "Healthcare", "Education", "Finance", "Other"];


  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-xl">
        <div className="mb-6">
            <Link
                to="/home" // Or wherever your home/dashboard page is
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
                <BackArrowIcon />
                Back to Dashboard
            </Link>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8 text-center">
            Create a New Job Post
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="job_title"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="job_title"
                id="job_title"
                placeholder="e.g., Senior Software Engineer"
                value={formData.job_title}
                onChange={handleChange}
                required
                className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="job_description"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="job_description"
                id="job_description"
                rows="4"
                placeholder="Describe the role, responsibilities, and qualifications..."
                value={formData.job_description}
                onChange={handleChange}
                required
                className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="job_location"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="job_location"
                  id="job_location"
                  placeholder="e.g., San Francisco, CA or Remote"
                  value={formData.job_location}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="job_type"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Job Type <span className="text-red-500">*</span>
                </label>
                 <select
                  name="job_type"
                  id="job_type"
                  value={formData.job_type}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                >
                  <option value="" disabled>Select job type</option>
                  {jobTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div>
                <label
                  htmlFor="job_category"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                 <select
                  name="job_category"
                  id="job_category"
                  value={formData.job_category}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                >
                  <option value="" disabled>Select category</option>
                  {jobCategoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="job_salary"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Salary (Optional, USD per year)
                </label>
                <input
                  type="number"
                  name="job_salary"
                  id="job_salary"
                  placeholder="e.g., 90000"
                  value={formData.job_salary}
                  onChange={handleChange}
                  // Removed required for salary, as it's often optional
                  className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>


            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Create Job Post"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
       <footer className="mt-12 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CreateJobPost;