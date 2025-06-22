import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // Added Link for back button (optional)
import axios from "axios";

// --- Reusable Icons (Heroicons style) ---
const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);

const CalendarCheckIcon = () => ( // For section title
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM12 18L9 15l1.5-1.5L12 15l3.5-3.5L17 13l-5 5z" />
    </svg>
);

const ClockIcon = () => ( // For slot time
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const NoSymbolIcon = () => ( // For no slots
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
);


const BookSlot = () => {
  const { userId } = useParams();
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // type: 'success' or 'error'
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoading(true);
      setFetchError(null);
      setMessage({ text: "", type: "" }); // Clear message on new fetch

      if (!userId) {
        setFetchError("User ID not found in URL. Cannot fetch slots.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/users/${userId}/available-slots/`);
        const allSlots = response.data.slots || [];
        const available = allSlots.filter(slot => slot.available).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        const booked = allSlots.filter(slot => !slot.available).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

        setAvailableSlots(available);
        setBookedSlots(booked);
      } catch (error) {
        console.error("Error fetching slots:", error.response?.data || error.message);
        const errorMsg = error.response?.data?.detail || "Failed to fetch available slots. Please try again later.";
        setFetchError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission if wrapped in a form
    if (!selectedSlot) {
      setMessage({ text: "Please select an available time slot.", type: "error" });
      return;
    }
    if (!email.trim()) {
      setMessage({ text: "Please enter your email address.", type: "error" });
      return;
    }
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage({ text: "Please enter a valid email address.", type: "error" });
      return;
    }


    setIsSubmitting(true);
    setMessage({ text: "", type: "" });
    try {
      const response = await axios.post(`http://localhost:8000/users/${userId}/book-slot/`, {
        candidate_email: email,
        selected_start_time: selectedSlot.start_time,
      });

      setMessage({ text: `Interview booked successfully! A confirmation and Google Meet link has been sent to ${email}.`, type: "success" });
      // Refresh slots to show the booked one
      setAvailableSlots(prev => prev.filter(slot => slot.start_time !== selectedSlot.start_time));
      setBookedSlots(prev => [...prev, {...selectedSlot, available: false}].sort((a,b) => new Date(a.start_time) - new Date(b.start_time)));
      setSelectedSlot(null); // Clear selection
      // setEmail(""); // Optionally clear email
    } catch (error) {
      console.error("Error booking slot:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || "Failed to book slot. The slot might have just been taken or an error occurred.";
      setMessage({ text: errorMsg, type: "error" });
       // Optionally re-fetch slots if booking failed due to slot being taken
      if (error.response?.status === 409 || error.response?.data?.detail?.includes("taken")) {
         const newResponse = await axios.get(`http://localhost:8000/users/${userId}/available-slots/`);
         const allSlots = newResponse.data.slots || [];
         setAvailableSlots(allSlots.filter(slot => slot.available).sort((a, b) => new Date(a.start_time) - new Date(b.start_time)));
         setBookedSlots(allSlots.filter(slot => !slot.available).sort((a, b) => new Date(a.start_time) - new Date(b.start_time)));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString([], {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl font-semibold text-slate-700">Loading available slots...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-lg">
            <p className="font-medium">Error!</p>
            <p>{fetchError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto w-full">
        {/* Optional: Back link if this page is part of a larger flow */}
        {/* <div className="mb-8">
            <Link to="/some-previous-page" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800">
                <BackArrowIcon /> Back
            </Link>
        </div> */}
        <div className="text-center mb-8">
            <CalendarCheckIcon className="mx-auto h-12 w-12 text-indigo-600" />
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-800">
                Book an Interview Slot
            </h1>
            <p className="mt-2 text-slate-500">
                Select an available time and enter your email to confirm your interview.
            </p>
        </div>


        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg p-6 sm:p-8 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Your Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Available Slots <span className="text-red-500">*</span>
            </h3>
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-2">
                {availableSlots.map((slot) => (
                  <button
                    type="button"
                    key={slot.start_time} // Use start_time as key, assuming it's unique
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full p-3 text-sm rounded-lg shadow-sm border transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
                      ${
                        selectedSlot?.start_time === slot.start_time
                          ? "bg-indigo-600 text-white border-indigo-600 ring-indigo-500"
                          : "bg-white text-slate-700 border-slate-300 hover:border-indigo-500 hover:text-indigo-600"
                      }`}
                  >
                    <div className="flex items-center justify-center">
                        <ClockIcon className={`${selectedSlot?.start_time === slot.start_time ? 'text-indigo-200' : 'text-slate-400'} mr-2`} />
                        {formatDate(slot.start_time)}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-md border border-dashed border-slate-300">
                <NoSymbolIcon />
                <p className="mt-2 text-slate-500">No available slots at the moment. Please check back later.</p>
              </div>
            )}
          </div>

          {bookedSlots.length > 0 && (
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">
                Already Booked Slots
              </h3>
              <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {bookedSlots.map((slot) => (
                  <li
                    key={slot.start_time}
                    className="bg-slate-100 text-slate-600 p-2.5 rounded-md text-sm border border-slate-200 flex items-center"
                  >
                    <ClockIcon className="text-slate-400 mr-2 flex-shrink-0" />
                    {formatDate(slot.start_time)} - <span className="ml-1 font-medium text-red-600">Booked</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {message.text && (
            <div
              className={`p-3.5 rounded-md text-sm ${
                message.type === "success"
                  ? "bg-green-50 border border-green-300 text-green-700"
                  : "bg-red-50 border border-red-300 text-red-700"
              }`}
              role="alert"
            >
              {message.text}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              disabled={isSubmitting || !selectedSlot || !email}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Booking Slot...
                </>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </div>
        </form>
      </div>
      <footer className="mt-12 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BookSlot;