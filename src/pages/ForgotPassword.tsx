import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/authLayout";
import api from "../api/axios";
import { AxiosError } from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess("Verification code sent to email");
      setTimeout(() => navigate("/reset-password", { state: { email } }), 1500);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>; //tells TS that it knows its an axios error, string tells TS what the response data from backend is
      setError(error.response?.data?.message || "Password reset failed.");
    }
      
  };

  return (
    <AuthLayout
      title="Forgot"
      subtitle="Password?"
      bottomText="Remembered it?"
      bottomLinkText="Login here!"
      bottomLinkTo="/login"
      formTitle="Forgot Password"
    >
      <div className="signup-form-inputs">
        {error && <p style={{ color: "red", margin: "0 0 8px" }}>{error}</p>}
        {success && <p style={{ color: "green", margin: "0 0 8px" }}>{success}</p>}

        <input
          type="email"
          placeholder="Enter your email"
          className="signup-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="signup-form-regist-button">
        <button className="signup-button" onClick={handleForgotPassword}>
          Send Code
        </button>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;