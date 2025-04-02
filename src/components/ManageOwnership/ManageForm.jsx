import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import FileCustodian from "./FileCustodian";
import DraftApprover from "./DraftApprover";
import FileInbox from "./FileInbox";
import LetterInbox from "./LetterInbox";

const ManageForm = () => {
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("FILE_CUSTODIAN"); 

  const toggleAccordion = (event) => {
    event.stopPropagation();
    setExpanded(!expanded);
  };

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  const tabComponents = [
    {
      key: "FILE_CUSTODIAN",
      label: "File Custodian",
      component: <FileCustodian/>
    },
    {
      key: "DRAFT_APPROVER",
      label: "Draft Approver",
      component: <DraftApprover/>
    },
    {
      key: "FILE_INBOX",
      label: "File Inbox",
      component: <FileInbox/>
    },
    {
      key: "LETTER_INBOX",
      label: "Letter Inbox",
      component: <LetterInbox/>
    },
  ];

  return (
    <Box sx={{ width: "100%", margin: "auto", mt: 3 }}>
      <Accordion
        expanded={expanded}
        square
        elevation={0}
        sx={{ backgroundColor: "#f5f8fa" }}
      >
        <AccordionSummary
          expandIcon={
            <IconButton
              onClick={toggleAccordion}
              sx={{
                backgroundColor: "#1a5f6a",
                color: "#fff",
                width: 30,
                height: 30,
                "&:hover": {
                  backgroundColor: "#207785",
                },
              }}
            >
              {expanded ? <RemoveIcon /> : <AddIcon />}
            </IconButton>
          }
          aria-controls="panel1a-content"
          id="panel1a-header"
          sx={{
            backgroundColor: "#e9ecef",
            borderBottom: "1px solid #1a5f6a",
          }}
        >
          <Typography variant="h6">Manage Ownership</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTabs-indicator": {
                display: "none",
              },
              "& .MuiTab-root": {
                backgroundColor: "#0f6773",
                color: "#fff",
                fontWeight: "bold",
                borderRadius: "5px",
                marginRight: 1,
                marginTop: 5,
                transition: "0.3s",
              },
              "& .Mui-selected": {
                backgroundColor: "#fff",
                color: "#0f6773",
                border: "2px solid #0f6773",
              },
            }}
          >
            {tabComponents.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                value={tab.key}
                sx={{
                  color: "white",
                  "&.Mui-disabled": {
                    color: "white",
                    opacity: 0.5,
                  },
                }}
              />
            ))}
          </Tabs>
          <Box sx={{ mt: 3 }}>
            {tabComponents.find((tab) => tab.key === activeTab)?.component ||
              null}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ManageForm;