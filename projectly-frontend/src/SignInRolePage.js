import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './SignInRolePage.css';

const SignInRolePage = () => {
  const [role, setRole] = useState(''); // Define the role state
  const navigate = useNavigate(); // Initialize useNavigate

  const handleRoleChange = (event) => {
    setRole(event.target.value); // Update the role state based on user selection
  };

  const handleSubmit = () => {
    console.log(`Selected Role: ${role}`); // Log the selected role

    // Navigate to different routes based on the selected role
    if (role === 'Program manager') {
      navigate('/dashboard2'); // Navigate to Program Manager page
    } else if (role === 'Committee member') {
      navigate('/projects'); // Navigate to Projects page
    } else if (role === 'Head of committee') {
      navigate('/managerdashboard'); // Navigate to Head of Committee page
    }
  };

  return (
    <div className="role-selection-container">
      <h1>Select Your Role:</h1>
      <select value={role} onChange={handleRoleChange} className="role-select">
        <option value="" disabled>Select your role</option>
        <option value="Program manager">Program manager</option>
        <option value="Committee member">Committee member</option>
        <option value="Head of committee">Head of committee</option>
      </select>
      <br /><br />
      <button onClick={handleSubmit} className="role-submit-button">Done</button>
    </div>
  );
};

export default SignInRolePage;