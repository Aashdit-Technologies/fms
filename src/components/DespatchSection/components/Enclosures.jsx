import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Tooltip, 
  IconButton,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

import {toast } from "react-toastify";
import api from "../../../Api/Api";
import useAuthStore from "../../../store/Store";
import { encryptPayload } from "../../../utils/encrypt";
import { PageLoader } from "../../pageload/PageLoader";
import CloseIcon from "@mui/icons-material/Close";
const Enclosures = ({ open, onClose, enclosures = [], fileName, filePath }) => {

  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadview = async (encloser) => {
    setIsLoading(true);
    try {
      const token = useAuthStore.getState().token;
    const payload = {
    documentName: encloser.fileName,
    documentPath: encloser.filePath,
    };
    
    const encryptedPayload = encryptPayload(payload);
    
    const response = await api.post(
    'download/download-document',
    { dataObject: encryptedPayload },
    {
    headers: {
    Authorization: `Bearer ${token}`,
    },
    responseType: 'blob', 
    }
    );
    debugger
    if (response.status === 200) {
   
    
    // Create a download link and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", encloser.fileName); 
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    
    }
    } catch (error) {
    console.error("Error downloading PDF:", error);
    toast.error("Failed to download PDF. Please try again.");
    }
    finally{
      setIsLoading(false);
    }
    };

  return (
    <>
     {isLoading && <PageLoader />}
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: '#207785',
          color: '#fff',
          fontWeight: 500,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
          fontSize: '18px',
          padding: "8px 16px",
          minHeight: "40px",
        }}
      >
        All Enclosures
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
    <CloseIcon />
  </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2, p: 2 }}>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table className='table table-bordered'>
            <TableHead >
              <TableRow sx={{ backgroundColor: '#f5f5f5',}}>
                <TableCell sx={{ width: '100px', fontWeight: 300, color: '#000', }}>Sl No.</TableCell>
                <TableCell sx={{ fontWeight: 300, color: '#000' }}>Enclosure Type</TableCell>
                <TableCell sx={{ fontWeight: 300, color: '#000' }}>Enclosure Name</TableCell>
                <TableCell sx={{ width: '100px', fontWeight: 300, color: '#000' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {enclosures.length > 0 ? (
    enclosures.map((enclosure, index) => (
      <TableRow key={index}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{enclosure.enclosuretype || 'N/A'}</TableCell>
        <TableCell>{enclosure.enclosureName || 'N/A'}</TableCell>
        <TableCell>
          <Tooltip title="Download Enclosure">
            <IconButton
              size="small"
              onClick={() => handleDownloadview(enclosure)}
              sx={{
                color: '#207785',
                bgcolor: 'rgba(32, 119, 133, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(32, 119, 133, 0.2)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out',
                padding: '8px',
                borderRadius: '8px',
              }}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={4} align="center">
        No data available
      </TableCell>
    </TableRow>
  )}
</TableBody>

          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" 
         sx={{
          backgroundColor: '#d32f2f',
          textTransform: 'none',
                '&:hover': {
            backgroundColor: '#c62828',
                },
              }}
           onClick={onClose}>
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default Enclosures;
