import React from "react";
import { Modal, Box, Typography } from "@mui/material";
import DataTable from 'react-data-table-component';

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  borderRadius: 8,
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

export const HistoryModal = ({ open, onClose, historyData  }) => {
  console.log("History Data:", historyData.data);
  
  const isValidHistoryData = Array.isArray(historyData.data) && historyData.data.length > 0;
  console.log("isValidHistoryData:", isValidHistoryData);
  

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2" gutterBottom>
          View History
        </Typography>
        {isValidHistoryData ? (
          <DataTable
            columns={columns}
            data={historyData}
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
