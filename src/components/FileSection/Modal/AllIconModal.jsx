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
import { FaEye, FaMinus, FaPlus } from "react-icons/fa";
import useAuthStore from "../../../store/Store";
import { encryptPayload } from "../../../utils/encrypt";
import api from "../../../Api/Api";
import { useMutation } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { FaDownload } from "react-icons/fa6";
import { PageLoader } from "../../pageload/PageLoader";

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
      backgroundColor: "#207785",
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

export const HistoryModal = ({ open, onClose, historyData }) => {
  // console.log("History Data:", historyData);
  // console.log("Correspondence Data:", correspondence.data);
  const [loading, setLoading] = useState(false);
  const data = historyData?.data || [];
  const isValidHistoryData = Array.isArray(data) && data.length > 0;
  const token =
    useAuthStore((state) => state.token) || sessionStorage.getItem("token");
  const handleDownloads = async (row) => {
    setLoading(true);
    if (!row || !row.correspondenceId) {
      console.error("Invalid row data for download");
      return;
    }

    try {
      const encryptedDload = encryptPayload({
        corrId: row.correspondenceId,
      });

      const response = await api.post(
        "/file/generate-corres-pdf",
        { dataObject: encryptedDload },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );
      if (!response.data) {
        throw new Error("No response data received");
      }
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error downloading the document", error);
      alert(
        "An error occurred while downloading the document. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
          color="secondary"
          onClick={() => handleDownloads(row)}
          title="View"
        >
          <FaEye />
        </Button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <>
      {loading && <PageLoader />}
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
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={headingStyle}
          >
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
    </>
  );
};

export const UploadModal = ({
  open,
  onClose,
  enclosuresData,
  refetchGet,
  corrId,
  allDetails,
  historyData,
  uploadData,
}) => {
  const token = sessionStorage.getItem("token");
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      try {
        const formData = new FormData();

        // First, prepare the enclosures data
        const enclosuresPayload = {
          enclosures: rows.map((row) => ({
            encTypeId: row.type, // This is the type ID from the dropdown
            encName: row.name,
          })),
        };

        console.log("Enclosures payload:", enclosuresPayload); // Debug log

        // Prepare and append the main data object
        const dataObject = {
          fileId: allDetails.fileId,
          fileReceiptId: allDetails.fileReceiptId,
          correspondenceId: corrId,
        };

        formData.append("dataObject", encryptPayload(dataObject));
        formData.append("enclosureData", encryptPayload(enclosuresPayload));

        // Append each file to the formData
        data.enclosureDocuments.forEach((file, index) => {
          formData.append(`enclosureDocuments`, file);
        });

        console.log(
          "Submitting form data with types:",
          rows.map((r) => ({ type: r.type, name: r.name }))
        ); // Debug log

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
        if (response.data.outcome === true) {
          setRows([{ type: "", name: "", file: null, fileName: "" }]);
          await refetchGet();
          toast.success("Upload successful!");
          return response.data;
        } else {
          throw new Error("Upload failed: No response data");
        }
      } catch (error) {
        console.error("Upload error details:", error);
        toast.error(error.message || "Upload failed. Please try again.");
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });

  const handleSubmit = () => {
    if (rows.length === 0) {
      toast.error("Please add at least one file!");
      return;
    }

    const invalidRows = rows.filter((row) => {
      return !row.type || !row.name || !row.file;
    });

    if (invalidRows.length > 0) {
      toast.error(
        "Please fill all required fields (Type, Name, and File) for each row!"
      );
      return;
    }

    const invalidFiles = rows.filter(
      (row) => !row.file || row.file.type !== "application/pdf"
    );
    if (invalidFiles.length > 0) {
      toast.error("Please ensure all selected files are PDFs!");
      return;
    }

    mutation.mutate({
      enclosureDocuments: rows.map((row) => row.file),
    });
  };

  const handleCancel = () => {
    setRows([{ type: "", name: "", file: null, fileName: "" }]);
    // toast.info("Form reset");
    onClose();
  };

  const addRow = () => {
    if (rows.length >= 10) {
      toast.error("You can upload a maximum of 10 files.");
      return;
    }
    setRows([...rows, { type: "", name: "", file: null, fileName: "" }]);
  };

  const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));
  const handleChange = (index, field, value) => {
    console.log(`Changing ${field} at index ${index} to:`, value);
    setRows(
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };
  const handleFileChange = (index, event) => {
    const file = event.target.files[0];
    console.log("Selected file:", file);

    if (!file) {
      toast.error("No file selected");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      event.target.value = "";
      return;
    }

    setRows(
      rows.map((row, i) => {
        if (i === index) {
          return {
            ...row,
            file: file,
            fileName: file.name,
          };
        }
        return row;
      })
    );

    toast.success(`File selected: ${file.name}`);
  };

  useEffect(() => {
    if (!open) {
      setRows([{ type: "", name: "", file: null, fileName: "" }]);
    }
  }, [open]);

  const handleDownload = async (enc, action = "view") => {
    setLoading(true);
    try {
      const encryptedDload = encryptPayload({
        documentName: enc.docFilename,
        documentPath: enc.path,
      });

      const response = await api.post(
        "/download/download-document",
        { dataObject: encryptedDload },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      if (
        action === "download" &&
        (enc.enclosuretype?.toLowerCase() === "letter" ||
          enc.enclosuretype?.toLowerCase() === "draft")
      ) {
        const link = document.createElement("a");
        link.href = url;
        link.download = enc.docFilename || "document.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(url, "_blank");
      }

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      toast.error("Failed to process document. Please try again.");
      console.error("Document processing error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <PageLoader />}
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
              color="secondary"
              variant="contained"
              size="small"
              title="addrow"
              sx={{
                minWidth: "auto",
                padding: "6px 10px",
                marginRight: "8px",
              }}
            >
              <FaPlus />
            </Button>
            {rows.length > 1 && (
              <Button
                onClick={() => removeRow(rows.length - 1)}
                color="error"
                variant="contained"
                size="small"
                sx={{
                  minWidth: "auto",
                  padding: "6px 10px",
                  marginRight: "8px",
                }}
              >
                <FaMinus />
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
              <TableHead
                sx={{
                  position: "sticky",
                  top: 0,
                  bgcolor: "#207785",
                  zIndex: 1,
                }}
              >
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
                          size="small"
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
                          size="small"
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
                        {
                          <Typography
                            noWrap
                            sx={{
                              minWidth: "150px",
                              maxWidth: "150px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.fileName ? row.fileName : "Upload File"}
                            <span style={{ color: "red" }}>*</span>
                          </Typography>
                        }
                        <input
                          type="file"
                          hidden
                          onChange={(e) => handleFileChange(index, e)}
                        />
                      </Button>
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
              <TableHead
                sx={{
                  position: "sticky",
                  top: 0,
                  bgcolor: "#207785",
                  zIndex: 1,
                }}
              >
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
                        {enc.enclosuretype?.toLowerCase() === "letter" ||
                        enc.enclosuretype?.toLowerCase() === "draft" ? (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleDownload(enc, "download")}
                            sx={{
                              minWidth: "auto",
                              padding: "6px 10px",
                              marginRight: "8px",
                            }}
                          >
                            <FaEye style={{ margin: "0 !important" }} />
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleDownload(enc, "view")}
                            sx={{
                              minWidth: "auto",
                              padding: "6px 10px",
                              marginRight: "8px",
                            }}
                          >
                            <FaEye style={{ margin: "0 !important" }} />
                          </Button>
                        )}
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
    </>
  );
};
