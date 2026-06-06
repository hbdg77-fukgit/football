import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api.js";
import { saveAuth } from "../App.jsx";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", role: "user" });
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
      // Register then immediately log in
      await authAPI.register(form.username, form.password, form.role);
      const { data } = await authAPI.login(form.username, form.password);
      saveAuth(data.access_token, { username: data.username, role: data.role });
      navigate("/posts");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">⚽</span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Create account</h1>
          <p className="mt-1 text-sm text-gray-500">Join the Football App community</p>
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
              minLength={3}
              className="input"
              placeholder="At least 3 characters"
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
              autoComplete="new-password"
              required
              minLength={6}
              className="input"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="role" className="label">
              Role
            </label>
            <select
              id="role"
              name="role"
              className="input bg-white"
              value={form.role}
              onChange={handleChange}
            >
              <option value="user">User — can view posts</option>
              <option value="admin">Admin — can create posts</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Admin accounts can create new posts.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
