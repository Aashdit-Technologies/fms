import React, { useState, useCallback, useEffect } from "react";
import { Accordion } from "react-bootstrap";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { Select, MenuItem } from "@mui/material";
import SunEditorComponent from "./SunEditorComponent";
import UploadDocument from "./UploadDocument";

const Ckeditor = ({ additionalDetails, fileDetails, content, onContentChange }) => {
  const [selectedItem, setSelectedItem] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editorContent, setEditorContent] = useState(content || '');

  const options = [
    "Noting No-1",
    "Noting No-2",
    "Noting No-3",
    "Noting No-4",
    "Noting No-5",
  ];

  // Update editor content when content prop changes
 // Sync when content prop changes
useEffect(() => {
  if (content !== undefined) {
    setEditorContent(content);
  }
}, [content]);

// Sync when additionalDetails changes
useEffect(() => {
  if (additionalDetails?.data?.note) {
    setEditorContent(additionalDetails.data.note);
    onContentChange?.(additionalDetails.data.note);
  }
}, [additionalDetails?.data?.note, onContentChange]);

  const handleSelectChange = useCallback((event) => {
    const value = event.target.value;
    setSelectedItem(value);

    if (value) {
      const linkHTML = `<a href="https://example.com/${value.replace(" ", "-").toLowerCase()}" target="_blank">${value}</a>`;
      const newContent = `${editorContent}<br/>${linkHTML}<br/>`;
      setEditorContent(newContent);
      onContentChange?.(newContent);
    }
  }, [editorContent, onContentChange]);

  const handleEditorChange = useCallback((newContent) => {
    setEditorContent(newContent);
    onContentChange?.(newContent);
  }, [onContentChange]);

  const toggleAccordion = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <>
      <div className="editor-container">
        <Accordion defaultActiveKey="0" className="custom-accordion">
          <Accordion.Item eventKey="0">
            <Accordion.Header onClick={toggleAccordion}>
              <div className="d-flex justify-content-between align-items-center w-100">
                <h5>Task Action</h5>
                <div className="d-flex align-items-center" onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={selectedItem}
                    onChange={handleSelectChange}
                    displayEmpty
                    size="small"
                    style={{ minWidth: 200, marginRight: '10px' }}
                  >
                    <MenuItem value="">--Select--</MenuItem>
                    {options.map((option, index) => (
                      <MenuItem key={index} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                  <span className="toggle-icon">
                    {isOpen ? <FaPlus /> : <FaMinus />}
                  </span>
                </div>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <SunEditorComponent
                content={editorContent}
                placeholder="Enter your task action here..."
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
        initialContent={editorContent}
      />
    </>
  );
};

export default Ckeditor;