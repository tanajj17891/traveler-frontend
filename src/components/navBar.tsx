// src/components/Navbar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaCompass,
  FaHome,
  FaMapMarkedAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  const profileString = localStorage.getItem("profile");
  const profile = profileString ? JSON.parse(profileString) : null;

  const initials =
    `${profile?.firstName?.[0] ?? ""}${profile?.lastName?.[0] ?? ""}`.toUpperCase() ||
    "TZ";

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <NavLink className="navbar-logo" to="/home">
          <img src="/traveler-logo.svg" alt="" className="logo-icon" />
          <span>
            <strong>Traveler</strong>
            <small>Traveling made easy</small>
          </span>
        </NavLink>

        <nav className="navbar-links">
          <NavLink to="/home"><FaHome /> Home</NavLink>
          <NavLink to="/trips"><FaMapMarkedAlt /> My trips</NavLink>
          <NavLink to="/explore"><FaCompass /> Explore</NavLink>
          <NavLink to="/calendar"><FaCalendarAlt /> Calendar</NavLink>

          <button type="button" className="signout-link" onClick={handleSignOut}>
            <FaSignOutAlt /> Sign Out
          </button>
        </nav>
      </div>

      <button className="avatar" type="button">
        {initials}
      </button>
    </header>
  );
}