import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { Button } from "@mui/material";
import { MdNote } from "react-icons/md";
import SunEditorComponent from "./SunEditorComponent";

const NoteSheet = ({ noteSheets, additionalDetails, content, onContentChange }) => {
  const [notes, setNotes] = useState([]);
  const [zoomIn, setZoomIn] = useState(false);
  const [writeNote, setWriteNote] = useState(false);
  const [editorContent, setEditorContent] = useState(content || '');
  const [showPreview, setShowPreview] = useState(false);

  // Update content when props change
  useEffect(() => {
    if (content !== undefined) {
      setEditorContent(content);
    }
  }, [content]);

  // Update content when additionalDetails change
  useEffect(() => {
    if (additionalDetails?.data?.note) {
      setEditorContent(additionalDetails.data.note);
      onContentChange?.(additionalDetails.data.note);
    }
  }, [additionalDetails?.data?.note, onContentChange]);

  // Update notes when noteSheets change
  useEffect(() => {
    if (noteSheets && Array.isArray(noteSheets.data)) {
      setNotes(noteSheets.data);
    } else {
      setNotes([]);
    }
  }, [noteSheets]);

  const handleEditorChange = (newContent) => {
    setEditorContent(newContent);
    onContentChange?.(newContent);
  };

  const togglePreview = () => {
    if (showPreview) {
      setShowPreview(false);
      setWriteNote(true);
    } else {
      setShowPreview(true);
      setWriteNote(false);
    }
  };

  const convertHTMLToText = (htmlContent) => {
    if (!htmlContent) return '';
    const doc = new DOMParser().parseFromString(htmlContent, "text/html");
    return doc.body.textContent || doc.body.innerText || '';
  };

  const badgeColors = ["#ff5733", "#1e90ff", "#28a745", "#ffcc00"];

  return (
    <div className={`note-sheet-container ${zoomIn || writeNote || showPreview ? "zoom-in" : ""}`}>
      <Card className="p-4 mb-4 shadow-lg note-card">
        <div className="d-flex justify-content-between align-items-center note-header">
          <h5 className="fw-bold text-uppercase text-dark d-flex align-items-center">
            <MdNote className="text-success me-2" size={28} /> Note Sheet
          </h5>
          <div>
            {!showPreview && (
              <>
                {writeNote ? (
                  <Button
                    variant="contained"
                    color="error"
                    className="me-2"
                    onClick={() => setWriteNote(false)}
                  >
                    Close View
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    className="me-2"
                    onClick={() => setWriteNote(true)}
                  >
                    Write Note
                  </Button>
                )}

                {!writeNote && (
                  <Button
                    variant="contained"
                    color="primary"
                    className="me-2"
                    onClick={() => setZoomIn(!zoomIn)}
                  >
                    {zoomIn ? "Zoom Out" : "Zoom In"}
                  </Button>
                )}
              </>
            )}
            
            <Button
              variant="contained"
              color="secondary"
              className="me-2"
              onClick={togglePreview}
              disabled={!editorContent}
            >
              {showPreview ? "Close Preview" : "Preview"}
            </Button>
          </div>
        </div>

        <div className="d-flex">
          <div className={`notes-container ${(writeNote || showPreview) && !zoomIn ? "half-width" : "full-width"}`}>
            {notes.length > 0 ? (
              notes.map((note, index) => (
                <Card.Body
                  key={note.noteSheetId}
                  className="note-card-body"
                  style={{
                    background: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                    borderLeft: `6px solid ${badgeColors[index % badgeColors.length]}`,
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
                    <span className="text-primary">{note.senderName}</span> ({note.senderDesignation})
                  </p>
                  <p className="note-content">{convertHTMLToText(note.note)}</p>
                  <p className="note-date">
                    {note.senderName} | {note.createdDate} | {note.createdTime}
                  </p>
                </Card.Body>
              ))
            ) : (
              <p>No notes available</p>
            )}
          </div>

          {(writeNote || showPreview) && (
            <div className="editor-container half-width">
              {showPreview ? (
                <div className="preview-content">
                  <div dangerouslySetInnerHTML={{ __html: editorContent || '' }} />
                </div>
              ) : (
                <SunEditorComponent
                  content={editorContent}
                  placeholder="Enter your task action here..."
                  onContentChange={handleEditorChange}
                  additionalDetails={additionalDetails}
                />
              )}
            </div>
          )}
        </div>
      </Card>

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
          overflow-y: auto;
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
          overflow-y: auto;
        }
        .full-width {
          width: 100%;
        }
        .preview-content {
          padding: 20px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          min-height: 500px;
          overflow-y: auto;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
