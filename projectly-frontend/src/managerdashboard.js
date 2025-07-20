import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './dashboard.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Gantt from './gantt.js'; 

const Dashboard = () => {
  const [ganttData, setGanttData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newTask, setNewTask] = useState({
    name: '',
    start_date: '',
    end_date: '',
    progress: 0,
    dependencies: []
  });

  // Fetch projects and Gantt data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects
        const projectsRes = await axios.get('http://localhost:8000/api/projects/');
        setProjects(projectsRes.data);

        if (projectsRes.data.length > 0) {
          setSelectedProject(projectsRes.data[0].id);
        }
      } catch (error) {
        toast.error('Error fetching projects');
        console.error('Error fetching projects:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch Gantt chart data when project is selected
  useEffect(() => {
    if (selectedProject) {
      const fetchGanttData = async () => {
        try {
          const res = await axios.get(`http://localhost:8000/api/projects/${selectedProject}/gantt-chart/`);
          const tasksRes = await axios.get(`http://localhost:8000/api/projects/${selectedProject}/gantt-tasks/`);

          const formattedData = tasksRes.data.map(task => ({
            id: task.id,
            text: task.name,
            start_date: task.start_date,
            duration: Math.ceil((new Date(task.end_date) - new Date(task.start_date)) / (1000 * 60 * 60 * 24)),
            progress: task.progress / 100,
            dependencies: task.dependencies.join(',')
          }));

          setGanttData(formattedData);
        } catch (error) {
          toast.error('Error fetching Gantt chart data');
          console.error('Error fetching Gantt chart:', error);
        }
      };

      fetchGanttData();
    }
  }, [selectedProject]);

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: value
    });
  };

  const handleAddTask = async () => {
    if (!selectedProject) {
      toast.error('Please select a project first');
      return;
    }

    try {
      // First get the Gantt chart for the project
      const ganttRes = await axios.get(`http://localhost:8000/api/projects/${selectedProject}/gantt-chart/`);

      // Then create the task
      await axios.post(`http://localhost:8000/api/projects/${selectedProject}/gantt-tasks/`, {
        ...newTask,
        gantt_chart: ganttRes.data.id
      });

      toast.success('Task added successfully');
      setNewTask({
        name: '',
        start_date: '',
        end_date: '',
        progress: 0,
        dependencies: []
      });

      // Refresh the Gantt chart data
      const tasksRes = await axios.get(`http://localhost:8000/api/projects/${selectedProject}/gantt-tasks/`);
      const formattedData = tasksRes.data.map(task => ({
        id: task.id,
        text: task.name,
        start_date: task.start_date,
        duration: Math.ceil((new Date(task.end_date) - new Date(task.start_date)) / (1000 * 60 * 60 * 24)),
        progress: task.progress / 100,
        dependencies: task.dependencies.join(',')
      }));
      setGanttData(formattedData);
    } catch (error) {
      toast.error('Error adding task');
      console.error('Error adding task:', error);
    }
  };

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

      <div className="sidebar2">
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
        <h3>Gantt Chart</h3>
        <hr />

        {/* Project Selection */}
        <div className="form-group">
          <label>Select Project:</label>
          <select
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        {/* Gantt Chart Display */}
        <div className="gantt-chart-container">
          {ganttData.length > 0 ? (
            <Gantt tasks={ganttData} />
          ) : (
            <p>No tasks available for this project. Add tasks below.</p>
          )}
        </div>

        {/* Add Task Form */}
        <div className="task-form">
          <h4>Add New Task</h4>
          <div className="form-group">
            <label>Task Name:</label>
            <input
              type="text"
              name="name"
              value={newTask.name}
              onChange={handleTaskInputChange}
            />
          </div>
          <div className="form-group">
            <label>Start Date:</label>
            <input
              type="date"
              name="start_date"
              value={newTask.start_date}
              onChange={handleTaskInputChange}
            />
          </div>
          <div className="form-group">
            <label>End Date:</label>
            <input
              type="date"
              name="end_date"
              value={newTask.end_date}
              onChange={handleTaskInputChange}
            />
          </div>
          <div className="form-group">
            <label>Progress (%):</label>
            <input
              type="number"
              name="progress"
              min="0"
              max="100"
              value={newTask.progress}
              onChange={handleTaskInputChange}
            />
          </div>
          <button onClick={handleAddTask}>Add Task</button>
        </div>

        <hr />
        <br />
        <h4 className="center-text">Kanban Board</h4>
        <hr />
        <div className="boards">
          <div className="board-column">
            <h4>To Do</h4>
            <div className="card">
              <span>Add card</span>
            </div>
          </div>
          <div className="board-column">
            <h4>Doing</h4>
            <div className="card">
              <span>Add card</span>
            </div>
          </div>
          <div className="board-column">
            <h4>Done</h4>
            <div className="card">
              <span>Add card</span>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default Dashboard;