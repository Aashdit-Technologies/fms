import React from "react";
import { Modal, Box, Typography } from "@mui/material";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export const UploadModal = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose}>
    <Box sx={modalStyle}>
      <Typography variant="h6" component="h2">
        Upload Encloser
      </Typography>
      {/* Add upload form or content here */}
    </Box>
  </Modal>
);

export const HistoryModal = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose}>
    <Box sx={modalStyle}>
      <Typography variant="h6" component="h2">
        View History
      </Typography>
      {/* Add history content here */}
    </Box>
  </Modal>
);