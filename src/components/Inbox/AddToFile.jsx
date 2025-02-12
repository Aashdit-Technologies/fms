import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, IconButton, Box } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { useLocation } from 'react-router-dom';
import CreateFileTag from "../Inbox/CreateFileTag"
import ExistingFile from "../Inbox/ExistingFile"

const AddToFile= () => {
  const [expanded, setExpanded] = useState(true);
  const [expandedletter, setExpandedletter] = useState(false);
  const [expandedfileList, setExpandedfileList] = useState(true);
  const location = useLocation();
  const fetchedData = location.state?.data; 

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  const handleExpandLetterClick = () => {
    setExpandedletter(!expandedletter);
  };
  const handleExpandfilelistClick = () => {
    setExpandedfileList(!expandedfileList);
  };
  return (
    <div>
      <Box sx={{ mx: "auto", my: 4, }}>
      <Accordion expanded={expanded} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <AccordionSummary
          expandIcon={
            <IconButton onClick={handleExpandClick}>
              {expanded ? <RemoveIcon /> : <AddIcon />}
            </IconButton>
          }
          aria-controls="panel1a-content"
          id="panel1a-header"
          sx={{
            backgroundColor: "#f5f5f5",
            borderBottom: "1px solid #1a5f6a",
            borderRadius: expanded ? "10px 10px 0 0" : "10px",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Letter's Details
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            backgroundColor: "#fafafa",
            p: 3,
            borderRadius: "0 0 10px 10px",
          }}
        >
          <Box>
            {fetchedData?.letterNo ? (
              <Box sx={{ lineHeight: 2.5 }}>
                <Typography variant="body1">
                  <b>Letter Number:</b> {fetchedData.letterNo}
                </Typography>
                <Typography variant="body1">
                  <b>Sender Date:</b> {fetchedData.senderDate}
                </Typography>
                <Typography variant="body1">
                  <b>Sender:</b> {fetchedData.sender}
                </Typography>
                <Typography variant="body1">
                  <b>Addressee:</b> {fetchedData.addressee}
                </Typography>
                <Typography variant="body1">
                  <b>Subject:</b> {fetchedData.subject}
                </Typography>
                <Typography variant="body1">
                  <b>Memo Number:</b> {fetchedData.memoNo}
                </Typography>
                <Typography variant="body1">
                  <b>Remarks:</b> {fetchedData.remarks}
                </Typography>
              </Box>
            ) : (
              <Typography color="error">No data available.</Typography>
            )}
          </Box>
          </AccordionDetails>
      </Accordion>
    </Box>
    <Box sx={{  mx: 'auto', my: 4 }}> 
    <Accordion expanded={expandedletter} sx={{ boxShadow: 3, borderRadius: 2 }}>
    <AccordionSummary
          expandIcon={
            <IconButton onClick={handleExpandLetterClick}>
              {expandedletter ? <RemoveIcon /> : <AddIcon />}
            </IconButton>
          }
          aria-controls="panel1a-content"
          id="panel1a-header"
          sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }} 
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Create file And tag letter to file</Typography>
       
        </AccordionSummary>

        <AccordionDetails sx={{ backgroundColor: '#fafafa', p: 2, borderRadius: '0 0 10px 10px' }}>
        <CreateFileTag/>
        </AccordionDetails>
    </Accordion>
    </Box>

    <Box sx={{  mx: 'auto', my: 4 }}> 
    <Accordion expanded={expandedfileList} sx={{ boxShadow: 3, borderRadius: 2 }}>
    <AccordionSummary
          expandIcon={
            <IconButton onClick={handleExpandfilelistClick}>
              {expandedfileList ? <RemoveIcon /> : <AddIcon />}
            </IconButton>
          }
          aria-controls="panel1a-content"
          id="panel1a-header"
          sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }} 
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Existing File List</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: '#fafafa', p: 2, borderRadius: '0 0 10px 10px' }}>
         <ExistingFile/>
        </AccordionDetails>
    </Accordion>
    </Box>
    </div>
  );
};

export default AddToFile;