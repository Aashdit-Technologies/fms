import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { FaPrint } from "react-icons/fa";
import { Button, Checkbox, FormControlLabel } from "@mui/material";

const NoteSheetPreview = () => {
  const location = useLocation();
  const previewData = location.state?.previewData?.data || [];
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Handle "Select All" functionality
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(previewData.map((note) => note.noteSheetId));
    }
    setSelectAll(!selectAll);
  };

  // Handle individual note selection
  const handleSelectNote = (id) => {
    setSelectedNotes((prev) =>
      prev.includes(id) ? prev.filter((noteId) => noteId !== id) : [...prev, id]
    );
  };

  // Handle print functionality
  const handlePrint = () => {
    if (selectedNotes.length === 0) {
      alert("Please select at least one note to print.");
      return;
    }
  
    // Filter selected notes
    const selectedNoteDetails = previewData.filter((note) =>
      selectedNotes.includes(note.noteSheetId)
    );
  
    // Open new print window
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Note Sheet</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .note-sheet { max-width: 800px; margin: 0 auto; }
            .note-sheet h1 { text-align: center; font-size: 24px; margin-bottom: 20px; }
            .note-container { display: flex; align-items: flex-start; border-top: 1px solid #ddd; padding: 10px; }
            .left-section { width: 25%; padding-right: 10px; border-right: 1px solid #e5e7eb; }
            .right-section { width: 75%; padding-left: 10px; border-left: 1px solid #e5e7eb; }
            .noting-no { font-size: 14px; font-weight: bold; margin-bottom: 5px; }
            .meta { font-size: 12px; color: #555; }
            .note-content { font-size: 14px; margin-top: 10px; }
            .sender-info { text-align: right; margin-top: 10px; font-size: 14px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="note-sheet">
            <h1>NOTE SHEET</h1>
            ${selectedNoteDetails
              .map(
                (note) => `
              <div class="note-container">
                <!-- Left Section: Docket Number, Date -->
                <div class="left-section">
                  <p class="noting-no">Noting No: ${note.notingNo}</p>
                  <p class="meta">Docket No: ${note.docketNumber}</p>
                  <p class="meta">${note.createdDate}</p>
                </div>
  
                <!-- Right Section: Note Content & Sender Info -->
                <div class="right-section">
                  <p class="note-content">
                    ${note.note ? note.note.replace(/<[^>]*>/g, "") : "No additional notes."}
                  </p>
                  <div class="sender-info">
                    ${note.senderName} <br /> (${note.senderDesignation})
                  </div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </body>
      </html>
    `);
  
    printWindow.document.close();
    printWindow.print();
  };
  

  const getPlainText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "No additional notes.";
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-blue-200 p-2 rounded">
        <h1 className="text-lg font-bold text-blue-900">Note sheet List</h1>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search content"
            className="border p-1 rounded"
          />
          <Button variant="contained" color="success">
            Find
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FaPrint />}
            onClick={handlePrint}
            disabled={selectedNotes.length === 0}
          >
            Print
          </Button>
        </div>
      </div>

      {/* Note Sheet List */}
      <div className="mt-4 bg-white p-4 shadow rounded-lg">
        <h2 className="text-xl font-bold text-center">NOTE SHEET</h2>
        {previewData.length === 0 ? (
          <p className="text-gray-500 text-center mt-2">
            No note sheet available.
          </p>
        ) : (
          <>
            {/* Select All Checkbox */}
            <FormControlLabel
              control={
                <Checkbox checked={selectAll} onChange={handleSelectAll} />
              }
              label="Select All"
              className="mb-4"
            />

            {/* Note List */}
            {previewData.map((note) => (
              <div
                key={note.noteSheetId}
                className="border-t pl-4 mt-4 d-flex justify-content-start align-items-center"
              >
                <div
                  className="w-25 "
                  style={{ borderRight: "1px solid #e5e7eb", height: "100%" }}
                >
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedNotes.includes(note.noteSheetId)}
                      onChange={() => handleSelectNote(note.noteSheetId)}
                    />
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        NotingNo: {note.notingNo}
                      </p>
                      <p className="text-sm text-gray-600 m-0">
                        Docket No: {note.docketNumber}
                      </p>
                      <p className="text-sm text-gray-600 m-0">
                        {note.createdDate}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="w-75 px-4"
                  style={{ borderLeft: "1px solid #e5e7eb", height: "100%" }}
                >
                  <div className="border-l-4 border-gray-400 pl-4">
                    {note.note ? (
                      <p className="mt-2">{getPlainText(note.note)}</p>
                    ) : (
                      <p className="text-gray-500">No additional notes.</p>
                    )}
                  </div>
                  <div className="mt-4 text-right float-end">
                    <p>
                      <strong>{note.senderName}</strong>
                      <br /> ({note.senderDesignation})
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default NoteSheetPreview;
