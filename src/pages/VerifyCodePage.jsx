import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const VerifyCodePage = () => {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const email = localStorage.getItem("resetEmail");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/auth/verify-code", { email, code });
      setStatus("Code verified!");
      setTimeout(() => navigate("/reset-password"), 1000);
    } catch (err) {
      setStatus("Error: " + err.response.data);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-3xl p-10 max-w-md w-full">
        <h1 className="text-xl font-bold text-center text-gray-800 mb-6">
          Enter Verification Code
        </h1>
        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-semibold"
          >
            Verify Code
          </button>
          {status && <p>{status}</p>}
        </form>
      </div>
    </div>
  );
};

export default VerifyCodePage;
