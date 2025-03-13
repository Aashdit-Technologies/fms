import React, { useState } from 'react';
import { Card, TextField, Button, Box, Typography, InputAdornment, IconButton } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { Grid } from '@mui/joy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from "react-router-dom";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PageLoader } from "../pageload/PageLoader";

const ChangePassword = () => {
  const location = useLocation();
  const changepasswordDetails = location.state?.changepassworddata || null;
  const token = useAuthStore.getState().token;
  const [formData, setFormData] = useState({
    userId: changepasswordDetails || '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isValidLength, setIsValidLength] = useState(false);
  const [hasLowerCase, setHasLowerCase] = useState(false);
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [isPasswordMatch, setIsPasswordMatch] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'newPassword') {
      setIsValidLength(value.length >= 8 && value.length <= 15);
      setHasLowerCase(/[a-z]/.test(value));
      setHasUpperCase(/[A-Z]/.test(value));
      setHasNumber(/\d/.test(value));
      setHasSpecialChar(/[@/'/#]/.test(value));
    }

    if (name === 'confirmPassword') {
      setIsPasswordMatch(formData.newPassword === value);
    }
  };

  const handleSubmit = async () => {
    if (
      isValidLength &&
      hasLowerCase &&
      hasUpperCase &&
      hasNumber &&
      hasSpecialChar &&
      isPasswordMatch
    ) {
      setIsLoading(true);

      const payload = {
        userName: formData.userId,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      };

      

      try {
        const response = await api.post('user/change/password',
        { dataObject: encryptPayload(payload) }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

        if (response.status === 200) {
          toast.success(response.data.message);
          navigate('/login'); 
        } else {
          toast.error('Failed to change password. Please try again.');
        }
      } catch (error) {
        toast.error('An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error('Validation failed. Please check the password requirements.');
    }
  };


  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box
    display={"flex"}
    flexDirection={'column'}
    alignItems={"center"}
      
      sx={{ backgroundColor: '#f0f2f5', mt:5  }}
    >
      <Card
        sx={{
          padding: 4,
          width: '1200px',
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: '#ffffff',
        }}
      >
        <Typography variant="h5" component="h1" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold', color: '#1976d2' }}>
          Change Password
        </Typography>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={3}>
          <Grid item xs={4}>
            <TextField
                fullWidth
                label="User Id"
                name="userId"
                variant="outlined"
                margin="normal"
                value={formData.userId}
                InputProps={{
                readOnly: true,
                sx: { 
                    height: '50px', 
                    borderRadius: '8px',
                    cursor: 'pointer', 
                },
                }}
                sx={{
                '& .MuiOutlinedInput-root.Mui-readOnly': {
                    cursor: 'pointer', 
                },
                }}
            />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type={showPassword ? 'text' : 'password'} 
                variant="outlined"
                margin="normal"
                value={formData.newPassword}
                onChange={handleInputChange}
                inputProps={{ maxLength: 15 }} 
                InputProps={{
                  sx: { height: '50px', borderRadius: '8px' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                variant="outlined"
                margin="normal"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                inputProps={{ maxLength: 15 }}
                InputProps={{
                  sx: { height: '50px', borderRadius: '8px' },
                }}
              />
            </Grid>
          </Grid>
        </Box>
        <Typography variant="body2" sx={{ mt: 5, mb: 3, color: '#666', textAlign: 'left' }}>
          <Box sx={{ mt: 1, lineHeight: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isValidLength ? <CheckCircleIcon fontSize="small" sx={{ color: 'green' }} /> : <CancelIcon fontSize="small" sx={{ color: 'red' }} />}
              <Typography variant="body2" sx={{ color: isValidLength ? 'green' : 'red' }}>
                Password must be between 8 - 15 characters.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {hasLowerCase ? <CheckCircleIcon fontSize="small" sx={{ color: 'green' }} /> : <CancelIcon fontSize="small" sx={{ color: 'red' }} />}
              <Typography variant="body2" sx={{ color: hasLowerCase ? 'green' : 'red' }}>
                Must have one lower case alphabet.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {hasUpperCase ? <CheckCircleIcon fontSize="small" sx={{ color: 'green' }} /> : <CancelIcon fontSize="small" sx={{ color: 'red' }} />}
              <Typography variant="body2" sx={{ color: hasUpperCase ? 'green' : 'red' }}>
                Must have one upper case alphabet.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {hasNumber ? <CheckCircleIcon fontSize="small" sx={{ color: 'green' }} /> : <CancelIcon fontSize="small" sx={{ color: 'red' }} />}
              <Typography variant="body2" sx={{ color: hasNumber ? 'green' : 'red' }}>
                Must have one number.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {hasSpecialChar ? <CheckCircleIcon fontSize="small" sx={{ color: 'green' }} /> : <CancelIcon fontSize="small" sx={{ color: 'red' }} />}
              <Typography variant="body2" sx={{ color: hasSpecialChar ? 'green' : 'red' }}>
                Must have one special sign (@/'/#).
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isPasswordMatch ? <CheckCircleIcon fontSize="small" sx={{ color: 'green' }} /> : <CancelIcon fontSize="small" sx={{ color: 'red' }} />}
              <Typography variant="body2" sx={{ color: isPasswordMatch ? 'green' : 'red' }}>
                Passwords must match.
              </Typography>
            </Box>
          </Box>
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#115293' },
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: '8px',
             
            }}
          >
            Change Password
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => navigate("/")}
            sx={{
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: '8px',
             
            }}
          >
            Cancle
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default ChangePassword;