// src/pages/OAuthSuccess.jsx

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/api/me", {
      method: "GET",
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        console.log("OAuth login success:", data);
        // Store user data in localStorage, context, etc.
        navigate("/home"); // Navigate to your homepage
      })
      .catch(err => {
        console.error("OAuth fetch error:", err);
        navigate("/login");
      });
  }, [navigate]);

  return <div>Logging in...</div>;
};

export default OAuthSuccess;
