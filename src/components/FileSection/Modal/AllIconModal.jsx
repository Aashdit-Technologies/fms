import React from "react";
import { Modal, Box, Typography, IconButton, Button } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import DataTable from 'react-data-table-component';

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export const UploadModal = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose}>
    <Box sx={modalStyle}>
      <Typography variant="h6" component="h2" gutterBottom>
        Upload Encloser
      </Typography>
      {/* Add upload form or content here */}
    </Box>
  </Modal>
);

const handleDownload = (filePath, fileName) => {
  // Implement the download functionality here
  console.log(`Downloading ${fileName} from ${filePath}`);
};

const columns = [
  { name: 'Correspondence Type', selector: row => row.corrType, sortable: true },
  { name: 'Draft Number', selector: row => row.draftNo, sortable: true },
  { name: 'Added By', selector: row => row.addedBy, sortable: true },
  { name: 'Modified Date', selector: row => row.modifiedDate, sortable: true },
  { name: 'Letter Number', selector: row => row.letterno, sortable: true },
  {
    name: 'Action',
    cell: row => <Button variant="contained" color="primary" onClick={() => handleDownload(row.filePath, row.fileName)}>Download</Button>,
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  },
];

export const HistoryModal = ({ open, onClose, historyData }) => {
  const data = historyData.data;
  const isValidHistoryData = Array.isArray(data) && data.length > 0;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
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
        <Typography variant="h6" component="h2" gutterBottom>
          View History
        </Typography>
        {isValidHistoryData ? (
          <DataTable
            columns={columns}
            data={data}
            pagination
            highlightOnHover
          />
        ) : (
          <Typography>No history data available.</Typography>
        )}
      </Box>
    </Modal>
  );
};