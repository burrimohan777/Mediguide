import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
    logout();
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="dot"></span>MediGuide
      </Link>

      <div className="navbar-actions">
        {user ? (
          <>
            <Link to="/dashboard" className="nav-btn nav-btn-outline">Dashboard</Link>
            <button onClick={handleLogout} className="nav-btn nav-btn-solid">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-btn nav-btn-outline">Login</Link>
            <Link to="/register" className="nav-btn nav-btn-solid">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}