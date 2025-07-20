import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Projects.css';

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);

  // Fetch recent projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/projects/');
        if (response.ok) {
          const data = await response.json();
          console.log('Projects response:', data);
          const projectsArray = Array.isArray(data) ? data : data.results || [];
          // Sort by created_at (newest first) and take top 3
          const sortedProjects = projectsArray
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3);
          setProjects(sortedProjects);
        } else {
          console.error('Failed to fetch projects:', response.status);
          setProjects([]);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
      }
    };
    fetchProjects();
  }, []);

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowProjectForm(true);
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
          {projects.length > 0 ? (
            <div className="project-item">
              <span className='icon'>📁</span>
              {projects[0].name}
            </div>
          ) : (
            <div className="project-item">
              <span className='icon'>📁</span>
              No recent projects
            </div>
          )}
        </div>
        <br />
        <a href="./SignInPage.js" className='view-link'>View All Projects</a>
      </div>

      <div className="main-content">
        <h3>📁 {projects.length > 0 ? projects[0].name : 'No Projects'}</h3>
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
          {projects.length > 0 ? (
            projects.map((project, index) => (
              <div className="project-item" key={index}>
                <span>📁 {project.name}</span>
                <button onClick={() => handleViewProject(project)}>View</button>
              </div>
            ))
          ) : (
            <div className="project-item">
              <span>📁 No projects available</span>
              <button disabled>View</button>
            </div>
          )}
        </div>

        {showProjectForm && selectedProject && (
          <div className="task-form-modal">
            <div className="task-form-content">
              <h2>{selectedProject.name} Details</h2>
              <form>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={selectedProject.name}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={selectedProject.description || 'No description available'}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Created At:</label>
                  <input
                    type="text"
                    value={new Date(selectedProject.created_at).toLocaleString()}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Created By:</label>
                  <input
                    type="text"
                    value={selectedProject.created_by?.email || 'N/A'}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Status:</label>
                  <input
                    type="text"
                    value={selectedProject.status || 'Active'}
                    readOnly
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowProjectForm(false)}
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;