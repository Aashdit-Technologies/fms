import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, MobileDatePicker } from "@mui/x-date-pickers";
import {
  CalendarToday,
  AddCircleOutline,
  RemoveCircleOutline,
} from "@mui/icons-material";
import dayjs from "dayjs";
import useFormStore from "../EmployeeMaster/store";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import { toast } from "react-toastify";
import { PageLoader } from "../pageload/PageLoader";

const FamilyDetails = ({ handleTabChange }) => {
  const { updateFormData, setActiveTab, formData, activeTab } = useFormStore();
  const [isLoading, setIsLoading] = useState(false);
  const [relationship, setRelationship] = useState([]);
  const [errors, setErrors] = useState({});
  const [rows, setRows] = useState([
    {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      relationshipId: "",
      employeeId: null,
    },
  ]);

  const token = useAuthStore.getState().token;

 

  const handleChange = (index, field, value) => {
    const updatedRows = rows.map((row, i) => {
      if (i === index) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setRows(updatedRows);
  };



  const addRow = () => {
   
    const isAllRowsValid = rows.every((row, index) => {
      return (
        row.firstName &&
        row.lastName &&
        row.dateOfBirth &&
        row.relationshipId
      );
    });

    if (!isAllRowsValid) {
      toast.error("Please fill all mandatory fields in all rows before adding a new row.");
      return;
    }


    setRows([
      ...rows,
      {
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        relationshipId: "",
      },
    ]);
  };

  const removeRow = (index) => {
    if (rows.length > 1) {
      const updatedRows = rows.filter((_, i) => i !== index);
      setRows(updatedRows);
    }
  };


  const handleBack = () => {
    if (typeof handleTabChange !== "function") {
      console.error("handleTabChange is not a function! Received:", handleTabChange);
      return;
    }
    handleTabChange(null, "EMPLOYMENT_DETAILS");
  };

  const fetchrelationData = async () => {
    setIsLoading(true);
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        console.error("Token is missing");
        return;
      }

      const response = await api.get("governance/relationship-list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRelationship(response.data.data);
    } catch (error) {
      console.error("Error fetching family  data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchrelationData();
  }, []);

  const handleSaveAndNext = async () => {
    const storedEmployeeId = useFormStore.getState().employeeId;
const isValid =validateFamilyFields (rows);

 if (!isValid) {
   toast.error("Please fill all the required fields.");
   return; 
 }
    if (!rows || rows.length === 0) {
      toast.error("No family details provided.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        employeeId: storedEmployeeId ?? null,
        familyDetails: rows.map((row) => ({
          familyId: row?.familyId ?? null,
          firstName: row?.firstName ?? null,
          lastName: row?.lastName ?? null,
          dateOfBirth: row?.dateOfBirth ?? null,
          relationshipId: row?.relationshipId ?? null,
        })),
      };

      const encryptedPayload = encryptPayload(payload);

      const response = await api.post(
        "governance/save-or-update-employee-family-details",
        { dataObject: encryptedPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.outcome) {
        const { employeeCode, employeeId } = response.data.data;

        useFormStore.getState().setEmployeeCode(employeeCode);
        useFormStore.getState().setEmployeeId(employeeId);

        updateFormData("familyDetails", payload.familyDetails);

        toast.success(response.data.message);

        setActiveTab("ADDRESS");
      } else {
        toast.error(response.data?.message || "Failed to save family details.");
      }
    } catch (error) {
      console.error("Error saving family details:", error);
      toast.error("An error occurred while saving. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "FAMILY_DETAILS") {
      const storedData = formData?.familyDetails?.familyDetails || [];

      if (storedData.length > 0) {
        const formattedRows = storedData.map((row) => ({
          familyId: row?.familyId ?? null,
          firstName: row?.firstName ?? "",
          lastName: row?.lastName ?? "",
          dateOfBirth: row?.dateOfBirth
            ? dayjs(row.dateOfBirth).format("YYYY-MM-DD")
            : "",
          relationshipId: row?.relationsipId ?? "",
          employeeId: row?.employeeId ?? null,
        }));

        setRows(formattedRows);
      } else {
        setRows([
          {
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            relationshipId: "",
            employeeId: null,
          },
        ]);
      }
    }
  }, [activeTab, formData]);


  const validateFamilyFields = (rows) => {
    const newErrors = {};
    let isValid = true;
  
    rows.forEach((row, index) => {
      if (!row.firstName) {
        newErrors[`firstName_${index}`] = "First Name is required.";
        isValid = false;
      } 
    
      if (!row.lastName) {
        newErrors[`lastName_${index}`] = "Last Name is required.";
        isValid = false;
      } 
  
    
      if (!row.dateOfBirth) {
        newErrors[`dateOfBirth_${index}`] = "Date of Birth is required.";
        isValid = false;
      }
  
     
      if (!row.relationshipId) {
        newErrors[`relationshipId_${index}`] = "Relationship is required.";
        isValid = false;
      }
    });
  
    setErrors(newErrors);
    return isValid;
  };

  return (
    <>
      {isLoading && <PageLoader />}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ mt: 5 }}>
          {rows.map((row, index) => (
            <Grid
              container
              spacing={2}
              // alignItems="center"
              key={index}
              sx={{ borderBottom: "1px solid #ddd", pb: 2, mb: 2 }}
            >
              
              <Grid item xs={3} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label={
                    <>
                      First Name <span style={{ color: "red" }}>*</span>
                    </>
                  }
                  value={row.firstName}
                  onChange={(e) => {
                    const value = e.target.value;
                   
                    if (/^[A-Za-z\s]*$/.test(value)) {
                      handleChange(index, "firstName", value);
                      setErrors((prevErrors) => ({ ...prevErrors, [`firstName_${index}`]: "" }));
                    }
                  }}
                  onKeyDown={(e) => {
                    
                    if (e.key === " " && !row.firstName.trim()) {
                      e.preventDefault();
                    }
                    
                    if (!/[A-Za-z\s]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete") {
                      e.preventDefault();
                    }
                  }}
                  autoComplete="off"
                  inputProps={{
                    maxLength: 20,
                    autoComplete: "off",
                  }}
                  InputProps={{ sx: { height: "50px" } }}
                  error={!!errors[`firstName_${index}`]}
                  helperText={errors[`firstName_${index}`]}
                />
              </Grid>

              {/* Last Name */}
              <Grid item xs={3} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label={
                      <>
                        Last Name <span style={{ color: "red" }}>*</span>
                      </>
                    }
                    value={row.lastName}
                    onChange={(e) => {
                      const value = e.target.value;
                     
                      if (/^[A-Za-z\s]*$/.test(value)) {
                        handleChange(index, "lastName", value);
                        setErrors((prevErrors) => ({ ...prevErrors, [`lastName_${index}`]: "" }));
                      }
                    }}
                    onKeyDown={(e) => {
                      
                      if (e.key === " " && !row.lastName.trim()) {
                        e.preventDefault();
                      }
                     
                      if (!/[A-Za-z\s]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete") {
                        e.preventDefault();
                      }
                    }}
                    inputProps={{
                      maxLength: 20,
                      autoComplete: "off",
                    }}
                    autoComplete="off"
                    InputProps={{ sx: { height: "50px" } }}
                    error={!!errors[`lastName_${index}`]}
                    helperText={errors[`lastName_${index}`]}
                  />
                </Grid>

              {/* Birth Date */}
              {/* <Grid item xs={3} sx={{mb:2}}>
              <MobileDatePicker
                label={
                  <>
                    Date Of Birth<span style={{ color: "red" }}>*</span>
                  </>
                }
                value={row.dateOfBirth ? dayjs(row.dateOfBirth) : null}
                
                onChange={(newValue) => {
                  const formattedDate = newValue ? newValue.format("YYYY-MM-DD") : "";
                  handleChange(index, "dateOfBirth", formattedDate);
                  setErrors((prevErrors) => ({ ...prevErrors, [`dateOfBirth_${index}`]: "" }));
                }}
                format="YYYY-MM-DD"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors[`dateOfBirth_${index}`], 
                    helperText: errors[`dateOfBirth_${index}`], 
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
                  },
                  actionBar: {
                    actions: [],
                  },
                }}
                closeOnSelect={true}
              />
            </Grid> */}
                
                <Grid item xs={3} sx={{ mb: 2 }}>
  <MobileDatePicker
    label={
      <>
        Date Of Birth<span style={{ color: "red" }}>*</span>
      </>
    }
    value={row.dateOfBirth ? dayjs(row.dateOfBirth) : null}
    onChange={(newValue) => {
      const formattedDate = newValue ? newValue.format("YYYY-MM-DD") : "";
      handleChange(index, "dateOfBirth", formattedDate);
      setErrors((prevErrors) => ({ ...prevErrors, [`dateOfBirth_${index}`]: "" }));
    }}
    format="DD-MM-YYYY"
    maxDate={dayjs()} 
    slotProps={{
      textField: {
        fullWidth: true,
        error: !!errors[`dateOfBirth_${index}`], 
        helperText: errors[`dateOfBirth_${index}`], 
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
      },
      actionBar: {
        actions: [],
      },
      toolbar: {
        hidden: true,
      },
    }}
    slots={{
      toolbar: null, 
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

              {/* Relationship Dropdown */}
              <Grid item xs={2} sx={{mb:2}}>
                <TextField
                  select
                  fullWidth
                 
                  label={
                    <>
                     Relationship <span style={{color:"red"}}>*</span>
                    </>
                  }
                  value={row.relationshipId}
                  onChange={(e) => {
                    handleChange(index, "relationshipId", e.target.value); 
                    setErrors((prevErrors) => ({ ...prevErrors, [`relationshipId_${index}`]: "" }));
                  }}
                  InputProps={{ sx: { height: "50px" } }}
                  error={!!errors[`relationshipId_${index}`]}
                  helperText={errors[`relationshipId_${index}`]}
                >
                  <MenuItem value="">
                  --Select relation--
                  </MenuItem>
                  {relationship.map((option) => (
                    <MenuItem
                      key={option.relationshipId}
                      value={option.relationshipId}
                    >
                      {option.relationshipName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Add & Remove Buttons (Right-Aligned) */}
              <Grid
                item
                xs={1}
                sx={{ms:3}}
              >
                {index === 0 && (
                  <IconButton color="primary" onClick={addRow}>
                    <AddCircleOutline />
                  </IconButton>
                )}
                {index > 0 && (
                  <IconButton color="error" onClick={() => removeRow(index)}>
                    <RemoveCircleOutline />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          ))}

          {/* Navigation Buttons */}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Button variant="contained" color="secondary" onClick={handleBack}>
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveAndNext}
            >
            {formData?.familyDetails?.familyDetails && formData?.familyDetails?.familyDetails.length > 0 ? 'Update & Next' :'Save & Next'}
            </Button>
          </Box>
        </Box>
      </LocalizationProvider>
    </>
  );
};

export default FamilyDetails;
