import React, { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config";


export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { fullName, email, password } = formData;
  const navigate = useNavigate();

  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        mode: "cors",
        body: JSON.stringify({ fullName, email, password }),
      });
      if (res.ok) {
        setMessage("Signup successful! You can now sign in.");
        setFormData({ fullName: "", email: "", password: "" });
        setTimeout(() => navigate("/signin"), 1500);
      } else {
        let errorMsg = "Signup failed";
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorMsg;
          console.error('Register API error:', errorData);
        } catch (jsonErr) {
          const text = await res.text();
          errorMsg = text || errorMsg;
          console.error('Register API error (non-JSON):', text);
        }
        setMessage(errorMsg);
      }
    } catch (err) {
      setMessage("Network error. Please try again.");
      console.error('Register network error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Sign up</h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="md:w-[67%] lg:w-[50%] mb-12 md:mb-6">
          <img
            src="https://images.unsplash.com/flagged/photo-1564767609342-620cb19b2357?q=80&w=1073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="key"
            className="w-full rounded-2xl"
          />
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form onSubmit={onSubmit}>
            <input
              type="text"
              value={fullName}
              onChange={onChange}
              id="fullName"
              placeholder="Full Name"
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
            />
            <input
              type="email"
              value={email}
              onChange={onChange}
              id="email"
              placeholder="Email address"
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
            />
            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={onChange}
                placeholder="Password"
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
              />
              {showPassword ? (
                <AiFillEyeInvisible
                  className="absolute right-3 top-3 text-xl cursor-pointer"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              ) : (
                <AiFillEye
                  className="absolute right-3 top-3 text-xl cursor-pointer"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              )}
            </div>
            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg">
              <p className="mb-6">
                Already have an account?
                <Link
                  to="/signin"
                  className="text-red-600 hover:text-red-700 transition duration-200 ease-in-out ml-1"
                >
                  Sign In
                </Link>
              </p>
              <p>
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out"
                >
                  Forgot password?
                </Link>
              </p>
            </div>
            <button
              className="w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>
            {message && (
              <p className="mt-4 text-center text-red-600">{message}</p>
            )}
            <div className="flex items-center  my-4 before:border-t before:flex-1 before:border-gray-300 after:border-t after:flex-1 after:border-gray-300">
              <p className="text-center font-semibold mx-4">OR</p>
            </div>
            
          </form>
        </div>
      </div>
    </section>
  );
}
