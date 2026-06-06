import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, isAdmin, getUser } from "../App";

export default function Navbar() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const user = getUser();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="text-xl font-bold tracking-wide hover:text-green-200 transition-colors"
        >
          ⚽ Football App
        </Link>

        {/* Links */}
        <div className="flex items-center gap-4 text-sm font-medium">
          {authenticated ? (
            <>
              <Link
                to="/posts"
                className="hover:text-green-200 transition-colors"
              >
                Posts
              </Link>

              {isAdmin() && (
                <Link
                  to="/create-post"
                  className="hover:text-green-200 transition-colors"
                >
                  New Post
                </Link>
              )}

              <span className="text-green-300">
                {user?.username}
                {isAdmin() && (
                  <span className="ml-1 text-xs bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded font-semibold">
                    admin
                  </span>
                )}
              </span>

              <button
                onClick={handleLogout}
                className="bg-white text-green-700 px-3 py-1 rounded hover:bg-green-100 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hover:text-green-200 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-green-700 px-3 py-1 rounded hover:bg-green-100 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
