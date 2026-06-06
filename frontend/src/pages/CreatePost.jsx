import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postsAPI } from "../services/api.js";

export default function CreatePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "" });
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
      await postsAPI.create(form.title.trim(), form.content.trim());
      navigate("/posts");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New Post</h1>
        <p className="mt-1 text-sm text-gray-500">
          Share the latest football news with your community.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="label">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="input"
              placeholder="e.g. Champions League Final Preview"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="content" className="label">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={8}
              className="input resize-y"
              placeholder="Write your post content here…"
              value={form.content}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-2.5"
            >
              {loading ? "Publishing…" : "Publish Post"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/posts")}
              className="btn-secondary px-6 py-2.5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
