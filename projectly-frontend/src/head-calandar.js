import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import './h-calandar.css';

const localizer = momentLocalizer(moment);

const events = [
  {
    start: new Date(),
    end: new Date(),
    title: "Some Event"
  },
  // Add more events as needed
];

const Dashboard = () => {
  return (
    <div className="projects-container">
      {/* Top Navbar */}
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
        <span className="icon"></span>
        <div className="recent-projects">
          <h4><span className='icon'>⬇</span> Head of Committee</h4>
          <Link to="/managerdashboard" className="project-item">
            <span className='icon'>📊</span> Reports
          </Link><br /><br /> 
          <Link to="/tasks" className="project-item">
            <span className='icon'>📋</span> Tasks
          </Link><br /><br /> 
          <Link to="/headNotifications" className="project-item">
            <span className='icon'>💬</span> Notifications
          </Link><br /><br /> 
          <Link to="/head-calandar" className="project-item">
            <span className='icon'>📅</span> Calendar
          </Link><br /><br /> 
        </div>
        <br />
        <Link to="/all-projects" className='view-link'>View All Projects</Link>
      </div>

      <div className="main-content">
        <h3>Calendar</h3>
        <hr />
        <div className="timeline-calendar">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 250, margin: '20px' }}
            views={['month', 'week', 'day']}
            defaultView="month"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;