import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const email = localStorage.getItem("resetEmail");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setStatus("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/auth/reset-password", { email, newPassword });
      setStatus("Password reset successful!");
      setTimeout(() => {
        localStorage.removeItem("resetEmail");
        navigate("/email-login");
      }, 1500);
    } catch (err) {
      setStatus("Error: " + err.response.data);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-3xl p-10 max-w-md w-full">
        <h1 className="text-xl font-bold text-center text-gray-800 mb-6">
          Set New Password
        </h1>
        <form onSubmit={handleReset}>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold"
          >
            Reset Password
          </button>
          {status && <p>{status}</p>}
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
