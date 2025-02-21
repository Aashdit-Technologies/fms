import React from 'react';
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import {toast } from "react-toastify";
import api from "../../../Api/Api";
import useAuthStore from "../../../store/Store";
import { encryptPayload } from "../../../utils/encrypt";
const Enclosures = ({ open, onClose, enclosures = [], fileName, filePath }) => {

  console.log( "fileName props",  fileName)
  console.log( "filePath props",filePath)
  
const token = useAuthStore.getState().token;

  const handleDownloadview = async (encloser) => {
    try {
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
    
    if (response.status === 200) {
    console.log('Full PDF Response:', response.data);
    
    // Create a download link and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${fileName}`); 
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    
    }
    } catch (error) {
    console.error("Error downloading PDF:", error);
    alert("Failed to download PDF. Please try again.");
    }
    };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: '#f5f5f5',
          color: '#000',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        All Enclosures
      </DialogTitle>
      <DialogContent sx={{ mt: 2, p: 2 }}>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table className='table table-bordered'>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '50px', fontWeight: 'bold' }}>SI NO</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Enclosure Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Enclosure Name</TableCell>
                <TableCell sx={{ width: '100px', fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                {enclosures.map((enclosure, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{enclosure.enclosuretype || 'N/A'}</TableCell>
                    <TableCell>{enclosure.enclosureName}</TableCell>
                    <TableCell>
                      <Tooltip title="View Enclosure">
                       <IconButton size="small"  onClick={() =>handleDownloadview(enclosure)}
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
                          }}>
                            <VisibilityIcon/>
                          </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="warning" onClick={onClose}>
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default Enclosures;
