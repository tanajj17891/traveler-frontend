import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { createProfile, type CreateProfileRequest } from "../api/profileAPI";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Profile.css";

type CognitoPayload = {
  // jwt issued by cognito
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
   const navigate = useNavigate();
  const idToken = localStorage.getItem("idToken"); // used to get real user info like email

  const decodedIdToken = idToken
    ? jwtDecode<CognitoPayload>(idToken) // decodes the id token so we can get email and cognito sub
    : null;

  const [form, setForm] = useState<CreateProfileRequest>({
    // stores the form data

    // pre-fills cognitoSub and email from the logged-in user's id token
    cognitoSub: decodedIdToken?.sub ?? "",
    email: decodedIdToken?.email ?? "",

    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    state: "",
    city: "",
    travelStyle: [],
    preferences: [],
  });

  const handleChange = (
    // handles changes to user inputs
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value, // firstname = tanajj changes it to form.firstname = tanajj
    });
  };

  const toggleTravelStyle = (value: string) => {
    // handles travel style toggles
    setForm((prev) => ({
      ...prev, // Take every property from pre and copy it into the new object.
      travelStyle: prev.travelStyle?.includes(value)
        ? prev.travelStyle.filter((item) => item !== value)
        : [...(prev.travelStyle || []), value], // keep everything the same and checks if style is already selected
    }));
  };

  const togglePreference = (value: string) => {
    // handles travel style preferences
    setForm((prev) => ({
      ...prev,
      preferences: prev.preferences?.includes(value)
        ? prev.preferences.filter((item) => item !== value)
        : [...(prev.preferences || []), value],
    }));
  };

  const handleSubmit = async () => {
    try {
      const currentAccessToken = localStorage.getItem("accessToken"); // gets access token when they hit save
      const currentIdToken = localStorage.getItem("idToken"); // gets id token when they hit save

      if (!currentAccessToken || !currentIdToken) {
        alert("No token found. Please log in again.");
        return;
      }

      const decodedCurrentIdToken = jwtDecode<CognitoPayload>(currentIdToken); // JWT decode converts token string into readable user data

      const profileData: CreateProfileRequest = {
        ...form,
        cognitoSub: decodedCurrentIdToken.sub, // always use cognitoSub from token
        email: decodedCurrentIdToken.email ?? form.email, // always use email from token first
      };

      await createProfile(profileData, currentAccessToken); // sends POST /profile with Authorization Bearer accessToken

      toast.success("Profile created successfully!");
      navigate("/home");
    } catch (error) {
      console.error(error);
      alert("Profile already exists.");
    }
  };

  return (
    <main className="profile-page">
      <div className="profile-container">
        <h1>Set up your profile</h1>
        <p>
          Tell us a bit about yourself so we can personalize your experience.
        </p>

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
              readOnly
              className="readonly-input"
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