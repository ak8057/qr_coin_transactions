import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    
      <div className="max-w-5xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg mb-10">
          <h1 className="text-3xl font-bold mb-2">Welcome Back 👋</h1>
          <p className="text-lg opacity-90">
            Manage your wallet, scan QR codes, and explore your account all in
            one place.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Wallet Card */}
          <Link
            to="/wallet"
            className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition group"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Wallet</h2>
              <span className="text-indigo-600 text-2xl group-hover:scale-110 transition">
                💰
              </span>
            </div>
            <p className="text-gray-600">
              View and manage your wallet balance with ease.
            </p>
          </Link>

          {/* Scan Card */}
          <Link
            to="/scan"
            className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition group"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Scan QR</h2>
              <span className="text-green-600 text-2xl group-hover:scale-110 transition">
                📷
              </span>
            </div>
            <p className="text-gray-600">
              Quickly scan QR codes to earn and redeem coins.
            </p>
          </Link>

          {/* Profile / Settings */}
          <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition group">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Profile</h2>
              <span className="text-purple-600 text-2xl group-hover:scale-110 transition">
                ⚙️
              </span>
            </div>
            <p className="text-gray-600">
              Update your details, preferences, and account security.
            </p>
          </div>
        </div>
      </div>
  
  );
}
