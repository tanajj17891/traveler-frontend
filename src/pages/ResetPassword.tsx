
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../components/authLayout";
import api from "../api/axios";
import { AxiosError } from "axios";

const ResetPassword = () => {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleResetPassword = async () => {
    setError("");
    setSuccess("");

    if (!code || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await api.post("/auth/confirm-forgot-password", { email, code, newPassword });
      setSuccess("Password reset successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>; //tells TS that it knows its an axios error, string tells TS what the response data from backend is
      setError(error.response?.data?.message || "Password reset failed.");
    }
  };
  
  

  return (
    <AuthLayout
      title="Reset Your"
      subtitle="Password"
      bottomText="Remembered it?"
      bottomLinkText="Login here!"
      bottomLinkTo="/login"
      formTitle="Reset Password"
    >
      <div className="signup-form-inputs">
        {error && <p style={{ color: "red", margin: "0 0 8px" }}>{error}</p>}
        {success && <p style={{ color: "green", margin: "0 0 8px" }}>{success}</p>}

        <input
          type="text"
          placeholder="Enter verification code"
          className="signup-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password"
          className="signup-input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          className="signup-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <div className="signup-form-regist-button">
        <button className="signup-button" onClick={handleResetPassword}>
          Reset Password
        </button>
      </div>
    </AuthLayout>
  );
};
  

export default ResetPassword;