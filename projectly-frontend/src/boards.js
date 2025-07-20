import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Projects.css';


const Projects = () => {
  const navigate = useNavigate();
  const [showAddCardForm, setShowAddCardForm] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [boardLists, setBoardLists] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState('');

  useEffect(() => {
    fetch('/api/public/boards/1/lists/')
      .then(response => response.json())
      .then(data => setBoardLists(data))
      .catch(error => console.error('Error fetching board lists:', error));
  }, []);

  const handleAddCardClick = (listId) => {
    setShowAddCardForm(listId);
    setNewCardTitle('');
  };

  const handleInputChange = (event) => {
    setNewCardTitle(event.target.value);
  };

  const handleAddCardSubmit = async (event, listId) => {
    event.preventDefault();
    if (!newCardTitle.trim()) {
      return;
    }

    setSubmissionStatus('Adding card...');

    try {
      const formData = new URLSearchParams();
      formData.append('title', newCardTitle);
      formData.append('list', listId);

      const response = await fetch(`/api/public/lists/${listId}/cards/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Indicate form data
        },
        body: formData.toString(),
      });

      if (response.ok) {
        setSubmissionStatus('Card added successfully!');
        setShowAddCardForm(null);
        setNewCardTitle('');
        fetch('/api/public/boards/1/lists/')
          .then(response => response.json())
          .then(data => setBoardLists(data))
          .catch(error => console.error('Error fetching board lists:', error));
      } else {
        const errorData = await response.text(); // Simple text error for now
        setSubmissionStatus(`Failed to add card: ${errorData}`);
      }
    } catch (error) {
      setSubmissionStatus(`Error adding card: ${error.message}`);
    }
  };

  const initialBoardLists = [
    { id: 'todo', name: 'To Do', cards: boardLists.find(list => list.name?.toLowerCase() === 'to do')?.cards || [] },
    { id: 'doing', name: 'Doing', cards: boardLists.find(list => list.name?.toLowerCase() === 'doing')?.cards || [] },
    { id: 'done', name: 'Done', cards: boardLists.find(list => list.name?.toLowerCase() === 'done')?.cards || [] },
  ];

  return (
    <div className="projects-container">
      {/* Top Navbar (remains the same) */}
      <div className="top-navbar">
        <div className="navbar-left">
          <img className='bar-icon' src={require('./menu.png')} alt="logo" />
          <img src={require('./logo1.png')} alt="logo" />&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
          <a href="./SignInPage.js" className='view-link'>Your work </a> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
          <a href="./Projects.js" className='view-link'>Projects </a> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;
          <a href="./SignInPage.js" className='view-link'>Dashboards </a> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
          <button className="create-button">Create</button>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp;
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
        </div><br />
        <a href="./SignInPage.js" className='view-link'>View All Projects</a>
      </div>

      <div className="main-content">
        <h3>📁 Project 1</h3>
        <div className="tabs">
          <button onClick={() => navigate('/summary')}><span className='icon'>📄</span> Summary</button>
          <button className="active-tab" onClick={() => navigate('/boards')}><span className='icon'>📋</span> Board</button>
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

        <div className="boards">
          {initialBoardLists.map(list => (
            <div className="board-column" key={list.id}>
              <h4>{list.name}</h4>
              {list.cards.map(card => (
                <div className="card" key={card.id}>
                  <span>{card.title}</span>
                </div>
              ))}
              {!showAddCardForm || showAddCardForm !== list.id ? (
                <button className="add-card-button" onClick={() => handleAddCardClick(list.id)}>
                  + Add card
                </button>
              ) : (
                <form onSubmit={(e) => handleAddCardSubmit(e, list.id)} className="add-card-form">
                  <input
                    type="text"
                    placeholder="Enter card title"
                    value={newCardTitle}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="form-actions">
                    <button type="submit">Add</button>
                    <button type="button" onClick={() => setShowAddCardForm(null)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
        {submissionStatus && <p className="submission-status">{submissionStatus}</p>}
      </div>
    </div>
  );
};

export default Projects;