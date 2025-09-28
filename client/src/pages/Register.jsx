import { useState, useContext } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // import context

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext); // get login function from context
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const response = await API.post("/auth/register", { email, password });

      const token = response.data.token;
      const username = response.data.username || email; // fallback to email if username not returned

      // Use context login to update state globally
      login(token, username);

      // Redirect after registration
      navigate("/wallet");
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={onSubmit} className="p-6 bg-white rounded shadow w-80">
        <h2 className="text-xl mb-4">Register</h2>
        <input
          className="w-full border p-2 mb-3"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full border p-2 mb-3"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}
