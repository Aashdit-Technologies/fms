import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import useAuthStore from "../../../store/Store";
import { encryptPayload } from "../../../utils/encrypt";
import api from '../../../Api/Api';
import {toast } from "react-toastify";
import { PageLoader } from "../../pageload/PageLoader";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, MobileDatePicker } from "@mui/x-date-pickers";
import { CalendarToday, AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
import { Grid } from '@mui/joy';
const UploadLetter = ({ open, onClose,   dispatchData,fetchLetters}) => {
  debugger
  const correspondenceId = dispatchData != null ? dispatchData.correspondenceId : null;


  const [formData, setFormData] = useState({
    letterNo: '',
    endingMemoNo: '',
    date: '',
    letterDocuments: null, 
  });

  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!open) {
      setFormData({ letterNo: '', endingMemoNo: '', date: '',  letterDocuments: null });
    }
  }, [open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      toast.error("No file selected.");
        return;
    }
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      return;
    }
    setFormData((prevData) => ({
        ...prevData,
        letterDocuments: file,
    }));
};

const validateForm = () => {
  const { letterNo, date, letterDocuments } = formData;


  if (!letterNo || !date || !letterDocuments) {
    toast.error("Please fill all required fields.");
    return false;
  }

  
  if (letterDocuments && letterDocuments.type !== "application/pdf") {
    toast.error("Only PDF files are allowed.");
    return false;
  }

  return true; 
};

  const handleSaveUpload = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      const token = useAuthStore.getState().token;
      if (!formData.letterDocuments || !(formData.letterDocuments instanceof File)) {
        toast.error("Invalid file. Please select a valid document.");
        console.error("Invalid file:", formData.letterDocuments);
        return;
    }
    
        const payload = {
            correspondenceId,
            letterNo: formData.letterNo,
            memoNo: formData.endingMemoNo,
            senderDate: formData.date,
        };

        const formDataToSend = new FormData();

        formDataToSend.append("dataObject", encryptPayload(payload));
        formDataToSend.append("letterDocuments", formData.letterDocuments);
        
        
        const response = await api.post("dispatch/upload-letter",
           formDataToSend, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type":"multipart/form-data"
            },
        });
        if (response.status === 200) {
          if(response.data.outcome){
            await fetchLetters('NEW_LETTER');
            toast.success(response.data.data);
            onClose();
          }else{
            toast.error(response.data.data);
          }
        } else {
          toast.error("Response is coming from backend " + response.status);
        } 
    } catch (error) {
        console.error("Upload failed:", error);
        toast.error(error.response?.data?.message || "Failed to save data.");
    } 
    finally{
      setIsLoading(false);
    }
};


  return (
    <>
     {isLoading && <PageLoader />}
     <LocalizationProvider dateAdapter={AdapterDayjs}>
     <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Dialog Title */}
      <DialogTitle
         sx={{ 
          backgroundColor: "#207785", 
          color: "#fff",             
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          height: "60px",              
          fontWeight: "bold",
          fontSize: "1.2rem",
          padding: "10px 20px"         
        }}
      >
        Upload Letter
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ mt: 2 }}>
        <form>
          <Box>
          <Grid container spacing={2} >
          <Grid item xs={6} sx={{ mb: 2 }}>
              <TextField
                required
                fullWidth
                label="Letter No"
                name="letterNo"
                value={formData.letterNo}
                onChange={handleInputChange}
                InputLabelProps={{
                  sx: {
                    
                    '& .MuiFormLabel-asterisk': {
                      color: 'red',
                    },
                  },
                }}
                sx={{
                 
                  "& .MuiOutlinedInput-root": {
                    height: "50px",
                    "& fieldset": { borderColor: "#207785" },
                    "&:hover fieldset": { borderColor: "#1a5f6a" }, 
                  },
                }}
                autoComplete="off"
                inputProps={{
                  maxLength: 20,
                  pattern: "[0-9]*", 
                  inputMode: "numeric", 
                  onKeyDown: (e) => {
                    if (!/^[0-9]$/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete") {
                      e.preventDefault(); 
                    }
                  },
                }}
              />
              </Grid>
              <Grid item xs={6} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Ending Memo No"
                name="endingMemoNo"
                value={formData.endingMemoNo}
                onChange={handleInputChange}
               
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "50px",
                    "& fieldset": { borderColor: "#207785" }, 
                    "&:hover fieldset": { borderColor: "#1a5f6a" },
                  },
                }}
                autoComplete="off"
                inputProps={{
                  maxLength: 20,
                  pattern: "[0-9]*",
                  inputMode: "numeric",
                  onKeyDown: (e) => {
                    if (!/^[0-9]$/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete") {
                      e.preventDefault(); 
                    }
                  },
                }}
              />
              
              </Grid>
              <Grid item xs={6} sx={{ mb: 2 }}>
                  <MobileDatePicker
                    label={
                      <>
                        Date <span style={{ color: "red" }}>*</span>
                      </>
                    }
                    value={formData.date || null}
                    onChange={(newValue) =>
                      handleInputChange({ target: { name: "date", value: newValue } })
                    }
                    disableCloseOnSelect
                    format="YYYY-MM-DD"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        
                        InputLabelProps: {
                          shrink: true,
                          
                        },
                        InputProps: {
                          endAdornment: <CalendarToday color="action" />,
                        },
                        sx: {
                          "& .MuiInputBase-root": {
                            height: "50px",
                          },
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": { borderColor: "#207785" },
                            "&:hover fieldset": { borderColor: "#1a5f6a" },
                          },
                        },
                      },
                      actionBar: { actions: [] },
                    }}
                    closeOnSelect={true}
                  />
                </Grid>

              <Grid item xs={6} sx={{ mb: 2 }}>
              <TextField
              label={
                <>
                letter Document <span style={{color:"red"}}>*</span>
                </>
              }
                type="file"
                accept=".pdf"
                id="file"
                onChange={handleFileChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  style: {
                    cursor: "pointer",
                    padding: "10px",
                  },
                }}
                sx={{
                  width: "420px",
                  "& .MuiOutlinedInput-root": {
                    height: "50px",
                    bgcolor: "#f9f9f9",
                    borderRadius: "4px",
                  },
                }}
              />   
            </Grid>
        </Grid>
          </Box>
         
        </form>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions>
        <Button
          onClick={onClose}
          sx={{ 
            backgroundColor: "#F5F5F5", 
            height: "10px",            // Set footer height
            padding: "10px 20px",
            display: "flex",
            justifyContent: "flex-end" // Align button to the right
          }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveUpload}
          sx={{
            textTransform: 'none',
            bgcolor: "#207785", 
            "&:hover": { bgcolor: "#1a5f6a" }, 
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
    </LocalizationProvider>
    </>
  );
};

export default UploadLetter;


