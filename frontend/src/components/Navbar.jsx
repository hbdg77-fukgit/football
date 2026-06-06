import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getUser, clearAuth } from "../App.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <nav className="bg-brand-800 text-white shadow-lg">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/posts"
            className="flex items-center gap-2 text-xl font-bold tracking-tight hover:text-brand-100 transition-colors"
          >
            <span className="text-2xl">⚽</span>
            <span>Football App</span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/posts"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/posts")
                      ? "text-white underline underline-offset-4"
                      : "text-brand-200 hover:text-white"
                  }`}
                >
                  Posts
                </Link>

                {user.role === "admin" && (
                  <Link
                    to="/posts/create"
                    className={`text-sm font-medium transition-colors ${
                      isActive("/posts/create")
                        ? "text-white underline underline-offset-4"
                        : "text-brand-200 hover:text-white"
                    }`}
                  >
                    + New Post
                  </Link>
                )}

                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-brand-600">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-brand-300">Signed in as</p>
                    <p className="text-sm font-semibold leading-tight">
                      {user.username}
                      {user.role === "admin" && (
                        <span className="ml-1 text-xs bg-brand-500 text-white px-1.5 py-0.5 rounded-full">
                          admin
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-brand-200 hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/login")
                      ? "text-white underline underline-offset-4"
                      : "text-brand-200 hover:text-white"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
