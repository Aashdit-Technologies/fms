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
const Enclosures = ({ open, onClose, enclosures = [] }) => {

  const handleDownload = (enclosure) => {
    if (enclosure.enclosurePath) {
      window.open(enclosure.enclosurePath, '_blank'); 
    } else {
      console.error('No valid path for download');
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
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '50px', fontWeight: 'bold' }}>#</TableCell>
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
                       <IconButton size="small"  onClick={() => handleDownload(enclosure)}
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
