import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Card } from "react-bootstrap";
import { Button } from "@mui/material";
import { MdNote } from "react-icons/md";
import { toast } from "react-toastify";
import { encryptPayload } from "../../utils/encrypt";
import useAuthStore from "../../store/Store";
import api from "../../Api/Api";
import { PageLoader } from "../pageload/PageLoader";
import debounce from "lodash/debounce";
import { Note } from "@mui/icons-material";
import NoteSheetEditor from "./NoteSheetEditor";

const NoteSheet = ({
  noteSheets,
  additionalDetails,
  fileDetails,
  content,
  onContentChange,
}) => {
  const [notes, setNotes] = useState([]);
  const [zoomIn, setZoomIn] = useState(false);
  const [writeNote, setWriteNote] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const token =
    useAuthStore((state) => state.token) || sessionStorage.getItem("token");
  const editorContentRef = useRef(content);

  useEffect(() => {
    if (noteSheets && Array.isArray(noteSheets.data)) {
      setNotes(noteSheets.data);
    } else {
      setNotes([]);
    }
  }, [noteSheets]);

  useEffect(() => {
    editorContentRef.current = content;
  }, [content]);

  const handleWriteNoteClick = () => {
    setWriteNote(true);
    if (onContentChange && editorContentRef.current !== undefined) {
      requestAnimationFrame(() => {
        onContentChange(editorContentRef.current);
      });
    }
  };

  const handleCloseWriteNote = () => {
    setWriteNote(false);
    if (onContentChange && editorContentRef.current !== undefined) {
      requestAnimationFrame(() => {
        onContentChange(editorContentRef.current);
      });
    }
  };

  const togglePreview = async () => {
    setIsLoading(true);
    try {
      const encryptedDload = encryptPayload({
        fileId: fileDetails.data.fileId,
      });

      const response = await api.post(
        "/file/notesheet-preview",
        { dataObject: encryptedDload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("API Response:", response.data);

      if (response.data.outcome) {
        sessionStorage.setItem(
          "noteSheetPreviewData",
          JSON.stringify(response.data.data)
        );

        setTimeout(() => {
          window.open("/note-sheet-preview", "_blank");
        }, 500);
      }
    } catch (error) {
      toast.error("Preview failed. Please try again.");
      console.error("Preview error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const convertHTMLToText = (html) => {
    const temp = document.createElement("div");

    temp.innerHTML = html;

    const links = temp.getElementsByTagName("a");
    for (let i = 0; i < links.length; i++) {
      links[i].target = "_blank";
      links[i].style.color = "#007bff";
    }

    return temp.innerHTML;
  };

  const badgeColors = ["#51029C"];

  const renderedNotes = useMemo(() => {
    return notes.map((note, index) => (
      <Card.Body
        key={note.noteSheetId}
        id={`note-${index + 1}`}
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
          <span className="text-primary">{note.senderName}</span> (
          {note.senderDesignation})
        </p>
        <p
          className="note-content"
          dangerouslySetInnerHTML={{
            __html: convertHTMLToText(note.note),
          }}
        ></p>
        <p className="note-date">
          {note.createdDate} | {note.createdTime}
        </p>
      </Card.Body>
    ));
  }, [notes]);

  return (
    <>
      {isLoading && <PageLoader />}
      <div
        className={`note-sheet-container ${
          zoomIn || writeNote || showPreview ? "zoom-in" : ""
        }`}
      >
        <Card className="p-4 mb-4 shadow-lg note-card">
          <div className="d-flex justify-content-between align-items-center note-header">
            <h5
              className="d-flex align-items-center"
              style={{
                color: "rgb(5 44 101)",
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              <MdNote className="text-success me-2" size={28} /> Note Sheet
            </h5>
            <div>
              {!showPreview && (
                <>
                  {fileDetails && fileDetails?.data.tabPanelId === 1 && (
                    <>
                      {writeNote ? (
                        <Button
                          variant="contained"
                          color="error"
                          className="me-2"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={handleCloseWriteNote}
                        >
                          Close View
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="success"
                          className="me-2"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={handleWriteNoteClick}
                        >
                          Write Note
                        </Button>
                      )}
                    </>
                  )}

                  {!writeNote && (
                    <Button
                      variant="contained"
                      color="primary"
                      className="me-2"
                      onMouseDown={(e) => e.preventDefault()}
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
                disabled={isLoading}
              >
                Preview
              </Button>
            </div>
          </div>

          <div className="d-flex">
            <div
              className={`notes-container ${
                (writeNote || showPreview) && !zoomIn
                  ? "half-width"
                  : "full-width"
              }`}
            >
              {notes.length > 0 ? renderedNotes : <p>No notes available</p>}
            </div>

            <div
              className={`editor-container half-width ${
                writeNote ? "" : "d-none"
              }`}
            >
              {showPreview ? (
                <div className="preview-content">
                  <div dangerouslySetInnerHTML={{ __html: content || "" }} />
                </div>
              ) : (
                writeNote && (
                  <div className="sun-editor-wrapper">
                    <NoteSheetEditor
                      content={content}
                      onContentChange={onContentChange}
                      additionalDetails={additionalDetails}
                    />
                  </div>
                )
              )}
            </div>
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
          width: 100%;
          background-color: #f9f9f9;
          border-radius: 12px;
          height: 500px;
          overflow: hidden;
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
          max-height: 405px;
          overflow-y: auto;
          padding:6px 20px;
          overflow-x: hidden;
          max-width:100%;
        }
        .note-sheet-container.zoom-in .notes-container {
          max-height: calc(100vh - 100px);
          overflow-y: auto;
        }
        .note-card-body {
          position: relative;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease-in-out;
        }
        .note-index {
          position: absolute;
          top: -12px;
          right: -12px;
          width: 35px;
          height: 35px;
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
          width: 5px;
          height: 5px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb {
          background: #207785;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #207785;
        }
       .note-link {
          color: #207785;
          text-decoration: none;
          font-weight: 500;
          padding: 2px 4px;
          border-radius: 3px;
          transition: background-color 0.2s;
        }

        .note-link:hover {
          background-color: #e9ecef;
          text-decoration: underline;
        }

        .note-card-body {
          scroll-margin-top: 100px;
          transition: background-color 0.3s;
        }

        .note-card-body.highlight {
          background-color: #fff3cd !important;
        }
      `}</style>
      </div>
    </>
  );
};

export default React.memo(NoteSheet);
