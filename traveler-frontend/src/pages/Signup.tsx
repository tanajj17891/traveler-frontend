import "./Signup.css";

const Signup = () => {
  console.log('hello')
  return (
    <div className="signup-page">
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

      <div className="signup-content">
        <div className="signup-left">
          <div className="signup-top-header">
          <h1 className="signup-title">Sign Up To</h1>
          <h2 className="signup-subtitle">Traveler</h2>
</div>  
<div className="signup-bottom-header">
          <p className="signup-text">
            Got an account? <br />
            <span className="signup-link"> Login here!</span>
          </p>
          </div>
        </div>

        <div className="signup-right">
          <div className="signup-form-title">
          <h2 className="form-title">Sign Up</h2></div>
<div className="signup-form-inputs">
          <input
            type="email"
            placeholder="Enter Email"
            className="signup-input"
          />

          <input
            type="password"
            placeholder="Password"
            className="signup-input"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="signup-input"
          />
          </div>
<div className="signup-form-regist-button">
          <button className="signup-button">Register</button></div>
        </div>
      </div>
    </div>
  );
};

export default Signup;