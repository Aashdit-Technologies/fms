import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  IconButton,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
 
} from '@mui/material';
import DataTable from 'react-data-table-component';
import { Visibility} from '@mui/icons-material';
import UploadLetter from './components/UploadLetter';
import Enclosures from './components/Enclosures';
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { MdFileUpload } from "react-icons/md";
import {toast } from "react-toastify";
import { PageLoader } from "../pageload/PageLoader";
import { useNavigate } from 'react-router-dom';
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
      // textTransform: "uppercase",
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
  const [expanded, setExpanded] = useState(true); 
  const [isLoading, setIsLoading] = useState(false);
   
  
   

  const handleTabChange = (tab) => {
  setActiveTab(tab === 'newLetter' ? 'NEW_LETTER' : 'SENT_LETTER');
    
  };
  const handleAccordionChange = () => {
    setExpanded(!expanded);
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
   
    setIsLoading(true);
    try {
      const token = useAuthStore.getState().token;
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
  
     
  
      let responseData = response.data?.data?.correspondancelist;
  
      if (!responseData) {
        setDispatchData([]);
      } else if (responseData.empty === true) {
        
        setDispatchData([]);
      } else if (Array.isArray(responseData)) {
        setDispatchData(responseData);
      } else if (typeof responseData === "object") {
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
    finally{
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    if (activeTab) {
      fetchLetters(activeTab);
    }
  }, [activeTab]);  


  const handleDownload = async (row) => {
    setIsLoading(true);
    try {
      const token = useAuthStore.getState().token;
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
  
      
  
      const enclosures = response.data?.data|| [];
    
      setSelectedRow({ ...row, enclosures });
      
      setTimeout(() => {
        setIsEnclosuresOpen(true);
      }, 100);
  
    } catch (error) {
      console.error("Error fetching enclosures:", error);
    }
    finally{
      setIsLoading(false);
    }
  };

  const newLetterColumns = [
    { name: 'Sl No',
       selector: (row, index) => index + 1,
        sortable: true,
         width: '100px' 
        },
    { name: 'Letter No.',
       selector: (row) => row.letterNo || '',
       cell: row => (
        <div 
          style={{
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            maxWidth: '200px'
          }} 
          title={row.letterNo || ''}
        >
          {row.letterNo || ''}
        </div>
      ),
        sortable: true,
         width: '200px'
         },
    { name: 'Ending Memo No.',
       selector: (row) => row.memoNo || '',
       cell: row => (
        <div 
          style={{
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            maxWidth: '200px'
          }} 
          title={row.memoNo || ''}
        >
          {row.memoNo || ''}
        </div>
      ),
        sortable: true,
         width: '250px' 
        },
    { name: 'Subject', 
      selector: (row) => row.subject,
      cell: row => (
        <div 
          style={{
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            // maxWidth: '200px'
          }} 
          title={row.subject || ''}
        >
          {row.subject || ''}
        </div>
      ),
       sortable: true, 
       wrap: true,
        grow: 2 },
    { name: 'From',
       selector: (row) => row.from,
       cell: row => (
        <div 
          style={{
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            maxWidth: '200px'
          }} 
          title={row.from || ''}
        >
          {row.from || ''}
        </div>
      ),
        sortable: true,
         wrap: true,
          grow: 1 ,
          width:"200px"
        },
    { name: 'Date',
       selector: (row) => row.date,
       cell: row => (
        <div 
          style={{
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            maxWidth: '200px'
          }} 
          title={row.date || ''}
        >
          {row.date || ''}
        </div>
      ),
        sortable: true, 
        width: '120px' 
      },
    {
      name: "View",
      cell: (row) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          {
            <Tooltip title="View Letter">
           <IconButton size="small" onClick={() => printLetter(row)} 
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
          </Tooltip>
          }

      <Tooltip title="View Enclosures">   
    <IconButton 
  size="small" 
  onClick={() => handleDownload(row)}
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
  }}
>
  <MdFileUpload style={{ fontSize: '28px' }} />
</IconButton>
</Tooltip> 

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
          textTransform: 'none',
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
    { name: 'Sl No.', selector: (row, index) => index + 1, sortable: true, width: '80px' },
    { name: 'Letter No.',
       selector: (row) => row.letterNo || '',
       cell: row => (
        <div 
          style={{
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            maxWidth: '200px'
          }} 
          title={row.letterNo || ''}
        >
          {row.letterNo || ''}
        </div>
      ),
        sortable: true, 
        width: '200px' 
      },
    { name: 'Ending Memo No.',
       selector: (row) => row.memoNo || '', 
       cell: row => (
        <div 
          style={{
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            maxWidth: '200px'
          }} 
          title={row.memoNo || ''}
        >
          {row.memoNo || ''}
        </div>
      ),
       sortable: true, 
       width: '250px',
       
      },
    { name: 'Subject',
       selector: (row) => row.subject,
       cell: row => (
        <div 
          style={{
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            maxWidth: '200px'
          }} 
          title={row.subject || ''}
        >
          {row.subject || ''}
        </div>
      ),
        sortable: true, 
        wrap: true,
         grow: 2 },
    { name: 'From', 
      selector: (row) => row.from, 
      cell: row => (
        <div 
          style={{
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            maxWidth: '200px'
          }} 
          title={row.from || ''}
        >
          {row.from || ''}
        </div>
      ),
      sortable: true,
       wrap: true,
        grow: 1 
      },
    { name: 'Date',
       selector: (row) => row.date, 
       cell: row => (
        <div 
          style={{
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            maxWidth: '200px'
          }} 
          title={row.date || ''}
        >
          {row.date || ''}
        </div>
      ),
       sortable: true,
        width: '120px' },
    
    {
      name: "View",
      cell: (row) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="View Letter">
          <IconButton size="small" onClick={() => handleDownloadview(row)} 
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
          </Tooltip>
          <Tooltip title="View Enclosures">
            <IconButton 
          size="small" 
          onClick={() => handleDownload(row)}
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
          }}
        >
          <MdFileUpload style={{ fontSize: '28px' }} />
        </IconButton>
        </Tooltip>
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
  
  const  handleDownloadview = async (row) => {
    setIsLoading(true);
    try {
     
      const token = useAuthStore.getState().token;
      const payload = {
        documentName: row.fileName,
        documentPath: row.filePath,
      };
  
      const encryptedPayload = encryptPayload(payload);
     
  
      const response = await api.post(
        'download/view-document',
        { dataObject: encryptedPayload },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (response.data && response.data.data) {
        const base64String = response.data.data.split(",")[1]; 
        const byteCharacters = atob(base64String);
        const byteNumbers = new Uint8Array([...byteCharacters].map(char => char.charCodeAt(0)));
        const blob = new Blob([byteNumbers], { type: "application/pdf" });
      
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else {
        toast.error("Failed to load PDF.");
      }
    } catch (error) {
      console.error("Error fetching PDF:", error);
      toast.error("Failed to fetch PDF. Please try again.");
    }
    finally{
      setIsLoading(false);
    }
  };



  const printLetter = async (row) => {
    setIsLoading(true);
    try {
      const token = useAuthStore.getState().token;
      const payload = {
        correspondenceId: row.correspondenceId,
      };
  
      const encryptedPayload = encryptPayload(payload);
  
      const response = await api.post(
        'dispatch/cor-draft-print',
        { dataObject: encryptedPayload },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (response.data.outcome) {
        const letterContent = response.data.data;
  
        // Store the letter content in localStorage
        localStorage.setItem('letterContent', JSON.stringify(letterContent));
  
        // Open a new tab with the print letter component
        window.open('/print-letter', '_blank');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching correspondence details:", error);
      toast.error("Failed to view letter. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
<>
{isLoading && <PageLoader />}
    <Accordion 
    expanded={expanded} 
    onChange={handleAccordionChange}
    sx={{
      boxShadow:"3",
       backgroundColor: '#f5f8fa'
    }}
  >
    <AccordionSummary
      expandIcon={
        <IconButton 
        sx={{
          backgroundColor: "#1a5f6a",
          color: "#fff",
          width: 30, 
          height: 30, 
          "&:hover": {
            backgroundColor: "#207785",
          },
        }}>
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
        Letter List
      </Typography>
    </AccordionSummary>
      <AccordionDetails sx={{ backgroundColor: '#fafafa', p: 2, borderRadius: '0 0 10px 10px' }}>
      <Box sx={{ p: 3 }}>
     
      <Box sx={{ mb: 2 }}>
  <Button
    variant="contained"
    onClick={() => handleTabChange('newLetter')}
    sx={{
      textTransform: 'none',
      mr: 1,
      backgroundColor: activeTab === 'NEW_LETTER' ? '#1a5f6a' : '#ffffff',
      color: activeTab === 'NEW_LETTER' ? '#ffffff' : '#1a5f6a',
      border: '1px solid #1a5f6a',
      '&:hover': {
        backgroundColor: activeTab === 'NEW_LETTER' ? '#144952' : '#f0f0f0',
      },
    }}
  >
    New Letter
  </Button>
  
  <Button
    variant="contained"
    onClick={() => handleTabChange('sentLetter')}
    sx={{
      textTransform: 'none',
      backgroundColor: activeTab === 'SENT_LETTER' ? '#1a5f6a' : '#ffffff',
      color: activeTab === 'SENT_LETTER' ? '#ffffff' : '#1a5f6a',
      border: '1px solid #1a5f6a',
      '&:hover': {
        backgroundColor: activeTab === 'SENT_LETTER' ? '#144952' : '#f0f0f0',
      },
    }}
  >
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
         dispatchData={selectedRow}
         fetchLetters={fetchLetters}
         />
   
    <Enclosures 
  open={isEnclosuresOpen} 
  onClose={handleCloseEnclosures} 
  enclosures={selectedRow?.enclosures || []} 
  fileName={dispatchdata?.[0]?.fileName} 
  filePath={dispatchdata?.[0]?.filePath}
/>
    </Box>

  </AccordionDetails>
</Accordion>
</>
  );
};

export default Despatch;
