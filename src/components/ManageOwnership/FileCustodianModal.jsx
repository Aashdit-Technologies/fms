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
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DetailItem = ({ label, value }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ mt: 0.5 }}>
      {value || '-'}
    </Typography>
  </Box>
);

const FileCustodianModal = ({ open, onClose, fileDetails }) => {
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
        <Typography sx={{color: '#fff',fontSize: '18px'}}>
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
        {fileDetails && (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
            gap: 3 
          }}>
            <DetailItem label="File Number" value={fileDetails.fileNumber} />
            <DetailItem label="File Type" value={fileDetails.fileType} />
            <DetailItem label="File Name" value={fileDetails.fileName} />
            <DetailItem label="Subject" value={fileDetails.subject} />
            <DetailItem label="Title" value={fileDetails.title} />
            <DetailItem label="Client" value={fileDetails.client} />
            <DetailItem label="Project" value={fileDetails.project} />
            <DetailItem label="Work" value={fileDetails.work} />
            <DetailItem label="Activity" value={fileDetails.activity} />
            <DetailItem label="Custodian" value={fileDetails.custodian} />
            <DetailItem label="Room Number" value={fileDetails.roomNumber} />
            <DetailItem label="Rack Number" value={fileDetails.rackNumber} />
            <DetailItem label="Cell Number" value={fileDetails.cellNumber} />
            <DetailItem label="Created By" value={fileDetails.createdBy} />
            <DetailItem label="Created Date" value={fileDetails.createdDate} />
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
        }}>
        
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileCustodianModal;