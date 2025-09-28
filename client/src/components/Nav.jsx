import { Link, useNavigate } from "react-router-dom";
export default function Nav() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  return (
    <nav className="p-4 bg-gray-800 text-white flex gap-4">
      <Link to="/scan">Scan</Link>
      <Link to="/wallet">Wallet</Link>
      <Link to="/login">Login</Link>
      <Link to="/">Register</Link>
      <button onClick={logout} className="ml-auto">
        Logout
      </button>
    </nav>
  );
}
