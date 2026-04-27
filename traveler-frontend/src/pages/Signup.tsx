import "./Signup.css";
import {Link} from "react-router-dom"; 
import { useState, type ChangeEvent} from "react"

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  }); 
 const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
   try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        alert("Registration successful!");
      } else {
        alert("Registration failed.");
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
    }
  };


  return (
    <div className="signup-page">
      <div className="logo-wrapper">
        <img src="/traveler-logo.svg" alt="Traveler icon" className="logo-icon" />
        <div className="logo-text">
          <span className="logo-title">Traveler</span>
          <span className="logo-subtitle">Traveling made easy</span>
        </div>
      </div>
      <div className="signup-content">
        <div className="signup-left">
          <div className="signup-top-header">
            <h1 className="signup-title">Sign Up To</h1>
            <h2 className="signup-subtitle">Traveler</h2>
          </div>
          <div className="signup-bottom-header">
            <p>
              Already have an account?{" "}
              <Link to="/Login" className="Login-link">
                Login here!
              </Link>
            </p>
          </div>
        </div>
        <div className="signup-right">
          <div className="signup-form-title">
            <h2 className="form-title">Sign Up</h2>
          </div>
          <div className="signup-form-inputs">
            {/* Added 'name', 'value', and 'onChange' to each input */}
            <input
              name="email"
              type="email"
              placeholder="Enter Email"
              className="signup-input"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="signup-input"
              value={formData.password}
              onChange={handleChange}
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              className="signup-input"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <div className="signup-form-register-button">
            {/* Added 'onClick' to the button */}
            <button className="signup-button" onClick={handleRegister}>
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;