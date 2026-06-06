import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPosts } from "../services/api";
import { isAdmin } from "../App";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data } = await getPosts();
        setPosts(data);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to load posts. Please refresh."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Posts</h1>
        {isAdmin() && (
          <Link
            to="/create-post"
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + New Post
          </Link>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!error && posts.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg font-medium">No posts yet.</p>
          {isAdmin() && (
            <p className="text-sm mt-1">
              Be the first —{" "}
              <Link to="/create-post" className="text-green-600 hover:underline">
                create a post
              </Link>
              .
            </p>
          )}
        </div>
      )}

      {/* Post list */}
      <div className="space-y-4">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {post.title}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">{post.body}</p>
            <p className="mt-3 text-xs text-gray-400">
              Posted by{" "}
              <span className="font-medium text-gray-500">{post.author}</span>
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
