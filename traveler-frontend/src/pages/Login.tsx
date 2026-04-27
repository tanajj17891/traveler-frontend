import "./Login.css";
import {Link} from "react-router-dom"; 

const Login = () => {
 
  return (
    <div className="signin-page">
      <div className="logo-wrapper">
        <img
          src="/traveler-logo.svg"
          alt="Traveler icon"
          className="logo-icon"
        />

        <div className="logo-text">
          <span className="logo-title">Traveler</span>
          <span className="logo-subtitle">Traveling made easy</span>
        </div>
      </div>

      <div className="signin-content">
        <div className="signin-left">
          <div className="signin-top-header">
          <h1 className="signin-title">Sign In To</h1>
          <h2 className="signin-subtitle">Traveler</h2>
</div>  
<div className="signin-bottom-header">
          <p>
            Don't have an account? {" "}
            <Link to ="/Signup" className="Login-link">
            
            Register here!
            </Link>
            </p> 
          
          </div>
        </div>

        <div className="signin-right">
          <div className="signin-form-title">
          <h2 className="form-title">Sign In</h2></div>
<div className="signin-form-inputs">
          <input
            type="email"
            placeholder="Enter Email"
            className="signin-input"
          />

          <input
            type="password"
            placeholder="Password"
            className="signin-input"
          />

          </div>
<div className="signin-form-regist-button">
          <button className="signin-button">Login</button></div>
        </div>
      </div>
    </div>
  );
};

export default Login;