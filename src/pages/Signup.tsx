import "./Signup.css";
import {Link} from 'react-router-dom';
import { useState} from 'react'; 


const Signup = () => {

  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [error, setError] = useState(""); 
  const [success, setSuccess] = useState(""); 

  
  const handleSignup = async () => {
    setError('');
    setSuccess('');

    // Client-side validation
    if (!email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/auth/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Signup failed.');
      } else {
        setSuccess('Account created! You can now log in.');
      }
    } catch (err) {
      setError('Could not connect to server. Is it running?');
      console.log(err); 
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
              <Link to="/login" className="Login-link">Login here!</Link>
            </p>
          </div>
        </div>

        <div className="signup-right">
          <div className="signup-form-title">
            <h2 className="form-title">Sign Up</h2>
          </div>

          <div className="signup-form-inputs">
            {error && <p style={{ color: 'red', margin: '0 0 8px' }}>{error}</p>}
            {success && <p style={{ color: 'green', margin: '0 0 8px' }}>{success}</p>}

            <input
              type="email"
              placeholder="Enter Email"
              className="signup-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)} //onChange keeps a track of what the user is typing 
            />
            <input
              type="password"
              placeholder="Password"
              className="signup-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)} //e.target.value stores that input 
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
        </div>
      </div>
    </div>
  );
};


export default Signup;