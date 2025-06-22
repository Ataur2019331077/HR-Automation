import { useEffect, useState } from "react";
import axios from "axios";

const InterviewInvite = ({ userId, candidateId }) => {
  const [emailBody, setEmailBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmailBody = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/invite-interview/${userId}/${candidateId}`);
        setEmailBody(response.data.email_body); // ✅ Set existing email body
      } catch (error) {
        console.error("Error fetching email body:", error.response?.data || error.message);
        setError(error.response?.data?.detail || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchEmailBody();
  }, [userId, candidateId]);

  const sendEmail = async () => {
    setSending(true);
    try {
      await axios.get(`http://localhost:8000/invite-interview/${userId}/${candidateId}`);
      alert("Email sent successfully! 📩");
    } catch (error) {
      console.error("Error sending email:", error.response?.data || error.message);
      alert("Failed to send email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-semibold text-center text-gray-800">Interview Invitation</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading email content...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="mt-4">
          <label className="block text-gray-700 font-medium mb-2">Email Body</label>
          <textarea
            className="w-full h-40 p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-300 resize-none"
            value={emailBody}
            readOnly // ✅ Ensures the user only reviews it
          />
          <button
            onClick={sendEmail}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-50"
            disabled={sending}
          >
            {sending ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      )}
    </div>
  );
};

export default InterviewInvite;
