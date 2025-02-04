import React from "react";
import { Card } from "react-bootstrap";
import { Button } from "@mui/material";
import { MdNote } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const NoteSheet = () => {
  const navigate = useNavigate();
  const notes = Array.from({ length: 10 }).map((_, index) => ({
    id: 100 + index,
    author: `Author ${index + 1}`,
    designation: "Designation",
    content: `This is sample content for note ${index + 1}.`,
    date: `02-09-202${index % 5} ${10 + (index % 10)}:${30 + (index % 30)} AM`,
    estimatedCost: `Rs. ${(index + 1) * 5000}/-`,
  }));

  const badgeColors = ["#ff5733", "#1e90ff", "#28a745", "#ffcc00"];

  return (
    <div className="note-sheet-container">
      <Card className="p-4 mb-4 shadow-lg note-card">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center note-header">
          <h5 className="fw-bold text-uppercase text-dark d-flex align-items-center">
            <MdNote className="text-success me-2" size={28} /> Note Sheet
          </h5>
          <div>
            <Button
              variant="contained"
              color="success"
              className="me-2"
              onClick={() => navigate("/write-note")}
            >
              Write Note
            </Button>
            <Button variant="contained" color="primary" className="me-2">
              Zoom In
            </Button>
            <Button variant="contained" color="secondary">
              Preview
            </Button>
          </div>
        </div>

        {/* Notes List */}
        <div className="notes-container">
          {notes.map((note, index) => (
            <Card.Body
              key={note.id}
              className="note-card-body"
              style={{
                background: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                borderLeft: `6px solid ${
                  badgeColors[index % badgeColors.length]
                }`,
              }}
            >
              <div
                className="note-index"
                style={{ background: badgeColors[index % badgeColors.length] }}
              >
                {index + 1}
              </div>
              <p className="note-author">
                <strong>Noting By:</strong>{" "}
                <span className="text-primary">{note.author}</span> (
                {note.designation})
              </p>
              <p className="note-content">{note.content}</p>
              <p>
                <strong>Estimated Cost:</strong>{" "}
                <span className="text-danger">{note.estimatedCost}</span>
              </p>
              <p className="note-date">
                {note.author} | {note.date}
              </p>
            </Card.Body>
          ))}
        </div>
      </Card>

      {/* CSS Styles */}
      <style >{`
        .note-sheet-container {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }
        .note-card {
          width: 100%;
          background-color: #f9f9f9;
          border-radius: 12px;
        }
        .note-header {
          position: sticky;
          top: 0;
          background: #f9f9f9;
          padding-bottom: 10px;
          z-index: 10;
        }
        .notes-container {
          max-height: 500px;
          overflow-y: auto;
          padding: 20px;
          overflow-x: hidden;

        }
        .note-card-body {
          position: relative;
          padding: 20px;
          margin-top: 25px;
          border-radius: 10px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease-in-out;
        }
        .main_note {
          width: 100%;
        }
        .main_correspondence {
          width: 100%;
        }
        .note-index {
          position: absolute;
          top: -12px;
          right: -12px;
          width: 40px;
          height: 40px;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          border: 2px solid white;
        }
        .note-author {
          margin-bottom: 5px;
        }
        .note-content {
          color: #555;
        }
        .note-date {
          text-align: right;
          font-weight: bold;
          color: #777;
        }
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
          height: 8px; 
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1; 
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb {
          background: #1565C0; 
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #1565C0; 
        }

      `}</style>
    </div>
  );
};

export default NoteSheet;
