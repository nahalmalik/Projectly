import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Projects.css';
import './CalendarStyles.css'; // New CSS file

const localizer = momentLocalizer(moment);

const Projects = () => {
  const navigate = useNavigate();

  const events = [
    {
      title: 'Team Meet',
      start: new Date(2025, 4, 12, 9, 0),
      end: new Date(2025, 4, 12, 10, 0),
      color: '#a8dadc', // Light blue
    },
    {
      title: 'Design Rev',
      start: new Date(2025, 4, 13, 11, 0),
      end: new Date(2025, 4, 13, 12, 0),
      color: '#f4a261', // Light orange
    },
    {
      title: 'Sprint Plan',
      start: new Date(2025, 4, 15, 14, 0),
      end: new Date(2025, 4, 15, 16, 0),
      allDay: false,
      color: '#e76f51', // Light red
    },
    {
      title: 'Client Demo',
      start: new Date(2025, 4, 18, 10, 30),
      end: new Date(2025, 4, 18, 11, 30),
      color: '#8ac926', // Light green
    },
    {
      title: 'Code Review',
      start: new Date(2025, 4, 16, 13, 0),
      end: new Date(2025, 4, 16, 14, 0),
      color: '#198c91', // Teal
    },
  ];

  return (
    <div className="projects-container">
      <div className="top-navbar">
        <div className="navbar-left">
          <img className="bar-icon" src={require('./menu.png')} alt="menu" />
          <img src={require('./logo1.png')} alt="logo" />
          <a href="/your-work" className="view-link">Your work</a>
          <a href="/projects" className="view-link">Projects</a>
          <a href="/dashboards" className="view-link">Dashboards</a>
          <button className="create-button">Create</button>
          <img className="bar-icon" src={require('./notification.png')} alt="notification" />
          <img className="bar-icon" src={require('./star.png')} alt="star" />
        </div>
      </div>

      <div className="sidebar">
        <div className="recent-projects">
          <h4><span className="icon">⬇</span> Recent</h4>
          <div className="project-item">
            <span className="icon">📁</span> Project 1
          </div>
        </div>
        <br />
        <a href="/all-projects" className="view-link">View All Projects</a>
      </div>

      <div className="main-content">
        <h3>📁 Project 1</h3>
        <div className="tabs">
          <button onClick={() => navigate('/summary')}><span className="icon">📄</span> Summary</button>
          <button onClick={() => navigate('/boards')}><span className="icon">📋</span> Board</button>
          <button onClick={() => navigate('/Projects')}><span className="icon">📊</span> Reports</button>
          <button className="active-tab"><span className="icon">📅</span> Calendar</button>
          <button onClick={() => navigate('/timeline')}><span className="icon">🕒</span> Timeline</button>
          <button onClick={() => navigate('/communications')}><span className="icon">💬</span> Communications</button>
          <button onClick={() => navigate('/attachments')}><span className="icon">📎</span> Attachments</button>
        </div>
        <hr />
        <div className="search-bar">
          <input type="text" placeholder="Search..." /> 🔍
        </div>

        <div className="timeline-calender">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 200, margin: '15px' }} // Reduced height and margin
            views={['month', 'week', 'day']}
            defaultView="month"
            className="small-colorful-calendar" // Apply new custom class
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.color || '#3174ad', // Use event color or default
                color: 'white',
                borderRadius: '3px',
                opacity: 0.8,
                border: 'none',
                fontSize: '0.75em', // Smaller font
                padding: '2px 5px',
              },
            })}
            dayPropGetter={(date) => {
              const day = date.getDay();
              if (day === 0 || day === 6) {
                return {
                  className: 'weekend-small',
                };
              }
              return {};
            }}
            components={{
              toolbar: (props) => (
                <div className="rbc-toolbar-small">
                  <span className="rbc-btn-group-small">
                    <button type="button" onClick={() => props.onNavigate('PREV')}>
                      {'<'}
                    </button>
                    <button type="button" onClick={() => props.onNavigate('TODAY')}>
                      Today
                    </button>
                    <button type="button" onClick={() => props.onNavigate('NEXT')}>
                      {'>'}
                    </button>
                  </span>
                  <span className="rbc-toolbar-label-small">{props.label}</span>
                  <span className="rbc-btn-group-small">
                    <button type="button" onClick={() => props.onView('month')}>
                      M
                    </button>
                    <button type="button" onClick={() => props.onView('week')}>
                      W
                    </button>
                    <button type="button" onClick={() => props.onView('day')}>
                      D
                    </button>
                  </span>
                </div>
              ),
              month: {
                dateHeader: ({ date, label }) => (
                  <div className="rbc-date-header-small">
                    {label}
                  </div>
                ),
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Projects;