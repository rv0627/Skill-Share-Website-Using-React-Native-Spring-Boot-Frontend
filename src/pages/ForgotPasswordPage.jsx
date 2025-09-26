import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/auth/send-code", { email });
      localStorage.setItem("resetEmail", email); // save for next step
      setStatus("Code sent to email!");
      setTimeout(() => navigate("/verify-code"), 1000);
    } catch (err) {
      setStatus("Error: " + err.response.data);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-3xl p-10 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Forgot / Edit Password
        </h1>
        <form onSubmit={handleSendCode}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold"
          >
            Send Verification Code
          </button>
          {status && <p>{status}</p>}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
