import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Wallet from "./pages/Wallet";
import Scan from "./pages/Scan";
import Nav from "./components/Nav";

export default function App() {
  return (
    <div>
      <Nav />
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/scan" element={<Scan />} />
      </Routes>
    </div>
  );
}
