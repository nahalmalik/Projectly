import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import './SignInPage.css';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSignIn = (event) => {
    event.preventDefault();
    console.log(`Signed in with email: ${email}`);
    navigate('/role');
  };

  return (
    <div className="sign-in-container">
      <form className="sign-in-form" onSubmit={handleSignIn}>
        <header>
          <img
            src={require('./logo1.png')}
            alt="Logo"
            className="logo"
          />
          <h5>Make it easier for teams to manage projects and tasks</h5>
        </header>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="Enter Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="sign-in-button">Sign In</button>
        <p>or</p>
        <div className="social-buttons">
          <button className="social-button">Sign in with Apple</button>
          <button className="social-button">Sign in with Google</button>
          <button className="social-button">Sign in with Microsoft</button>
        </div>
        <p>Don't have an account? <Link to="/register">Register here</Link></p>
      </form>
    </div>
  );
};

export default SignInPage;