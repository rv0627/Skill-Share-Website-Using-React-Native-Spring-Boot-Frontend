import React, { useState } from "react";
import addProfileImage from "../assets/default-profile.jpg";

const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    bio: "",
    location: "",
    photo: null,
  });

  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [editing, setEditing] = useState(true); // toggle if needed


  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, photo: file });
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullName", form.fullName);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("confirmPassword", form.confirmPassword);
    formData.append("mobile", form.mobile);
    formData.append("bio", form.bio);
    formData.append("location", form.location);
    if (form.photo) {
      formData.append("photo", form.photo);
    }

    try {
      const response = await fetch("http://localhost:8080/api/user/register", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("User registered successfully");
      } else {
        const errorData = await response.text();
        alert(`Error: ${errorData}`);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred during registration");
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-3xl p-10 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Your Account
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Profile Picture */}
          <div className="relative flex justify-center mb-20 mt-20">
            <div className="absolute -bottom-16 w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-md">
              <img
                src={profilePicPreview || addProfileImage} // fallback image
                alt="Profile"
                className="w-full h-full object-cover p-3"
              />
              {editing && (
                <label className="absolute bottom-0 bg-black bg-opacity-60 text-white w-full text-center text-xs py-1 cursor-pointer">
                  Edit
                  <input type="file" hidden accept="image/*" onChange={handleProfilePicChange} />
                </label>
              )}
            </div>
          </div>

          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="tel"
            name="mobile"
            placeholder="Mobile"
            value={form.mobile}
            onChange={handleChange}
            required
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            name="bio"
            placeholder="Bio"
            value={form.bio}
            onChange={handleChange}
            required
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            required
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold"
          >
            Register
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a href="/email-login" className="text-blue-600 hover:underline font-semibold">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
