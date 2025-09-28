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

  return(
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-lg">
        {/* Header */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
          <span className="text-green-600">💰</span> Your Wallet
        </h2>

        {/* Balance Section */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mb-6">
          <p className="text-lg text-gray-600">Current Balance</p>
          <div className="text-5xl font-extrabold text-green-700 mt-2">
            {balance ?? "—"}
          </div>
          <p className="text-sm text-gray-500 mt-1">EcoCoins available</p>
        </div>

        {/* Recent Transactions Placeholder */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            Recent Transactions
          </h3>
          <ul className="space-y-3 text-left">
            <li className="flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm">
              <span>♻️ Bottle Scan</span>
              <span className="text-green-600 font-bold">+10</span>
            </li>
            <li className="flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm">
              <span>🎁 Redeemed Voucher</span>
              <span className="text-red-500 font-bold">-25</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

}
