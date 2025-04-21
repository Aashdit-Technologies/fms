import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  IconButton,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DetailItem = ({ label, value }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" sx={{ color:'#000' , fontWeight: 'bold' }}>
      {label}
    </Typography>
   
    <Typography variant="body1" sx={{ mt: 0.5 ,color: 'text.secondary', fontWeight: 'bold'}} style={{fontSize:"14px"}}>
      {value || 'NA'}
    </Typography>
    
  </Box>
);

const FileCustodianModal = ({ open, onClose, fileDetails }) => {

  const getDetailValue = (value) => value || 'NA';
console.log("FileCustodianModal fileDetails:", fileDetails);
const alldetails= fileDetails?.data || {};

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: '#1a5f6a',
        borderBottom: '1px solid #e0e0e0',
        py: 2,
        px: 3,
        height: '60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography sx={{color: '#fff', fontSize: '18px'}}>
          File Details
        </Typography>
        <IconButton 
          onClick={onClose}
          sx={{
            color: '#fff',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {alldetails && (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
            gap: 3 
          }}>
            <DetailItem label="File Number" value={getDetailValue(alldetails.fileNo)} />
            <DetailItem label="File Type" value={getDetailValue(alldetails.fileType)} />
            <DetailItem label="File Name" value={getDetailValue(alldetails.fileName)} />
            <DetailItem label="Subject" value={getDetailValue(alldetails.subject)} />
            <DetailItem label="Title" value={getDetailValue(alldetails.title)} />
            <DetailItem label="Client" value={getDetailValue(alldetails.client)} />
            <DetailItem label="Project" value={getDetailValue(alldetails.project)} />
            <DetailItem label="Work" value={getDetailValue(alldetails.work)} />
            <DetailItem label="Activity" value={getDetailValue(alldetails.activity)} />
            <DetailItem label="Custodian" value={getDetailValue(alldetails.custodian)} />
            <DetailItem label="Room Number" value={getDetailValue(alldetails.roomNumber)} />
            <DetailItem label="Rack Number" value={getDetailValue(alldetails.rackNumber)} />
            <DetailItem label="Cell Number" value={getDetailValue(alldetails.cellNumber)} />
            <DetailItem label="Created By" value={getDetailValue(alldetails.createdBy)} />
            <DetailItem label="Created Date" value={getDetailValue(alldetails.createdDate)} />
          </Box>
        )}
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          color='error' 
          sx={{
            fontWeight: 'bold',
            borderRadius: '8px',
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileCustodianModal;