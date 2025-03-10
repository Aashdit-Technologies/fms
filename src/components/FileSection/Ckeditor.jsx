import React, { useState, useCallback, useEffect, useRef } from "react";
import { Accordion } from "react-bootstrap";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { Select, MenuItem } from "@mui/material";
import SunEditorComponent from "./SunEditorComponent";
import UploadDocument from "./UploadDocument";

const Ckeditor = ({ additionalDetails, fileDetails, notingNo, content, onContentChange, refetchData }) => {
  const [selectedItem, setSelectedItem] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  // Remove local state and use content prop directly
  const isUpdatingRef = useRef(false);
  const options = React.useMemo(() => {
    if (!notingNo || !notingNo.data || !Array.isArray(notingNo.data)) {
      return [];
    }
    return notingNo.data.map((item, index) => `Noting No-${index + 1}`);
  }, [notingNo]);

  const handleSelectChange = useCallback(
    (event) => {
      event.stopPropagation();
      const value = event.target.value;
      setSelectedItem(value);
  
      if (value) {
        const noteNumber = value.split("-")[1];
        // Create noting link with custom class
        const linkHTML = `<span class="noting-link" data-note-number="${noteNumber}" style="color: #207785; text-decoration: none; font-weight: 500; padding: 2px 4px; border-radius: 3px; cursor: pointer;">${value}</span>`;
        const newContent = `${content}${linkHTML}&nbsp;`;
  
        isUpdatingRef.current = true;
        onContentChange?.(newContent);
  
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 0);
      }
    },
    [content, onContentChange]
  );
  console.log(content,"editorContent");
  
  
  useEffect(() => {
    const handleNotingClick = (event) => {
      const notingLink = event.target.closest('.noting-link');
      if (notingLink) {
        event.preventDefault();
        event.stopPropagation();
  
        const noteNumber = notingLink.dataset.noteNumber;
        if (noteNumber) {
          const noteElement = document.querySelector(`#note-${noteNumber}`);
          if (noteElement) {
            noteElement.classList.add('highlight');
            setTimeout(() => noteElement.classList.remove('highlight'), 2000);
  
            noteElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }
      }
    };
  
    document.addEventListener('click', handleNotingClick);
    return () => document.removeEventListener('click', handleNotingClick);
  }, []);

  const handleEditorChange = useCallback((newContent) => {
    console.log('Ckeditor content changed:', newContent);
    // Immediately pass the new content to parent without delay
    if (newContent !== content) {
      onContentChange?.(newContent);
    }
  }, [content, onContentChange]);

  const toggleAccordion = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <>
      <div className="editor-container">
        <Accordion defaultActiveKey="0" className="custom-accordion">
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <div className="d-flex justify-content-between align-items-center w-100">
                <h5>Take Action</h5>
                <div 
                  className="d-flex align-items-center" 
                  onMouseDown={(e) => {
                    e.preventDefault(); 
                    e.stopPropagation(); 
                  }}
                >
                  <Select
                    value={selectedItem}
                    onChange={handleSelectChange}
                    onMouseDown={(e) => {
                      e.preventDefault(); 
                      e.stopPropagation();
                    }}
                    MenuProps={{
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'left',
                      },
                      getContentAnchorEl: null,
                    }}
                    displayEmpty
                    size="small"
                    style={{ minWidth: 200, marginRight: '10px' }}
                  >
                    <MenuItem value="">--Select--</MenuItem>
                    {options.map((option, index) => (
                      <MenuItem key={index} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                  <span 
                    className="toggle-icon"
                    onMouseDown={(e) => {
                      e.preventDefault(); 
                      e.stopPropagation(); 
                    }}
                    onClick={toggleAccordion}
                  >
                    {isOpen ? <FaPlus /> : <FaMinus />}
                  </span>
                </div>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <SunEditorComponent
                content={content}
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
        initialContent={content}
        refetchData={refetchData}
      />
    </>
  );
};

export default Ckeditor;
