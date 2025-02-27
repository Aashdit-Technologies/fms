


import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Grid, InputAdornment, Typography, InputLabel, Select, MenuItem } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { CalendarToday } from '@mui/icons-material';
import dayjs from 'dayjs';
import useFormStore from '../EmployeeMaster/store';
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PageLoader } from "../pageload/PageLoader";
const BasicDetails = () => {
  const { updateFormData, setActiveTab, formData, activeTab } = useFormStore();
  const storedData = formData?.basicDetails || {};
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    ...storedData,
    employeeId: storedData?.employeeId || null,
    firstName: storedData?.firstName || "",
    middleName: storedData?.middleName || "",
    lastName: storedData?.lastName || "",
    dateBirth: storedData?.dateBirth && dayjs(storedData.dateBirth, "DD-MM-YYYY", true).isValid()
      ? dayjs(storedData.dateBirth, "DD-MM-YYYY")
      : null,
    email: storedData?.email || "",
    joiningDate: storedData?.joiningDate && dayjs(storedData.joiningDate, "DD-MM-YYYY", true).isValid()
      ? dayjs(storedData.joiningDate, "DD-MM-YYYY")
      : null,
    mobile: storedData?.mobile || "",
    officeEmail: storedData?.officeEmail || "",
    officePhone: storedData?.officePhone || "",
    serviceEndDate: storedData?.serviceEndDate && dayjs(storedData.serviceEndDate, "DD-MM-YYYY", true).isValid()
      ? dayjs(storedData.serviceEndDate, "DD-MM-YYYY")
      : null,
    user: storedData?.user || null,
    serviceStatus: storedData?.serviceStatus || null,
    staffCode: storedData?.staffCode || null,
  });
console.log("data response ",data)
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
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleDateChange = (field, newValue) => {
    if (newValue && dayjs(newValue, "DD-MM-YYYY").isValid()) {
      setData((prevData) => ({
        ...prevData,
        [field]: newValue, 
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(data).forEach((key) => {
      const error = validateField(key, data[key]);
      if (error) {
        isValid = false;
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        return value?.trim() ? "" : "First name is required";
      case "lastName":
        return value?.trim() ? "" : "Last name is required";
      case "dateBirth":
        return value ? "" : "Date of birth is required";
      case "officeEmail":
        const emailRegex = /^[a-zA-Z0-9._-]+@(gmail\.com|cag\.gov\.in|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
        return value
          ? emailRegex.test(value)
            ? ""
            : "Enter a valid office email address"
          : "Office email is required";
      case "officePhone":
        const mobileRegex = /^\d{10}$/;
        return value
          ? mobileRegex.test(value)
            ? ""
            : "Enter valid 10-digit office phone number"
          : "Office phone is required";
      case "joiningDate":
        return value ? "" : "Joining date is required";
      default:
        return "";
    }
  };
  const handleSaveAndNext = async () => {
    
    if (!validateForm()) {
      toast.error("Please fill all the required fields.");
      return;
    }
  setIsLoading(true)
    try {
      
      const formattedData = {
        ...data,
        dateBirth: data.dateBirth ? dayjs(data.dateBirth, "DD-MM-YYYY").format("YYYY-MM-DD") : null,
        joiningDate: data.joiningDate ? dayjs(data.joiningDate, "DD-MM-YYYY").format("YYYY-MM-DD") : null,
        serviceEndDate: data.serviceEndDate ? dayjs(data.serviceEndDate, "DD-MM-YYYY").format("YYYY-MM-DD") : null,
      };
  
      const payload = { ...formattedData };
      console.log("Payload being sent:", payload); 
  
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
        const { EmployeeCode, EmployeeId } = response.data.data;
  
        useFormStore.getState().setEmployeeCode(EmployeeCode);
        useFormStore.getState().setEmployeeId(EmployeeId);
        updateFormData("basicDetails", { ...data, employeeId: EmployeeId });
  
        toast.success("Data saved successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
  
        setActiveTab('EMPLOYMENT_DETAILS');
      }
    } catch (error) {
      console.error("Error saving employee data:", error);
      let errorMessage = "Failed to save data. Please try again.";
      if (error.response && error.response.data && error.response.data.error_msg) {
        errorMessage = error.response.data.error_msg; 
      }
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    finally{
      setIsLoading(false)
    }
  };

  return (
    <>
    {isLoading && <PageLoader />}
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box >
        <ToastContainer /> 
        <Grid container spacing={2} sx={{mt:5}}>
          <Grid item xs={3} sx={{mb:2}}>
            <TextField
              fullWidth
              label={
                <>
                  First Name <span style={{ color: 'red' }}>*</span>
                </>
              }
              name="firstName"
              value={data.firstName}
              onChange={handleChange}
              InputProps={{ sx: { height: '50px' } }}
              InputLabelProps={{ shrink: true }} 
              error={!!errors.firstName} 
              helperText={errors.firstName}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField fullWidth 
              label="Middle Name"
              name="middleName"
              value={data.middleName}
              onChange={handleChange} 
              InputProps={{ sx: { height: '50px' } }}
              InputLabelProps={{ shrink: true }} 
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label={
                <>
                  Last Name <span style={{ color: 'red' }}>*</span>
                </>
              }
              name="lastName"
              value={data.lastName}
              onChange={handleChange}
              InputProps={{ sx: { height: '50px' } }}
              InputLabelProps={{ shrink: true }} 
              error={!!errors.lastName} // Add error state
              helperText={errors.lastName} // Display error message
            />
          </Grid>

          <Grid item xs={3}>
  <MobileDatePicker
    label={
      <>
        Date of Birth <span style={{ color: 'red' }}>*</span>
      </>
    }
    value={data.dateBirth && dayjs(data.dateBirth, "DD-MM-YYYY").isValid()
      ? dayjs(data.dateBirth, "DD-MM-YYYY")
      : null
    }
    onChange={(newValue) => handleDateChange('dateBirth', newValue)}
    format="DD-MM-YYYY"
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
          '& .MuiInputBase-root': {
            height: '50px', 
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


          <Grid item xs={3} sx={{mb:2}}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={data.email}
              onChange={handleChange}
              InputProps={{ sx: { height: '50px' } }}
              InputLabelProps={{ shrink: true }} 
            />
          </Grid>

          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Mobile"
              name="mobile"
              value={data.mobile}
              onChange={handleChange}
              InputProps={{ sx: { height: '50px' } }}
              InputLabelProps={{ shrink: true }} 
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label={
                <>
                  Office Email <span style={{ color: 'red' }}>*</span>
                </>
              }
              name="officeEmail"
              type="email"
              value={data.officeEmail}
              onChange={handleChange}
              InputProps={{ sx: { height: '50px' } }}
              InputLabelProps={{ shrink: true }} 
              error={!!errors.officeEmail} // Add error state
              helperText={errors.officeEmail} // Display error message
            />
          </Grid>

          <Grid item xs={3}>
            <TextField
              fullWidth
              label={
                <>
                  Office Phone <span style={{ color: 'red' }}>*</span>
                </>
              }
              name="officePhone"
              value={data.officePhone}
              onChange={handleChange}
              InputProps={{ sx: { height: '50px' } }}
              InputLabelProps={{ shrink: true }} 
              error={!!errors.officePhone} // Add error state
              helperText={errors.officePhone} // Display error message
            />
          </Grid>

          <Grid item xs={3}>
            <MobileDatePicker
              label={
                <>
                  Joining Date <span style={{ color: 'red' }}>*</span>
                </>
              }
              value={data.joiningDate && dayjs(data.joiningDate, "DD-MM-YYYY", true).isValid()
                ? dayjs(data.joiningDate, "DD-MM-YYYY")
                : null
              }
              onChange={(newValue) => handleDateChange('joiningDate', newValue)}
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
                    '& .MuiInputBase-root': {
                      height: '50px',
                    },
                  },
                  error: !!errors.joiningDate, // Add error state
                  helperText: errors.joiningDate, // Display error message
                },

              actionBar: {
        actions: [], // Removes both "OK" and "Clear" buttons
      },
    }}
    closeOnSelect={true}
            />
          </Grid>

          <Grid item xs={3}>
            <MobileDatePicker
              label="Service End Date"
              value={data.serviceEndDate && dayjs(data.serviceEndDate, "DD-MM-YYYY", true).isValid()
                ? dayjs(data.serviceEndDate, "DD-MM-YYYY")
                : null
              }
              onChange={(newValue) => handleDateChange('serviceEndDate', newValue)}
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
                    '& .MuiInputBase-root': {
                      height: '50px',
                    },
                  },
                },
                actionBar: {
                  actions: [], // Removes both "OK" and "Clear" buttons
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
          onChange={handleChange}
          InputProps={{
            sx: { height: '50px' },
            readOnly: !!data.employeeId, 
          }}
        />
      </Grid>


          <Box sx={{  mt: 5, ms:5 }}>
            <Typography sx={{ color: 'red' }}>
              *Note: If employee code is not entered, the system will generate it.
            </Typography>
          </Box>
        </Grid>

        {/* Save & Next Button */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAndNext}
          >
            {data.employeeId ? 'Update & Next'  :'Save & Next'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
    </>
  );
};

export default BasicDetails;