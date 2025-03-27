
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Grid,
  IconButton,
  Typography,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { PageLoader } from "../pageload/PageLoader";
import { encryptPayload } from "../../utils/encrypt";
import { toast } from "react-toastify";
import useAuthStore from "../../store/Store";
import api from "../../Api/Api";

const EditProfile = ({ open, handleClose, data: initialData }) => {
  const [data, setData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    designation: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthStore.getState().token;

  useEffect(() => {
    if (initialData) {
      setData({
        userName: initialData.userName || "",
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        mobile: initialData.mobile || "",
        designation: initialData.designation || "",
      });
    }
  }, [initialData]);

  const validateField = (name, value) => {
    switch (name) {
      case "userName":
        return value?.trim() ? "" : "User name is required";

      case "firstName":
        return value?.trim() ? "" : "First name is required";

      case "lastName":
        return value?.trim() ? "" : "Last name is required";

      case "email":
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return value
          ? emailRegex.test(value)
            ? ""
            : "Enter a valid email address"
          : "Email is required";

      case "mobile":
        const mobileRegex = /^\d{10}$/;
        return value
          ? mobileRegex.test(value)
            ? ""
            : "Enter valid 10-digit mobile number"
          : "Mobile is required";

      case "designation":
        return value?.trim() ? "" : "Designation is required";

      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    const requiredFields = [
      "userName",
      "firstName",
      "lastName",
      "email",
      "mobile",
      "designation",
    ];

    requiredFields.forEach((field) => {
      const error = validateField(field, data[field]);
      if (error) {
        isValid = false;
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });

    // Validate the field as the user types or on blur
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSaveAndNext = async () => {
    if (!validateForm()) {
      toast.error("Please fill all the required fields correctly.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        userName: data.userName,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,
        designation: data.designation,
      };

      const encryptedPayload = encryptPayload(payload);

      const response = await api.post(
        "user/profile/update",
        { dataObject: encryptedPayload },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success(response.data.message);
        handleClose();
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <PageLoader />}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        {/* Header */}
        <DialogTitle
          sx={{
            backgroundColor: " #1a5f6a",
            color: "#fff",
            height: "60px",
            fontWeight: "bold",
            fontSize: "18px",
            padding: "10px 20px",
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 500, color: "#fff" }}>
              Edit Profile
            </Typography>
            <IconButton onClick={handleClose} sx={{ fontWeight: 500, color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />

        {/* Form Section */}
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label={
                  <>
                    User Name <span style={{ color: "red" }}>*</span>
                  </>
                }
                name="userName"
                value={data.userName}
                onChange={handleChange}
                autoComplete="off"
                inputProps={{ maxLength: 20, readOnly: true }}
                InputProps={{ sx: { height: "50px" } }}
                InputLabelProps={{ shrink: true }}
                error={!!errors.userName}
                helperText={errors.userName}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label={
                  <>
                    First Name <span style={{ color: "red" }}>*</span>
                  </>
                }
                name="firstName"
                value={data.firstName}
                // onChange={handleChange}
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

            <Grid item xs={6} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label={
                  <>
                    Last Name <span style={{ color: "red" }}>*</span>
                  </>
                }
                name="lastName"
                value={data.lastName}
                // onChange={handleChange}
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

            <Grid item xs={6}>
              <TextField
                fullWidth
                label={
                  <>
                    Email <span style={{ color: "red" }}>*</span>
                  </>
                }
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

            <Grid item xs={6}>
              <TextField
                fullWidth
                label={
                  <>
                    Mobile <span style={{ color: "red" }}>*</span>
                  </>
                }
                name="mobile"
                value={data.mobile}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value)) handleChange(e);
                }}
                onKeyDown={(e) => {
                  if (!/\d/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab") {
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

            <Grid item xs={6}>
              <TextField
                fullWidth
                label={
                  <>
                    Designation <span style={{ color: "red" }}>*</span>
                  </>
                }
                name="designation"
                value={data.designation}
                onChange={handleChange}
                autoComplete="off"
                inputProps={{ maxLength: 20 }}
                InputProps={{ sx: { height: "50px" } }}
                InputLabelProps={{ shrink: true }}
                error={!!errors.designation}
                helperText={errors.designation}
              />
            </Grid>
          </Grid>
        </DialogContent>

        {/* Footer */}
        <Divider />
        <DialogActions
          sx={{
            backgroundColor: "#F5F5F5",
            height: "50px",
            padding: "10px 20px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button variant="contained" onClick={handleSaveAndNext} sx={{
              backgroundColor: ' #1a5f6a',
              '&:hover': { backgroundColor: '#207785' },
              fontSize: '14px',
              fontWeight: 'bold',
              borderRadius: '8px',
             
            }}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditProfile;
