import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './dashboard.css';

const Dashboard = () => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [subtasks, setSubtasks] = useState({}); // Store subtasks by parent_task_id
  const [isCreating, setIsCreating] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [lastProjects, setLastProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [newTask, setNewTask] = useState({
    project: '',
    title: '',
    description: '',
    status: 'To Do',
    assignedTo: '',
    dueDate: new Date().toISOString().split('T')[0],
    createdBy: ''
  });

  // Add notification function
  const addNotification = (message, type = 'success') => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      visible: true
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    setTimeout(() => {
      setNotifications(prev => 
        prev.map(n => 
          n.id === newNotification.id ? {...n, visible: false} : n
        )
      );
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 500);
    }, 5000);
  };

  // Fetch projects from backend
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
          setLastProjects(sortedProjects);
        } else {
          addNotification('Failed to fetch projects', 'error');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        addNotification('Error fetching projects', 'error');
      }
    };
    fetchProjects();
  }, []);

  // Fetch tasks and subtasks from backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/tasks/');
        if (response.ok) {
          const data = await response.json();
          console.log('Tasks response:', data);
          const tasksArray = Array.isArray(data) ? data : data.results || [];
          setTasks(tasksArray);

          // Fetch subtasks for each task
          const subtaskPromises = tasksArray.map(task =>
            fetch(`http://127.0.0.1:8000/api/tasks/${task.id}/subtasks/`)
              .then(res => res.ok ? res.json() : [])
              .then(subtaskData => ({
                taskId: task.id,
                subtasks: Array.isArray(subtaskData) ? subtaskData : subtaskData.results || []
              }))
              .catch(() => ({ taskId: task.id, subtasks: [] }))
          );

          const subtaskResults = await Promise.all(subtaskPromises);
          const subtaskMap = subtaskResults.reduce((acc, { taskId, subtasks }) => ({
            ...acc,
            [taskId]: subtasks
          }), {});
          setSubtasks(subtaskMap);
        } else {
          addNotification('Failed to fetch tasks', 'error');
          setTasks([]);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        addNotification('Error fetching tasks', 'error');
        setTasks([]);
      }
    };
    fetchTasks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setShowTaskForm(false);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/tasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          assigned_to: newTask.assignedTo || null,
          due_date: newTask.dueDate || null,
          project: newTask.project || null,
          created_by: newTask.createdBy || null
        })
      });

      if (response.ok) {
        const createdTask = await response.json();
        setTasks(prev => [...prev, createdTask]);
        addNotification(`Task "${createdTask.title}" created successfully!`);

        // Update lastProjects if project is new
        if (createdTask.project && !lastProjects.some(p => p.id === createdTask.project)) {
          const projectResponse = await fetch('http://127.0.0.1:8000/api/projects/');
          if (projectResponse.ok) {
            const projects = await projectResponse.json();
            const sortedProjects = (Array.isArray(projects) ? projects : projects.results || [])
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 3);
            setLastProjects(sortedProjects);
          }
        }
      } else {
        const errorData = await response.json();
        addNotification(`Failed to create task: ${errorData.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      addNotification('Error creating task', 'error');
    } finally {
      setIsCreating(false);
      setNewTask({
        project: '',
        title: '',
        description: '',
        status: 'To Do',
        assignedTo: '',
        dueDate: new Date().toISOString().split('T')[0],
        createdBy: ''
      });
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProject({
      name: project.name,
      description: project.description || 'No description available',
      manager: project.manager || 'Not assigned',
      startDate: project.start_date || 'N/A',
      deadline: project.deadline || 'N/A',
      status: project.status || 'Unknown',
      team: project.team || []
    });
    setShowProjectDetails(true);
  };

  const notificationStyles = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000,
  };

  const notificationItemStyles = (type) => ({
    padding: '10px 15px',
    marginBottom: '10px',
    borderRadius: '4px',
    color: 'white',
    backgroundColor: type === 'error' ? '#ff4444' : '#00C851',
    opacity: 1,
    transition: 'opacity 0.5s ease',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  });

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
          <button className="create-button" onClick={() => setShowTaskForm(true)}>Create</button>
          <img className='bar-icon' src={require('./notification.png')} alt="logo" />
          <img className='bar-icon' src={require('./star.png')} alt="logo" />
        </div>
      </div>

      {/* Notification container */}
      <div style={notificationStyles}>
        {notifications.map(notification => (
          notification.visible && (
            <div 
              key={notification.id} 
              style={notificationItemStyles(notification.type)}
            >
              {notification.message}
            </div>
          )
        ))}
      </div>

      <div className="sidebar2">
        <div className="recent-projects">
          <h4><span className='icon'>⬇</span> Manager</h4>
          <Link to="/dashboard2" className="project-item">
            <span className='icon'>📊</span> Generate Reports
          </Link>
          <Link to="/subTask" className="project-item">
            <span className='icon'>📋</span> Create Sub Tasks
          </Link>
          <Link to="/access" className="project-item">
            <span className='icon'>📎</span> Access
          </Link>
          <Link to="/fileSharing" className="project-item">
            <span className='icon'>📁</span> File Sharing
          </Link>
        </div>
        <Link to="/all-projects" className='view-link'>View All Projects</Link>
      </div>

      <div className="main-content">
        <div className="search-bar">
          <button className="search-button">Search</button>
          <hr />
        </div>

        {showTaskForm && (
          <div className="task-form-modal">
            <div className="task-form-content">
              <h2>Add Task</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Project:</label>
                  <input
                    type="text"
                    name="project"
                    value={newTask.project}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Title:</label>
                  <input
                    type="text"
                    name="title"
                    value={newTask.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    name="description"
                    value={newTask.description}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Status:</label>
                  <select
                    name="status"
                    value={newTask.status}
                    onChange={handleInputChange}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Assigned to:</label>
                  <input
                    type="text"
                    name="assignedTo"
                    value={newTask.assignedTo}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Due date:</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={newTask.dueDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Created By:</label>
                  <input
                    type="text"
                    name="createdBy"  
                    value={newTask.createdBy}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="submit" 
                    disabled={isCreating}
                    className={isCreating ? 'disabled-button' : ''}
                  >
                    {isCreating ? 'Creating...' : 'Create Task'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowTaskForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="project-list">
          <button className="create-button" onClick={() => setShowTaskForm(true)}>
            📝 Create Task
          </button>
        </div>

        <div className="tasks-container">
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <div key={index} className="task-box">
                <h3>{task.title}</h3>
                <p><strong>Project:</strong> {task.project || 'N/A'}</p>
                <p><strong>Status:</strong> {task.status}</p>
                <p><strong>Assigned to:</strong> {task.assigned_to || 'N/A'}</p>
                <p><strong>Due date:</strong> {task.due_date || 'N/A'}</p>
                <p>{task.description}</p>
                {subtasks[task.id] && subtasks[task.id].length > 0 && (
                  <div>
                    <h4>Subtasks:</h4>
                    <ul>
                      {subtasks[task.id].map((subtask, subIndex) => (
                        <li key={subIndex}>{subtask.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No tasks available.</p>
          )}
        </div>

        <h4>Last Projects Created</h4>
        <div className="attachment-list">
          <div className="attachment-file">
            {lastProjects.length > 0 ? (
              lastProjects.map((project, index) => (
                <React.Fragment key={project.id}>
                  <div className="upload-box" onClick={() => handleProjectClick(project)}>
                    <h4>{project.name}</h4>
                    <p>Click to view details</p>
                    <div className="project-stats">
                      <span>Status: {project.status || 'Active'}</span>
                      <span>Tasks: {project.task_count || 0}</span>
                    </div>
                  </div>
                  {index < lastProjects.length - 1 && <hr />}
                </React.Fragment>
              ))
            ) : (
              <p>No projects available.</p>
            )}
          </div>
        </div>

        {/* Project Details Form */}
        {showProjectDetails && selectedProject && (
          <div className="project-details-modal">
            <div className="project-details-content">
              <h2>{selectedProject.name} Details</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowProjectDetails(false)}
              >
                ×
              </button>
              
              <div className="project-info">
                <p><strong>Description:</strong> {selectedProject.description}</p>
                <p><strong>Manager:</strong> {selectedProject.manager}</p>
                <p><strong>Start Date:</strong> {selectedProject.startDate}</p>
                <p><strong>Deadline:</strong> {selectedProject.deadline}</p>
                <p><strong>Status:</strong> {selectedProject.status}</p>
                <p><strong>Team Members:</strong></p>
                <ul>
                  {selectedProject.team.length > 0 ? (
                    selectedProject.team.map((member, i) => (
                      <li key={i}>{member}</li>
                    ))
                  ) : (
                    <li>No team members assigned</li>
                  )}
                </ul>
              </div>
              
              <button 
                className="close-button"
                onClick={() => setShowProjectDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;