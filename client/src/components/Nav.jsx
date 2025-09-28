import { Link, useNavigate } from "react-router-dom";
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Nav() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useContext(AuthContext);

   return (
    <nav className="bg-gray-900 text-white px-6 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
            E
          </div>
          <h1 className="text-xl font-bold tracking-wide">EcoVend</h1>
        </div>

        {/* Navigation Links */}
        <ul className="flex gap-6 items-center">
          <li>
            <Link
              to="/"
              className="hover:text-green-400 transition-colors duration-200"
            >
              Home
            </Link>
          </li>

          {isLoggedIn ? (
            <>
              <li>
                <Link
                  to="/scan"
                  className="hover:text-green-400 transition-colors duration-200"
                >
                  Scan
                </Link>
              </li>
              <li>
                <Link
                  to="/wallet"
                  className="hover:text-green-400 transition-colors duration-200"
                >
                  Wallet
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className="hover:text-green-400 transition-colors duration-200"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-green-400 transition-colors duration-200"
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* User Info / Logout */}
        {isLoggedIn && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              Logged in as <span className="font-semibold">{user}</span>
            </span>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );

}
