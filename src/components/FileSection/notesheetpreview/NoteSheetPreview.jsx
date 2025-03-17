import React, {  useEffect, useState } from "react";
import { FaPrint } from "react-icons/fa";
import { Button, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { toast } from "react-toastify";
import "./NoteSheetPreview.css";
import { MdOutlineKeyboardBackspace } from "react-icons/md";

const NoteSheetPreview = () => {
  const [previewData, setPreviewData] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchText, setSearchText] = useState("");


  useEffect(() => {
    setTimeout(() => {
      const dataString = sessionStorage.getItem("noteSheetPreviewData");
      if (dataString) {
        setPreviewData(JSON.parse(dataString));
        console.log("Loaded Preview Data:", JSON.parse(dataString)); 
      } else {
        console.log("No data found in sessionStorage.");
      }
    }, 500); 
  }, []);

  const handleBack = () => {
    sessionStorage.removeItem("noteSheetPreviewData");
    window.close();
  };

  if (!previewData.length) {
    return <p>No data available for preview.</p>;
  }


  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(previewData.map((note) => note.noteSheetId));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectNote = (id) => {
    setSelectedNotes((prev) =>
      prev.includes(id) ? prev.filter((noteId) => noteId !== id) : [...prev, id]
    );
  };

  const highlightText = (text) => {
    if (!searchText.trim()) return text;
    const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
    return text.replace(
      regex,
      `<span style="background-color: yellow; color: black;">$1</span>`
    );
  };

  const handlePrint = () => {
    if (selectedNotes.length === 0) {
      toast.error("Please select at least one note to print.");
      return;
    }

    const selectedNoteDetails = previewData.filter((note) =>
      selectedNotes.includes(note.noteSheetId)
    );

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Note Sheet</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .note-sheet { max-width: 800px; margin: 0 auto; }
            .note-sheet h1 { text-align: center; font-size: 24px; margin-bottom: 20px; }
            .note-container { border-top: 1px solid #000; padding: 10px; }
            .noting-no { font-size: 14px; font-weight: bold; }
            .meta { font-size: 12px; color: #555; }
            .note-content { font-size: 14px; margin-top: 10px; }
            .sender-info { text-align: right; font-size: 14px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="note-sheet">
            <h1>NOTE SHEET</h1>
            ${selectedNoteDetails
              .map(
                (note) => `
              <div class="note-container">
                <p class="noting-no">Noting No: ${note.notingNo}</p>
                <p class="meta">Docket No: ${note.docketNumber}</p>
                <p class="meta">${note.createdDate}</p>
                <p class="note-content">
                  ${note.note ? note.note.replace(/<[^>]*>/g, "") : "No additional notes."}
                </p>
                <div class="sender-info">
                  ${note.senderName} <br /> (${note.senderDesignation})
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

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="main_preview bg-blue-300 p-2 gap-2 rounded shadow-lg d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center justify-content-between w-100 ">
          <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#052C65" }}>Note Sheet List</h1>

          <TextField
            variant="outlined"
            placeholder="Search content..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-52"
            size="small"
            style={{ padding: "0", textTransform: "inherit" }}
          />
          

          <Button
            variant="contained"
            color="primary"
            startIcon={<FaPrint />}
            onClick={handlePrint}
            disabled={selectedNotes.length === 0}
            style={{ height: "40px" }}
          >
            Print
          </Button>
          
        </div>
        <Button
            variant="contained"
            color="warning"
            startIcon={<MdOutlineKeyboardBackspace />}
            onClick={handleBack}
            style={{ height: "40px" }}
          >
            Back
          </Button>
      </div>
      

      <div className="mt-4 bg-white p-4 shadow rounded-lg">
        <h2 className="text-center" style={{ fontSize: "20px", fontWeight: "600", color: "#052C65" }}>NOTE SHEET</h2>
        
        {previewData.length === 0 ? (
          <p className="text-gray-500 text-center mt-2">No note sheet available.</p>
        ) : (
          <>
            <FormControlLabel
              control={<Checkbox checked={selectAll} onChange={handleSelectAll} />}
              label="Select All"
              className="mb-4"
            />

            {previewData.map((note) => (
              <div key={note.noteSheetId} className="border-t pl-4 mt-4 d-flex align-items-center">
                <div className="w-25" style={{ borderRight: "1px solid #e5e7eb" }}>
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedNotes.includes(note.noteSheetId)}
                      onChange={() => handleSelectNote(note.noteSheetId)}
                    />
                    <div>
                      <p className="text-sm text-gray-600 mb-2" dangerouslySetInnerHTML={{ __html: highlightText(`Noting No: ${note.notingNo}`) }} />
                      <p className="text-sm text-gray-600 m-0" dangerouslySetInnerHTML={{ __html: highlightText(`Docket No: ${note.docketNumber}`) }} />
                      <p className="text-sm text-gray-600 m-0" dangerouslySetInnerHTML={{ __html: highlightText(note.createdDate) }} />
                    </div>
                  </div>
                </div>

                <div className="w-75 px-4" style={{ marginTop: "65px" }}>
                  <div className="border-l-4 border-gray-400 pl-4">
                    <p className="mt-2" dangerouslySetInnerHTML={{ __html: highlightText(note.note) }} />
                  </div>
                  <div className="mt-4 text-right float-end">
                    <p className="text-right float-end" dangerouslySetInnerHTML={{ __html: highlightText(`${note.senderName} <br /> (${note.senderDesignation})`) }} />
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
