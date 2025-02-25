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

const UploadLetter = ({ open, onClose,   dispatchData}) => {
  
  const correspondenceId = dispatchData?.length > 0 ? dispatchData[0].correspondenceId : null;
 
  const [formData, setFormData] = useState({
    letterNo: '',
    endingMemoNo: '',
    date: '',
    letterDocuments: null, 
  });

  
  
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
            toast.success(response.data.message);
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
};


  return (
<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Dialog Title */}
      <DialogTitle
        sx={{
          bgcolor: "#207785", 
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: "1.25rem",
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, py: 2 }}>
            {/* Letter No and Ending Memo No */}
            <Box sx={{ display: "flex", gap: 2 }}>
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
                    "& fieldset": { borderColor: "#207785" },
                    "&:hover fieldset": { borderColor: "#1a5f6a" }, 
                  },
                }}
                autoComplete="off"
                    inputProps={{
                      maxLength: 20,
                      pattern: "[^ ]*", 
                      onKeyDown: (e) => {
                        if (e.key === " ") {
                          e.preventDefault(); 
                        }
                      },
                    }}
              />
              <TextField
                fullWidth
                label="Ending Memo No"
                name="endingMemoNo"
                value={formData.endingMemoNo}
                onChange={handleInputChange}
               
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#207785" }, 
                    "&:hover fieldset": { borderColor: "#1a5f6a" },
                  },
                }}
                autoComplete="off"
                    inputProps={{
                      maxLength: 20,
                      pattern: "[^ ]*", 
                      onKeyDown: (e) => {
                        if (e.key === " ") {
                          e.preventDefault(); 
                        }
                      },
                    }}
              />
              
            </Box>

            {/* Date and File Upload */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                required
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#207785" }, 
                    "&:hover fieldset": { borderColor: "#1a5f6a" }, 
                  },
                }}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
                <Button
                  variant="contained"
                  component="label"
                  sx={{
                    bgcolor: "#207785", 
                    "&:hover": { bgcolor: "#1a5f6a" }, 
                  }}
                >
                  Select File *
                  <input
                    type="file"
                    accept=".pdf"
                    id="file"
                    hidden
                    onChange={handleFileChange}
                  />
                </Button>
                {formData.letterDocuments && (
                  <Box sx={{ ml: 1, color: "#1976d2", fontWeight: "medium" }}>
                    {formData.letterDocuments.name}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </form>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions sx={{ p: 2, bgcolor: "#f5f5f5" }}>
        <Button
          onClick={onClose}
          sx={{
            color: "#1976d2", 
            "&:hover": { bgcolor: "#e3f2fd" }, 
          }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveUpload}
          sx={{
            bgcolor: "#207785", 
            "&:hover": { bgcolor: "#1a5f6a" }, 
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>

  );
};

export default UploadLetter;
