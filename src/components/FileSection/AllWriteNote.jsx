import React, { useState } from "react";
import { Button, Tabs, Tab } from "@mui/material";
import { MdNote } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import SunEditorComponent from "./SunEditorComponent";

const AllWriteNote = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("noteSheet");
  

  return (
    <div className="full-screen-editor p-4" style={{ background: "#fff", height: "100vh" }}>
      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
        <Tab label="NOTE SHEET" value="noteSheet" />
        <Tab label="Legacy Notesheet" value="legacyNoteSheet" />
        <Tab label="Correspondence" value="correspondence" />
      </Tabs>

      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <h5 className="fw-bold text-uppercase text-dark d-flex align-items-center">
          <MdNote className="text-success me-2" size={28} /> {activeTab.replace(/([A-Z])/g, " $1")}
        </h5>
        <div>
          <Button variant="contained" color="error" className="me-2" onClick={() => navigate(-1)}>
            Close View
          </Button>
          <Button variant="contained" color="success">
            Preview
          </Button>
        </div>
      </div>

      {/* CKEditor Section */}
      <div className="editor-container mt-4" style={{ padding: "10px" }}>
        <SunEditorComponent />
      </div>
    </div>
  );
};

export default AllWriteNote;
