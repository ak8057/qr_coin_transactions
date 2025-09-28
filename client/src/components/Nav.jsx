import { Link, useNavigate } from "react-router-dom";
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Nav() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useContext(AuthContext);

  return (
    <nav className="p-4 bg-gray-800 text-white flex gap-4 items-center">
      <ul className="flex gap-4">
        <li>
          <Link to="/">Home</Link>
        </li>

        {isLoggedIn ? (
          <>
            <li>
              <Link to="/scan">Scan</Link>
            </li>
            <li>
              <Link to="/wallet">Wallet</Link>
            </li>
            <li className="ml-auto">Logged in as: {user}</li>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="ml-4 bg-red-600 px-3 py-1 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
