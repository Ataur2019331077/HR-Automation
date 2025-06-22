import React, { useState } from "react";
import { Link } from "react-router-dom"; // For back button
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./custom-datepicker.css"; // We'll create this for custom styles

// --- Reusable Icons (Heroicons style) ---
const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);

const CalendarDaysIcon = () => ( // For section title
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const PlusCircleIcon = () => ( // For Confirm Time
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
    </svg>
);

const TrashIcon = () => ( // For Remove
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const CreateSlots = () => {
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [duration, setDuration] = useState(60); // Default duration in minutes
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // type can be 'success' or 'error'
  const userId = localStorage.getItem("userId");

  const handleTimeSelect = (date) => {
    setSelectedDateTime(date);
  };

  const handleAddTime = () => {
    if (selectedDateTime) {
      // Check for duplicates
      if (selectedTimes.some(time => time.getTime() === selectedDateTime.getTime())) {
        setMessage({ text: "This time slot has already been added.", type: "error" });
        return;
      }
      setSelectedTimes([...selectedTimes, selectedDateTime].sort((a, b) => a - b)); // Keep sorted
      setSelectedDateTime(null);
      setMessage({ text: "", type: "" }); // Clear previous message
    }
  };

  const handleRemoveTime = (index) => {
    const updatedTimes = [...selectedTimes];
    updatedTimes.splice(index, 1);
    setSelectedTimes(updatedTimes);
  };

  const handleSubmit = async () => {
    if (selectedTimes.length === 0) {
        setMessage({ text: "Please add at least one time slot.", type: "error" });
        return;
    }
    setIsLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const formattedTimes = selectedTimes.map((time) => time.toISOString());
      const response = await axios.post(
        `http://localhost:8000/users/${userId}/create-slots/`,
        {
          start_times: formattedTimes,
          duration: parseInt(duration, 10), // Ensure duration is an integer
        }
      );
      setMessage({ text: response.data.message || "Slots created successfully!", type: "success" });
      setSelectedTimes([]);
    } catch (error) {
      console.error("Error creating slots:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || "Failed to create slots. Please try again.";
      setMessage({ text: errorMsg, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter past times for DatePicker
  const filterPassedTimes = (time) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);
    return currentDate.getTime() < selectedDate.getTime();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        <div className="mb-8">
            <div className="mb-2">
                <Link
                    to="/home" // Or your main dashboard route
                    className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                    <BackArrowIcon />
                    Back to Dashboard
                </Link>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 flex items-center">
                <CalendarDaysIcon />
                Create Interview Slots
            </h1>
            <p className="mt-1 text-slate-500">
                Define available time slots for candidate interviews.
            </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8 space-y-6">
          <div>
            <label
              htmlFor="datetime-picker"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Select Date and Start Time
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <DatePicker
                    id="datetime-picker"
                    selected={selectedDateTime}
                    onChange={handleTimeSelect}
                    showTimeSelect
                    filterTime={filterPassedTimes} // Prevent selecting past times
                    minDate={new Date()} // Prevent selecting past dates
                    timeFormat="h:mm aa"
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm react-datepicker-wrapper-full" // Custom class for width
                    placeholderText="Click to select a date and time"
                />
                <button
                    type="button"
                    onClick={handleAddTime}
                    disabled={!selectedDateTime}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <PlusCircleIcon />
                    Confirm Time
                </button>
            </div>
          </div>

          {selectedTimes.length > 0 && (
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-medium text-slate-800 mb-3">
                Scheduled Slots:
              </h3>
              <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {selectedTimes.map((time, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200"
                  >
                    <span className="text-sm text-slate-700">
                      {time.toLocaleString([], {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: true
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(index)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
                      aria-label="Remove slot"
                    >
                      <TrashIcon />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Interview Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(Math.max(15, Number(e.target.value)))} // Min duration 15 mins
              min="15"
              step="15"
              className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., 60"
            />
          </div>

          {message.text && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === "success"
                  ? "bg-green-50 border border-green-300 text-green-700"
                  : "bg-red-50 border border-red-300 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading || selectedTimes.length === 0}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Slots...
                </>
              ) : (
                "Create All Scheduled Slots"
              )}
            </button>
          </div>
        </div>
      </div>
       <footer className="mt-12 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CreateSlots;