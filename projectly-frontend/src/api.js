let csrfToken = '';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const getCSRFToken = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/csrf/`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get CSRF token: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON response, got: ${text.substring(0, 50)}`);
    }

    const data = await response.json();
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    throw error;
  }
};

export const apiRequest = async (url, method, body = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrfToken,
  };
  
  const config = {
    method,
    headers,
    credentials: 'include',
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, config);
    
    // Don't attempt to parse JSON for non-success responses
    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        const text = await response.text();
        errorData = { error: text || `Request failed with status ${response.status}` };
      }
      
      const error = new Error(errorData.error || 'Request failed');
      error.response = response;
      error.data = errorData;
      throw error;
    }
    
    // Only parse as JSON if content-type is correct
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('API request failed:', {
      url,
      method,
      error: error.message,
      ...(error.response && { status: error.response.status })
    });
    
    // Handle cases where server returns HTML error pages
    if (error.message.includes('Unexpected token') || 
        error.message.includes('<!DOCTYPE html>')) {
      throw new Error('Server error occurred. Please try again later.');
    }
    
    throw error;
  }
};
// api.js
const API_BASE = 'http://localhost:8000/api';

export const fetchProjects = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE}/projects/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

export const fetchProjectDetails = async (projectId) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE}/projects/${projectId}/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};