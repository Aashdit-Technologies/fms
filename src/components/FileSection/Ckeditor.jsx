import React, { useState, useCallback, useEffect, useRef } from "react";
import { Accordion, Modal, Card, Button } from "react-bootstrap";
import { FaPlus, FaMinus, FaPrint } from "react-icons/fa6";
import { Select, MenuItem } from "@mui/material";
import SunEditorComponent from "./SunEditorComponent";
import UploadDocument from "./UploadDocument";

const Ckeditor = ({
  additionalDetails,
  fileDetails,
  notingNo,
  content,
  onContentChange,
  refetchData,
}) => {
  const [selectedItem, setSelectedItem] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const modalRef = useRef(null);
  const accordionRef = useRef(null);
  console.log("notingNo:", selectedNote);

  const options = React.useMemo(() => {
    if (!notingNo || !notingNo.data || !Array.isArray(notingNo.data)) {
      return [];
    }
    return notingNo.data.map((item, index) => ({
      label: `Noting No-${index + 1}`,
      value: item,
    }));
  }, [notingNo]);

  const handleSelectChange = useCallback(
    (event) => {
      event.stopPropagation();
      const selectedValue = options.find(
        (option) => option.label === event.target.value
      );

      if (selectedValue) {
        setSelectedItem(selectedValue.label);
        setSelectedNote(selectedValue.value); 

        const linkHTML = `<a href="#" class="noting-link" data-note-index="${selectedValue.label}" 
        style="color: #007bff; text-decoration: underline; font-weight: 600; cursor: pointer;">
        ${selectedValue.label}
      </a>`;

        const newContent = `${content}${linkHTML}&nbsp;`;
        onContentChange?.(newContent);

        setModalOpen(false); 
      }
    },
    [content, onContentChange, options]
  );

  useEffect(() => {
    const handleNotingClick = (event) => {
      const notingLink = event.target.closest(".noting-link");
      if (notingLink) {
        event.preventDefault();
        event.stopPropagation();

        const selectedLabel = notingLink.dataset.noteIndex;
        const selectedNoteData = options.find(
          (option) => option.label === selectedLabel
        );

        if (selectedNoteData) {
          setSelectedItem(selectedNoteData.label); // Ensure selection reflects in UI
          setSelectedNote(selectedNoteData.value); // Set the selected note details
          setModalOpen(true); // Open the modal
        }
      }
    };

    document.addEventListener("click", handleNotingClick);
    return () => document.removeEventListener("click", handleNotingClick);
  }, [options]);

  const handleEditorChange = useCallback(
    (newContent) => {
      if (newContent !== content) {
        onContentChange?.(newContent);
      }
    },
    [content, onContentChange]
  );

  const toggleAccordion = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }, []);
  useEffect(() => {
    // Set the initial state to true when the page loads (for example)
    setIsOpen(true);
  }, []);
  

  const handlePrint = () => {
    if (modalRef.current) {
      const printContent = modalRef.current.innerHTML;
      const newWindow = window.open("", "_blank");
      newWindow.document.write(`
        <html>
          <head>
            <title>Print Noting</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .note-card { border: 2px solid #007bff; padding: 15px; border-radius: 8px; }
              .note-title { font-size: 20px; font-weight: bold; color: #0056b3; }
              .note-date { font-size: 14px; color: #666; }
              .note-description { font-size: 16px; margin-top: 10px; }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      newWindow.document.close();
      newWindow.print();
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

  return (
    <>
      <div ref={accordionRef} className="editor-container">
        <Accordion activeKey={isOpen ? "0" : null} className="custom-accordion">
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <div className="d-flex justify-content-between align-items-center w-100">
                <h5>Take Action</h5>
                <div className="d-flex align-items-center ">
                  <Select
                    value={selectedItem}
                    onChange={handleSelectChange}
                    displayEmpty
                    size="small"
                    style={{ minWidth: 200, marginRight: "10px" }}
                  >
                    <MenuItem value="">--Select--</MenuItem>
                    {options.map((option, index) => (
                      <MenuItem key={index} value={option.label}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <span className="toggle-icon" onClick={toggleAccordion}>
                    {isOpen ? <FaPlus /> : <FaMinus />}
                  </span>
                </div>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <SunEditorComponent
                content={content}
                placeholder=""
                onContentChange={handleEditorChange}
                additionalDetails={additionalDetails}
              />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
      <UploadDocument
        fileDetails={fileDetails}
        additionalDetails={additionalDetails}
        initialContent={content}
        refetchData={refetchData}
      />

      <Modal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>📜 NoteSheet Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNote ? (
            <Card ref={modalRef} className="">
              <Card.Body className="note-card-body">
                {/* Noting Number */}

                {/* Sender Details */}
                <div className="mb-3">
                  <p className="note-author">
                    <strong>Noting By:</strong>{" "}
                    <span className="text-primary">
                      {selectedNote.senderName}
                    </span>{" "}
                    ({selectedNote.senderDesignation})
                  </p>
                </div>
                <p
                  className="note-content"
                  dangerouslySetInnerHTML={{
                    __html: convertHTMLToText(selectedNote.note),
                  }}
                ></p>
                <p className="note-date">
                  {selectedNote.senderName} | {selectedNote.createdDate} |{" "}
                  {selectedNote.createdTime}
                </p>

                {/* Note Content */}
              </Card.Body>
            </Card>
          ) : (
            <p>No details available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            <FaPrint className="me-2" /> Print Note
          </Button>
        </Modal.Footer>
      </Modal>
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
          padding: 20px;
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
    </>
  );
};

export default Ckeditor;
