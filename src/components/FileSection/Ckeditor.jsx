import React, { useState } from "react";
import { Accordion } from "react-bootstrap";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { Select, MenuItem } from "@mui/material";
import SunEditorComponent from "./SunEditorComponent";
import UploadDocument from "./UploadDocument";


const Ckeditor = () => {
  
  const [selectedItem, setSelectedItem] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    "Noting No-1",
    "Noting No-2",
    "Noting No-3",
    "Noting No-4",
    "Noting No-5",
  ];

  const handleSelectChange = (event) => {
    const value = event.target.value;
    setSelectedItem(value);

    // If a valid option is selected, insert it as a link
    if (value) {
      const linkHTML = `<a href="https://example.com/${value.replace(" ", "-").toLowerCase()}" target="_blank">${value}</a>`;
      setContent((prevContent) => `${prevContent}<br/>${linkHTML}<br/>`);
    }
  };

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

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
                    {isOpen ? <FaMinus /> : <FaPlus />}
                  </span>
                </div>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <SunEditorComponent  />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
      <UploadDocument  />
    </>
  );
};

export default Ckeditor;