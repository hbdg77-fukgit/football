import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api.js";
import { saveAuth } from "../App.jsx";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await authAPI.login(form.username, form.password);
      saveAuth(data.access_token, { username: data.username, role: data.role });
      navigate("/posts");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">⚽</span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="label">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="input"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="input"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
