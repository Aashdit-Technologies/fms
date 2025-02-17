import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { Button } from "@mui/material";
import { MdNote } from "react-icons/md";
import SunEditorComponent from "./SunEditorComponent"; // Import the SunEditorComponent

const NoteSheet = ({ noteSheets }) => {
  const [notes, setNotes] = useState([]);
  const [zoomIn, setZoomIn] = useState(false); // State to handle zoom-in mode
  const [writeNote, setWriteNote] = useState(false); // State to handle write note mode
  const [editorContent, setEditorContent] = useState(""); // State to handle editor content

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
    <div
      className={`note-sheet-container ${zoomIn || writeNote ? "zoom-in" : ""}`}
    >
      <Card className="p-4 mb-4 shadow-lg note-card">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center note-header">
          <h5 className="fw-bold text-uppercase text-dark d-flex align-items-center">
            <MdNote className="text-success me-2" size={28} /> Note Sheet
          </h5>
          <div>
            {/* Conditional buttons for Write Note and Zoom In/Out */}
            {writeNote ? (
              <Button
                variant="contained"
                color="error"
                className="me-2"
                onClick={() => setWriteNote(false)} // Close write note mode
              >
                Close View
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                className="me-2"
                onClick={() => setWriteNote(true)} // Open write note mode
              >
                Write Note
              </Button>
            )}

            {/* Only show Zoom In/Out button if writeNote is false */}
            {!writeNote && (
              <Button
                variant="contained"
                color="primary"
                className="me-2"
                onClick={() => setZoomIn(!zoomIn)} // Toggle zoom-in state
              >
                {zoomIn ? "Zoom Out" : "Zoom In"}
              </Button>
            )}
            {/* Always show Preview button */}
            <Button variant="contained" color="secondary" className="me-2">
              Preview
            </Button>
          </div>
        </div>

        {/* Notes List and Editor */}
        <div className="d-flex">
          {/* Left Side: Notes List */}
          <div
            className={`notes-container ${
              writeNote && !zoomIn ? "half-width" : "full-width"
            }`}
          >
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

          {/* Right Side: SunEditorComponent */}
          {writeNote && (
            <div className="editor-container half-width">
              <SunEditorComponent
                content={editorContent}
                onContentChange={(content) => setEditorContent(content)}
                placeholder="Write your note here..."
              />
            </div>
          )}
        </div>
      </Card>

      {/* CSS Styles */}
      <style>{`
        .note-sheet-container {
          display: flex;
          justify-content: center;
        }
        .note-sheet-container.zoom-in {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: white;
          z-index: 1000;
          padding: 20px;
          overflow: hidden;
        }
        .note-card {
          height: 500px;
          width: 100%;
          background-color: #f9f9f9;
          border-radius: 12px;
        }
        .note-sheet-container.zoom-in .note-card {
          height: calc(100vh - 40px);
          width: calc(100vw - 40px);
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
        .note-sheet-container.zoom-in .notes-container {
          max-height: calc(100vh - 100px);
          overflow-y: scroll;
        }
        .note-card-body {
          position: relative;
          padding: 20px;
          margin-top: 25px;
          border-radius: 10px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease-in-out;
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
        .half-width {
          width: 50%;
          overflow-y: scroll;
        }
        .full-width {
          width: 100%;
        }
        .editor-container {
          padding: 20px;
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
