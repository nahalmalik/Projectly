import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Projects.css';

const Projects = () => {
  const navigate = useNavigate();
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
          <a href="./SignInPage.js" className='view-link'>Your work</a>
          <a href="./Projects.js" className='view-link'>Projects</a>
          <a href="./SignInPage.js" className='view-link'>Dashboards</a>
          <button className="create-button">Create</button>
          <img className='bar-icon' src={require('./notification.png')} alt="logo" />
          <img className='bar-icon' src={require('./star.png')} alt="logo" />
        </div>
      </div>

      <div className="sidebar">
        <span className="icon"></span>
        <div className="recent-projects">
          <h4><span className='icon'>⬇</span> Recent</h4>
          <div className="project-item">
            <span className='icon'>📁</span>
            Project 1
          </div>
        </div>
        <br />
        <a href="./SignInPage.js" className='view-link'>View All Projects</a>
      </div>

      <div className="main-content">
        <h3>📁 Project 1</h3>
        <div className="tabs">
          <button onClick={() => navigate('/summary')}><span className='icon'>📄</span> Summary</button>
          <button onClick={() => navigate('/boards')}><span className='icon'>📋</span> Board</button>
          <button onClick={() => navigate('/Projects')}><span className='icon'>📊</span> Reports</button>
          <button onClick={() => navigate('/calendar')}><span className='icon'>📅</span> Calendar</button>
          <button onClick={() => navigate('/timeline')}><span className='icon'>🕒</span> Timeline</button>
          <button onClick={() => navigate('/communications')}><span className='icon'>💬</span> Communications</button>
          <button onClick={() => navigate('/attachments')}><span className='icon'>📎</span> Attachments</button>
        </div>
        <hr />
        <div className="search-bar">
          <input type="text" className='icon' placeholder="Search..." /> 🔍
        </div>

        <div className="attachment-list">
          <div className="attachment-file">
            <div 
              className="upload-box"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <h4>Drag and Drop Files Here</h4>
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
                    {files.map((file, index) => (
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
    </div>
  );
};

export default Projects;