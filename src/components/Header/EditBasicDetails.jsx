import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Typography,
  TextField,
  Grid,
  InputAdornment,
  Button,
} from "@mui/material";
import { LocalizationProvider, MobileDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { CalendarToday, Remove as RemoveIcon, Add as AddIcon } from "@mui/icons-material";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PageLoader } from "../pageload/PageLoader";
import { useLocation } from "react-router-dom";

const EditBasicDetails = () => {
    const location = useLocation();
    const basicDetails = location.state?.basicDetails || null;
    const token = useAuthStore.getState().token;
  const [expanded, setExpanded] = useState(true);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [data, setData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dateBirth: "",
    email: "",
    mobile: "",
    officeEmail: "",
    officePhone: "",
    joiningDate: "",
    serviceEndDate: "",
    staffCode: "",
    employeeId:""

  });

  useEffect(() => {
    if (basicDetails) {
      setData({
        firstName: basicDetails.firstName || "",
        middleName: basicDetails.middleName || "",
        lastName: basicDetails.lastName || "",
        
        dateBirth: 
  basicDetails.dateBirth && dayjs(basicDetails.dateBirth, "DD-MM-YYYY", true).isValid()
    ? dayjs(basicDetails.dateBirth, "DD-MM-YYYY")
    : null,
        email: basicDetails.email || "",
        mobile: basicDetails.mobile || "",
        officeEmail: basicDetails.officeEmail || "",
        officePhone: basicDetails.officePhone || "",
        
        joiningDate: 
  basicDetails.joiningDate && dayjs(basicDetails.joiningDate, "DD-MM-YYYY", true).isValid()
    ? dayjs(basicDetails.joiningDate, "DD-MM-YYYY")
    : null,

serviceEndDate: 
  basicDetails.serviceEndDate && dayjs(basicDetails.serviceEndDate, "DD-MM-YYYY", true).isValid()
    ? dayjs(basicDetails.serviceEndDate, "DD-MM-YYYY")
    : null,

        staffCode: basicDetails.staffCode || "",
        employeeId: basicDetails.employeeId || "",
      });
    }
  }, [basicDetails]);
  
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleDateChange = (field, newValue) => {
    if (newValue && dayjs(newValue, "DD-MM-YYYY").isValid()) {
      setData((prevData) => ({
        ...prevData,
        [field]: newValue,
      }));
      setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
    }
  };

 const validateField = (name, value, data = {}) => {
    switch (name) {
      case "firstName":
        return value?.trim() ? "" : "First name is required";
  
      case "lastName":
        return value?.trim() ? "" : "Last name is required";
  
      case "dateBirth":
        if (!value) return "Date of birth is required";
  
        if (data?.joiningDate) {
          const birthDate = dayjs(value, "DD-MM-YYYY");
          const joinDate = dayjs(data.joiningDate, "DD-MM-YYYY");
  
          if (joinDate.diff(birthDate, "year") < 18) {
            return "Date of birth must be at least 18 years before joining date.";
          }
        }
        return "";
  
      case "joiningDate":
        if (!value) return "Joining date is required";
  
        if (data?.dateBirth) {
          const birthDate = dayjs(data.dateBirth, "DD-MM-YYYY");
          const joinDate = dayjs(value, "DD-MM-YYYY");
  
          if (joinDate.diff(birthDate, "year") < 18) {
            return "Joining date must be at least 18 years after date of birth.";
          }
        }
        return "";
  
      case "serviceEndDate":
        if (!value) return ""; 
  
        if (data?.joiningDate) {
          const joinDate = dayjs(data.joiningDate, "DD-MM-YYYY");
          const endDate = dayjs(value, "DD-MM-YYYY");
  
          if (endDate.isBefore(joinDate)) {
            return "Service end date must be after joining date.";
          }
        }
        return "";
  
      case "officeEmail":
        const emailRegex =
          /^[a-zA-Z0-9._-]+@(gmail\.com|cag\.gov\.in|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
        return value
          ? emailRegex.test(value)
            ? ""
            : "Enter a valid office email address"
          : "Enter a valid office email address";
  
          case "officePhone":
            if (!value) return "Office phone is required.";

            // Ensure exactly 11 digits and exactly one hyphen
            const digitCount = (value.match(/\d/g) || []).length;
            const hyphenCount = (value.match(/-/g) || []).length;

            if (digitCount !== 11 || hyphenCount !== 1) {
              return "Office phone must contain exactly 11 digits and one hyphen.";
            }

            return ""; 
  
      case "email":
        const emailOptionalRegex =
          /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return value
          ? emailOptionalRegex.test(value)
            ? ""
            : "Enter a valid email address"
          : "";
  
      case "mobile":
        const mobileOptionalRegex = /^\d{10}$/;
        return value
          ? mobileOptionalRegex.test(value)
            ? ""
            : "Enter valid 10-digit mobile number"
          : "";
  
      default:
        return "";
    }
  };
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    const requiredFields = [
      "firstName",
      "lastName",
      "dateBirth",
      "officeEmail",
      "officePhone",
      "joiningDate",
    ];

    requiredFields.forEach((field) => {
      const error = validateField(field, data[field], data);

      if (error) {
        isValid = false;
        newErrors[field] = error;
      }
    });

    const optionalFields = ["email", "mobile", "staffCode", "serviceEndDate"];
    optionalFields.forEach((field) => {
      const error = validateField(field, data[field], data);

      if (error) {
        isValid = false;
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

 
  const validateDateOfBirth = (dateBirth, joiningDate) => {
    const newErrors = { ...errors };
  
    if (dateBirth && joiningDate) {
      const birthDate = dayjs(dateBirth, "DD-MM-YYYY");
      const joinDate = dayjs(joiningDate, "DD-MM-YYYY");
  
      if (joinDate.diff(birthDate, "year") < 18) {
        newErrors.dateBirth =
          "Date of birth must be at least 18 years before joining date.";
        
        updateFormData("basicDetails", (prev) => ({
          ...prev,
          dateBirth: "",
        }));
      } else {
        newErrors.dateBirth = "";
      }
    }
  
    setErrors(newErrors);
  };
  
  const validateJoiningDate = (joiningDate, dateBirth) => {
    const newErrors = { ...errors };
  
    if (dateBirth && joiningDate) {
      const birthDate = dayjs(dateBirth, "DD-MM-YYYY");
      const joinDate = dayjs(joiningDate, "DD-MM-YYYY");
  
      if (joinDate.diff(birthDate, "year") < 18) {
        newErrors.joiningDate =
          "Joining date must be at least 18 years after date of birth.";
        
        updateFormData("basicDetails", (prev) => ({
          ...prev,
          joiningDate: "",
        }));
      } else {
        newErrors.joiningDate = "";
      }
    }
  
    setErrors(newErrors);
  };

  const validateServiceEndDate = (serviceEndDate, joiningDate) => {
    const newErrors = { ...errors };
  
    if (serviceEndDate && joiningDate) {
      const joinDate = dayjs(joiningDate, "DD-MM-YYYY");
      const endDate = dayjs(serviceEndDate, "DD-MM-YYYY");
  
      if (endDate.isBefore(joinDate)) {
        newErrors.serviceEndDate = "Service end date must be after joining date.";
      } else {
        newErrors.serviceEndDate = "";
      }
    }
  
    setErrors(newErrors);
  };


  const handleSaveAndNext = async () => {
     if (!validateForm()) {
         toast.error("Please fill all the required fields.");
         return;
       }
     
       if (data.serviceEndDate && data.joiningDate) {
         const joinDate = dayjs(data.joiningDate, "DD-MM-YYYY");
         const endDate = dayjs(data.serviceEndDate, "DD-MM-YYYY");
     
         if (endDate.isBefore(joinDate) ) {
           toast.error("Service end date must be after the joining date.");
           return;
         }
       }
   
    setIsLoading(true);
    try {
      const formattedData = {
        ...data,
        dateBirth: data.dateBirth
          ? dayjs(data.dateBirth, "DD-MM-YYYY").format("YYYY-MM-DD")
          : null,
        joiningDate: data.joiningDate
          ? dayjs(data.joiningDate, "DD-MM-YYYY").format("YYYY-MM-DD")
          : null,
        serviceEndDate: data.serviceEndDate
          ? dayjs(data.serviceEndDate, "DD-MM-YYYY").format("YYYY-MM-DD")
          : null,
      };

      const payload = { ...formattedData };

      const response = await api.post(
        "governance/save-or-update-employee",
        { dataObject: encryptPayload(payload) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success(response.data.data.success_msg);
      }
    } catch (error) {
      console.error("Error saving employee data:", error);
      let errorMessage = "Failed to save data. Please try again.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.error_msg
      ) {
        errorMessage = error.response.data.error_msg;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  
  };

  return (
    <>
     {isLoading && <PageLoader />}
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{mt:5}}>
        <Accordion expanded={expanded} sx={{ boxShadow: 3 }}>
          <AccordionSummary
            expandIcon={
              <IconButton
                onClick={handleExpandClick}
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
            <Typography variant="h6">Basic Details</Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              backgroundColor: "#fafafa",
              p: 3,
              borderRadius: "0 0 10px 10px",
            }}
          >
            <Box>
              <Grid container spacing={2} sx={{ mt: 5 }}>
                <Grid item xs={3} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label={
                      <>
                        First Name <span style={{ color: "red" }}>*</span>
                      </>
                    }
                    name="firstName"
                    value={data.firstName}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[A-Za-z\s]*$/.test(value)) { 
                        handleChange(e);
                      }
                    }}
                    onKeyPress={(e) => {
                     
                      if (e.key === " " && !data.firstName.trim()) {
                        e.preventDefault();
                      }
                     
                      if (!/[A-Za-z\s]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    autoComplete="off"
                    inputProps={{ maxLength: 20 }}
                    InputProps={{ sx: { height: "50px" } }}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Middle Name"
                    name="middleName"
                    value={data.middleName}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[A-Za-z\s]*$/.test(value)) { 
                        handleChange(e);
                      }
                    }}
                    onKeyPress={(e) => {
                    
                      if (e.key === " " && !data.middleName.trim()) {
                        e.preventDefault();
                      }
                      
                      if (!/[A-Za-z\s]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    autoComplete="off"
                    inputProps={{ maxLength: 20 }}
                    InputProps={{ sx: { height: "50px" } }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label={
                      <>
                        Last Name <span style={{ color: "red" }}>*</span>
                      </>
                    }
                    name="lastName"
                    value={data.lastName}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[A-Za-z\s]*$/.test(value)) { 
                        handleChange(e);
                      }
                    }}
                    onKeyPress={(e) => {
                    
                      if (e.key === " " && !data.lastName.trim()) {
                        e.preventDefault();
                      }
                      
                      if (!/[A-Za-z\s]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    autoComplete="off"
                    inputProps={{ maxLength: 20 }}
                    InputProps={{ sx: { height: "50px" } }}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                  />
                </Grid>
                <Grid item xs={3}>
                  <MobileDatePicker
                    label={
                      <>
                        Date of Birth <span style={{ color: "red" }}>*</span>
                      </>
                    }
                    value={
                      data.dateBirth && dayjs(data.dateBirth, "DD-MM-YYYY").isValid()
                        ? dayjs(data.dateBirth, "DD-MM-YYYY")
                        : null
                    }
                    onChange={(newValue) => {
                      handleDateChange("dateBirth", newValue);
                      validateDateOfBirth(newValue, data.joiningDate);
                    }}
                    format="DD/MM/YYYY"
                    maxDate={dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        InputLabelProps: { shrink: true },
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
                        error: !!errors.dateBirth,
                        helperText: errors.dateBirth,
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
                <Grid item xs={3} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={data.email}
                    onChange={handleChange}
                    autoComplete="off"
                    InputProps={{ sx: { height: "50px" } }}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Mobile"
                    name="mobile"
                    value={data.mobile}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        handleChange(e);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (!/\d/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab") {
                        e.preventDefault();
                      }
                    }}
                    autoComplete="off"
                    inputProps={{ maxLength: 10 }}
                    InputProps={{ sx: { height: "50px" } }}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.mobile}
                    helperText={errors.mobile}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label={
                      <>
                        Office Email <span style={{ color: "red" }}>*</span>
                      </>
                    }
                    name="officeEmail"
                    type="email"
                    value={data.officeEmail}
                    onChange={handleChange}
                    autoComplete="off"
                    InputProps={{ sx: { height: "50px" } }}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.officeEmail}
                    helperText={errors.officeEmail}
                  />
                </Grid>
                
                      <Grid item xs={3}>
                        <TextField
                          fullWidth
                          label={
                            <>
                              Office Phone <span style={{ color: "red" }}>*</span>
                            </>
                          }
                          name="officePhone"
                          autoComplete="off"
                          value={data.officePhone}
                          onChange={(e) => {
                            let value = e.target.value.trim(); 
      
                            if (/^[0-9-]*$/.test(value)) {
                            
                              if (!value.startsWith("-")) {
                                const digitCount = (value.match(/\d/g) || []).length; 
                                const hyphenCount = (value.match(/-/g) || []).length;
      
                                if (digitCount <= 11 && hyphenCount <= 1) {
                                  handleChange(e); 
                                }
                              }
                            }
                          }}
                          onBlur={() => {
                            const error = validateField("officePhone", data.officePhone.trim(), data); 
                            setErrors((prev) => ({ ...prev, officePhone: error }));
                          }}
                          onKeyDown={(e) => {
        
                            if (
                              !/\d/.test(e.key) && 
                              e.key !== "-" && 
                              !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)
                            ) {
                              e.preventDefault(); 
                            }
      
                            const digitCount = (data.officePhone.match(/\d/g) || []).length;
                            if (digitCount >= 11 && /\d/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          inputProps={{ maxLength: 13 }} 
                          InputProps={{ sx: { height: "50px" } }}
                          InputLabelProps={{ shrink: true }}
                          error={!!errors.officePhone}
                          helperText={errors.officePhone}
                          aria-describedby="officePhone-error" 
                        />
                      </Grid>

                <Grid item xs={3}>
                  <MobileDatePicker
                    label={
                      <>
                        Joining Date <span style={{ color: "red" }}>*</span>
                      </>
                    }
                    value={
                      data.joiningDate && dayjs(data.joiningDate, "DD-MM-YYYY", true).isValid()
                        ? dayjs(data.joiningDate, "DD-MM-YYYY")
                        : null
                    }
                    onChange={(newValue) => {
                      handleDateChange("joiningDate", newValue);
                      validateJoiningDate(newValue, data.dateBirth);
                    }}
                    format="DD/MM/YYYY"
                     maxDate={dayjs()}
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
                        error: !!errors.joiningDate,
                        helperText: errors.joiningDate,
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
                <Grid item xs={3}>
                  <MobileDatePicker
                    label="Service End Date"
                    value={
                      data.serviceEndDate &&
                       dayjs(data.serviceEndDate, "DD-MM-YYYY", true).isValid()
                        ? dayjs(data.serviceEndDate, "DD-MM-YYYY")
                        : null
                    }
                    onChange={(newValue) => {
                      handleDateChange("serviceEndDate", newValue);
                      validateServiceEndDate(newValue, data.joiningDate);
                    }}
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
                        error: !!errors.serviceEndDate,
                        helperText: errors.serviceEndDate,
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
                <Grid item xs={3}>
                    <TextField
                        fullWidth
                        label="Employee Code"
                        name="staffCode"
                        value={data.staffCode || ""}
                        autoComplete="off"
                        inputProps={{ maxLength: 15, readOnly: true }}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase(); 
                          if (/^[A-Za-z0-9]*$/.test(value)) {
                            handleChange({ target: { name: "staffCode", value } });
                          }
                        }}
                        onKeyPress={(e) => {
                          if (!/[A-Za-z0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        InputProps={{
                        sx: { height: "50px" },
                        }}
                        error={!!errors.staffCode}
                        helperText={errors.staffCode}
                    />
                    </Grid>

              </Grid>
              
              <Box sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}>
                <Button variant="contained" 
                onClick={handleSaveAndNext}
                sx={{
                  backgroundColor: ' #1a5f6a',
                  '&:hover': { backgroundColor: '#207785' },
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                 
                }}>
                    Update
                </Button>
                <Button variant="contained" color="error"   onClick={() => navigate("/")}
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                   
                  }}>
                    Cancel
                </Button>
                </Box>

            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </LocalizationProvider>
    </>
  );
};

export default EditBasicDetails;

