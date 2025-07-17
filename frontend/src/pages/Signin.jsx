import React, { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";

import GoogleAuthButton from "../Components/GoogleAuthButton";
import Spinner from "../Components/Spinner";

export default function Signin() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { email, password } = formData;
  const navigate = useNavigate();

  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("http://localhost:3000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem("token", data.token);
          window.dispatchEvent(new Event("storage")); // update header immediately
        }
        setMessage("Signin successful! Redirecting...");
        setFormData({ email: "", password: "" });
        setTimeout(() => {
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            navigate("/");
          }, 1000); // Spinner shows for 1s
        }, 1000); // Alert shows for 1s
      } else {
        let errorMsg = "Signin failed";
        let errorBody = null;
        try {
          const text = await res.text(); // Only read once!
          try {
            const errorData = JSON.parse(text);
            errorMsg = errorData.message || errorMsg;
            errorBody = errorData;
          } catch {
            errorMsg = text || errorMsg;
            errorBody = text;
          }
          console.error('Sign In API error:', errorBody);
        } catch (err) {
          console.error('Sign In API error (body read failed):', err);
        }
        setMessage(errorMsg);
      }
    } catch (err) {
      setMessage("Network error. Please try again.");
      console.error('Sign In network error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      // Send credentialResponse.credential (JWT) to your backend for verification
      console.log("Google login success:", credentialResponse);
      // Example: fetch('/api/auth/google', { method: 'POST', body: JSON.stringify({ token: credentialResponse.credential }) })
    } catch (err) {
      console.error('Google login processing error:', err);
    }
  };

  const handleGoogleError = (error) => {
    console.error("Google login failed:", error);
  };

  if (loading) return <Spinner />;

  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Sign In</h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="md:w-[67%] lg:w-[50%] mb-12 md:mb-6">
          <img
            src="https://images.unsplash.com/flagged/photo-1564767609342-620cb19b2357?q=80&w=1073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="key"
            className="w-full rounded-2xl"
          />
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form onSubmit={onSubmit} autoComplete="off">
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
                Don't have a account?
                <Link
                  to="/signup"
                  className="text-red-600 hover:text-red-700 transition duration-200 ease-in-out ml-1"
                >
                  Register
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
              {loading ? "Signing in..." : "Sign in"}
            </button>
            {message && (
              <p className="mt-4 text-center text-red-600">{message}</p>
            )}
            <div className="flex items-center  my-4 before:border-t before:flex-1 before:border-gray-300 after:border-t after:flex-1 after:border-gray-300">
              <p className="text-center font-semibold mx-4">OR</p>
            </div>
            <GoogleAuthButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </form>
        </div>
      </div>
    </section>
  );
}
