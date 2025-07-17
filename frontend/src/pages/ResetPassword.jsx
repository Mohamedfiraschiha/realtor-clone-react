import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract token from URL
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:3000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const text = await res.text();
      setMessage(text);
      if (res.ok) {
        setTimeout(() => navigate("/signin"), 2000);
      }
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Reset Password</h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form onSubmit={onSubmit}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="New password"
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
            />
            <button
              className="w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800"
              type="submit"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            {message && (
              <p className="mt-4 text-center text-red-600">{message}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
} 