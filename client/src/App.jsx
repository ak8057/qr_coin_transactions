import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Wallet from "./pages/Wallet";
import Scan from "./pages/Scan";
import Nav from "./components/Nav";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/Protected";

export default function App() {
  return (
    <div>
      <Nav />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scan"
          element={
            <ProtectedRoute>
              <Scan />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
