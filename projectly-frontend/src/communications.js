import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Projects.css';

const Projects = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  return (
    <div className="projects-container">
      {/* Top Navbar */}
      <div className="top-navbar">
      <div className="navbar-left">
            <img className='bar-icon' src={require('./menu.png')}  alt="logo" />
                <img src={require('./logo1.png')}  alt="logo" />&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 
                <a href="./SignInPage.js" className='view-link'>Your work </a> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                <a href="./Projects.js" className='view-link'>Projects </a> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;
                <a href="./SignInPage.js" className='view-link'>Dashboards </a> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                <button className="create-button">Create</button>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp;
                <img className='bar-icon' src={require('./notification.png')}  alt="logo" />
                <img className='bar-icon' src={require('./star.png')}  alt="logo" />
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
            </div>  <br />
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

        <div className="project-list">
          <div className="project-item">
          <img className='pro-pic' src={require('./display-pic.png' ) } alt="logo" />
          <h4>Manager</h4>
          <h6>abc@xyz.com</h6>
            <button className="create-button">View</button>
          </div>
          <div className="project-item">
            <img className='pro-pic' src={require('./display-pic.png' ) } alt="logo" />
            <h4>Head of Committee</h4>
            <h6>abc@xyz.com</h6>
            <button className="create-button">View</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;