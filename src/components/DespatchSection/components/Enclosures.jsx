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
} from '@mui/material';

const Enclosures = ({ open, onClose, enclosures = [] }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
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
                  <TableCell>{enclosure.type}</TableCell>
                  <TableCell>{enclosure.name}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => console.log('Download:', enclosure)}
                    >
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {enclosures.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">No enclosures found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="warning"
            onClick={onClose}
          >
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default Enclosures;
