import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const r = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", r.data.token);
      nav("/wallet");
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={onSubmit} className="p-6 bg-white rounded shadow w-80">
        <h2 className="text-xl mb-4">Login</h2>
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
        <button className="w-full bg-green-600 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
