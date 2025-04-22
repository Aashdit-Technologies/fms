import React, { useEffect, useMemo, useState } from 'react';
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
import useApiListStore from '../ManageFile/ApiListStore';
import useAuthStore from "../../store/Store";
import api from "../../Api/Api";
import { encryptPayload } from "../../utils/encrypt.js";
import { toast } from 'react-toastify';
import { PageLoader } from "../pageload/PageLoader";

import customStyles from "../customStyles.jsx";
const LetterInbox = () => {
    
  const [toOffice, setToOffice] = useState('');
  const [toCustodian, setToCustodian] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [rowSize, setRowSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
    // office drop down states
    const { fetchAllData, office} = useApiListStore();
    const [selectedOffice, setSelectedOffice] = useState('');

    // custodian drop down state
    const [custodianData, setCustodianData] = useState([]);
    const [selectedCustodian, setSelectedCustodian] = useState("");
    const [loading, setLoading] = useState(false);
  

   // selected office list data
   const [selectedOfficeTo, setSelectedOfficeTo] = useState("");
   // custodian drop down state
  const [custodianDataTo, setCustodianDataTo] = useState([]);
   const [selectedCustodianTo, setSelectedCustodianTo] = useState("");

 const [letterInboxTableData, setLetterInboxTableData] = useState([]);
 const [selectedFiles, setSelectedFiles] = useState([]);
   useEffect(() => {
    const fetchCustodianData = async () => {
      if (!selectedOffice) {
        setCustodianData([]);
        return;
      }
     
      const payload = { officeId: selectedOffice };
      setIsLoading(true);
      try {
        const token = useAuthStore.getState().token;
        const encryptedMessage = encryptPayload(payload);
        const response = await api.get("file/custodian-list-by-office-id", {
          headers: { Authorization: `Bearer ${token}` },
          params: { dataObject: encryptedMessage },
        });
        setCustodianData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching custodian data:", error);
        setCustodianData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustodianData();
  }, [selectedOffice]);


  useEffect(() => {
    const fetchCustodianDataTo = async () => {
      if (!selectedOfficeTo) {
        setCustodianDataTo([]);
        return;
      }

   
      const payload = { officeId: selectedOfficeTo };
      setIsLoading(true);
      try {
        const token = useAuthStore.getState().token;
        const encryptedMessage = encryptPayload(payload);
        const response = await api.get("file/custodian-list-by-office-id", {
          headers: { Authorization: `Bearer ${token}` },
          params: { dataObject: encryptedMessage },
        });

        setCustodianDataTo(response.data.data || []);
      } catch (error) {
        console.error("Error fetching custodian data:", error);
        setCustodianDataTo([]);
      }finally{
        setIsLoading(false);
      } 
    };

    fetchCustodianDataTo();
  }, [selectedOfficeTo]);

 

  useEffect(() => {
      const fetchletterInboxTableData = async () => {
  
        if (!selectedCustodian) {
          setLetterInboxTableData([]);
          return;
        }
  
       
        const payload = { empDeptMapId: selectedCustodian };
        setIsLoading(true);
        try {
          const token = useAuthStore.getState().token;
          const response = await api.post("file/get-letter-inbox-list",
              { dataObject: encryptPayload(payload) },
            {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          setLetterInboxTableData(response.data.data || []);
          
        } catch (error) {
          console.error("Error fetching file inbox table data:", error);
          setLetterInboxTableData([]);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchletterInboxTableData();
    }, [selectedCustodian]);

    const handleSubmit = async () => {
   if (!selectedOffice) {
                 toast.warning("Please select Office (From)");
                 return;
               }
             
               if (!selectedCustodian) {
                 toast.warning("Please select Letter Recipient (From)");
                 return;
               }
               if (selectedFiles.length === 0) {
                 toast.warning("Please select at least one letter to assign");
                 return;
               }
             
               if (!selectedOfficeTo) {
                 toast.warning("Please select Office (To)");
                 return;
               }
             
               if (!selectedCustodianTo) {
                 toast.warning("Please select File Recipient (To)");
                 return;
               }
   
      const payload = {
        fromEmpDeptMapId: selectedCustodian,
        toEmpDeptMapId: selectedCustodianTo,
        changeIds: selectedFiles,
      };
      setIsLoading(true);
      try {
        const token = useAuthStore.getState().token;
        
        const response = await api.post(
          "file/update-letter-inbox-receiver",
          { dataObject: encryptPayload(payload) },
          {
          headers: { Authorization: `Bearer ${token}` },
        }
        );
  
        if (response.status === 200) {
          toast.success(response.data.message);
  
          setLetterInboxTableData((prevData) =>
            prevData.filter((file) => !selectedFiles.includes(file.receiptId))
          );
          setSelectedCustodian("");
          setSelectedCustodianTo("");
          setSelectedFiles([]);
          setSelectedFiles([]);
          setLetterInboxTableData([]);
          setSearchText("");
          setSelectedOffice(""); 
          setSelectedOfficeTo(""); 
        
        }
     
      } catch (error) {
        console.error("Error draft approver files:", error);
        toast.error("Failed to draft approver files.");
        
      }finally{
        setIsLoading(false);
      }
    };


    const handleCheckboxChange = (receiptId) => {
      setSelectedFiles((prevSelected) =>
        prevSelected.includes(receiptId)
          ? prevSelected.filter((id) => id !== receiptId)
          : [...prevSelected, receiptId]
      );
    };
    const filteredData = letterInboxTableData.filter(
      (item) =>
        item.letterNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchText.toLowerCase()) ||
        item.updatedDateTime.toLowerCase().includes(searchText.toLowerCase())|| 
        item.sender.toLowerCase().includes(searchText.toLowerCase()) ||
        item.senderDate.toLowerCase().includes(searchText.toLowerCase()) 
    );

   

    const columns = [
      {
        name: "Select",
        cell: (row) => (
          <input
            type="checkbox"
            checked={selectedFiles.includes(row.receiptId)}
            onChange={() => handleCheckboxChange(row.receiptId)}
          />
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    {
      name: "SL",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "100px",
      center: true,
    },
    {
        name: "Letter Number",
        selector: row => row.letterNumber,
        sortable: true,
        width: "200px",
        cell: row => row.letterNumber
    },
    {
      name: "Subject",
      selector: row => row.subject,
      width:"200px",
      sortable: true,
      wrap: true,
      cell: row => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {row.subject}
        </div>
      )
    },
    {
      name: "Updated Date/Time",
      selector: row => row.updatedDateTime,
      sortable: true,
      // width: "250px",
    },
   
    {
        name: "Sender",
        selector: row => row.sender,
        sortable: true,
        // width: "150px",
      },
      {
        name: "Sender Date",
        selector: row => row.senderDate,
        sortable: true,
        width: "180px",
      },
    ];
  
   

  const handleCancel = () => {
    setToOffice('None');
    setToCustodian(null);
    setSearchText('');
    setSelectedRows([]);
  };

  const paginatedData = useMemo(() => {
    const startIndex = (pageNo - 1) * rowSize;
    return filteredData.slice(startIndex, startIndex + rowSize);
  }, [filteredData, pageNo, rowSize]);
  
  useEffect(() => {
    setTotalRecords(filteredData.length);
    setTotalPages(Math.ceil(filteredData.length / rowSize));
  
    if (pageNo > Math.ceil(filteredData.length / rowSize)) {
      setPageNo(1);
    }
  }, [filteredData, rowSize, pageNo]);
  
  const handlePageChange = (event, newPage) => {
    setPageNo(newPage);
  };
  
  const handleRowSizeChange = (event) => {
    setRowSize(Number(event.target.value));
    setPageNo(1); 
  };

  return (
    <>
    
    {isLoading && <PageLoader />}
  
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
        <Grid item xs={4} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
                Office (From):<span style={{ color: 'red', marginLeft: '2px' }}>*</span>
            </Typography>
            <Autocomplete options={office}
              getOptionLabel={(option) => option.officeOrgName}
              value={office.find((o) => o.officeOrgId === selectedOffice) || null}
             onChange={(event, newValue) =>
             setSelectedOffice(newValue ? newValue.officeOrgId : "")
            }
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
            Letter Recipient (From):<span style={{ color: 'red', marginLeft: '2px' }}>*</span>
            </Typography>
            <Autocomplete
              options={custodianData}
              getOptionLabel={(option) => option.custodianName}
              value={
                custodianData.find((c) => c.custodianId === selectedCustodian) ||
                null
              }
             
              onChange={(event, newValue) =>
                setSelectedCustodian(newValue ? newValue.custodianId : "")
              }
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
            data={paginatedData}
            customStyles={customStyles}
           
          />
            <div className="d-flex justify-content-end align-items-center gap-2">
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
          Page {pageNo} of {totalPages} ({totalRecords} records)
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
                    options={office}
                    getOptionLabel={(option) => option.officeOrgName}
                    value={
                      office.find((o) => o.officeOrgId === selectedOfficeTo) || null
                    }
                    onChange={(event, newValue) => {
                      setSelectedOfficeTo(newValue ? newValue.officeOrgId : "");
                      setSelectedCustodianTo("");
                      
                    }}
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
            Letter Recipient (To):  <span style={{ color: 'red', marginLeft: '2px' }}>*</span>
            </Typography>
            <Autocomplete
               options={custodianDataTo}
               getOptionLabel={(option) => option.custodianName}
               value={
                 custodianDataTo.find(
                   (c) => c.custodianId === selectedCustodianTo
                 ) || null
               }
               onChange={(event, newValue) => {
                 setSelectedCustodianTo(newValue ? newValue.custodianId : "");
               }}
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
    </>
  );
};

export default LetterInbox;