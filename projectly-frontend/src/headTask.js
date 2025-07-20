import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './h-calandar.css';
import axios from 'axios';

const Dashboard = () => {
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [tasks, setTasks] = useState([]);
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
                const token = localStorage.getItem('access_token');
                const response = await axios.get('http://localhost:8000/api/tasks/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log('Tasks response:', response.data);
                const tasksArray = Array.isArray(response.data) ? response.data : response.data.results || [];
                setTasks(tasksArray);
            } catch (error) {
                addNotification('Error fetching tasks', 'error');
                console.error('Error fetching tasks:', error);
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
            const token = localStorage.getItem('access_token');
            const response = await axios.post(
                'http://localhost:8000/api/tasks/',
                {
                    title: newTask.title,
                    description: newTask.description,
                    status: newTask.status,
                    assigned_to: newTask.assignedTo || null,
                    due_date: newTask.dueDate || null,
                    project: newTask.project || null,
                    created_by: newTask.createdBy || null
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const createdTask = response.data;
            setTasks(prevTasks => [...prevTasks, createdTask]);
            addNotification(`Task "${createdTask.title}" created successfully!`);
            
            setNewTask({
                project: '',
                title: '',
                description: '',
                status: 'To Do',
                assignedTo: '',
                dueDate: new Date().toISOString().split('T')[0],
                createdBy: ''
            });
        } catch (error) {
            addNotification('Error creating task', 'error');
            console.error('Error:', error);
        } finally {
            setIsCreating(false);
        }
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
                    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                    <Link to="/your-work" className='view-link'>Your work</Link>
                    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                    <Link to="/projects" className='view-link'>Projects</Link>
                    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;
                    <Link to="/dashboards" className='view-link'>Dashboards</Link>
                    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp;
                    <button className="create-button" onClick={() => setShowTaskForm(true)}>Create</button>
                    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                    <img className='bar-icon' src={require('./notification.png')} alt="logo" />
                    <img className='bar-icon' src={require('./star.png')} alt="logo" />
                </div>
            </div>

            {/* Notifications */}
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
                    <button 
                        className="create-button" 
                        onClick={() => setShowTaskForm(true)}
                    >
                        📝 Create Task
                    </button>
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
            </div>
        </div>
    );
};

export default Dashboard;