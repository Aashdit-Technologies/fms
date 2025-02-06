import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';

const LetterDetail = ({ open, onClose, letterData ,letterDataView}) => {
 

  const [isNonUrgent, setIsNonUrgent] = useState(false);
  const [isNonConfidential, setIsNonConfidential] = useState(false);
  const handleToggleChange = (setter) => (event) => {
    setter(event.target.checked);
  };

  // Show all details only for NEW_LETTER tab
  const showAllDetails = letterData?.tabCode === 'NEW_LETTER';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6">Letter Detail</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
          {/* Top Left: Letter Details */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 3 }}>
              Letter Details
            </Typography>
            <Box sx={{ display: 'grid', gap: 2, mb: 3}}>
              <Typography>Letter Number: {letterDataView?.letterNo || 'NA'}</Typography>
              <Typography>Sender Date: {letterData?.senderDate || 'NA'}</Typography>
              <Typography>Sender: {letterData?.sender || 'NA'}</Typography>
              <Typography>Addressee: {letterData?.addressee|| 'NA'}</Typography>
              <Typography>Subject: {letterData?.subject || 'NA'}</Typography>
            </Box>

          
            {showAllDetails && (
              <>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Marginal Instructions
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={letterData?.marginalInstructions || ''}
                  disabled
                  variant="outlined"
                  size="small"
                  sx={{ mb: 3 }}
                />
              </>
            )}

        
            {showAllDetails && (
              <>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Frequently Mark
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell>#</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Office</TableCell>
                        <TableCell>Designation</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {letterData?.frequentlyMark?.map((mark, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{mark.name}</TableCell>
                          <TableCell>{mark.department}</TableCell>
                          <TableCell>{mark.office}</TableCell>
                          <TableCell>{mark.designation}</TableCell>
                          <TableCell>{mark.action}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

          
            {showAllDetails && (
              <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isNonUrgent}
                      onChange={handleToggleChange(setIsNonUrgent)}
                    />
                  }
                  label="Non-Urgent"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={isNonConfidential}
                      onChange={handleToggleChange(setIsNonConfidential)}
                    />
                  }
                  label="Non-Confidential"
                />
              </Box>
            )}

          
            {showAllDetails && (
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button variant="contained" color="primary">
                  Save
                </Button>
                <Button variant="contained" color="secondary">
                  Send
                </Button>
                <Button variant="contained" color="success">
                  Add to File
                </Button>
                <Button variant="outlined" color="error">
                  Cancel
                </Button>
              </Box>
            )}
          </Box>

          {/* Top Right: PDF View */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1">PDF View</Typography>
            <Box
              sx={{
                width: '100%',
                height: 300,
                bgcolor: '#e0e0e0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" color="textSecondary">
                PDF content will be displayed here
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<DownloadIcon />}>
              Download PDF
            </Button>
          </Box>
        </Box>

        {/* Bottom Section */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 3 }}>
          {/* Bottom Left: Note */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Note
            </Typography>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              {letterData?.notes?.map((note, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Action taken by: {note.actionTakenBy}</Typography>
                  <Typography>Action: {note.action}</Typography>
                  <Typography variant="caption">Date: {note.date}</Typography>
                  <Typography>Note: {note.note}</Typography>
                  {index < letterData.notes.length - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Bottom Right: All Enclosures */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              All Enclosures
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>#</TableCell>
                    <TableCell>Enclosure Name</TableCell>
                    <TableCell>Enclosure Type</TableCell>
                    <TableCell>Added By</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {letterData?.enclosures?.map((enclosure, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{enclosure.name}</TableCell>
                      <TableCell>{enclosure.type}</TableCell>
                      <TableCell>{enclosure.addedBy}</TableCell>
                      <TableCell>{enclosure.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LetterDetail;
