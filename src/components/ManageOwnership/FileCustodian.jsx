import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Button,
  Paper,
  Typography,
  Grid,
  InputAdornment,
 Pagination,
 Dialog,
 DialogContent,
 DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from 'react-data-table-component';
import { toast } from 'react-toastify';
import FileCustodianModal from './FileCustodianModal';
import useApiListStore from '../ManageFile/ApiListStore';
import useAuthStore from "../../store/Store";
import api from "../../Api/Api";
import { encryptPayload } from "../../utils/encrypt.js";
import { PageLoader } from "../pageload/PageLoader";
import customStyles from "../customStyles.jsx";
const FileCustodian = () => {
  const [searchText, setSearchText] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [rowSize, setRowSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [showLocationFields, setShowLocationFields] = useState(false);
  
   const [selectedRack, setSelectedRack] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);
    const [currentRackCells, setCurrentRackCells] = useState(0);
     const [roomData, setRoomData] = useState([]);
     const [rackData, setRackData] = useState([]);
// office drop down states
  const { fetchAllData, office} = useApiListStore();
  const [selectedOffice, setSelectedOffice] = useState('');
  // custodian drop down state
  const [custodianData, setCustodianData] = useState([]);
  const [selectedCustodian, setSelectedCustodian] = useState("");
  const [loading, setLoading] = useState(false);
  // custodian table data
    const [custodianTableData, setCustodianTableData] = useState([]);
    // selected office list data
   const [selectedOfficeTo, setSelectedOfficeTo] = useState("");
   // custodian drop down state
   const [custodianDataTo, setCustodianDataTo] = useState([]);
   const [selectedCustodianTo, setSelectedCustodianTo] = useState("");
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
    const fetchCustodianTableData = async () => {

      if (!selectedCustodian) {
        setCustodianTableData([]);
        return;
      }

     
      const payload = { fromCustodianId: selectedCustodian };
      setIsLoading(true);
      try {
        const token = useAuthStore.getState().token;
        const encryptedMessage = encryptPayload(payload);
        const response = await api.get("file/file-custodian", {
          headers: { Authorization: `Bearer ${token}` },
          params: { dataObject: encryptedMessage },
        });

        setCustodianTableData(response.data.data || []);
        console.log(setCustodianTableData);
      } catch (error) {
        console.error("Error fetching custodian table data:", error);
        setCustodianTableData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustodianTableData();
  }, [selectedCustodian]);

  const filteredData = custodianTableData.filter(
    (item) =>
      item.docFileName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.subjectName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.status.toLowerCase().includes(searchText.toLowerCase())
  );


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
  
    const handleFileNumberClick = async (row) => {
      setIsLoading(true);
      try {
        setSelectedFile({
          fileNumber: row.docFileName,
          subject: row.subjectName,
          custodian: row.fullName,
          docFileId: row.docFileId,
          status: row.status
        });
        setModalOpen(true);
    
        const payload = {
          tabPanelId: 2,
          fileId: row.docFileId,
          fileReceiptId: 0
        };
        const encryptedPayload = encryptPayload(payload);
        const response = await api.post(
          'file/basic-details',
          { dataObject: encryptedPayload },
          { 
            headers: { 
              Authorization: `Bearer ${useAuthStore.getState().token}` 
            } 
          }
        );
        const fileDetails = response.data; 
        setSelectedFile(prev => ({
          ...prev,
          ...fileDetails,
          
          fileType: fileDetails.type,
          fileName: fileDetails.name,
         
        }));
    
      } catch (error) {
        console.error('Error fetching basic details:', error);
        
      }
      finally{
        setIsLoading(false);
      }
    };

    const handleRackChange = (event, newValue) => {
      setSelectedRack(newValue ? newValue.rackId : "");
      setSelectedCell(null);
  
      if (newValue) {
        setCurrentRackCells(newValue.noOfCell);
      } else {
        setCurrentRackCells(0);
      }
    };
  
    const handleRoomChange = (event, newValue) => {
      setSelectedRoom(newValue ? newValue.docRoomId : "");
      setIsRoomSelected(!!newValue);
      setSelectedRack(null);
      setSelectedCell(null);
      setCurrentRackCells(0);
    };

    useEffect(() => {
      const fetchRoomData = async () => {
        setIsLoading(true);
        try {
          const token = useAuthStore.getState().token;
  
          const response = await api.get("/manage-room", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setRoomData(response.data.data);
        } catch (error) {
          console.error("Error fetching room data:", error);
        }
        finally{
          setIsLoading(false);
        }
      };
      fetchRoomData();
    }, []);
  
    useEffect(() => {
      const fetchRackData = async () => {
        if (!selectedRoom) {
          setRackData([]);
          return;
        }
  
        const payload = { docRoomId: selectedRoom };
        setIsLoading(true);
        try {
          const token = useAuthStore.getState().token;
          const encryptedMessage = encryptPayload(payload);
          const response = await api.get("/manage-file-rack", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              dataObject: encryptedMessage,
            },
          });
          console.log("Fetched Rack Data:", response.data.data);
          setRackData(response.data.data);
        } catch (error) {
          console.error("Error fetching rack data:", error);
          setRackData([]);
        }
        finally{
          setIsLoading(false);
        }
      };
  
      fetchRackData();
    }, [selectedRoom]);
  

    const columns = [
      {
        name: "Select",
        cell: (row) => (
          <input
            type="checkbox"
            checked={selectedFiles.includes(row.docFileId)}
            onChange={() => handleCheckboxChange(row.docFileId)}
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
        name: "File Number",
        selector: row => row.docFileName,
        sortable: true,
        // width: "350px",
        cell: row => (
          <div 
            style={{ 
              color: '#1a5f6a',
              textDecoration: 'underline',
              cursor: 'pointer',
              whiteSpace: 'normal',
              wordBreak: 'break-word'
            }}
            onClick={() => handleFileNumberClick(row)}
          >
            {row.docFileName}
          </div>
        ),
      },
    {
      name: "Subject",
      selector: row => row.subjectName,
      sortable: true,
      width:"250px",
      wrap: true,
      cell: row => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {row.subjectName}
        </div>
      )
    },
    {
      name: "Custodian Status",
      selector: row => row.fullName,
      sortable: true,
      width: "250px",
    },
    {
        name: " Status",
        selector: row => row.status,
        sortable: true,
        width: "120px",
      },
    ];
    
    const handleCheckboxChange = (docFileId) => {
      setSelectedFiles((prevSelected) =>
        prevSelected.includes(docFileId)
          ? prevSelected.filter((id) => id !== docFileId)
          : [...prevSelected, docFileId]
      );
    };

    const handleAssignFiles = async () => {
    
      if (!selectedOffice) {
        toast.warning("Please select Office (From)");
        return;
      }
    
      if (!selectedCustodian) {
        toast.warning("Please select Custodian (From)");
        return;
      }
      if (selectedFiles.length === 0) {
        toast.warning("Please select at least one file to assign");
        return;
      }
    
      if (!selectedOfficeTo) {
        toast.warning("Please select Office (To)");
        return;
      }
    
      if (!selectedCustodianTo) {
        toast.warning("Please select Custodian (To)");
        return;
      }
  
      const isPhysicalLocationRequired = true; 
      
      if (isPhysicalLocationRequired) {
        if (!selectedRoom) {
          toast.warning("Please select Room");
          return;
        }
    
        if (!selectedRack) {
          toast.warning("Please select Rack");
          return;
        }
    
        if (!selectedCell) {
          toast.warning("Please select Cell");
          return;
        }
      }
 
      const payload = {
        fromEmpDeptMapId: selectedCustodian,
        toEmpDeptMapId: selectedCustodianTo,
        changeIds: selectedFiles,
      };
      setIsLoading(true);
      try {
        const token = useAuthStore.getState().token;
        const encryptedMessage = encryptPayload(payload);
        const response = await api.post(
          "file/assign-file",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { dataObject: encryptedMessage },
          }
        );
  
        if (response.status === 200) {
          toast.success(response.data.message);
  
          setCustodianTableData((prevData) =>
            prevData.filter((file) => !selectedFiles.includes(file.docFileId))
          );
          setSelectedCustodian("");
          setSelectedCustodianTo("");
          setSelectedFiles([]);
          setSelectedFiles([]);
          setCustodianTableData([]);
          setSearchText("");
          setSelectedRoom(null);
          setSelectedRack(null);
          setSelectedCell(null);
          setSelectedOffice(""); 
          setSelectedOfficeTo(""); 
        
        }
     
      } catch (error) {
        console.error("Error assigning files:", error);
        toast.error("Failed to assign files.");
        
      }finally{
        setIsLoading(false);
      }
    };
   
  const handleCancel = () => {
    console.log("Form cancelled");
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
            <Autocomplete
               options={office}
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
              Custodian (From):<span style={{ color: 'red', marginLeft: '2px' }}>*</span>
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
                     value={office.find((o) => o.officeOrgId === selectedOfficeTo) || null}
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
              Custodian (To): <span style={{ color: 'red', marginLeft: '2px' }}>*</span>
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
                
                if (newValue && selectedOfficeTo) {
                  setConfirmationOpen(true);
                }
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
        {showLocationFields && (
       <Grid container spacing={2} sx={{ mt: 1 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ 
            width: '100%', 
            fontWeight: 'bold', 
            color: "red",
            marginLeft: '15px',
            marginBottom: 0 
        }}>
            Change Room/Rack 
        </Typography>
        
        <Grid item xs={4}>
    <Typography variant="subtitle2" gutterBottom>
        Room Number:<span style={{ color: 'red', marginLeft: '2px' }}>*</span>
    </Typography>
    <Autocomplete
  options={roomData}
  getOptionLabel={(option) => option.roomNumber}
  value={roomData.find((r) => r.docRoomId === selectedRoom) || null}
  onChange={(event, newValue) => {
    if (newValue) {
      setSelectedRoom(newValue.docRoomId); 
    } else {
      setSelectedRoom(null);
    }
  }}
  noOptionsText={
    <Box
      sx={{
        padding: 1,
        backgroundColor: '#ccd1d1',
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
      }}
    >
      No matches found
    </Box>
  }
  renderInput={(params) => (
    <TextField {...params} variant="outlined" size="small" fullWidth />
  )}
/>

</Grid>
<Grid item xs={4}>
    <Typography variant="subtitle2" gutterBottom>
        Rack Number:<span style={{ color: 'red', marginLeft: '2px' }}>*</span>
    </Typography>
    <Autocomplete
        options={rackData}
        getOptionLabel={(option) => option.rackNumber}
        value={
          rackData.find((r) => r.rackId === selectedRack) || null
        }
        onChange={handleRackChange}
        
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
            <TextField {...params} variant="outlined" size="small" fullWidth />
        )}
    />
   </Grid>
        <Grid item xs={4}>
            <Typography variant="subtitle2" gutterBottom>
                Cell No:<span style={{ color: 'red', marginLeft: '2px' }}>*</span>
            </Typography>
            <Autocomplete
                options={[...Array(currentRackCells)].map(
                  (_, index) => index + 1
                )}
                getOptionLabel={(option) => option.toString()}
                value={selectedCell}
                onChange={(event, newValue) => setSelectedCell(newValue)}
                
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
                    <TextField {...params} variant="outlined" size="small" fullWidth />
                )}
            />
        </Grid>
    </Grid>
)}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
          <Button 
            variant="contained" 
            onClick={handleAssignFiles}
            
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
        <FileCustodianModal 
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fileDetails={selectedFile}
      />

<Dialog
    open={confirmationOpen}
    onClose={() => setConfirmationOpen(false)}
    maxWidth="xs"
    fullWidth
    sx={{
        '& .MuiDialog-paper': {
            borderRadius: '12px',
            padding: '16px'
        }
    }}
>
    <DialogContent>
        <Typography variant="body1" sx={{ textAlign: 'center' }}>
            Do you want to change Room and Rack Number?
        </Typography>
    </DialogContent>
    <DialogActions sx={{ 
        justifyContent: 'center',
        padding: '0 24px 16px'
    }}>
        <Button 
            onClick={() => {
                setConfirmationOpen(false);
                setShowLocationFields(false);
            }}
            color="error"
            variant="contained"
            sx={{
                minWidth: '100px',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 'bold'
            }}
        >
            No
        </Button>
        <Button 
            onClick={() => {
                setConfirmationOpen(false);
                setShowLocationFields(true);
            }}
            color="primary"
            variant="contained"
            sx={{
                backgroundColor: '#1a5f6a',
                minWidth: '100px',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': {
                    backgroundColor: '#207785'
                }
            }}
        >
            OK
        </Button>
    </DialogActions>
   </Dialog>
      </Paper>
    </Box>
    </>
  );
};

export default FileCustodian;