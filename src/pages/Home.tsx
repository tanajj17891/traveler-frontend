import "./Home.css";
import {
  FaHome,
  FaMapMarkedAlt,
  FaCompass,
  FaCalendarAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false); {/* starts in a false state because menu has not been clicked*/}
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("idToken");

    navigate("/login");
  };
  return (
    <main className="home-page">
      <header className="navbar">
        <div className="navbar-logo">
          <div className="logo-wrapper">
            <img
              src="/traveler-logo.svg"
              alt="Traveler icon"
              className="logo-icon"
            />
            <div className="logo-text"></div>
            <h2>Traveler</h2>
            <span>Traveling made easy</span>
          </div>
        </div>

        <nav className="navbar-links">
          <a href="#">
            <FaHome />
            Home
          </a>

          <a href="#">
            <FaMapMarkedAlt />
            My Trips
          </a>

          <a href="#">
            <FaCompass />
            Explore
          </a>

          <a href="#">
            <FaCalendarAlt />
            Calendar
          </a>
        </nav>
        <div className="navbar-profile">
          <button className="notification-btn">🔔</button>

          <div className="avatar-menu">
            <button className="avatar" onClick={() => setMenuOpen(!menuOpen)}> {/*set menu becomes true after user clicks on it , from false to true */}
              TA
            </button>

            {menuOpen && (
              <div className="profile-dropdown">
                <button onClick={handleSignOut}>Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </header>
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome back, Tanajj!</h1>
          <p>Your next adventure to Cancún is in 18 days.</p>

          <button className="new-trip-btn">+ New trip plan</button>
        </div>

        <div className="hero-stats">
          <div>
            <h2>3</h2>
            <p>Upcoming trips</p>
          </div>

          <div>
            <h2>12</h2>
            <p>Countries visited</p>
          </div>

          <div>
            <h2>8</h2>
            <p>Past trips</p>
          </div>
        </div>
      </section>

      <section className="quick-actions">
        <div className="action-card">Create Trip</div>
        <div className="action-card">Explore Destinations</div>
        <div className="action-card">Budget Tracker</div>
        <div className="action-card">Share a Trip</div>
      </section>

      <section className="dashboard-grid">
        <div className="trips-section">
          <h2>Your Trips</h2>
        </div>

        <div className="sidebar-section">
          <h2>Trip Checklist</h2>
        </div>
      </section>
      <section className="travel-tips-section">
        <h2>Travel tips</h2>

        <div className="travel-tips-card">
          <div className="travel-tip-item">
            <div className="tip-icon blue">☀️</div>
            <div>
              <h3>Best time to visit Cancún</h3>
              <p>
                Dec-April is peak season. June can be warm with occasional rain
                showers.
              </p>
            </div>
          </div>

          <div className="travel-tip-item">
            <div className="tip-icon yellow">$</div>
            <div>
              <h3>Currency</h3>
              <p>Mexican Peso (MXN). USD widely accepted in tourist areas.</p>
            </div>
          </div>

          <div className="travel-tip-item">
            <div className="tip-icon green">🛡️</div>
            <div>
              <h3>Visa requirements</h3>
              <p>
                US citizens don't need a visa. Tourist card issued on arrival.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
