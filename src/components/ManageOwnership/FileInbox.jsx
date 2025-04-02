import React, { useState } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Button,
  Paper,
  Typography,
  Divider,
  Grid,
  InputAdornment,
 Pagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import FileCustodianModal from './FileCustodianModal';
const FileInbox = () => {
    
  const navigate = useNavigate();

 const officeOptions = ['HO', 'Branch A', 'Branch B', 'Branch C'];
  const custodianOptions = [
    'None',
    'ABAKASH MISHRA (HO, Cwi, GM (Civil))',
    'John Doe (Branch A, Manager)',
    'Jane Smith (Branch B, Supervisor)',
    'Robert Johnson (Branch C, Director)'
  ];
 const fileData = [
    {
      id: 1,
      fileNumber: 'IDCO/HO-CIVIL/A-10032/05/2021/V-1',
      subject: 'Tour Programme',
      custodianStatus: 'ABAKASH MISHRA (HO, Cwi, GM (Civil)) ',
      status: 'Pending'
    },
    {
      id: 2,
      fileNumber: 'IDCO/HO-CIVIL/O-1912/05/2021/V-1',
      subject: 'Requisition for released of funds towards operational cost felling and removal of trees',
      custodianStatus: 'ABAKASH MISHRA (HO, Cwi, GM (Civil)) ',
      status: 'Approved'
    }
  ];

  const roomOptions = ['101', '102', '103', '201', '202'];
  const rackOptions = ['R-1', 'R-2', 'R-3', 'R-4'];
  const cellOptions = ['C-1', 'C-2', 'C-3', 'C-4'];

  const [fromOffice, setFromOffice] = useState('');
  const [fromCustodian, setFromCustodian] = useState('');
  const [toOffice, setToOffice] = useState('');
  const [toCustodian, setToCustodian] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
   const [rowSize, setRowSize] = useState(10);
   const [pageNo, setPageNo] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
 const [roomNumber, setRoomNumber] = useState('');
  const [rackNumber, setRackNumber] = useState('');
  const [cellNumber, setCellNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleFileNumberClick = (row) => {
    setSelectedFile({
      fileNumber: row.fileNumber,
      ...row.details
    });
    setModalOpen(true);
  };
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
        minHeight: "52px",
        borderBottom: "2px solid #003d4c",
      },
    },
    headCells: {
      style: {
        padding: "12px 8px",
        textAlign: "left",
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
        "&:not(:last-of-type)": {
          borderBottom: "1px solid #ddd",
        },
        "&:hover": {
          backgroundColor: "#e6f2f5",
        },
      },
    },
    cells: {
      style: {
        padding: "12px 8px",
        textAlign: "left",
        borderRight: "1px solid #ddd",
        wordBreak: "break-word",
      },
    },
    };

    const columns = [
    {
      name: "SL",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "80px",
      center: true,
    },
    {
        name: "File Number",
        selector: row => row.fileNumber,
        sortable: true,
        width: "250px",
        cell: row => row.fileNumber,
  },
    {
      name: "Subject",
      selector: row => row.subject,
      sortable: true,
      wrap: true,
      cell: row => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {row.subject}
        </div>
      )
    },
    {
      name: "Recipient",
      selector: row => row.custodianStatus,
      sortable: true,
      width: "250px",
    },
    {
        name: " Status",
        selector: row => row.status,
        sortable: true,
        width: "150px",
      },
    ];
    
    const handleSubmit = () => {
    console.log({
      fromOffice,
      fromCustodian,
      toOffice,
      toCustodian,
      roomNumber,
      rackNumber,
      cellNumber,
      selectedFiles: selectedRows
    });
   
  };

  const handleCancel = () => {
    setToOffice('None');
    setToCustodian(null);
    setSearchText('');
    setSelectedRows([]);
  };

  const handlePageChange = (event, newPage) => {
    setPageNo(newPage);
  };

  const handleRowSizeChange = (event) => {
    setRowSize(Number(event.target.value));
    setPageNo(1);
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
        <Grid item xs={4} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
                Office (From):
            </Typography>
            <Autocomplete
                value={fromOffice}
                onChange={(_, newValue) => setFromOffice(newValue)}
                options={officeOptions}
                noOptionsText={
                <Box sx={{ 
                    padding: 1,
                    backgroundColor: '#ccd1d1',
                    color: '#fff',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    No matches found
                </Box>
                }
                renderInput={(params) => (
                <TextField 
                    {...params} 
                    variant="outlined" 
                    size="small" 
                    fullWidth 
                />
                )}
            
            />
            </Grid>
          
          <Grid item xs={4} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
            File Recipient (From):
            </Typography>
            <Autocomplete
              value={fromCustodian}
              onChange={(_, newValue) => setFromCustodian(newValue)}
              options={custodianOptions}
              noOptionsText={
                <Box sx={{ 
                    padding: 1,
                    backgroundColor: '#ccd1d1',
                    color: '#fff',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    No matches found
                </Box>
                }
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  variant="outlined" 
                  size="small" 
                  fullWidth 
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: '#207785' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box>
          <DataTable
            columns={columns}
            data={fileData}
            customStyles={customStyles}
            selectableRows
          />
           <div className="d-flex justify-content-end align-items-center  gap-2">
                <div className="d-flex align-items-center">
                <span className="me-2">Rows per page:</span>
                <select
                    value={rowSize}
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
                    count={totalPages}
                    page={pageNo}
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
                    Page {pageNo} of {totalPages}
                </span>
                </div>
            </div>
        </Box>
                     
           <Grid container spacing={2}>
                <Grid item xs={4} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ height: '24px', display: 'flex', alignItems: 'center' }}>
                Office (To): <span style={{ color: 'red', marginLeft: '2px' }}>*</span>
                </Typography>
                
                <Autocomplete
                    value={toOffice}
                    onChange={(_, newValue) => setToOffice(newValue)}
                    options={officeOptions}
                    noOptionsText={
                        <Box sx={{ 
                            padding: 1,
                            backgroundColor: '#ccd1d1',
                            color: '#fff',
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            No matches found
                        </Box>
                        }
                    renderInput={(params) => (
                    <TextField 
                        {...params} 
                        variant="outlined" 
                        size="small" 
                        fullWidth
                        sx={{ 
                        '& .MuiOutlinedInput-root': {
                            height: '40px'
                        }
                        }}
                    />
                    )}
                />
            
            </Grid>
          
          <Grid item xs={4} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
            File Recipient (To): <span style={{ color: 'red', marginLeft: '2px' }}>*</span>
            </Typography>
            <Autocomplete
              value={toCustodian}
              onChange={(_, newValue) => setToCustodian(newValue)}
              options={custodianOptions}
              noOptionsText={
                <Box sx={{ 
                    padding: 1,
                    backgroundColor: '#ccd1d1',
                    color: '#fff',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    No matches found
                </Box>
                }
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  variant="outlined" 
                  size="small" 
                  fullWidth 
                />
              )}
            />
          </Grid>
        </Grid>
       

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            
            sx={{ 
              backgroundColor: '#1a5f6a',
              fontSize: '1rem',
              fontWeight: 'bold', 
              borderRadius: '8px',
              '&:hover': { backgroundColor: '#207785' },
              '&:disabled': { backgroundColor: '#e0e0e0' }
            }}
          >
            Submit
          </Button>
            <Button variant="contained" color="error"   onClick={handleCancel}
                sx={{
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: '8px',
            }}>
                Cancel
            </Button>
        </Box>
      
      </Paper>
    </Box>
  );
};

export default FileInbox;