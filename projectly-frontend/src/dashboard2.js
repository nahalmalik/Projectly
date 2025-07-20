import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './dashboard.css';

const Dashboard = () => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [files, setFiles] = useState([null, null, null]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [notifications, setNotifications] = useState([]);
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

  // Fetch tasks from backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/tasks/');
        if (response.ok) {
          const data = await response.json();
          console.log('Tasks response:', data); // Debug response
          // Ensure data is an array
          const tasksArray = Array.isArray(data) ? data : data.results || [];
          setTasks(tasksArray);
        } else {
          addNotification('Failed to fetch tasks', 'error');
          setTasks([]); // Ensure tasks is an array on error
        }
      } catch (error) {
        addNotification('Error fetching tasks', 'error');
        console.error('Error fetching tasks:', error);
        setTasks([]); // Ensure tasks is an array on error
      }
    };
    fetchTasks();
  }, []);

  // Fetch uploaded files from backend
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/files/');
        if (response.ok) {
          const data = await response.json();
          console.log('Files response:', data); // Debug response
          // Ensure data is an array
          const filesArray = Array.isArray(data) ? data : data.results || [];
          setUploadedFiles(filesArray);
        } else {
          addNotification('Failed to fetch files', 'error');
          setUploadedFiles([]); // Ensure uploadedFiles is an array on error
        }
      } catch (error) {
        addNotification('Error fetching files', 'error');
        console.error('Error fetching files:', error);
        setUploadedFiles([]); // Ensure uploadedFiles is an array on error
      }
    };
    fetchFiles();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: value
    });
  };

  const handleFileChange = (index, e) => {
    const newFiles = [...files];
    newFiles[index] = e.target.files[0];
    setFiles(newFiles);
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    
    if (files.every(file => file === null)) {
      addNotification('Please select at least one file to upload', 'error');
      return;
    }
    
    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      
      files.forEach((file, index) => {
        if (file) {
          formData.append(`file_${index + 1}`, file);
        }
      });

      const response = await fetch('http://127.0.0.1:8000/api/upload-files/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        addNotification('Files uploaded successfully!');
        setUploadSuccess(true);
        setFiles([null, null, null]);
        // Refresh file list
        const fileResponse = await fetch('http://127.0.0.1:8000/api/files/');
        if (fileResponse.ok) {
          const fileData = await fileResponse.json();
          const filesArray = Array.isArray(fileData) ? fileData : fileData.results || [];
          setUploadedFiles(filesArray);
        }
      } else {
        addNotification('Failed to upload files', 'error');
        console.error('Failed to upload files');
      }
    } catch (error) {
      addNotification('Error uploading files', 'error');
      console.error('Error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setShowTaskForm(false);
  
    try {
      const response = await fetch('http://127.0.0.1:8000/api/tasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        setTasks(prevTasks => [...prevTasks, createdTask]);
        addNotification(`Task "${createdTask.title}" created successfully!`);
      } else {
        const errorData = await response.json();
        addNotification(`Failed to create task: ${errorData.message || 'Unknown error'}`, 'error');
        console.error('Failed to create task:', errorData);
      }
    } catch (error) {
      addNotification('Error creating task', 'error');
      console.error('Error:', error);
    } finally {
      setIsCreating(false);
    }

    setNewTask({
      project: '',
      title: '',
      description: '',
      status: 'To Do',
      assignedTo: '',
      dueDate: new Date().toISOString().split('T')[0],
      createdBy: ''
    });
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
      <div className="top-navbar">
        <div className="navbar-left">
          <img className='bar-icon' src={require('./menu.png')} alt="logo" />
          <img src={require('./logo1.png')} alt="logo" />
          <Link to="/projects" className='view-link'>Your work</Link>
          <Link to="/projects" className='view-link'>Projects</Link>
          <Link to="/SignInRolePage" className='view-link'>Dashboards</Link>
          <button className="create-button" onClick={() => setShowTaskForm(true)}>Create</button>
          <img className='bar-icon' src={require('./notification.png')} alt="logo" />
          <img className='bar-icon' src={require('./star.png')} alt="logo" />
        </div>
      </div>

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
          <button className="create-button" onClick={() => setShowTaskForm(true)}>📝 Create Task</button>
        </div>

        <div className="tasks-container">
          {tasks && tasks.length > 0 ? (
            tasks.map((task, index) => (
              <div key={index} className="task-box">
                <h3>{task.title}</h3>
                <p><strong>Project:</strong> {task.project || 'N/A'}</p>
                <p><strong>Status:</strong> {task.status}</p>
                <p><strong>Assigned to:</strong> {task.assigned_to || 'N/A'}</p>
                <p><strong>Due date:</strong> {task.due_date || 'N/A'}</p>
                <p>{task.description}</p>
              </div>
            ))
          ) : (
            <p>No tasks available.</p>
          )}
        </div>

        <div className="attachment-list">
          <form onSubmit={handleFileSubmit}>
            <div className="attachment-file">
              {[0, 1, 2].map((index) => (
                <div key={index} className="upload-box">
                  <h4>Upload File {index + 1}</h4>
                  <input 
                    type="file" 
                    className="file-input" 
                    onChange={(e) => handleFileChange(index, e)}
                  />
                  {files[index] && (
                    <p>Selected: {files[index].name}</p>
                  )}
                </div>
              ))}
            </div>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isUploading || files.every(file => file === null)}
            >
              {isUploading ? 'Uploading...' : 'Submit Files'}
            </button>
          </form>

          <div className="uploaded-files">
            <h3>Uploaded Files</h3>
            {uploadedFiles && uploadedFiles.length > 0 ? (
              <ul>
                {uploadedFiles.map((file, index) => (
                  <li key={index}>
                    <a href={file.file} target="_blank" rel="noopener noreferrer">
                      {file.file.split('/').pop()} ({(file.size / 1024).toFixed(2)} KB)
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No files uploaded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;