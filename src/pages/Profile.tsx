import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { createProfile, type CreateProfileRequest } from "../api/profileAPI";
import "./Profile.css";

type CognitoPayload = { // jwt issued by cognito
  sub: string;
  email?: string;
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

export default function Profile() { 
  const [form, setForm] = useState<CreateProfileRequest>({ // stores the form data
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
  });

  const handleChange = ( // handles changes to user inputs
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value, // firstname = tanajj changes it to form.firstname = tanajj
    });
  };

  const toggleTravelStyle = (value: string) => { // handles travel style toggles
    setForm((prev) => ({
      ...prev,
      travelStyle: prev.travelStyle?.includes(value)
        ? prev.travelStyle.filter((item) => item !== value)
        : [...(prev.travelStyle || []), value],
    }));
  };

  const togglePreference = (value: string) => { // handles travel style preferences
    setForm((prev) => ({
      ...prev,
      preferences: prev.preferences?.includes(value)
        ? prev.preferences.filter((item) => item !== value)
        : [...(prev.preferences || []), value],
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("accessToken"); // gets cognito token when they hit save 

      if (!token) {
        alert("No access token found. Please log in again.");
        return;
      }

      const decoded = jwtDecode<CognitoPayload>(token);  // JWT decode is the process of converting a Base64Url-encoded JSON Web Token (JWT) string back into a human-readable JSON object.

      const profileData: CreateProfileRequest = {
        ...form,
        cognitoSub: decoded.sub,
        email: form.email || decoded.email || "", // extracts sub and email
      };

      await createProfile(profileData, token); // creates request body matching my backend, then it goes to profileapi.tsx which does post /prpfile

      alert("Profile created successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to create profile");
    }
  };

  return (
    <main className="profile-page">
      <div className="profile-container">
        <h1>Set up your profile</h1>
        <p>Tell us a bit about yourself so we can personalize your experience.</p>

        <section className="profile-card">
          <h2>Basic info</h2>

          <div className="profile-grid">
            <input
              name="firstName"
              placeholder="First name"
              value={form.firstName}
              onChange={handleChange}
            />

            <input
              name="lastName"
              placeholder="Last name"
              value={form.lastName}
              onChange={handleChange}
            />

            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            <input
              name="dateOfBirth"
              placeholder="Date of birth"
              value={form.dateOfBirth}
              onChange={handleChange}
            />

            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>

            <input
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
            />

            <input
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className="profile-card">
          <h2>Travel style</h2>

          <div className="chip-container">
            {travelStyles.map((style) => (
              <button
                key={style.value}
                type="button"
                className={
                  form.travelStyle?.includes(style.value)
                    ? "chip active"
                    : "chip"
                }
                onClick={() => toggleTravelStyle(style.value)}
              >
                {style.label}
              </button>
            ))}
          </div>
        </section>

        <section className="profile-card">
          <h2>Preferences</h2>

          <div className="chip-container">
            {preferences.map((pref) => (
              <button
                key={pref.value}
                type="button"
                className={
                  form.preferences?.includes(pref.value)
                    ? "chip active"
                    : "chip"
                }
                onClick={() => togglePreference(pref.value)}
              >
                {pref.label}
              </button>
            ))}
          </div>
        </section>

        <button className="save-profile-btn" onClick={handleSubmit}>
          Save profile
        </button>
      </div>
    </main>
  );
}