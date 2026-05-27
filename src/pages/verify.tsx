import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../components/authLayout";
import api from "../api/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const Verify = () => {
  const [code, setCode] = useState(""); //code (The State Variable): Holds the current value of the state. On the first render, it matches the initial value you passed to useState().
  const [error] = useState(""); //setCode (The Setter Function): A function that lets you update the state to a new value and triggers a re-render of the component
  const [success] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleVerify = async () => {
    if (!code) {
      toast.error("Please enter the verification code.");
      return;
    }

    try {
      await api.post("/auth/confirm-user", { username: email, code });
      toast.success("Account verified! Redirecting...");
      setTimeout(() => navigate("/login", { state: { email } }), 1500);
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
    <AuthLayout //copied from auth layout
      title="Verify Your"
      subtitle="Email"
      bottomText={`Code sent to ${email}`}
      bottomLinkText=""
      bottomLinkTo=""
      formTitle="Enter Code"
    >
      <div className="signup-form-inputs">
        {error && <p style={{ color: "red", margin: "0 0 8px" }}>{error}</p>}
        {success && (
          <p style={{ color: "green", margin: "0 0 8px" }}>{success}</p>
        )}

        <input
          type="text"
          placeholder="Enter verification code"
          className="signup-input" //reused the same class names from signup.css, probably need a better solution to this
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <div className="signup-form-regist-button">
        <button className="signup-button" onClick={handleVerify}>
          Verify
        </button>
      </div>
    </AuthLayout>
  );
};

export default Verify;
