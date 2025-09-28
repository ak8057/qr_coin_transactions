import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useContext(AuthContext);

  if (loading) {
    // Still checking auth, render nothing or a loader
    return <Loader />;
  }

  if (!isLoggedIn) {
    // Auth checked, user not logged in
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
