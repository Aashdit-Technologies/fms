import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Grid, InputAdornment, Typography } from '@mui/material';
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

const BasicDetails = () => {
  const { updateFormData, setActiveTab, formData, activeTab } = useFormStore();

  const [data, setData] = useState({
    employeeId: null,
    user: null,
    serviceStatus: null,
    staffCode: null,
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    joiningDate: "",
    dateBirth: "",  
    mobile: "",
    officeEmail: "",
    serviceEndDate: "",
    officePhone: "",
  });

  const token = useAuthStore.getState().token;

  useEffect(() => {
    if (activeTab === 0) {
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
  
const fetchEmployeeData = async (employeeId) => {
  try {
    const response = await api.get(
      "governance/get-employee-details-by-empid-tabcode",
      {
        params: { employeeId, tabCode: 1 },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      const employeeData = response.data.data;
      console.log("Fetched Basic Details:", employeeData);

     
      setData({
        employeeId: employeeData.EmployeeId, 
        user: employeeData.user,
        serviceStatus: employeeData.serviceStatus,
        staffCode: employeeData.staffCode,
        firstName: employeeData.FirstName,
        middleName: employeeData.MiddleName,
        lastName: employeeData.LastName,
        email: employeeData.Email,
        joiningDate: employeeData.JoiningDate ? dayjs(employeeData.JoiningDate, "DD-MM-YYYY") : null,
        dateBirth: employeeData.dateBirth ? dayjs(employeeData.dateBirth, "DD-MM-YYYY") : null, 
        mobile: employeeData.Mobile,
        officeEmail: employeeData.OfficialEmail, 
        serviceEndDate: employeeData.ServiceEndDate ? dayjs(employeeData.ServiceEndDate, "DD-MM-YYYY") : null,
        officePhone: employeeData.OfficialPhone,
      });

     
      updateFormData("basicDetails", employeeData);
    }
  } catch (error) {
    console.error("Error fetching employee data:", error);
    toast.error("Failed to fetch employee data. Please try again.", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
};
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleDateChange = (field, newValue) => {
    if (newValue) {
      setData((prevData) => ({
        ...prevData,
        [field]: newValue.format("YYYY-MM-DD"),
      }));
    }
  };
  
const handleSaveAndNext = async () => {
  try {
    const payload = { ...data };
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

      setActiveTab(1);
    }
  } catch (error) {
    console.error("Error saving employee data:", error);
    toast.error("Failed to save data. Please try again.", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
};


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <ToastContainer /> 
        <Grid container spacing={2}>
          {/* First Row */}
          <Grid item xs={3}>
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
            />
          </Grid>
          <Grid item xs={3}>
            <TextField fullWidth label="Middle Name" name="middleName" value={data.middleName} onChange={handleChange} InputProps={{ sx: { height: '50px' } }}/>
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
            />
          </Grid>

          {/* Second Row */}
          <Grid item xs={3}>
  <MobileDatePicker
    label={
      <>
        Date of Birth <span style={{ color: 'red' }}>*</span>
      </>
    }
    value={data.dateBirth  && dayjs(data.dateBirth).isValid() ? dayjs(data.dateBirth) : null}
    onChange={(newValue) => handleDateChange('dateBirth', newValue)}
    
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
            height: '50px', // Adjust height as needed
          },
        },
      },
    }}
  />
</Grid>

          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={data.email}
              onChange={handleChange}
              InputProps={{ sx: { height: '50px' } }}
            />
          </Grid>

          {/* Third Row */}
        
          <Grid item xs={3}>
            <TextField
              fullWidth
              label={
                <>
                  Mobile <span style={{ color: 'red' }}>*</span>
                </>
              }
              name="mobile"
              type="number"
              value={data.mobile}
              onChange={handleChange}
              InputProps={{ sx: { height: '50px' } }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label=" Office Email"
            
              name="officeEmail"
              type="email"
              value={data.officeEmail}
              onChange={handleChange}
              InputProps={{ sx: { height: '50px' } }}
            />
          </Grid>

          {/* Fourth Row */}
          <Grid item xs={3}>
            <TextField fullWidth label="Office Phone" name="officePhone" value={data.officePhone} onChange={handleChange} InputProps={{ sx: { height: '50px' } }}/>
          </Grid>

          <Grid item xs={3}>
          <MobileDatePicker
              label="Joining Date"
              value={data.joiningDate && dayjs(data.joiningDate).isValid() ? dayjs(data.joiningDate) : null}
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
                      height: '50px', // Adjust height as needed
                    },
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <MobileDatePicker
              label={
                <>
                  Service End Date <span style={{ color: 'red' }}>*</span>
                </>
              }
              value={data.serviceEndDate  &&  dayjs(data.serviceEndDate).isValid()  ? dayjs(data.serviceEndDate) : null}
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
                      height: '50px', // Adjust height as needed
                    },
                  },
                },
              }}
            />
          </Grid>
        </Grid>

        {/* Save & Next Button */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAndNext}
          >
            Save & Next
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default BasicDetails;