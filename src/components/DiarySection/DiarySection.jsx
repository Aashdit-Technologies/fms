
import React from 'react';
import './DiarySection.css';

const DiarySection = () => {
  return (
    <div className="diary-container">
      <h1>File Section</h1>
      <div className="diary-content">
        <p>Welcome to the File Section. This is the /file route component.</p>
        <div className="diary-features">
          <h2>File Management Features:</h2>
          <ul>
            <li>Create and manage files</li>
            <li>Track file status</li>
            <li>Process file requests</li>
            <li>View file details</li>
          </ul>
        </div>
        <div className="diary-actions">
          <button className="action-btn">New File</button>
          <button className="action-btn">View Files</button>
          <button className="action-btn">Search</button>
        </div>
      </div>
    </div>
  );
};

export default DiarySection;
