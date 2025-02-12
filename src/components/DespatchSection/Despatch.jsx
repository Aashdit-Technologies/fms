import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  IconButton,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import DataTable from 'react-data-table-component';
import { Visibility, Download } from '@mui/icons-material';
import UploadLetter from './components/UploadLetter';
import Enclosures from './components/Enclosures';
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { MdFileUpload } from "react-icons/md";


const customStyles = {
  table: {
    style: {
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#ffffff",
      marginBottom: "1rem",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#207785",
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      minHeight: "52px",
      borderBottom: "2px solid #1a5f6a",
    },
  },
  headCells: {
    style: {
      padding: "16px",
      justifyContent: "center",
      "&:not(:last-of-type)": {
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
      },
    },
  },
  rows: {
    style: {
      fontSize: "13px",
      fontWeight: "400",
      color: "#333333",
      backgroundColor: "#ffffff",
      minHeight: "48px",
      "&:not(:last-of-type)": {
        borderBottom: "1px solid #e0e0e0",
      },
      "&:hover": {
        backgroundColor: "#f5f9fa",
        cursor: "pointer",
        transition: "all 0.2s ease",
      },
    },
    stripedStyle: {
      backgroundColor: "#f8f9fa",
    },
  },
  cells: {
    style: {
      padding: "12px 16px",
      justifyContent: "center",
      "&:not(:last-of-type)": {
        borderRight: "1px solid #e0e0e0",
      },
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid #e0e0e0",
      backgroundColor: "#f8f9fa",
      color: "#333333",
      fontSize: "13px",
      fontWeight: "500",
      padding: "8px 16px",
      "& .MuiButtonBase-root": {
        backgroundColor: "#207785",
        color: "#ffffff",
        "&:hover": {
          backgroundColor: "#1a5f6a",
        },
      },
    },
    pageButtonsStyle: {
      borderRadius: "4px",
      height: "32px",
      minWidth: "32px",
      padding: "0 6px",
      margin: "0 4px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      backgroundColor: "#207785",
      color: "#ffffff",
      "&:hover:not(:disabled)": {
        backgroundColor: "#1a5f6a",
        color: "#ffffff",
      },
      "&:disabled": {
        opacity: 0.5,
        cursor: "not-allowed",
      },
    },
  },
  noData: {
    style: {
      padding: "24px",
      textAlign: "center",
      color: "#666666",
    },
  },
};

const Despatch = () => {
  const [activeTab, setActiveTab] = useState('NEW_LETTER');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEnclosuresOpen, setIsEnclosuresOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
   const [dispatchdata, setDispatchData] = useState([]);
  const [expanded, setExpanded] = useState(false); 
   const token = useAuthStore.getState().token;
  const handleTabChange = (tab) => {
  setActiveTab(tab === 'newLetter' ? 'NEW_LETTER' : 'SENT_LETTER');
    
  };
  const handleAccordionChange = () => {
    setExpanded(!expanded);
  };
 

  const handleView = (row) => {
    window.open(`/view-pdf?id=${row.id}`, '_blank');
  };


  const handleUpload = (row) => {
    setSelectedRow(row);
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedRow(null);
  };

  const handleCloseEnclosures = () => {
    setIsEnclosuresOpen(false);
    setSelectedRow(null);
  };


  const fetchLetters = async (tabCode) => {
    try {
      const payload = { tabCode };
  
      const response = await api.post(
        "dispatch/dispatch-section-manage-letter",
        { dataObject: encryptPayload(payload) },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("Raw API Response:", JSON.stringify(response.data, null, 2));
  
      let responseData = response.data?.data?.correspondancelist;
  
      if (!responseData) {
        setDispatchData([]);
      } else if (responseData.empty === true) {
        console.log("Correspondance list is empty.");
        setDispatchData([]);
      } else if (Array.isArray(responseData)) {
        setDispatchData(responseData);
      } else if (typeof responseData === "object") {
        // Check if the object contains meaningful data
        const convertedArray = Object.values(responseData).filter(item => item !== null && item !== undefined);
        if (convertedArray.length > 0) {
          setDispatchData(convertedArray);
        } else {
          console.warn("Correspondance list is an empty object.");
          setDispatchData([]);
        }
      } else {
        console.warn("Unexpected response format:", responseData);
        setDispatchData([]);
      }
    } catch (error) {
      console.error("Error fetching letters:", error);
      setDispatchData([]);
    }
  };
  

  useEffect(() => {
    if (activeTab) {
      fetchLetters(activeTab);
    }
  }, [activeTab]);  


  const handleDownload = async (row) => {
    try {
      const payload = { correspondenceId: row.correspondenceId };
  
      const response = await api.post(
        "dispatch/getallEnclosureByCorrespondanceid",
        { dataObject: encryptPayload(payload) },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("API Response:", response.data.data);
  
      const enclosures = response.data?.data|| [];
    
      setSelectedRow({ ...row, enclosures });
      
      setTimeout(() => {
        setIsEnclosuresOpen(true);
      }, 100);
  
    } catch (error) {
      console.error("Error fetching enclosures:", error);
    }
  };

  const newLetterColumns = [
    { name: 'SI NO', selector: (row, index) => index + 1, sortable: true, width: '80px' },
    { name: 'Letter Number', selector: (row) => row.letterNo || '', sortable: true, width: '200px' },
    { name: 'Ending Memo Number', selector: (row) => row.memoNo || '', sortable: true, width: '250px' },
    { name: 'Subject', selector: (row) => row.subject, sortable: true, wrap: true, grow: 2 },
    { name: 'From', selector: (row) => row.from, sortable: true, wrap: true, grow: 1 },
    { name: 'Date', selector: (row) => row.date, sortable: true, width: '120px' },
    {
      name: "View",
      cell: (row) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton size="small" onClick={() => handleView(row)} 
          sx={{ 
            color: '#207785',
            bgcolor: 'rgba(32, 119, 133, 0.1)',
            '&:hover': {
              bgcolor: 'rgba(32, 119, 133, 0.2)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease-in-out',
            padding: '8px',
            borderRadius: '8px',
          }}>
            <Visibility />
          </IconButton>
          
    <IconButton 
  size="small" 
  onClick={() => handleDownload(row)}
  sx={{ 
    bgcolor: '#ffc107',
    color:"#fff",
    '&:hover': {
      bgcolor: '#e0a800',
    },
  }}
>
  <MdFileUpload style={{ fontSize: '28px' }} />
</IconButton>

        </Box>
      ),
      width: "150px",
      center: true,
    },
    
    {
      name: 'Action',
      cell: (row) => (
        
        <Button
        onClick={() => handleUpload(row)}
        variant="contained"
        color="success"
        size="small"
        sx={{
          "&:hover": { bgcolor: "success.dark" }
        }}
      >
        Upload
      </Button>
      ),
      width: '150px',
      center: true,
    },
  ];


  const sentLetterColumns = [
    { name: 'SI NO', selector: (row, index) => index + 1, sortable: true, width: '80px' },
    { name: 'Letter Number', selector: (row) => row.letterNo || '', sortable: true, width: '200px' },
    { name: 'Ending Memo Number', selector: (row) => row.memoNo || '', sortable: true, width: '250px' },
    { name: 'Subject', selector: (row) => row.subject, sortable: true, wrap: true, grow: 2 },
    { name: 'From', selector: (row) => row.from, sortable: true, wrap: true, grow: 1 },
    { name: 'Date', selector: (row) => row.date, sortable: true, width: '120px' },
    {
      name: "View",
      cell: (row) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton size="small" onClick={() => handleView(row)} sx={{ color: "primary.main" }}>
            <Visibility />
          </IconButton>
        </Box>
      ),
      width: "150px",
      center: true,
    },
    
   
  ];
  const NoDataComponent = () => (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Typography>No data available</Typography>
    </Box>
  );

  return (
    <Accordion 
    expanded={expanded} 
    onChange={handleAccordionChange}
    sx={{
      boxShadow: 'none',
      border: '1px solid #e0e0e0',
      width: '100%',
      maxWidth: '100%',  
      overflow: 'hidden', 
      '&:before': {
        display: 'none',
      },
    }}
  >
    <AccordionSummary
      expandIcon={expanded ? <RemoveIcon /> : <AddIcon />}
      sx={{
        '& .MuiAccordionSummary-expandIconWrapper': {
          transform: 'none',
          '&.Mui-expanded': {
            transform: 'none',
          }
        }
      }}
    >
      <Typography sx={{ fontWeight: 500, color: '#666' }}>
        Letter List
      </Typography>
    </AccordionSummary>
      <AccordionDetails>
      <Box sx={{ p: 3 }}>
      {/* Tabs */}
      <Box sx={{ mb: 2 }}>
        <Button variant={activeTab === 'NEW_LETTER' ? 'contained' : 'outlined'} onClick={() => handleTabChange('newLetter')} sx={{ mr: 1 }}>
          New Letter
        </Button>
        <Button variant={activeTab === 'SENT_LETTER' ? 'contained' : 'outlined'} onClick={() => handleTabChange('sentLetter')}>
          Sent Letter
        </Button>
      </Box>
     {/* Data Table */}
    <Paper>
  {activeTab === 'NEW_LETTER' && (
    <DataTable
      columns={newLetterColumns}
      data={dispatchdata}
      customStyles={customStyles}
      pagination
      paginationPerPage={10}
      paginationRowsPerPageOptions={[10, 20, 30, 50]}
      highlightOnHover
      pointerOnHover
      responsive
      striped
      noDataComponent={<NoDataComponent />}
    />
  )}

  {activeTab === 'SENT_LETTER' && (
    <DataTable
      columns={sentLetterColumns}
      data={dispatchdata}
      customStyles={customStyles}
      pagination
      paginationPerPage={10}
      paginationRowsPerPageOptions={[10, 20, 30, 50]}
      highlightOnHover
      pointerOnHover
      responsive
      striped
      noDataComponent={<NoDataComponent />}
    />
  )}
</Paper>

      <UploadLetter open={isUploadModalOpen} onClose={handleCloseUploadModal}
         dispatchData={dispatchdata}/>
   
    <Enclosures 
  open={isEnclosuresOpen} 
  onClose={handleCloseEnclosures} 
  enclosures={selectedRow?.enclosures || []} 
  
/>
    </Box>

      </AccordionDetails>
</Accordion>

  );
};

export default Despatch;
