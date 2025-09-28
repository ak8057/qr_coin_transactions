import { useEffect, useState, useContext } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Wallet() {
  const [balance, setBalance] = useState(null);
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      // Redirect to login if not logged in
      navigate("/login");
      return;
    }

    async function load() {
      try {
        const r = await API.get("/auth/wallet"); // backend must implement /auth/wallet
        setBalance(r.data.balance);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, [isLoggedIn, navigate]);

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow text-center">
        <h2 className="text-2xl mb-4">Your Wallet</h2>
        <div className="text-4xl font-bold">{balance ?? "—"}</div>
      </div>
    </div>
  );
}
