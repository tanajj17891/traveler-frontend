import "./Login.css";
import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/authLayout";
import {Link} from "react-router-dom"; 
import api from "../api/axios";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      // const response = await fetch("http://localhost:5001/auth/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, password }),
      // });

      const { data } = await api.post("auth/login", { email, password });

      console.log(data);

      // if (!response.ok) {
      //   setError(data.message || "Login failed.");
      // } else {
      //   setSuccess("Logged in! Redirecting...");
      //   setTimeout(() => navigate("/home"), 1500); // change /home to wherever you want
      // }
    } catch (err) {
      // setError("Could not connect to server.");
      console.log(err);
    }
  };

  return (
    <AuthLayout
      title="Sign In To"
      subtitle="Traveler"
      bottomText="Don't have an account?"
      bottomLinkText="Register here!"
      bottomLinkTo="/signup"
      formTitle="Sign In"
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
        {/* Forgot password link on the right side of the form */}
        <p style={{ textAlign: "right", margin: "0" }}>
          <Link to="/forgot-password" className="Login-link">
            Forgot password?
          </Link>
        </p>
      </div>
      <div className="signup-form-regist-button">
        <button className="signup-button" onClick={handleLogin}>
          Login
        </button>
      </div>
    </AuthLayout>
  );
};

export default Login;
