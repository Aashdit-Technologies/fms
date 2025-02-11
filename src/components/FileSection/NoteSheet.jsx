import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { Button } from "@mui/material";
import { MdNote } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const NoteSheet = ({ noteSheets }) => {
  console.log("noteSheets", noteSheets);

  // Ensure notes is always an array
  const [notes, setNotes] = useState([]);

  console.log("notes", notes);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if noteSheets is an array before setting it
    if (noteSheets && Array.isArray(noteSheets.data)) {
      setNotes(noteSheets.data);
    } else {
      setNotes([]); // Fallback to an empty array
    }
  }, [noteSheets]);

  const convertHTMLToText = (htmlContent) => {
    const doc = new DOMParser().parseFromString(htmlContent, "text/html");
    return doc.body.textContent || doc.body.innerText;
  };

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
          {notes.length > 0 ? (
            notes.map((note, index) => (
              <Card.Body
                key={note.noteSheetId}
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
                  style={{
                    background: badgeColors[index % badgeColors.length],
                  }}
                >
                  {index + 1}
                </div>
                <p className="note-author">
                  <strong>Noting By:</strong>{" "}
                  <span className="text-primary">{note.senderName}</span> (
                  {note.senderDesignation})
                </p>
                <p className="note-content">{convertHTMLToText(note.note)}</p>
                <p className="note-date">
                  {note.senderName} | {note.createdDate} | {note.createdTime}
                </p>
              </Card.Body>
            ))
          ) : (
            <p>No notes available</p> // Fallback message
          )}
        </div>
      </Card>

      {/* CSS Styles */}
      <style>{`
        .note-sheet-container {
          display: flex;
          justify-content: center;
        }
        .note-card {
          height: 500px;
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