import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './h-calandar.css';

const Dashboard = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Fetch team members (simplified for your UI)
  useEffect(() => {
    setLoading(true);
    // This would be replaced with actual API call to your Django backend
    setTimeout(() => {
      setMembers([
        { id: 1, name: 'Member 1', email: 'member1@example.com', role: 'Committee Member', tasks: 5, completed: 3 },
        { id: 2, name: 'Member 2', email: 'member2@example.com', role: 'Committee Member', tasks: 7, completed: 5 }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSendMessage = () => {
    // This would connect to your Communication model
    alert(`Message sent to ${selectedMember.name}`);
    setShowCommunicationModal(false);
    setMessage('');
  };

  return (
    <div className="projects-container">
      {/* Keep your existing top navbar and sidebar exactly as is */}
      <div className="top-navbar">
        <div className="navbar-left">
          <img className='bar-icon' src={require('./menu.png')} alt="logo" />
          <img src={require('./logo1.png')} alt="logo" />
          &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
          <Link to="/your-work" className='view-link'>Your work</Link>
          &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
          <Link to="/projects" className='view-link'>Projects</Link>
          &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;
          <Link to="/dashboards" className='view-link'>Dashboards</Link>
          &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp;
          <button className="create-button">Create</button>
          &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
          <img className='bar-icon' src={require('./notification.png')} alt="logo" />
          <img className='bar-icon' src={require('./star.png')} alt="logo" />
        </div>
      </div>

      <div className="sidebar1">
        <div className="recent-projects">
          <h4><span className='icon'>⬇</span> Head of Committee</h4>
          <Link to="/managerdashboard" className="project-item">
            <span className='icon'>📊</span> Reports
          </Link><br /><br />
          <Link to="/headTask" className="project-item">
            <span className='icon'>📋</span> Tasks
          </Link><br /><br />
          <Link to="/headNotifications" className="project-item">
            <span className='icon'>💬</span> Notifications
          </Link><br /><br />
          <Link to="/head-calandar" className="project-item">
            <span className='icon'>📅</span> Calendar
          </Link>
        </div>
        <br />
        <Link to="/all-projects" className='view-link'>View All Projects</Link>
      </div>

      {/* Modified project-list section only */}
      <div className="main-content">
        <div className="search-bar">
          <button className="search-button">Search</button>
          <hr />
          <input type="text" className='icon' placeholder="Search..." /> 🔍
        </div>
        
        {loading ? (
          <div className="loading">Loading team members...</div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : (
          <div className="project-list">
            {members.map(member => (
              <div className="project-item" key={member.id}>
                <img className='pro-pic' src={require('./display-pic.png')} alt="logo" />
                <div className="member-details">
                  <h4>{member.name}</h4>
                  <h6>{member.email}</h6>
                  <p className="member-role">{member.role}</p>
                </div>
                <div className="member-actions">
                  <button 
                    className="communicate-button"
                    onClick={() => {
                      setSelectedMember(member);
                      setShowCommunicationModal(true);
                    }}
                  >
                    Communicate
                  </button>
                  <button 
                    className="track-button"
                    onClick={() => {
                      setSelectedMember(member);
                      setShowProgressModal(true);
                    }}
                  >
                    Track Progress
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Communication Modal (appears when Communicate button clicked) */}
      {showCommunicationModal && (
        <div className="communication-modal">
          <div className="modal-content">
            <h3>Send Message to {selectedMember?.name}</h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
            />
            <div className="modal-buttons">
              <button onClick={handleSendMessage} className="send-button">
                Send
              </button>
              <button 
                onClick={() => setShowCommunicationModal(false)} 
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Tracking Modal (appears when Track Progress button clicked) */}
      {showProgressModal && (
        <div className="progress-modal">
          <div className="modal-content">
            <h3>{selectedMember?.name}'s Progress</h3>
            <div className="progress-stats">
              <div className="stat-item">
                <span>Tasks Assigned</span>
                <strong>{selectedMember?.tasks}</strong>
              </div>
              <div className="stat-item">
                <span>Tasks Completed</span>
                <strong>{selectedMember?.completed}</strong>
              </div>
              <div className="stat-item">
                <span>Completion Rate</span>
                <strong>{Math.round((selectedMember?.completed / selectedMember?.tasks) * 100)}%</strong>
              </div>
            </div>
            <button 
              onClick={() => setShowProgressModal(false)}
              className="close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;