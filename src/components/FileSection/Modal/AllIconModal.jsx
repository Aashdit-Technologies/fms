import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  

  const token =
    useAuthStore((state) => state.token) || sessionStorage.getItem("token");
  const data = Array.isArray(uploadData?.data.enclosureTypeList)
    ? uploadData?.data.enclosureTypeList
    : [];
  const enclosuredatas = Array.isArray(enclosuresData?.data)
    ? enclosuresData?.data
    : [];
    console.log("dddd Modal Data:", {
      enclosuredatas,
    });
  const [rows, setRows] = useState([
    { type: "", name: "", file: null, fileName: "" },
  ]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      try {
        console.log("Mutation function triggered with data:", data);

        const encryptedDataObject = encryptPayload({
          fileId: allDetails.fileId,
          fileReceiptId: allDetails.fileReceiptId,
          correspondenceId: corrId,
        });

        const enclosureDatass = encryptPayload({
          enclosures: rows.map((row) => ({
            encTypeId: row.type,
            encName: row.name,
          })),
        });

        const formData = new FormData();
        formData.append("dataObject", encryptedDataObject);
        formData.append("enclosureData", enclosureDatass);

        data.enclosureDocuments.forEach((file, index) => {
          formData.append("enclosureDocuments", file);
        });

        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }

        const response = await api.post(
          "/file/upload-file-correspondence-enclosures",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("API Response:", response);
      } catch (error) {
        console.error("API request failed:", error);
        if (error.response?.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        throw error;
      }
    },
  });

  const handleSubmit = () => {
    if (
      rows.length === 0 ||
      rows.some((row) => !row.type || !row.name || !row.file)
    ) {
      toast.error("Please fill in all required fields before submitting.");
      return;
    }

    // Prepare data
    const requestData = {
      enclosureDocuments: rows.map((row) => row.file),
    };

    console.log("Submitting Data:", requestData);

    mutation.mutate(requestData);
  };

  const handleCancel = () => {
    setRows([{ type: "", name: "", file: null, fileName: "" }]);
    toast.info("Form reset");
  };

  const addRow = () =>
    setRows([...rows, { type: "", name: "", file: null, fileName: "" }]);
  const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));

  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleFileChange = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      handleChange(index, "file", file);
      handleChange(index, "fileName", file.name);
    }
  };

  // const handleDownload = (filePath, fileName) => {
  //   const link = document.createElement("a");
  //   link.href = filePath;
  //   link.download = fileName;
  //   link.click();
  // };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Upload Enclosure</Typography>
          <Box>
            <Button
              onClick={addRow}
              color="success"
              variant="contained"
              className="mx-2"
            >
              <FaPlus />
            </Button>
            {rows.length > 1 && (
              <Button
                onClick={() => removeRow(rows.length - 1)}
                color="error"
                variant="contained"
              >
                <FaMinus />
              </Button>
            )}
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{ color: "grey", ml: 1 }}
              variant="contained"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="upload table">
            <TableHead>
              <TableRow>
                <TableCell>Enclosure Type *</TableCell>
                <TableCell>Enclosure Name *</TableCell>
                <TableCell>File *</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <FormControl fullWidth>
                      <InputLabel>Enclosure Type</InputLabel>
                      <Select
                        value={row.type}
                        onChange={(e) =>
                          handleChange(index, "type", e.target.value)
                        }
                        required
                      >
                        {data.map((option, idx) => (
                          <MenuItem key={idx} value={option.id}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      label="Enclosure Name"
                      value={row.name}
                      onChange={(e) =>
                        handleChange(index, "name", e.target.value)
                      }
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="contained" component="label">
                      Choose File
                      <input
                        type="file"
                        hidden
                        onChange={(e) => handleFileChange(index, e)}
                      />
                    </Button>
                    {row.fileName && <Typography>{row.fileName}</Typography>}
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
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="enclosures table">
            <TableHead>
              <TableRow>
                <TableCell>Enclosure Type</TableCell>
                <TableCell>Enclosure Name</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enclosuredatas.map((enc, idx) => (
                <TableRow key={idx}>
                  <TableCell >{enc.enclosuretype}</TableCell>
                  <TableCell >{enc.enclosureName}</TableCell>
                  <TableCell >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleDownload(enc.filePath, enc.fileName)}
                      title="Download"
                    >
                      <FaDownload />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Modal>
  );
};
