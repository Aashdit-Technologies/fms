import React from "react";
import { Modal, Box, Typography, IconButton, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DataTable from "react-data-table-component";
import { FaDownload } from "react-icons/fa";
import { BorderAll } from "@mui/icons-material";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "100%", 
  maxWidth: "60%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  overflow: "auto", 
};

const headingStyle = {
  color: "black", 
  padding: "12px 16px", 
};

const tableCustomStyles = {
  table: {
    style: {
      borderRadius: "4px", 
    },
  },
  headRow: {
    style: {
      backgroundColor: "#7B1FA2", 
      color: "white", 
      fontWeight:600,
    },
  },
  headCells: {
    style: {
      border: "1px solid #ddd", 
      padding: "8px", 
    },
  },
  rows: {
    style: {
      fontSize: "14px", 
      color: "#333",
    },
  },
  cells: {
    style: {
      border: "1px solid #ddd", 
      padding: "8px", 
    },
  },
};

const handleDownload = (filePath, fileName) => {
  // Implement the download functionality here
  console.log(`Downloading ${fileName} from ${filePath}`);
};

const columns = [
  {
    name: "Correspondence Type",
    selector: (row) => row.corrType,
    sortable: true,
  },
  { name: "Draft Number", selector: (row) => row.draftNo, sortable: true },
  { name: "Added By", selector: (row) => row.addedBy, sortable: true },
  {
    name: "Modified Date",
    selector: (row) => row.modifiedDate,
    sortable: true,
  },
  { name: "Letter Number", selector: (row) => row.letterno, sortable: true },
  {
    name: "Action",
    cell: (row) => (
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleDownload(row.filePath, row.fileName)}
        title="Download"
      >
        <FaDownload />
      </Button>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  },
];

export const HistoryModal = ({ open, onClose, historyData }) => {
  const data = historyData?.data || [];
  const isValidHistoryData = Array.isArray(data) && data.length > 0;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" component="h2" gutterBottom sx={headingStyle}>
          View History
        </Typography>
        {isValidHistoryData ? (
          <DataTable
            columns={columns}
            data={data}
            pagination
            highlightOnHover
            customStyles={tableCustomStyles} 
            style={{ width: "100%" }} 
          />
        ) : (
          <Typography>No history data available.</Typography>
        )}
      </Box>
    </Modal>
  );
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
