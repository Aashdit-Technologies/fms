import React, { useState, useEffect,useCallback, useRef } from 'react';
import DataTable from 'react-data-table-component';
import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  TextField,
  Box,
  Tabs,
  Tab,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Pagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import VisibilityIcon from '@mui/icons-material/Visibility';


import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import LetterDetail from './LetterDetail';
import {toast } from "react-toastify";
import useLetterStore from './useLetterStore';
import { PageLoader } from "../pageload/PageLoader";
const customStyles = {
  table: {
    style: {
      border: "1px solid #ddd",
      borderRadius: "10px",
      overflow: "hidden",
      boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#ffffff",
      marginBottom: "1rem",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#005f73",
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: "600",
      // textTransform: "uppercase",
      letterSpacing: "0.5px",
      minHeight: "52px",
      borderBottom: "2px solid #003d4c",
    },
  },
  headCells: {
    style: {
      padding: "16px",
      textAlign: "center",
      fontWeight: "bold",
      borderRight: "1px solid rgba(255, 255, 255, 0.1)",
    },
  },
  rows: {
    style: {
      fontSize: "13px",
      fontWeight: "400",
      color: "#333",
      backgroundColor: "#ffffff",
      minHeight: "50px",
      transition: "background-color 0.2s ease-in-out",
      "&:not(:last-of-type)": {
        borderBottom: "1px solid #ddd",
      },
      "&:hover": {
        backgroundColor: "#e6f2f5",
        cursor: "pointer",
      },
    },
    stripedStyle: {
      backgroundColor: "#f9f9f9",
    },
  },
  cells: {
    style: {
      padding: "12px 16px",
      textAlign: "center",
      borderRight: "1px solid #ddd",
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid #ddd",
      padding: "10px",
      backgroundColor: "#f9f9f9",
    },
  },
  noData: {
    style: {
      padding: "24px",
      textAlign: "center",
      fontSize: "14px",
      color: "#777",
      backgroundColor: "#f9f9f9",
    },
  },
};
const LetterList = () => {

  const { successMessage, setSuccessMessage } = useLetterStore();
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null); 
      }, 12000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, setSuccessMessage]);

  const [letters, setLetters] = useState([]);
  const [viewletters, setViewLetters] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [openLetterDetail, setOpenLetterDetail] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  
  
  const TAB_CODES = {
    NEW_LETTER: 'NEW_LETTER',
    SENT_LETTER: 'SENT_LETTER',
    MOVE_FILE: 'MOVE_FILE'
  };
  const [tabStates, setTabStates] = useState({
    [TAB_CODES.NEW_LETTER]: { pageNo: 1, rowSize: 10, totalPages: 0 },
    [TAB_CODES.SENT_LETTER]: { pageNo: 1, rowSize: 10, totalPages: 0 },
    [TAB_CODES.MOVE_FILE]: { pageNo: 1, rowSize: 10, totalPages: 0 },
  });

  const handlePageChange = (event, newPage) => {
    if (newPage !== tabStates[activeTab].pageNo) {
      setTabStates((prevStates) => {
        const updatedStates = {
          ...prevStates,
          [activeTab]: {
            ...prevStates[activeTab],
            pageNo: newPage,
          },
        };
        fetchLetters(activeTab, updatedStates); 
        return updatedStates;
      });
    }
  };
  
  const handleRowSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setTabStates((prevStates) => {
      const updatedStates = {
        ...prevStates,
        [activeTab]: {
          ...prevStates[activeTab],
          rowSize: newSize,
          pageNo: 1, // Reset page when row size changes
        },
      };
      fetchLetters(activeTab, updatedStates);
      return updatedStates;
    });
  };

  

  const [activeTab, setActiveTab] = useState(TAB_CODES.NEW_LETTER);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    fetchLetters(newTab);
  };
 
  const fetchLetters = useCallback(
    async (tabCode, updatedTabStates = tabStates) => {
      setIsLoading(true);
      try {
        const token = useAuthStore.getState().token;
        const payload = {
          rowsize: updatedTabStates[tabCode].rowSize,
          tabCode: tabCode,
          pageNo: updatedTabStates[tabCode].pageNo,
        };
  
        const response = await api.post(
          "letter/manage-letter-receipents",
          { dataObject: encryptPayload(payload) },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        const responseData = response.data?.data?.letterList || [];
        setLetters(Array.isArray(responseData) ? responseData : []);
        const totalRecords = response.data.data.totalPages;
        setTabStates((prevStates) => ({
          ...prevStates,
          [tabCode]: {
            ...prevStates[tabCode],
            totalPages: totalRecords,
          },
        }));
      } catch (error) {
        console.error("Error fetching letters:", error);
        setLetters([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );
  
  useEffect(() => {
    fetchLetters(activeTab);
  }, [activeTab]); // Now it runs only when the tab changes
  

const handleViewLetterDetail = async (row, tabCode) => {

  if (!row.receiptId) {
    console.error("Error: receiptId is missing in row data!");
    return;
  }
  setIsLoading(true);
  try {
    const token = useAuthStore.getState().token;
    const payload = {
      metadataId: row.metadataId,
      receiptId: row.receiptId,
      tabCode: tabCode,
    };

 

    const response = await api.post(
      "letter/view-letter",
      { dataObject: encryptPayload(payload) },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
   

    if (!response.data || !response.data.data) {
      console.error("Error: API response is missing 'data'.", response.data);
      return;
    }
    const responseData = response.data.data; 
    setViewLetters([responseData]); 

    setTotalRows(1); 
    setSelectedLetter({ ...row, tabCode: tabCode });
    setOpenLetterDetail(true);
  } catch (error) {
    console.error("Error fetching letters:", error);
    setViewLetters([]);
  }
  finally{
    setIsLoading(false);
  }
};



  

  const handleCloseLetterDetail = () => {
    setOpenLetterDetail(false);
    setSelectedLetter(null);
  };

  const actionButton = (row) => (
    <Button
      size="small"
      variant="contained"
      color="primary"
      startIcon={<VisibilityIcon sx={{ fontSize: 20 }} />} 
      onClick={() => handleViewLetterDetail(row, activeTab)}
      sx={{
        minWidth: "36px", 
        padding: "6px 10px", 
        "& .MuiButton-startIcon": {
          margin: 0, 
        },
      }}
    />
  );
  



const NewLettercolumns = [
  {
    name: '#',
    cell: (row, index) => index + 1,
    sortable: true,
   width:"80px"
  },
  {
    name: 'Diary No.',
    selector: row => row.diaryNumber || '',
    sortable: true,
   
    cell: row => (
      <div 
        style={{
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          maxWidth: '150px'
        }} 
        title={row.diaryNumber || ''}
      >
        {row.diaryNumber || ''}
      </div>
    ),
  },
  {
    name: 'Letter No. & Date',
  
    cell: (row) => (
      <div
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "150px",
        }}
        title={`${row?.letterNumber || "N/A"} / ${row?.senderDate || "N/A"}`}
      >
        {`${row?.letterNumber || "N/A"} / ${row?.senderDate || "N/A"}`}
      </div>
    ),
    sortable: true,
   
  },  
  {
    name: 'Letter Source',
    selector: row => row.letterSource || '',
    sortable: true,
    
    cell: row => (
      <div 
        style={{
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          maxWidth: '150px'
        }} 
        title={row.letterSource || ''}
      >
        {row.letterSource || ''}
      </div>
    ),
    
  },
  
  {
    name: 'Send Date',
    selector: row => row.senderDate || '',
    sortable: true,
   
    cell: row => (
      <div 
        style={{
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          maxWidth: '150px'
        }} 
        title={row.senderDate  || ''}
      >
        {row.senderDate  || ''}
      </div>
    ),
  },
  {
    name: 'Sender',
    selector: row => row.sender || '',
    sortable: true,
     
    cell: row => (
      <div 
        style={{
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          maxWidth: '150px'
        }} 
        title={row.sender || ''}
      >
        {row.sender || ''}
      </div>
    ),
  },
  {
    name: 'Updated Date & Time',
    selector: row => row.updatedDateTime || 'NA',
    sortable: true,
  
    cell: row => (
      <div 
        style={{
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          maxWidth: '150px'
        }} 
        title={row.updatedDateTime || ''}
      >
        {row.updatedDateTime || ''}
      </div>
    ),
  },
  {
    name: 'Memo No. & Date',
    selector: row => row.memoNo || '',
    sortable: true,
   
    cell: row => (
      <div 
        style={{
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          maxWidth: '150px',
          
        }} 
        title={row.memoNo || ''}
      >
        {row.memoNo || ''}
      </div>
    ),
   
  },

  {
    name: 'Action',
    cell: actionButton,
    width:"100px",
  },
];

const SentLetterColumns = [
  {
    name: 'Sl No.',
    cell: (row, index) => index + 1,
    sortable: true,
    width: '100px',
  },
  {
    name: 'Letter No. & Date',
    
    cell: (row) => (
      <div
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "200px",
        }}
        title={`${row?.letterNumber || "N/A"} / ${row?.senderDate || "N/A"}`}
      >
        {`${row?.letterNumber || "N/A"} / ${row?.senderDate || "N/A"}`}
      </div>
    ),
    sortable: true,
    
  },  
  {
    name: 'Updated Date & Time',
    selector: row => row.updatedDateTime || 'NA',
    sortable: true,
    cell: row => (
      <div 
        style={{
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          maxWidth: '150px'
        }} 
        title={row.updatedDateTime || ''}
      >
        {row.updatedDateTime || ''}
      </div>
    ),
  },
  {
    name: 'Memo No. & Date',
    selector: row => row.memoNo|| '',
    sortable: true,
    width: '130px',
    cell: row => (
      <div 
        style={{
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          maxWidth: '150px'
        }} 
        title={row.memoNo || ''}
      >
        {row.memoNo || ''}
      </div>
    ),
  },
  {
    name: 'Send To',
    selector: row => row.sendTo || '',
    
   cell: row => (
    <div 
      style={{
        whiteSpace: 'nowrap', 
        overflow: 'hidden', 
        textOverflow: 'ellipsis', 
        maxWidth: '200px'
      }} 
      title={row.sendTo || ''}
    >
      {row.sendTo || ''}
    </div>
  ),
  sortable: true,
   width:"250px"
  },
  {
    name: 'Subject',
    selector: row => row.subject || '',
    sortable: true,
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
  },
  {
    name: 'Send Date',
    selector: row => row.senderDate|| '',
    sortable: true,
    cell: row => (
      <div 
        style={{
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          maxWidth: '200px'
        }} 
        title={row.senderDate || ''}
      >
        {row.senderDate || ''}
      </div>
    ),
  },
  {
    name: 'Action',
    cell: actionButton,
    width:"100px",
  },
];

const MovedToFileColumns = [
  {
    name: 'Sl No.',
    cell: (row, index) => index + 1,
    sortable: true,
    width: '100px',
  },
  {
    name: 'Diary No.',
    selector: row => row.diaryNumber || '',
    sortable: true,
    cell: row => (
      <div 
        style={{
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          maxWidth: '200px'
        }} 
        title={row.diaryNumber|| ''}
      >
        {row.diaryNumber|| ''}
      </div>
    ),
  },
  {
    name: 'Letter No. & Date',

    cell: (row) => (
      <div
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "200px",
        }}
        title={`${row?.letterNumber || "N/A"} / ${row?.senderDate || "N/A"}`}
      >
        {`${row?.letterNumber || "N/A"} / ${row?.senderDate || "N/A"}`}
      </div>
    ),
    sortable: true,
    
  },  
  {
    name: 'Updated Date & Time',
    selector: row => row.updatedDateTime || 'NA',
    sortable: true,
    cell: row => (
      <div 
        style={{
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          maxWidth: '200px'
        }} 
        title={row.updatedDateTime || ''}
      >
        {row.updatedDateTime || ''}
      </div>
    ),
  },
  {
    name: 'Memo No. & Date',
    selector: row => row.memoNo || '',
    sortable: true,
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
  },
  {
    name: 'Subject',
    selector: row => row.subject || '',
    sortable: true,
   
    cell: row => (
      <div 
        style={{
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          maxWidth: '200px'
        }} 
        title={row.subject|| ''}
      >
        {row.subject|| ''}
      </div>
    ),
  },
  {
    name: 'Status',
    selector: row => row.status || '',
    sortable: true,
    cell: row => (
      <span style={{ 
        padding: '4px 8px', 
        borderRadius: '4px',
        fontSize: '13px',
        backgroundColor: row.status === 'Moved' ? '#4caf50' : '#f44336',
        color: 'white'
      }}>
        {row.status || 'N/A'}
      </span>
    )
  },
  {
    name: 'Action',
    cell: actionButton,
    width:"100px",
  },
];

  const handleAccordionChange = () => {
    setExpanded(!expanded);
  };

  const getActiveColumns = () => {
    switch (activeTab) {
      case TAB_CODES.NEW_LETTER:
        return NewLettercolumns;
      case TAB_CODES.SENT_LETTER:
        return SentLetterColumns;
      case TAB_CODES.MOVE_FILE:
        return MovedToFileColumns;
      default:
        return NewLettercolumns;
    }
  };

 

  return (
    <>
     {isLoading && <PageLoader />}
    <div className="diary-section-container">
      <Box sx={{ p: 3 }}>
      {successMessage && (
        <Box
          sx={{
            bgcolor: "#e8f5e9",
            p: 2,
            borderRadius: "4px",
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body1" sx={{ color: "#1b5e20" }}>
            {successMessage}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setSuccessMessage(null)} 
            sx={{ color: "#1b5e20" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>

      <Accordion 
        expanded={expanded} 
       
        sx={{
          boxShadow: '3',
        
        }}
      >
        <AccordionSummary
           expandIcon={
            <IconButton   onClick={handleAccordionChange}
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
          <Paper sx={{ width: '100%', mb: 5 ,mt: 3}}>
            <Tabs
              value={activeTab}
             onChange={(event, newValue) => handleTabChange(newValue)}
             aria-label="letter tabs"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minWidth: 120,
                  fontWeight: 500,
                  flexShrink: 0, 
                },
                '& .Mui-selected': {
                  color: '#1976d2',
                },
              }}
            >
              <Tab value="NEW_LETTER" label="New Letter" />
              <Tab value="SENT_LETTER" label="Sent Letter" />
              <Tab value="MOVE_FILE" label="Moved To File" />
            </Tabs>
          </Paper>

          {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          
            <TextField
            type="number"
            size="small"
            value={rowSize || 10} 
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value > 0) {
                handleRowsPerPageChange(value);
              }
            }}
            label="Records per page"
            sx={{ width: 150 }}
            inputProps={{ min: 1 }}
/>
          </Box> */}

          <Box sx={{ width: '100%', overflowX: 'auto' }}>
        
          <DataTable
  columns={getActiveColumns()}
  data={letters}
  customStyles={customStyles}
  responsive
/>

<div className="d-flex justify-content-end align-items-center mt-3 gap-2">
  <div className="d-flex align-items-center">
    <span className="me-2">Rows per page:</span>
    <select
      value={tabStates[activeTab].rowSize}
      onChange={handleRowSizeChange}
      className="form-select form-select-sm"
      style={{ width: "80px", marginLeft: "8px" }}
    >
      <option value={10}>10</option>
      <option value={50}>50</option>
      <option value={100}>100</option>
      <option value={150}>150</option>
    </select>
  </div>

  <div className="d-flex align-items-center">
    <Pagination
      count={tabStates[activeTab].totalPages}
      page={tabStates[activeTab].pageNo}
      onChange={handlePageChange}
      variant="outlined"
      color="primary"
      size="medium"
      showFirstButton
      showLastButton
      siblingCount={1}
      boundaryCount={1}
      sx={{
        "& .MuiPaginationItem-root": {
          margin: "0 2px",
          minWidth: "32px",
          height: "32px",
        },
        "& .Mui-selected": {
          backgroundColor: "#1a5f6a !important",
          color: "white",
          "&:hover": {
            backgroundColor: "#1a5f6a",
          },
        },
      }}
    />
    <span className="ms-3">
      Page {tabStates[activeTab].pageNo} of {tabStates[activeTab].totalPages}
    </span>
  </div>
</div>
          </Box> 
        </AccordionDetails>
      </Accordion>
    

   <LetterDetail 
    open={openLetterDetail}
    onClose={handleCloseLetterDetail}
    letterData={selectedLetter} 
    letterDataView={viewletters[0]}
    fetchLetters={fetchLetters}
/>


    </div>
    </>
  );
};

export default LetterList;
