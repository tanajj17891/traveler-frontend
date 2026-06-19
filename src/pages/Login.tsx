import toast from "react-hot-toast";
import "./Login.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/authLayout";
import api from "../api/axios";
import { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import { getProfile } from "../api/profileAPI";

type CognitoPayload = {
  sub: string;
  email?: string;
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email || !password) {
      toast.error("All fields are required.");
      return;
    }

    try {
      const { data } = await api.post("/auth/login", { email, password });

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("idToken", data.idToken);

      toast.success("Logged in!");

      const decoded = jwtDecode<CognitoPayload>(data.idToken);
      const cognitoSub = decoded.sub; // decodes the id token to get the cognito user id

      try {
        // try catch bc getprofile is an async api call and it returns a promise not the actual profile , its not just a true false thing
        await getProfile(cognitoSub, data.accessToken); // checks if the user has a profile
        // await new Promise((resolve) => setTimeout(resolve, 1000));
        navigate("/home"); // if yes then navigate to home
      } catch {
        navigate("/profile"); // if not then create profile
      } finally {
        setLoading(false);
      }

      console.log(data);
    } catch (err) {
      const error = err as AxiosError<{
        error: { description: string; data: string[] };
      }>;
      const data = error.response?.data?.error;
      const message = data?.data?.[0] ?? data?.description ?? "Login failed";
      toast.error(message);
      setLoading(false);
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
        <button
          className="signup-button"
          onClick={handleLogin}
          disabled={loading} // prevents user from clicking the login button while its loading 
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>
      </div>
    </AuthLayout>
  );
};

export default Login;
