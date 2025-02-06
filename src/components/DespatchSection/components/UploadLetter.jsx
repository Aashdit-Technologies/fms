import React, { useState } from 'react';
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

const UploadLetter = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    letterNo: '',
    endingMemoNo: '',
    date: '',
    file: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      file
    }));
  };

  const handleSubmit = () => {
    console.log('Form Data:', formData);
    // Add your submit logic here
    onClose();
  };

  const handleReset = () => {
    setFormData({
      letterNo: '',
      endingMemoNo: '',
      date: '',
      file: null,
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle 
        sx={{ 
          bgcolor: '#2196f3', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        Upload Letter
        <IconButton 
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              required
              fullWidth
              label="Letter No"
              name="letterNo"
              value={formData.letterNo}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="Ending Memo No"
              name="endingMemoNo"
              value={formData.endingMemoNo}
              onChange={handleInputChange}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              required
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
              <Button
                variant="contained"
                component="label"
              >
                Select File *
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              {formData.file && (
                <Box sx={{ ml: 1 }}>
                  {formData.file.name}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>
          Close
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          sx={{ mx: 1 }}
        >
          Save
        </Button>
        <Button 
          variant="contained"
          color="warning"
          onClick={handleReset}
        >
          Reset
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadLetter;
