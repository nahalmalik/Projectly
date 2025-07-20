import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './dashboard.css';

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = [...e.target.files].slice(0, 3); // Limit to 3 files
    setFiles(selectedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = [...e.dataTransfer.files].slice(0, 3); // Limit to 3 files
    setFiles(droppedFiles);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file_${index + 1}`, file); // Use file_1, file_2, file_3
      });

      const response = await fetch('http://127.0.0.1:8000/api/upload-files/', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'File upload failed');
      }

      const result = await response.json();
      if (result.status === 'success') {
        setUploadSuccess(true);
        setFiles([]);
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        throw new Error(result.message || 'File upload failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="projects-container">
      {/* Top Navbar */}
      <div className="top-navbar">
        <div className="navbar-left">
          <img className='bar-icon' src={require('./menu.png')} alt="logo" />
          <img src={require('./logo1.png')} alt="logo" />
          <Link to="/your-work" className='view-link'>Your work</Link>
          <Link to="/projects" className='view-link'>Projects</Link>
          <Link to="/dashboards" className='view-link'>Dashboards</Link>
          <button className="create-button">Create</button>
          <img className='bar-icon' src={require('./notification.png')} alt="logo" />
          <img className='bar-icon' src={require('./star.png')} alt="logo" />
        </div>
      </div>

      <div className="sidebar2">
        <div className="recent-projects">
          <h4><span className='icon'>⬇</span> Manager</h4>
          <Link to="/dashboard2" className="project-item">
            <span className='icon'>📊</span> Generate Reports
          </Link><br /><br />
          <Link to="/subTask" className="project-item">
            <span className='icon'>📋</span> Create Sub Tasks
          </Link><br /><br />
          <Link to="/access" className="project-item">
            <span className='icon'>📎</span> Access
          </Link><br /><br />
          <Link to="/fileSharing" className="project-item">
            <span className='icon'>📁</span> File Sharing
          </Link>
        </div>
        <br />
        <Link to="/all-projects" className='view-link'>View All Projects</Link>
      </div>

      <div className="main-content">
        <div className="search-bar">
          <button className="search-button">Search</button>
          <hr />
        </div>
        
        <div className="attachment-list">
          <div 
            className="upload-box"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <h4>Drag and Drop File here</h4>
            <p>or</p>
            <input 
              type="file" 
              className="file-input" 
              onChange={handleFileChange}
              multiple
            />
            
            {files.length > 0 && (
              <div className="file-list">
                <h5>Selected Files:</h5>
                <ul>
                  {Array.from(files).map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <button 
              onClick={handleSubmit}
              disabled={uploading || files.length === 0}
              className="submit-button"
            >
              {uploading ? 'Uploading...' : 'Submit Files'}
            </button>
            
            {uploadSuccess && (
              <div className="success-message">
                Files uploaded successfully!
              </div>
            )}
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;