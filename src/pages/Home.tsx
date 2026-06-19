import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaCalendarAlt,
  FaCheck,
  FaCompass,
  FaDollarSign,
  FaHome,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaPen,
  FaPlane,
  FaPlus,
  FaSearch,
  FaShareAlt,
  FaShieldAlt,
  FaTimes,
} from "react-icons/fa";
import {
  getProfile,
  updateProfile,
  type CreateProfileRequest,
} from "../api/profileAPI";
import "./Home.css";
type CognitoPayload = {
  sub: string;
  email?: string;
};

const emptyProfile: CreateProfileRequest = {
  cognitoSub: "",
  email: "",
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  state: "",
  city: "",
  travelStyle: [],
  preferences: [],
};

const travelStyles = [
  { label: "Beach & sun", value: "BEACH_AND_SUN" },
  { label: "Adventure", value: "ADVENTURE" },
  { label: "City breaks", value: "CITY_BREAKS" },
  { label: "Food & drink", value: "FOOD_AND_DRINK" },
  { label: "Culture & art", value: "CULTURE_AND_ART" },
  { label: "Eco travel", value: "ECO_TRAVEL" },
  { label: "Business", value: "BUSINESS" },
  { label: "Romantic", value: "ROMANTIC" },
  { label: "Winter sports", value: "WINTER_SPORTS" },
  { label: "Photography", value: "PHOTOGRAPHY" },
];

const preferences = [
  { label: "Solo traveler", value: "SOLO_TRAVELER" },
  { label: "Traveling with kids", value: "TRAVELING_WITH_KIDS" },
  { label: "Budget conscious", value: "BUDGET_CONSCIOUS" },
];

export default function Home() {
  const [profileOpen, setProfileOpen] = useState(false); // controls whether profile side panel is open
  const [isEditingProfile, setIsEditingProfile] = useState(false); // controls view mode vs edit mode
  const [isSavingProfile, setIsSavingProfile] = useState(false); // controls save button loading state
  const [profile, setProfile] = useState<CreateProfileRequest>(emptyProfile); // stores profile data
  const navigate = useNavigate();
  const handleSignOut = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("idToken");

    navigate("/login");
  };

  useEffect(() => {
    // loads the logged-in user's saved profile when the homepage opens
    const loadProfile = async () => {
      const idToken = localStorage.getItem("idToken");
      const accessToken = localStorage.getItem("accessToken");

      if (!idToken || !accessToken) {
        return;
      }

      try {
        const decoded = jwtDecode<CognitoPayload>(idToken);
        const existingProfile = await getProfile(decoded.sub, accessToken);

        setProfile({
          cognitoSub: existingProfile.cognitoSub,
          email: existingProfile.email,
          firstName: existingProfile.firstName ?? "",
          lastName: existingProfile.lastName ?? "",
          gender: existingProfile.gender ?? "",
          dateOfBirth: existingProfile.dateOfBirth ?? "",
          state: existingProfile.state ?? "",
          city: existingProfile.city ?? "",
          travelStyle: existingProfile.travelStyle ?? [],
          preferences: existingProfile.preferences ?? [],
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load profile");
      }
    };

    loadProfile();
  }, []);

  const openProfile = () => {
    // opens the profile panel in view mode
    setIsEditingProfile(false);
    setProfileOpen(true);
  };

  const closeProfile = () => {
    // closes the profile panel
    setIsEditingProfile(false);
    setProfileOpen(false);
  };

  const handleProfileChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    // updates basic profile fields while editing
    const { name, value } = event.target;

    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const toggleProfileChoice = (
    field: "travelStyle" | "preferences",
    value: string,
  ) => {
    // only allow chip changes while in edit mode
    if (!isEditingProfile) return;

    const currentValues = profile[field] || []; // gets the current values

    setProfile({
      // updates the profile state
      ...profile, //copies everything from the profile
      [field]: currentValues.includes(value) // field becomes travel style or preferences depending on what i called
        ? currentValues.filter((item) => item !== value) // checks if its already selected
        : [...currentValues, value],
    });
  };

  const handleSaveProfile = async () => {
    // calls backend api
    // sends updated profile data to backend
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken || !profile.cognitoSub) {
      toast.error("Please log in again to update your profile.");
      return;
    }

    setIsSavingProfile(true);

    try {
      await updateProfile(profile.cognitoSub, profile, accessToken); // attempt the update , await calls the backend

      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const initials =
    `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() ||
    "T"; // extracts first and last letter of my name then capitalises it , if empty shows T

  const fullName =
    `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || // trim removes extra spaces
    "Traveler";

  const location =
    [profile.city, profile.state].filter(Boolean).join(", ") ||
    "Location not provided";

  return (
    <main className="home-page">
      <header className="navbar">
        <div className="navbar-left">
          <a className="navbar-logo" href="/home" aria-label="Traveler home">
            <img src="/traveler-logo.svg" alt="" className="logo-icon" />
            <span>
              <strong>Traveler</strong>
              <small>Traveling made easy</small>
            </span>
          </a>

          <nav className="navbar-links" aria-label="Main navigation">
            <a className="active" href="#">
              <FaHome /> Home
            </a>
            <a href="#">
              <FaMapMarkedAlt /> My trips
            </a>
            <a href="#">
              <FaCompass /> Explore
            </a>
            <a href="#">
              <FaCalendarAlt /> Calendar
            </a>
          </nav>
        </div>

        <div className="navbar-profile">
          <button className="notification-btn" aria-label="Notifications">
            <FaBell />
            <span />
          </button>

          <button
            className="avatar"
            onClick={openProfile}
            aria-label={`Open ${fullName}'s profile`}
          >
            {initials}
          </button>
        </div>
      </header>

      {profileOpen && (
        <>
          <button
            className="profile-overlay"
            onClick={closeProfile}
            aria-label="Close profile"
          />

          <aside className="profile-panel" aria-label="My profile">
            <div className="pp-header">
              <h2>My Profile</h2>
              <button className="pp-close" onClick={closeProfile}>
                <FaTimes />
              </button>
            </div>

            <div className="pp-body">
              <div className="pp-hero">
                <div className="pp-avatar-lg">{initials}</div>
                <div className="pp-hero-info">
                  <h3>{fullName}</h3>
                  <p>
                    <FaMapMarkerAlt /> {location}
                  </p>
                </div>
              </div>

              <div className="pp-stats">
                <div>
                  <strong>3</strong>
                  <span>Upcoming</span>
                </div>
                <div>
                  <strong>12</strong>
                  <span>Countries</span>
                </div>
                <div>
                  <strong>8</strong>
                  <span>Past trips</span>
                </div>
              </div>

              <section className="pp-card">
                <div className="pp-card-head">
                  <h3>Basic info</h3>

                  <button
                    className="pp-edit-btn"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    {isEditingProfile ? (
                      <>
                        <FaTimes /> Cancel
                      </>
                    ) : (
                      <>
                        <FaPen /> Edit
                      </>
                    )}
                  </button>
                </div>

                <div className="pp-field-row">
                  <label className="pp-field">
                    <span>First name</span>
                    {isEditingProfile ? (
                      <input
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleProfileChange}
                        placeholder="First name"
                      />
                    ) : (
                      <strong>{profile.firstName || "Not provided"}</strong>
                    )}
                  </label>

                  <label className="pp-field">
                    <span>Last name</span>
                    {isEditingProfile ? (
                      <input
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleProfileChange}
                        placeholder="Last name"
                      />
                    ) : (
                      <strong>{profile.lastName || "Not provided"}</strong>
                    )}
                  </label>
                </div>

                <label className="pp-field">
                  <span>Email</span>
                  <strong>{profile.email || "Not provided"}</strong>
                </label>

                <div className="pp-field-row">
                  <label className="pp-field">
                    <span>Date of birth</span>
                    {isEditingProfile ? (
                      <input
                        name="dateOfBirth"
                        value={profile.dateOfBirth}
                        onChange={handleProfileChange}
                        placeholder="MM / DD / YYYY"
                      />
                    ) : (
                      <strong>{profile.dateOfBirth || "Not provided"}</strong>
                    )}
                  </label>

                  <label className="pp-field">
                    <span>Gender</span>
                    {isEditingProfile ? (
                      <select
                        name="gender"
                        value={profile.gender}
                        onChange={handleProfileChange}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">
                          Prefer not to say
                        </option>
                      </select>
                    ) : (
                      <strong>{profile.gender || "Not provided"}</strong>
                    )}
                  </label>
                </div>

                <div className="pp-field-row">
                  <label className="pp-field">
                    <span>City</span>
                    {isEditingProfile ? (
                      <input
                        name="city"
                        value={profile.city}
                        onChange={handleProfileChange}
                        placeholder="City"
                      />
                    ) : (
                      <strong>{profile.city || "Not provided"}</strong>
                    )}
                  </label>

                  <label className="pp-field">
                    <span>State</span>
                    {isEditingProfile ? (
                      <input
                        name="state"
                        value={profile.state}
                        onChange={handleProfileChange}
                        placeholder="State"
                      />
                    ) : (
                      <strong>{profile.state || "Not provided"}</strong>
                    )}
                  </label>
                </div>
              </section>

              <section className="pp-card">
                <div className="pp-card-head">
                  <h3>Travel style</h3>
                </div>

                <div className="pp-chips">
                  {travelStyles.map((style) => {
                    const selected = profile.travelStyle?.includes(style.value);

                    return (
                      <button
                        key={style.value}
                        type="button"
                        className={`pp-chip ${selected ? "active" : ""}`}
                        onClick={() =>
                          toggleProfileChoice("travelStyle", style.value)
                        }
                        disabled={!isEditingProfile}
                      >
                        {selected && <FaCheck />} {style.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="pp-card">
                <div className="pp-card-head">
                  <h3>Preferences</h3>
                </div>

                <div className="pp-chips">
                  {preferences.map((preference) => {
                    const selected = profile.preferences?.includes(
                      preference.value,
                    );

                    return (
                      <button
                        key={preference.value}
                        type="button"
                        className={`pp-chip ${selected ? "active" : ""}`}
                        onClick={() =>
                          toggleProfileChoice("preferences", preference.value)
                        }
                        disabled={!isEditingProfile}
                      >
                        {selected && <FaCheck />} {preference.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
             
  {!isEditingProfile && (
  <div className="pp-signout">
    <button
      className="pp-signout-btn"
      onClick={handleSignOut}
    >
      Sign Out
    </button>
  </div>
)}
            {isEditingProfile && (
              <div className="pp-footer">
                <button
                  className="pp-cancel-btn"
                  onClick={() => setIsEditingProfile(false)}
                >
                  Cancel
                </button>

                <button
                  className="pp-save-btn"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? "Saving..." : "Save changes"}
                </button>
                <div className="pp-signout"></div>
              </div>
            )}
          </aside>
        </>
      )}

      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-content">
            <h1>Welcome back, {profile.firstName || "Traveler"}!</h1>
            <p>
              Your next adventure to Cancún is in 18 days. Keep planning or
              start something new.
            </p>
            <button className="new-trip-btn">
              <FaPlus /> New trip plan
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <strong>3</strong>
              <span>Upcoming trips</span>
            </div>
            <i />
            <div>
              <strong>12</strong>
              <span>Countries visited</span>
            </div>
            <i />
            <div>
              <strong>8</strong>
              <span>Past trips</span>
            </div>
          </div>
        </div>
      </section>

      <div className="home-content">
        <section className="quick-actions">
          <button className="action-card">
            <span>
              <FaPlus />
            </span>
            <strong>Create trip</strong>
            <small>Plan a new vacation from scratch</small>
          </button>

          <button className="action-card">
            <span>
              <FaSearch />
            </span>
            <strong>Explore destinations</strong>
            <small>Browse top spots and hidden gems</small>
          </button>

          <button className="action-card">
            <span>
              <FaDollarSign />
            </span>
            <strong>Budget tracker</strong>
            <small>Manage spending across your trips</small>
          </button>

          <button className="action-card">
            <span>
              <FaShareAlt />
            </span>
            <strong>Share a trip</strong>
            <small>Invite friends and family</small>
          </button>
        </section>

        <section className="dashboard-grid">
          <div>
            <div className="section-heading">
              <h2>Your trips</h2>
              <a href="#">See all →</a>
            </div>

            {[
              [
                "Cancún, Mexico",
                "Jun 19 – Jun 26, 2026 · 7 nights",
                "Upcoming",
              ],
              [
                "New York City, USA",
                "Aug 4 – Aug 8, 2026 · 4 nights",
                "Planning",
              ],
              ["Banff, Canada", "Sep 12 – Sep 18, 2026 · 6 nights", "Planning"],
            ].map(([name, dates, status]) => (
              <article className="trip-card" key={name}>
                <span className="trip-icon">
                  <FaPlane />
                </span>

                <div>
                  <h3>{name}</h3>
                  <p>
                    <FaCalendarAlt /> {dates}
                  </p>
                </div>

                <em className={status.toLowerCase()}>{status}</em>
              </article>
            ))}
          </div>

          <div>
            <div className="section-heading">
              <h2>Trip checklist</h2>
              <a href="#">Cancún</a>
            </div>

            <div className="sidebar-card">
              <div className="progress-track">
                <span />
              </div>

              <small>3 of 5 tasks done</small>

              {[
                "Book flights",
                "Reserve hotel",
                "Travel insurance",
                "Plan activities",
                "Currency & spending money",
              ].map((task, index) => (
                <div className="checklist-item" key={task}>
                  <span className={index < 3 ? "done" : ""}>
                    {index < 3 && <FaCheck />}
                  </span>
                  <p className={index < 3 ? "done" : ""}>{task}</p>
                </div>
              ))}
            </div>

            <div className="section-heading tips-heading">
              <h2>Travel tips</h2>
            </div>

            <div className="sidebar-card travel-tips-card">
              <div>
                <span>
                  <FaCompass />
                </span>
                <p>
                  <strong>Best time to visit Cancún</strong>
                  <small>
                    Dec-April is peak season. June can be warm with occasional
                    rain.
                  </small>
                </p>
              </div>

              <div>
                <span>
                  <FaDollarSign />
                </span>
                <p>
                  <strong>Currency</strong>
                  <small>
                    Mexican Peso (MXN). USD is widely accepted in tourist areas.
                  </small>
                </p>
              </div>

              <div>
                <span>
                  <FaShieldAlt />
                </span>
                <p>
                  <strong>Visa requirements</strong>
                  <small>
                    US citizens don't need a visa. Tourist card issued on
                    arrival.
                  </small>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
