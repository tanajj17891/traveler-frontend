import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../components/authLayout";

const Verify = () => {
  const [code, setCode] = useState(""); //code (The State Variable): Holds the current value of the state. On the first render, it matches the initial value you passed to useState().
  const [error, setError] = useState(""); //setCode (The Setter Function): A function that lets you update the state to a new value and triggers a re-render of the component
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleVerify = async () => {
    setError("");
    setSuccess("");

    if (!code) {
      setError("Please enter the verification code.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/auth/confirm-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Verification failed.");
      } else {
        setSuccess("Email verified! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setError("Could not connect to server.");
      console.log(err); 
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
        {success && <p style={{ color: "green", margin: "0 0 8px" }}>{success}</p>}

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