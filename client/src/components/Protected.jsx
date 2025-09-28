import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useContext(AuthContext);

  if (loading) {
    // Still checking auth, render nothing or a loader
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    // Auth checked, user not logged in
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
