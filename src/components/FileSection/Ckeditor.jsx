import React, { useState, useCallback, useEffect, useRef } from "react";
import { Accordion } from "react-bootstrap";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { Select, MenuItem } from "@mui/material";
import SunEditorComponent from "./SunEditorComponent";
import UploadDocument from "./UploadDocument";

const Ckeditor = ({ additionalDetails, fileDetails, content, onContentChange, refetchData, notingNo }) => {
  const [selectedItem, setSelectedItem] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editorContent, setEditorContent] = useState(content || '');
  const isUpdatingRef = useRef(false);
  const options = React.useMemo(() => {
    if (!notingNo || !notingNo.data || !Array.isArray(notingNo.data)) {
      return [];
    }
    return notingNo.data.map((item, index) => `Noting No-${index + 1}`);
  }, [notingNo]);


  useEffect(() => {
    if (content !== editorContent && !isUpdatingRef.current) {
      const newContent = content || additionalDetails?.data?.note || '';
      console.log('Ckeditor updating content:', newContent);
      isUpdatingRef.current = true;
      setEditorContent(newContent);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }
  }, [content, additionalDetails, editorContent]);

  const handleSelectChange = useCallback((event) => {
    event.stopPropagation();

    const value = event.target.value;
    setSelectedItem(value);

    if (value) {
      const noteNumber = value.split("-")[1];

      const linkHTML = `<a href="#note-${noteNumber}" class="note-link">${value}</a>`;
      const newContent = `${editorContent}<br/>${linkHTML}<br/>`;

      isUpdatingRef.current = true;
      setEditorContent(newContent);
      onContentChange?.(newContent);

      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }
  }, [editorContent, onContentChange]);

  
  useEffect(() => {
    const handleNoteClick = (event) => {
      if (event.target.classList.contains("note-link")) {
        event.preventDefault(); 

        const href = event.target.getAttribute("href"); 
        if (href && href.startsWith("#note-")) {
          const noteElement = document.querySelector(href);
          if (noteElement) {
            noteElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }
      }
    };

    document.addEventListener("click", handleNoteClick);

    return () => {
      document.removeEventListener("click", handleNoteClick); // ✅ Cleanup on unmount
    };
  }, []);
  

  const handleEditorChange = useCallback((newContent) => {
    if (!isUpdatingRef.current) {
      console.log('Ckeditor content changed:', newContent);
      isUpdatingRef.current = true;
      setEditorContent(newContent);
      onContentChange?.(newContent);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }
  }, [onContentChange]);

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
                <h5>Task Action</h5>
                <div 
                  className="d-flex align-items-center z-3" 
                  onMouseDown={(e) => {
                    e.preventDefault(); 
                    e.stopPropagation(); 
                  }}
                >
                  <Select
                    value={selectedItem}
                    onClick={(e) => e.stopPropagation()} 
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
                content={editorContent}
                placeholder="Enter your task action here..."
                onContentChange={handleEditorChange}
                // additionalDetails={additionalDetails}
              />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
      <UploadDocument
        fileDetails={fileDetails}
        additionalDetails={additionalDetails}
        initialContent={editorContent}
        refetchData={refetchData}
      />
    </>
  );
};

export default Ckeditor;
