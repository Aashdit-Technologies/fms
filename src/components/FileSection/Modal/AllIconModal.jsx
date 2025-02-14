import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  TablePagination,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FaDownload, FaMinus, FaPlus } from "react-icons/fa";
import useAuthStore from "../../../store/Store";
import { encryptPayload } from "../../../utils/encrypt";
import api from "../../../Api/Api";
import { useMutation } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";

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
      fontWeight: 600,
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

export const UploadModal = ({
  open,
  onClose,
  enclosuresData,
  corrId,
  allDetails,
  historyData,
  uploadData,
}) => {
  const token = sessionStorage.getItem("token");
  const data = Array.isArray(uploadData?.data.enclosureTypeList)
    ? uploadData?.data.enclosureTypeList
    : [];
  const enclosuredatas = Array.isArray(enclosuresData?.data)
    ? enclosuresData?.data
    : [];

  const [rows, setRows] = useState([
    { type: "", name: "", file: null, fileName: "" },
  ]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const mutation = useMutation({
    mutationFn: async (data) => {
      try {
        const formData = new FormData();
        formData.append(
          "dataObject",
          encryptPayload({
            fileId: allDetails.fileId,
            fileReceiptId: allDetails.fileReceiptId,
            correspondenceId: corrId,
          })
        );
        formData.append(
          "enclosureData",
          encryptPayload({
            enclosures: rows.map((row) => ({
              encTypeId: row.type,
              encName: row.name,
            })),
          })
        );
        data.enclosureDocuments.forEach((file) =>
          formData.append("enclosureDocuments", file)
        );
        await api.post(
          "/file/upload-file-correspondence-enclosures",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Upload successful!");
      } catch (error) {
        toast.error("Upload failed. Please try again.");
      }
    },
  });

  const handleSubmit = () => {
    if (
      rows.length === 0 ||
      rows.some((row) => !row.type || !row.name || !row.file)
    ) {
      toast.error("All fields are mandatory!");
      return;
    }
    mutation.mutate({ enclosureDocuments: rows.map((row) => row.file) });
  };

  const handleCancel = () => {
    setRows([{ type: "", name: "", file: null, fileName: "" }]);
    toast.info("Form reset");
  };

  const addRow = () => {
    if (rows.length >= 10) {
      toast.error("You can upload a maximum of 10 files.");
      return;
    }
    setRows([...rows, { type: "", name: "", file: null, fileName: "" }]);
  };

  const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));
  const handleChange = (index, field, value) =>
    setRows(
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
    const handleFileChange = (index, event) => {
      const file = event.target.files[0];
      console.log(file);
      
      if (file && file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed.");
        return;
      }
      if (file) {
        handleChange(index, "file", file);
        handleChange(index, "fileName", file.name);
        toast.success(`File uploaded: ${file.name}`);
      }
    };
    

  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        if (reason && reason === "backdropClick") {
          return;
        }
        onClose();
      }}
    >
      <Box
        sx={{
          width: "800px",
          padding: "20px",
          background: "#fff",
          borderRadius: "10px",
          margin: "auto",
          mt: "5vh",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Upload Enclosure</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box display="flex" justifyContent="flex-end" gap={1} mb={2}>
          <Button
            onClick={addRow}
            color="success"
            variant="contained"
            startIcon={<FaPlus />}
          >
            
          </Button>
          {rows.length > 1 && (
            <Button
              onClick={() => removeRow(rows.length - 1)}
              color="error"
              variant="contained"
              startIcon={<FaMinus />}
            >
              
            </Button>
          )}
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            maxHeight: 300,
            overflow: "auto",
            mt: 2,
            border: "1px solid #ccc",
            bgcolor: "#f5f5f5",
          }}
        >
          <Table sx={{ width: "100%" }}>
            <TableHead sx={{ position: "sticky", top: 0, bgcolor: "#0A3D62" , zIndex: 1 }}>
              <TableRow>
                <TableCell
                  style={{
                    fontWeight: "bold",
                    color: "#fff",
                    borderRight: "1px solid #ddd",
                  }}
                >
                  Type *
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: "bold",
                    color: "#fff",
                    borderRight: "1px solid #ddd",
                  }}
                >
                  Name *
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: "bold",
                    color: "#fff",
                    borderRight: "1px solid #ddd",
                  }}
                >
                  File *
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <FormControl fullWidth>
                      <TextField
                        select
                        style={{ width: "190px" }}
                        variant="outlined"
                        label="Enclosure Type"
                        value={row.type}
                        onChange={(e) =>
                          handleChange(index, "type", e.target.value)
                        }
                      >
                        {data.map((opt) => (
                          <MenuItem key={opt.id} value={opt.id}>
                            {opt.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth>
                      <TextField
                        variant="outlined"
                        label="Name"
                        fullWidth
                        value={row.name}
                        onChange={(e) =>
                          handleChange(index, "name", e.target.value)
                        }
                      />
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ backgroundColor: "primary" }}
                      component="label"
                    >
                      Choose File
                      <input
                        type="file"
                        hidden
                        onChange={(e) => handleFileChange(index, e)}
                      />
                    </Button>
                      {/* {row.fileName && <Typography variant="body2" color="textSecondary">{row.fileName}</Typography>} */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={2} display="flex" justifyContent="center" gap={2}>
          <Button variant="contained" color="success" onClick={handleSubmit}>
            Save
          </Button>
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            maxHeight: 300,
            overflow: "auto",
            mt: 2,
            border: "1px solid #ccc",
            borderRadius: "4px",
            bgcolor: "#f9f9f9",
          }}
        >
          <Table>
            <TableHead sx={{position: "sticky", top: 0, bgcolor: "#0A3D62" , zIndex: 1 }}>
              <TableRow>
                <TableCell
                  style={{
                    fontWeight: "bold",
                    color: "#fff",
                    borderRight: "1px solid #ddd",
                  }}
                >
                  Type
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: "bold",
                    color: "#fff",
                    borderRight: "1px solid #ddd",
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: "bold",
                    color: "#fff",
                    borderRight: "1px solid #ddd",
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enclosuredatas
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((enc, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{enc.enclosuretype}</TableCell>
                    <TableCell>{enc.enclosureName}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<FaDownload style={{margin: "0 !important"}}/>}
                        sx={{
                          fontWeight: "light",
                        }}
                      ></Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5]}
            component="div"
            count={enclosuredatas.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
          />
        </TableContainer>
      </Box>
    </Modal>
  );
};
