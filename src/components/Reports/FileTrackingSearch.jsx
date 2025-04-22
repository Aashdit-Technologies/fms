import React, { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Button,
  Box,
  TextField,
  MenuItem,
  Autocomplete,
  InputAdornment,
  Pagination,
} from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { Grid } from "@mui/joy";
import SearchIcon from '@mui/icons-material/Search';
import useApiListStore from "../ManageFile/ApiListStore";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CalendarToday from "@mui/icons-material/CalendarToday";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from 'dayjs';
import DataTable from "react-data-table-component";
import { PageLoader } from "../pageload/PageLoader";
import {  FaHistory } from "react-icons/fa";
import VisibilityIcon from '@mui/icons-material/Visibility';
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
const FileTrackingSearch = () => {

  const tableData = [
    {
      id: 1,
      fileNo: 'IDCO/HO-MIS/A-10001/05/2019/V-1/P-1',
      fileName: 'APAA/Automated Post.Allotment Application/Work Execution',
      sender: 'ROLE_CGM.(P&A) || P&A || HIO',
      receivedDate: '21/04/2025',
      custodian: 'MOMASHREE SAMANTRAM',
      currentOwner: 'ROLE_DGM_MIS (MIS)',
      pendingDays: 0,
      fileStatus: 'PENDING'
    },
    {
      id: 2,
      fileNo: 'IDCO/HO-MIS/A-10045/01/2020/V-1/P-1',
      fileName: 'IDCO/MIS/74/2012/PURCHASE OF LAPTOP COMPUTER/General Correspondence',
      sender: 'ROLE_DGM_MIS || MIS || HIO',
      receivedDate: '21/04/2025',
      custodian: 'KABI SURYA SINGH',
      currentOwner: 'ROLE_IR_MNG_Admin/MSME (MIS)',
      pendingDays: 0,
      fileStatus: 'PENDING'
    },
    {
      id: 3,
      fileNo: 'IDCO/HO-MIS/A-10004/01/2019/V-1',
      fileName: 'IDCO/HO/MIS/123/2016/USE OF SOCIAL MEDIA ACCOUNT IN IDCO. (PAKT-1)/General Correspondence',
      sender: 'ROLE_CGM.(P&A) || P&A || HIO',
      receivedDate: '21/04/2025',
      custodian: 'KABI SURYA SINGH',
      currentOwner: 'ROLE_GKL_MIS (MIS)',
      pendingDays: 0,
      fileStatus: 'PENDING'
    },
    {
      id: 4,
      fileNo: 'IDCO/HO-MIS/A-10091/2025/V-1',
      fileName: 'Ethvoice/Ethvoice/GST Ethvoice',
      sender: 'ROLE_CGM.(FIN) || Finance || HIO',
      receivedDate: '21/04/2025',
      custodian: 'Akash Das',
      currentOwner: 'ROLE_GKL_MIS (MIS)',
      pendingDays: 0,
      fileStatus: 'PENDING'
    }
  ];


  const [selectedOffice, setSelectedOffice] = useState("1");
  const [selectedDepartment, setSelectedDepartment] = useState("1");
  const [selectedCustodian, setSelectedCustodian] = useState("");
  const [selectedFileModule, setSelectedFileModule] = useState("");
  const [expandedletter, setExpandedletter] = useState(true);
  const [errors, setErrors] = useState({});
  const [expanded, setExpanded] = useState(true);
const [searchText, setSearchText] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [rowSize, setRowSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { office, departments, custodians, fileModules, fetchAllData } =
    useApiListStore();
  
  const [formData, setFormData] = useState({
    fileNumber: "",
    fileName: "",
    presentFileOwners: [],
    pendingDays: "",
    status: "",
    movementDateFrom: null,
    movementDateTo: null,
  });
  const statusOptions = ["Pending", "Approved", "Rejected", "In Progress"];

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (office.length > 0 && departments.length > 0) {
      setSelectedOffice(office[0].officeOrgId);
      setSelectedDepartment(departments[0].departmentId);
    }
  }, [office, departments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setSelectedOffice(office[0]?.officeOrgId || "");
    setSelectedDepartment(departments[0]?.departmentId || "");
    setSelectedCustodian("");
    setSelectedFileModule("");
    setFormData({
      fileNumber: "",
      fileName: "",
      presentFileOwners: [],
      pendingDays: "",
      status: "",
      movementDateFrom: null,
      movementDateTo: null,
    });
  };

  const handleExpandLetterClick = () => {
    setExpandedletter(!expandedletter);
  };
  const handleExpandClick = () => {
    setExpanded(!expanded);
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
      selector: row => row.fileNo,
      sortable: true,
      // width: "350px",
     
    },
  {
    name: "file Name",
    selector: row => row.fileName,
    sortable: true,
 
  },
  {
    name: "sender",
    selector: row => row.sender,
    sortable: true,
    // width: "250px",
  },
  {
      name: " received Date",
      selector: row => row.receivedDate,
      sortable: true,
      width: "120px",
    },
    {
      name: " custodian",
      selector: row => row.custodian,
      sortable: true,
      // width: "120px",
    },
    {
      name: " current Owner",
      selector: row => row.currentOwner,
      sortable: true,
      // width: "120px",
    },
    {
      name: " pending Days",
      selector: row => row.pendingDays,
      sortable: true,
      width: "120px",
    },
    {
      name: " Status",
      selector: row => row.fileStatus,
      sortable: true,
      width: "120px",
    },
    {
      name: "Action",
      width: "100px",

      cell: (row) => (
        <>
          <div className="main_btn d-flex justify-content-between">
            <div className="main_btn_fst  d-flex">
              <Button
              variant="contained"
              color="warning"
              size="small"
              title="Send to Rack"
              sx={{
                minWidth: "auto",
                padding: "6px 10px",
                marginRight: "8px",
              }}
             
              
            >
              <VisibilityIcon sx={{ fontSize: 14 }}/>
              
            </Button>
            </div>

            <div className="main_btn_snd mr-2">
              <Button
                variant="contained"
                color="secondary"
                size="small"
                title="History"
                sx={{
                  minWidth: "auto",
                  padding: "6px 10px",
                  marginRight: "8px",
                }}
              
              >
                <FaHistory />
              </Button>
            </div>
          </div>
        </>
      ),
    },
  ];
  const filteredData = tableData.filter(
    (item) =>
      item.fileNo.toLowerCase().includes(searchText.toLowerCase()) ||
      item.fileName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.sender.toLowerCase().includes(searchText.toLowerCase()) ||
      item.custodian.toLowerCase().includes(searchText.toLowerCase()) ||
      item.currentOwner.toLowerCase().includes(searchText.toLowerCase())
      
  );
  // const paginatedData = useMemo(() => {
  //   const startIndex = (pageNo - 1) * rowSize;
  //   return filteredData.slice(startIndex, startIndex + rowSize);
  // }, [filteredData, pageNo, rowSize]);
  
  // useEffect(() => {
  //   setTotalRecords(filteredData.length);
  //   setTotalPages(Math.ceil(filteredData.length / rowSize));
  
  //   if (pageNo > Math.ceil(filteredData.length / rowSize)) {
  //     setPageNo(1);
  //   }
  // }, [filteredData, rowSize, pageNo]);
  
  const handlePageChange = (event, newPage) => {
    setPageNo(newPage);
  };
  
  const handleRowSizeChange = (event) => {
    setRowSize(Number(event.target.value));
    setPageNo(1); 
  };
  return (
    <div>
       {isLoading && <PageLoader />}
      <Box sx={{ my: 4 }}>
        <Accordion expanded={expandedletter} sx={{ boxShadow: 3 }}>
          <AccordionSummary
            expandIcon={
              <IconButton
                onClick={handleExpandLetterClick}
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
            <Typography variant="h6">Search File</Typography>
          </AccordionSummary>

          <AccordionDetails
            sx={{
              backgroundColor: "#fafafa",
              p: 3,
              borderRadius: "0 0 10px 10px",
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={12} md={3} mb={1} >
                  <Autocomplete
                    id="officeSelect"
                    options={office}
                    size="small"
                    getOptionLabel={(option) => option.officeOrgName}
                    value={
                      office.find((o) => o.officeOrgId === selectedOffice) ||
                      null
                    }
                    onChange={(event, newValue) =>
                      setSelectedOffice(newValue ? newValue.officeOrgId : "")
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Office <span style={{ color: "red" }}>*</span>
                          </span>
                        }
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Autocomplete
                    id="departmentSelect"
                    options={departments}
                    size="small"
                    getOptionLabel={(option) => option.departmentName}
                    value={
                      departments.find(
                        (d) => d.departmentId === selectedDepartment
                      ) || null
                    }
                    onChange={(event, newValue) =>
                      setSelectedDepartment(
                        newValue ? newValue.departmentId : ""
                      )
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Department <span style={{ color: "red" }}>*</span>
                          </span>
                        }
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Autocomplete
                    id="custodianSelect"
                    size="small"
                    options={custodians}
                    getOptionLabel={(option) => option.empNameWithDesgAndDept}
                    value={
                      custodians.find(
                        (c) => c.empDeptRoleId === selectedCustodian
                      ) || null
                    }
                    onChange={(event, newValue) =>
                      setSelectedCustodian(
                        newValue ? newValue.empDeptRoleId : ""
                      )
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Custodian <span style={{ color: "red" }}>*</span>
                          </span>
                        }
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
               
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="File Number"
                    name="fileName"
                    value={formData.fileNumber}
                    onChange={handleChange}
                    placeholder="Enter file number"
                  />
                </Grid>
                {/* Second Row - 4 fields */}
                <Grid item xs={12} md={3}  mb={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label="File Name"
                    name="fileName"
                    value={formData.fileName}
                    onChange={handleChange}
                    placeholder="Enter file name"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Autocomplete
                    multiple
                    size="small"
                    options={custodians}
                    getOptionLabel={(option) => option.empNameWithDesgAndDept}
                    value={formData.presentFileOwners}
                    onChange={(_, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        presentFileOwners: newValue,
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Present File Owner"
                        placeholder="Select owners"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Pending from days"
                    name="pendingDays"
                    type="number"
                    value={formData.pendingDays}
                    onChange={handleChange}
                    placeholder="Enter days"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Autocomplete
                    id="fileModuleSelect"
                    size="small"
                    options={fileModules}
                    getOptionLabel={(option) => option.moduleName}
                    value={
                      fileModules.find(
                        (f) => f.moduleId === selectedFileModule
                      ) || null
                    }
                    onChange={(event, newValue) =>
                      setSelectedFileModule(newValue ? newValue.moduleId : "")
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            File Module <span style={{ color: "red" }}>*</span>
                          </span>
                        }
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                {/* Third Row - 4 fields */}
                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <MenuItem value="">-Select-</MenuItem>
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <MobileDatePicker
                    label="File Movement Date From"
                    value={formData.movementDateFrom}
                    onChange={(newValue) =>
                      setFormData((prev) => ({
                        ...prev,
                        movementDateFrom: newValue,
                      }))
                    }
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        InputProps: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <CalendarToday />
                            </InputAdornment>
                          ),
                        },
                        sx: {
                          "& .MuiInputBase-root": {
                            height: "40px",
                          },
                        },
                        error: !!errors.movementDateFrom,
                        helperText: errors.movementDateFrom,
                      },
                      actionBar: {
                        actions: [],
                      },
                    }}
                    slots={{
                      toolbar: undefined,
                    }}
                    sx={{
                      "& .MuiPickersLayout-actionBar": {
                        display: "none",
                      },
                      "& .MuiPickersLayout-contentWrapper": {
                        "& .MuiPickersCalendarHeader-root": {
                          display: "none",
                        },
                        "& .MuiDayCalendar-header": {
                          display: "none",
                        },
                      },
                    }}
                    closeOnSelect={true}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <MobileDatePicker
                    label="File Movement Date To"
                    value={formData.movementDateTo}
                    onChange={(newValue) =>
                      setFormData((prev) => ({
                        ...prev,
                        movementDateTo: newValue,
                      }))
                    }
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        InputProps: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <CalendarToday />
                            </InputAdornment>
                          ),
                        },
                        sx: {
                          "& .MuiInputBase-root": {
                            height: "40px",
                          },
                        },
                        error: !!errors.movementDateTo,
                        helperText: errors.movementDateTo,
                      },
                      actionBar: {
                        actions: [],
                      },
                    }}
                    slots={{
                      toolbar: undefined,
                    }}
                    sx={{
                      "& .MuiPickersLayout-actionBar": {
                        display: "none",
                      },
                      "& .MuiPickersLayout-contentWrapper": {
                        "& .MuiPickersCalendarHeader-root": {
                          display: "none",
                        },
                        "& .MuiDayCalendar-header": {
                          display: "none",
                        },
                      },
                    }}
                    closeOnSelect={true}
                  />
                </Grid>
                <Grid item xs={12} md={3}></Grid> {/* Empty spacer */}
               
                <Grid
                  item
                  xs={12}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <Button variant="contained" 
                 sx={{ 
                  backgroundColor: '#1a5f6a',
                  fontSize: '1rem',
                  fontWeight: 'bold', 
                  borderRadius: '8px',
                
                  '&:hover': { backgroundColor: '#207785' },
                  '&:disabled': { backgroundColor: '#e0e0e0' }
                }}>
                    Search
                  </Button>
                  <Button variant="contained"
                   sx={{ 
                    backgroundColor: ' #fdb44b',
                    fontSize: '1rem',
                    fontWeight: 'bold', 
                    borderRadius: '8px',
                    '&:disabled': { backgroundColor: '#e0e0e0' }
                  }}
                  onClick={handleReset}>
                    Reset
                  </Button>
                  <Button variant="contained" sx={{
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: '8px',
            }}
            color="error">
            
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </LocalizationProvider>
          </AccordionDetails>
        </Accordion>
      </Box>


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
          File List
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            backgroundColor: "#fafafa",
            p: 3,
            borderRadius: "0 0 10px 10px",
          }}
        >
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
            data={filteredData}
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
                     
    </AccordionDetails>
      </Accordion>
    </Box>

    </div>
  );
};

export default FileTrackingSearch;
