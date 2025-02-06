import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
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
  Pagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import LetterDetail from './LetterDetail';

const LetterList = () => {
  const [letters, setLetters] = useState([]);
  const [viewletters, setViewLetters] = useState([]);
  const [rowSize, setRowSize] = useState(10);
  const [pageNo, setPageNo] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [activeTab, setActiveTab] = useState('NEW_LETTER');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [openLetterDetail, setOpenLetterDetail] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const token = useAuthStore.getState().token;

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
        textTransform: "uppercase",
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
        fontSize: "14px",
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

  const TAB_CODES = {
    NEW_LETTER: 'NEW_LETTER',
    SENT_LETTER: 'SENT_LETTER',
    MOVE_FILE: 'MOVE_FILE'
  };

  const fetchLetters = async (tabCode) => {
    try {
    
      const payload = {
        rowsize: parseInt(rowSize),
        tabCode: tabCode,
        pageNo:pageNo,
      };
      
      const response = await api.post(
        "letter/manage-letter-receipents",
        { dataObject: encryptPayload(payload) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.data);
      const responseData = response.data?.data?.letterList || [];
      setLetters(Array.isArray(responseData) ? responseData : []);
      setTotalRows(response.data?.data?.totalRows || 0);
    } catch (error) {
      console.error('Error fetching letters:', error);
      setLetters([]);
    } finally {
      
    }
  };

  const handleViewLetterDetail = async (row, tabCode) => {
    console.log("Row data:", row); // Debugging

    if (!row. receiptId) {
        console.error("Error: recipientId is missing in row data!");
        return; // Prevent API call if recipientId is missing
    }

    try {
        const payload = {
            metadataId: row.metadataId,
            receiptId: row.receiptId,
            tabCode: tabCode,
        };

        console.log("Sending payload:", payload); // Debugging

        const response = await api.post(
            "letter/view-letter",
            { dataObject: encryptPayload(payload) },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log("View letter response:", response.data.data);
        const responseData = response.data?.data?.letterList || [];
        setViewLetters(Array.isArray(responseData) ? responseData : []);
        setTotalRows(response.data?.data?.totalRows || 0);
        setSelectedLetter({ ...row, tabCode: activeTab });
        setOpenLetterDetail(true);
    } catch (error) {
        console.error("Error fetching letters:", error);
        setViewLetters([]);
    }
};



 
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    fetchLetters(newValue);
  };

  const handlePageChange = (event, page) => {
    setPageNo(page);
    fetchLetters(activeTab);
  };
  

  const handleRowsPerPageChange = (newRowSize) => {
    setRowSize(newRowSize);
    setPageNo(1); 
    fetchLetters(activeTab);
  };

//   const handleViewLetterDetail = (row) => {
//     setSelectedLetter({ ...row, tabCode: activeTab });
//     setOpenLetterDetail(true);
// };

  const handleCloseLetterDetail = () => {
    setOpenLetterDetail(false);
    setSelectedLetter(null);
  };

  const actionButton = (row) => (
    <Button
        size="small"
        variant="contained"
        color="primary"
        startIcon={<VisibilityIcon />}
        onClick={() => handleViewLetterDetail(row, activeTab)}  
    >
        View
    </Button>
);

  const NewLettercolumns = [
    {
      name: 'SI No',
      cell: (row, index) => index + 1,
      sortable: true,
      width: '60px',
    },
    {
      name: 'Diary Number',
      selector: row => row.diaryNumber || '',
      sortable: true,
    },
    {
      name: 'Letter Number & Date',
      selector: row => row.letterNumber || '',
      sortable: true,
    },
    {
      name: 'Letter Source',
      selector: row => row.letterSource || '',
      sortable: true,
    },
    {
      name: 'Send Date',
      selector: row => row.senderDate || '',
      sortable: true,
    },
    {
      name: 'Sender',
      selector: row => row.sender || '',
      sortable: true,
    },
    {
      name: 'Updated DateTime',
      selector: row => row.updatedDateTime || 'NA',
      sortable: true,
    },
    {
      name: 'Memo Number & Date',
      selector: row => row.memoNo || '',
      sortable: true,
    },
    {
      name: 'Subject',
      selector: row => row.subject || '',
      sortable: true,
      grow: 2,
    },
    {
      name: 'Action',
      cell: actionButton,
      width: '120px',
    },
  ];

  const SentLetterColumns = [
    {
      name: 'SI NO',
      cell: (row, index) => index + 1,
      sortable: true,
      width: '60px',
    },
    {
      name: 'Letter Number & Date',
      selector: row => row.letterNumber || '',
      sortable: true,
    },
    {
      name: 'Updated DateTime',
      selector: row => row.updatedDateTime || 'NA',
      sortable: true,
    },
    {
      name: 'Memo Number & Date',
      selector: row => row.memoNo|| '',
      sortable: true,
    },
    {
      name: 'Send To',
      selector: row => row.sendTo || '',
      sortable: true,
      grow: 2,
    },
    {
      name: 'Subject',
      selector: row => row.subject || '',
      sortable: true,
      grow: 2,
    },
    {
      name: 'Send Date',
      selector: row => row.senderDate|| '',
      sortable: true,
    },
    {
      name: 'Action',
      cell: actionButton,
      width: '120px',
    },
  ];

  const MovedToFileColumns = [
    {
      name: 'SI NO',
      cell: (row, index) => index + 1,
      sortable: true,
      width: '60px',
    },
    {
      name: 'Diary Number',
      selector: row => row.diaryNumber || '',
      sortable: true,
    },
    {
      name: 'Letter Number & Date',
      selector: row => row.letterNumber || '',
      sortable: true,
    },
    {
      name: 'Updated DateTime',
      selector: row => row.updatedDateTime || 'NA',
      sortable: true,
    },
    {
      name: 'Memo Number & Date',
      selector: row => row.memoNo || '',
      sortable: true,
    },
    {
      name: 'Subject',
      selector: row => row.subject || '',
      sortable: true,
      grow: 2,
    },
    {
      name: 'Status',
      selector: row => row.status || '',
      sortable: true,
      cell: row => (
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '4px',
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
      width: '120px',
    },
  ];

  const handleAccordionChange = () => {
    setExpanded(!expanded);
  };

  const getActiveColumns = () => {
    switch(activeTab) {
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

  useEffect(() => {
    fetchLetters(activeTab);
  }, []);

  return (
    <div>
      <Accordion 
        expanded={expanded} 
        onChange={handleAccordionChange}
        sx={{
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
          '&:before': {
            display: 'none',
          },
          '& .MuiAccordionSummary-root': {
            minHeight: '48px',
            backgroundColor: '#f8f9fa',
            borderBottom: expanded ? '1px solid #e0e0e0' : 'none',
          },
          '& .MuiAccordionSummary-content': {
            margin: '0',
          },
          '& .MuiAccordionDetails-root': {
            padding: '16px',
          }
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
          <Paper sx={{ width: '100%', mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minWidth: 120,
                  fontWeight: 500,
                },
                '& .Mui-selected': {
                  color: '#1976d2',
                }
              }}
            >
              <Tab value="NEW_LETTER" label="New Letters" />
              <Tab value="SENT_LETTER" label="Sent Letters" />
              <Tab value="MOVE_FILE" label="Move Files" />
            </Tabs>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <TextField
              type="number"
              size="small"
              value={rowSize}
              onChange={(e) => handleRowsPerPageChange(parseInt(e.target.value))}
              label="Records per page"
              sx={{ width: 150 }}
              inputProps={{ min: 1 }}
            />
          </Box>

          <Box sx={{ width: '100%' }}>
            <DataTable
              columns={getActiveColumns()}
              data={letters}
              customStyles={customStyles}
              paginationServer
              paginationTotalRows={totalRows}
              paginationPerPage={rowSize}
              paginationDefaultPage={pageNo}
              onChangeRowsPerPage={handleRowsPerPageChange}
            />
           

          </Box>
          <Box sx={{ 
            width: '100%',
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px',
            marginTop: '16px',
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#ffffff'
          }}>
            <Pagination
              count={Math.ceil(totalRows / rowSize)}
              page={pageNo}
              onChange={(e, page) => handlePageChange(e, page)}
              color="primary"
              size="large"
            />
           </Box>
        </AccordionDetails>
      </Accordion>

   
<LetterDetail 
    open={openLetterDetail}
    onClose={handleCloseLetterDetail}
    letterData={selectedLetter}
    letterDataView={viewletters} 
/>

    </div>
  );
};

export default LetterList;
