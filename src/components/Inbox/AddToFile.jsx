import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, IconButton, Box } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { useLocation } from 'react-router-dom';
import CreateFileTag from "../Inbox/CreateFileTag"
import ExistingFile from "../Inbox/ExistingFile"
import {toast } from "react-toastify";
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
      <Box>
      <Accordion expanded={expanded} sx={{ boxShadow: 3,}}>
        <AccordionSummary
          expandIcon={
            <IconButton onClick={handleExpandClick}
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
          <Typography variant="h6" >
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
          <Typography variant="body1" sx={{ mb: 2 }}>
            <b>Letter Number:</b> {fetchedData.letterNo}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <b>Sender Date:</b> {fetchedData.senderDate}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <b>Sender:</b> {fetchedData.sender}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <b>Addressee:</b> {fetchedData.addressee}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <b>Subject:</b> {fetchedData.subject}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <b>Memo Number:</b> {fetchedData.memoNo}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <b>Remarks:</b> {fetchedData.remarks}
          </Typography>
        </Box>
      ) : (
        <Typography variant="body1">No data available</Typography>
      )}
    </Box>

    </AccordionDetails>
      </Accordion>
    </Box>
    
    <Box sx={{ my: 4 }}> 
    <Accordion expanded={expandedletter} sx={{ boxShadow: 3 }}>
    <AccordionSummary
          expandIcon={
            <IconButton onClick={handleExpandLetterClick}
            sx={{
              backgroundColor: "#1a5f6a",
              color: "#fff",
              width: 30, 
              height: 30, 
              "&:hover": {
                backgroundColor: "#207785",
              },
            }}>
              {expandedletter ? <RemoveIcon /> : <AddIcon />}
            </IconButton>
          }
          aria-controls="panel1a-content"
          id="panel1a-header"
          sx={{
            backgroundColor: "#e9ecef",
            borderBottom: "1px solid #1a5f6a",
          }} 
        >
          <Typography variant="h6" >Create File And Tag Letter To File</Typography>
       
        </AccordionSummary>

        <AccordionDetails sx={{ backgroundColor: '#fafafa', p: 3, borderRadius: '0 0 10px 10px' }}>
        <CreateFileTag/>
        </AccordionDetails>
    </Accordion>
    </Box>

    <Box sx={{   my: 4 }}> 
    <Accordion expanded={expandedfileList} sx={{ boxShadow: 3}}>
    <AccordionSummary
          expandIcon={
            <IconButton onClick={handleExpandfilelistClick}
            sx={{
              backgroundColor: "#1a5f6a",
              color: "#fff",
              width: 30, 
              height: 30, 
              "&:hover": {
                backgroundColor: "#207785",
              },
            }}>
              {expandedfileList ? <RemoveIcon /> : <AddIcon />}
            </IconButton>
          }
          aria-controls="panel1a-content"
          id="panel1a-header"
          sx={{
            backgroundColor: "#e9ecef",
            borderBottom: "1px solid #1a5f6a",
          }}
        >
          <Typography variant="h6" >Existing File List</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: '#fafafa', p: 3, borderRadius: '0 0 10px 10px' }}>
         <ExistingFile/>
        </AccordionDetails>
    </Accordion>
    </Box>
    </div>
  );
};

export default AddToFile;