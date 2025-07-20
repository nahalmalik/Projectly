import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, getCSRFToken } from './api';
import './SignInPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'head'
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Get CSRF token when component mounts
  useEffect(() => {
    getCSRFToken();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/\d/.test(password)) errors.push('At least one number');
    if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
    return errors;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    // Password validation
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors.join(', ');
      isValid = false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/register/`,
        'POST',
        formData
      );

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(text || 'Server returned non-JSON response');
      }

      const data = await response.json();
      
      if (!response.ok) {
        if (data.errors) {
          // Handle field-specific errors from API
          const apiErrors = {};
          for (const [field, message] of Object.entries(data.errors)) {
            apiErrors[field] = Array.isArray(message) ? message.join(' ') : message;
          }
          setErrors(apiErrors);
        } else {
          setApiError(data.error || 'Registration failed');
        }
        return;
      }
      
      alert('Registration successful!');
      navigate('/');
    } catch (err) {
      // Handle HTML error responses
      if (err.message.includes('<!DOCTYPE html>')) {
        setApiError('Server error occurred. Please try again later.');
      } else {
        setApiError(err.message || 'An unexpected error occurred');
      }
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sign-in-container">
      <form className="sign-in-form" onSubmit={handleSubmit}>
        <header>
          <img
            src={require('./logo1.png')}
            alt="Logo"
            className="logo"
          />
          <h5>Create a new account</h5>
        </header>
        
        {apiError && <div className="error-message">{apiError}</div>}
        
        <label htmlFor="name">Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Enter your full name"
          required
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? 'error-field' : ''}
        />
        {errors.name && <div className="field-error">{errors.name}</div>}
        
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          required
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? 'error-field' : ''}
        />
        {errors.email && <div className="field-error">{errors.email}</div>}
        
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Create a password"
          required
          minLength="8"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? 'error-field' : ''}
        />
        {errors.password && (
          <div className="field-error">
            Password requirements: {errors.password}
          </div>
        )}
        
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Confirm your password"
          required
          minLength="8"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={errors.confirmPassword ? 'error-field' : ''}
        />
        {errors.confirmPassword && (
          <div className="field-error">{errors.confirmPassword}</div>
        )}
        
        <label htmlFor="role">Role</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className={`role-select ${errors.role ? 'error-field' : ''}`}
        >
          <option value="head">head</option>
          <option value="program_manager">Program Manager</option>
          <option value="committee_member">Committee Member</option>
        </select>
        {errors.role && <div className="field-error">{errors.role}</div>}
        
        <button 
          type="submit" 
          className="sign-in-button"
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
        
        <p>Already have an account? <a href="/">Login here</a></p>
      </form>
    </div>
  );
};

export default RegisterPage;