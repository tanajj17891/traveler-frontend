import "./Signup.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/authLayout";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate(); //navigates through the pages

  const handleSignup = async () => {
    setError("");
    setSuccess("");

    if (!email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/auth/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Signup failed.");
      } else {
        setSuccess("Account created! Redirecting...");
        setTimeout(() => navigate("/verify", { state: { email } }), 1500);
      }
    } catch (err) {
      setError("Could not connect to server.");
      console.log(err); // without this err gives an error which i dont know how to get rid of 
    }
  };

  return (
    <AuthLayout
      title="Sign Up To"
      subtitle="Traveler"
      bottomText="Already have an account?"
      bottomLinkText="Login here!"
      bottomLinkTo="/login"
      formTitle="Sign Up"
    >
      <div className="signup-form-inputs">
        {error && <p style={{ color: "red", margin: "0 0 8px" }}>{error}</p>}
        {success && <p style={{ color: "green", margin: "0 0 8px" }}>{success}</p>}

        <input
          type="email"
          placeholder="Enter Email"
          className="signup-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="signup-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="signup-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <div className="signup-form-regist-button">
        <button className="signup-button" onClick={handleSignup}>
          Register
        </button>
      </div>
    </AuthLayout>
  );
};

export default Signup;