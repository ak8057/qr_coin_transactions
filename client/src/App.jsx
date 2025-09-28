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
    <div className="min-h-screen bg-gray-100">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50">
        <Nav />
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-6">
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
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-4 mt-6">
        <p className="text-sm">
          © {new Date().getFullYear()} EcoVend. All rights reserved.
        </p>
      </footer>
    </div>
  );

}
