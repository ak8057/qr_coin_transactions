import { useEffect, useState } from "react";
import API from "../api";

export default function Wallet() {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await API.get("/auth/wallet"); // backend must implement /api/wallet
        setBalance(r.data.balance);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow text-center">
        <h2 className="text-2xl mb-4">Your Wallet</h2>
        <div className="text-4xl font-bold">{balance ?? "—"}</div>
      </div>
    </div>
  );
}
