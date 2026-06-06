import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { postsAPI } from "../services/api.js";
import { getUser } from "../App.jsx";

function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function Posts() {
  const user = getUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data } = await postsAPI.getAll();
        setPosts(data.posts || []);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load posts.");
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
          <p className="mt-1 text-sm text-gray-500">
            {posts.length} {posts.length === 1 ? "post" : "posts"} published
          </p>
        </div>
        {user?.role === "admin" && (
          <Link to="/posts/create" className="btn-primary gap-1">
            <span className="text-lg leading-none">+</span> New Post
          </Link>
        )}
      </div>

      {/* States */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-20">
          <span className="text-6xl">📭</span>
          <p className="mt-4 text-lg font-medium text-gray-600">No posts yet</p>
          {user?.role === "admin" ? (
            <p className="mt-1 text-sm text-gray-400">
              Be the first —{" "}
              <Link to="/posts/create" className="text-brand-600 hover:underline">
                create a post
              </Link>
              .
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-400">
              Check back later for new content.
            </p>
          )}
        </div>
      )}

      {/* Post list */}
      {!loading && !error && posts.length > 0 && (
        <div className="space-y-4">
          {[...posts].reverse().map((post) => (
            <article key={post.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-gray-900 truncate">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                <span className="font-medium text-gray-500">@{post.author}</span>
                <span>·</span>
                <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
