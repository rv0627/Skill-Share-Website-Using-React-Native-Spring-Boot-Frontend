// import React, { useEffect } from "react";
import googleIcon from "../assets/google-icon.png";
import loginIllustration from "../assets/login-illustration.png";

const UserLogin = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/login/oauth2/code/google";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-3xl p-10 max-w-md w-full">
        <img
          src={loginIllustration}
          alt="login"
          className="w-60 mx-auto mb-6"
        />
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Welcome Back 👋
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Log in to continue and share your knowledge & skills
        </p>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-xl flex items-center justify-center mb-4"
        >
          <img src={googleIcon} alt="Google" className="w-5 h-5 mr-3" />
          Continue with Google
        </button>

        <div className="text-center">
          <a
            href="/email-login"
            className="text-blue-600 hover:underline font-semibold"
          >
            Or login with Email →
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
