import "./Signup.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/authLayout";
import api from "../api/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error] = useState("");
  const [success] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      toast.error("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await api.post("/auth/create-user", { email, password });
      toast.success("Account created! Redirecting...");
      setTimeout(() => navigate("/verify", { state: { email } }), 1500);
    } catch (err) {
      const error = err as AxiosError<{
        error: { description: string; data: string[] };
      }>;
      const data = error.response?.data?.error;
      const message = data?.data?.[0] ?? data?.description ?? "Signup failed";
      toast.error(message);
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
        {success && (
          <p style={{ color: "green", margin: "0 0 8px" }}>{success}</p>
        )}

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
