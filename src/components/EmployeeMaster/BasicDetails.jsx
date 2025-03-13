import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  InputAdornment,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, MobileDatePicker } from "@mui/x-date-pickers";
import { CalendarToday } from "@mui/icons-material";
import dayjs from "dayjs";
import useFormStore from "../EmployeeMaster/store";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PageLoader } from "../pageload/PageLoader";

const BasicDetails = () => {
  const { updateFormData, setActiveTab, formData, activeTab } = useFormStore();
  const storedData = formData?.basicDetails || {};
  const [isLoading, setIsLoading] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [data, setData] = useState({
    ...storedData,
    employeeId: storedData?.employeeId || null,
    firstName: storedData?.firstName || "",
    middleName: storedData?.middleName || "",
    lastName: storedData?.lastName || "",
    dateBirth:
      storedData?.dateBirth &&
      dayjs(storedData.dateBirth, "DD-MM-YYYY", true).isValid()
        ? dayjs(storedData.dateBirth, "DD-MM-YYYY")
        : null,
    email: storedData?.email || "",
    joiningDate:
      storedData?.joiningDate &&
      dayjs(storedData.joiningDate, "DD-MM-YYYY", true).isValid()
        ? dayjs(storedData.joiningDate, "DD-MM-YYYY")
        : null,
    mobile: storedData?.mobile || "",
    officeEmail: storedData?.officeEmail || "",
    officePhone: storedData?.officePhone || "",
    
    serviceEndDate:
      storedData?.serviceEndDate &&
      dayjs(storedData.serviceEndDate, "DD-MM-YYYY", true).isValid()
        ? dayjs(storedData.serviceEndDate, "DD-MM-YYYY")
        : null,
    user: storedData?.user || null,
    serviceStatus: storedData?.serviceStatus || null,
    staffCode: storedData?.staffCode || null,
  });

  const [errors, setErrors] = useState({});

  const token = useAuthStore.getState().token;

  useEffect(() => {
    if (activeTab === "BASIC_DETAILS") {
      const storedData = formData.basicDetails;
      if (storedData) {
        setData(storedData);
      } else {
        const employeeId = formData.basicDetails?.employeeId;
        if (employeeId) {
          fetchEmployeeData(employeeId);
        }
      }
    }
  }, [activeTab]);

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


 
  const validateField = (name, value, formData = {}) => {
    switch (name) {
      case "firstName":
        return value?.trim() ? "" : "First name is required";
  
      case "lastName":
        return value?.trim() ? "" : "Last name is required";
  
      case "dateBirth":
        if (!value) return "Date of birth is required";
  
        if (formData?.joiningDate) {
          const birthDate = dayjs(value, "DD-MM-YYYY");
          const joinDate = dayjs(formData.joiningDate, "DD-MM-YYYY");
  
          if (joinDate.diff(birthDate, "year") < 18) {
            return "Date of birth must be at least 18 years before joining date.";
          }
        }
        return "";
  
      case "joiningDate":
        if (!value) return "Joining date is required";
  
        if (formData?.dateBirth) {
          const birthDate = dayjs(formData.dateBirth, "DD-MM-YYYY");
          const joinDate = dayjs(value, "DD-MM-YYYY");
  
          if (joinDate.diff(birthDate, "year") < 18) {
            return "Joining date must be at least 18 years after date of birth.";
          }
        }
        return "";
  
      case "serviceEndDate":
        if (!value) return ""; // Not mandatory
  
        if (formData?.joiningDate) {
          const joinDate = dayjs(formData.joiningDate, "DD-MM-YYYY");
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
  
      case "staffCode":
        return value ? "" : ""; // Not mandatory
  
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
  
      if (endDate.isBefore(joinDate)) {
        toast.error("Service end date must be after the joining date.");
        return;
      }
    }
  
    if (data.staffCode) {
      const isUnique = await checkDuplicateEmployeeCode(data.staffCode);
  
      if (!isUnique) {
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
        const { EmployeeCode, EmployeeId, success_msg } = response.data.data;
        useFormStore.getState().setEmployeeCode(EmployeeCode);
        useFormStore.getState().setEmployeeId(EmployeeId);
        updateFormData("basicDetails", { ...data, employeeId: EmployeeId, employeeCode: EmployeeCode });
  
        toast.success(success_msg);
  
        setActiveTab("EMPLOYMENT_DETAILS");
      }
    } catch (error) {
      console.error("Error saving employee data:", error);
      let errorMessage = "Failed to save data. Please try again.";
      if (error.response && error.response.data && error.response.data.error_msg) {
        errorMessage = error.response.data.error_msg;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const checkDuplicateEmployeeCode = async (employeeCode) => {
   
    if (!employeeCode) return false;
  
    setIsLoading(true);
    const payload = {
      employeeId: data.employeeId || null,
      employeeCode: employeeCode,
    };
  
    try {
      const response = await api.post("governance/check-duplicate-employee-code", {
        dataObject: encryptPayload(payload),
      });
  
      if (response.data.data === "DUPLICATE") {
        setData((prevData) => ({ ...prevData, staffCode: "" }));
        setIsDuplicate(true);
  
        setErrors((prevErrors) => ({
          ...prevErrors,
          staffCode: "Employee Code already exists. Please enter a different code.",
        }));
        return false; 
      } else {
        setIsDuplicate(false);
        return true; 
      }
    } catch (error) {
      console.error("Error checking duplicate employee code:", error);
      return false; 
    } finally {
      setIsLoading(false);
    }
  };
  
  
  return (
    <>
      {isLoading && <PageLoader />}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
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
            inputProps={{
              maxLength: 20,
              autoComplete: "off",
            }}
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
            inputProps={{
              maxLength: 20,
              autoComplete: "off",
            }}
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
              inputProps={{
                maxLength: 20,
                autoComplete: "off",
              }}
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
                  format="DD-MM-YYYY"
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
                inputProps={{maxLength:10}}
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
                    let value = e.target.value.trim(); // Trim spaces
                    console.log("onChange - Current Value:", value); // Debugging

                    // Allow only digits and hyphen
                    if (/^[0-9-]*$/.test(value)) {
                      // Ensure hyphen is not at the start
                      if (!value.startsWith("-")) {
                        const digitCount = (value.match(/\d/g) || []).length; // Count digits
                        const hyphenCount = (value.match(/-/g) || []).length; // Count hyphens
                        console.log("Digit Count:", digitCount, "Hyphen Count:", hyphenCount); // Debugging

                        // Ensure max 11 digits and only one hyphen
                        if (digitCount <= 11 && hyphenCount <= 1) {
                          handleChange(e); // Update state
                        }
                      }
                    }
                  }}
                  onBlur={() => {
                    const error = validateField("officePhone", data.officePhone.trim(), data); // Use validateField
                    setErrors((prev) => ({ ...prev, officePhone: error }));
                  }}
                  onKeyDown={(e) => {
                    console.log("onKeyDown - Key Pressed:", e.key); // Debugging

                    // Allow digits, hyphen, Backspace, Delete, Arrow keys, and Tab
                    if (
                      !/\d/.test(e.key) && // Allow digits
                      e.key !== "-" && // Explicitly allow hyphen
                      !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)
                    ) {
                      console.log("Blocked Key:", e.key); // Debugging
                      e.preventDefault(); // Block invalid keys
                    }

                    // Block input if digit count is already 11
                    const digitCount = (data.officePhone.match(/\d/g) || []).length;
                    if (digitCount >= 11 && /\d/.test(e.key)) {
                      console.log("Blocked Key (Max Digits Reached):", e.key); // Debugging
                      e.preventDefault(); // Block additional digits
                    }
                  }}
                  inputProps={{ maxLength: 13 }} // Max length (11 digits + 1 hyphen + 1 extra)
                  InputProps={{ sx: { height: "50px" } }}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.officePhone}
                  helperText={errors.officePhone}
                  aria-describedby="officePhone-error" // Accessibility
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
                    format="DD-MM-YYYY"
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
              format="DD-MM-YYYY"
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
              inputProps={{ maxLength: 15 }}
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
                readOnly: !!data.employeeId,
              }}
              error={!!errors.staffCode}
              helperText={errors.staffCode}
            />
          </Grid>

           

            <Box sx={{ mt: 5, paddingLeft: "20px" }}> 
            <Typography sx={{ color: "red", marginBottom: 2 }}>
              *Note 1: If employee code is not entered, the system will generate it.
            </Typography> 
            <Typography sx={{ color: "red" }}>
              *Note 2 :  Employee code is not editable, once submit.
            </Typography>
          </Box> 
          
          </Grid>

          {/* Save & Next Button */}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveAndNext}
            >
              {data.employeeId ? "Update & Next" : "Save & Next"}
            </Button>
          </Box>
        </Box>
      </LocalizationProvider> 
    </>
  );
};

export default BasicDetails;
