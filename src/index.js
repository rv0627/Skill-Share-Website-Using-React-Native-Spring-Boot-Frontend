import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import UserLogin from "./pages/UserLogin";
import EmailLoginPage from "./pages/EmailLoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPasswordPage";
import VerifyCodePage from "./pages/VerifyCodePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Scroll to top on route change
import ScrollToTop from "./components/ScrollToTop";
import MainPage from "./pages/MainPage";
import UserProfilePage from "./pages/UserProfilePage";
import OAuthSuccess from "./pages/OAuthSuccess";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <ScrollToTop /> {/* This must be inside <Router> but outside <Routes> */}
      <Routes>
        <Route path="/" element={<UserLogin />} />
        <Route path="/email-login" element={<EmailLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCodePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/home" element={<MainPage />} />
        <Route path="/profile/:id" element={<UserProfilePage />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />

      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
