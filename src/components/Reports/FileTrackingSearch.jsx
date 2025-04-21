import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Box,
  TextField,
  MenuItem,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { Grid } from "@mui/joy";
import { Button } from "react-bootstrap";
import useApiListStore from "../ManageFile/ApiListStore";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CalendarToday from "@mui/icons-material/CalendarToday";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from 'dayjs';
const FileTrackingSearch = () => {
  const [selectedOffice, setSelectedOffice] = useState("1");
  const [selectedDepartment, setSelectedDepartment] = useState("1");
  const [selectedCustodian, setSelectedCustodian] = useState("");
  const [selectedFileModule, setSelectedFileModule] = useState("");
  const [expandedletter, setExpandedletter] = useState(false);
  const [errors, setErrors] = useState({});
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

  return (
    <div>
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
              <Grid container spacing={2}>
                {/* First Row - 4 fields */}
                <Grid item xs={12} md={3}>
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
                    name="fileNumber"
                    value={formData.fileNumber}
                    onChange={handleChange}
                    placeholder="Enter file number"
                  />
                </Grid>
                {/* Second Row - 4 fields */}
                <Grid item xs={12} md={3}>
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
                            height: "50px",
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
                            height: "50px",
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
                {/* Buttons Row */}
                <Grid
                  item
                  xs={12}
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <Button variant="contained" color="primary">
                    Search
                  </Button>
                  <Button variant="outlined" onClick={handleReset}>
                    Reset
                  </Button>
                  <Button variant="outlined" color="error">
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </LocalizationProvider>
          </AccordionDetails>
        </Accordion>
      </Box>
    </div>
  );
};

export default FileTrackingSearch;
