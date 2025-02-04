import React, { useState, useEffect, useCallback, } from "react";
import {
  TextField,
  Select,
  MenuItem,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Grid,
  Box,
  Modal,
  Switch,
  Typography,
} from "@mui/material";
import {
  FaPlus,
  FaMinus,
  FaFolderOpen,
  FaSave,
  FaArrowUp,
  FaArrowDown,
  FaPaperPlane,
  FaBan,
  FaCheckCircle,
} from "react-icons/fa";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { toast } from "react-toastify";
import "./FileDetails.css";
import "./UploadDocument.css";
// import { useLocation } from "react-router-dom";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { AccordionItem } from "react-bootstrap";

const UploadDocument = ({ content }) => {
  const token =
    useAuthStore((state) => state.token) || sessionStorage.getItem("token");
    const { fileDetails,additionalDetails, setAdditionalDetails,setFileDetails } = useAuthStore((state) => ({
      additionalDetails: state.additionalDetails,
      setAdditionalDetails: state.setAdditionalDetails,
      fileDetails: state.fileDetails,
      setFileDetails: state.setFileDetails,
    }));
  // const location = useLocation();
  // const fileDetails = location.state?.fileDetails || {};
  // const additionalDetails = location.state?.additionalDetails || {};
  const [rows, setRows] = useState([
    {
      subject: "",
      type: "LETTER",
      letterNumber: "",
      date: null,
      document: null,
    },
  ]);
  const handleAddRow = useCallback(() => {
    setRows((prevRows) => [
      ...prevRows,
      {
        subject: "",
        type: "LETTER",
        letterNumber: "",
        date: null,
        document: null,
      },
    ]);
  }, []);

  const [filePriority, setFilePriority] = useState("Normal");
  const [isConfidential, setIsConfidential] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [pendingConfidential, setPendingConfidential] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

 

  const handleRemoveRow = (index) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
      toast.warning("Row removed successfully!");
    }
  };

  const handleInputChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const handleFileChange = (index, file) => {
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const newRows = [...rows];
      newRows[index].document = file;
      setRows(newRows);
      toast.success("File uploaded successfully!");
    } else {
      toast.error("Only JPG and PNG files are allowed.");
    }
  };

  const handleConfidentialChange = (e) => {
    setPendingConfidential(e.target.checked);
    setConfirmationModalOpen(true);
  };

  const handleMarkUp = () => {
    toast.info("Document marked up!");
  };

  const handleMarkDown = () => {
    toast.info("Document marked down!");
  };

  const handleSendTo = () => {
    toast.success("Document sent successfully!");
  };

  const handleEndTask = () => {
    toast.warning("Task ended!");
  };

  const handleCancel = () => {
    toast.error("Operation cancelled!");
  };

  const isRowFilled = (row) => {
    return (
      row.subject &&
      row.type &&
      (row.type !== "LETTER" || row.letterNumber) &&
      row.date &&
      row.document
    );
  };

  const formatDateToString = (date) => {
    if (!date) return "";
    return dayjs(date).format("DD/MM/YYYY");
  };
  const mutation = useMutation({
    mutationFn: async (data) => {
      if (!fileDetails?.fileId || !fileDetails?.fileReceiptId) {
        throw new Error("File details are missing!");
      }

      if (!data?.additionalDetails || !data?.documents?.length) {
        throw new Error("Missing required document data fields!");
      }

      const encryptedDataObject = encryptPayload({
        fileId: fileDetails.fileId,
        note: additionalDetails.note || null,
        filerecptId: fileDetails.fileReceiptId,
        prevNoteId: additionalDetails.prevNoteId || null,
        priority: data.filePriority,
        isConfidential: data.isConfidential,
      });

      const encryptedDocumentData = encryptPayload({
        documents: data.documents.map((doc) => ({
          ...doc,
          date: dayjs(doc.date).format("DD/MM/YYYY"),
        })),
      });

      const formData = new FormData();
      formData.append("dataObject", encryptedDataObject);
      formData.append("documentData", encryptedDocumentData);

      data.uploadedDocuments.forEach((file) => {
        formData.append("uploadedDocuments", file);
      });

      return api.post("/file/save-notesheet-and-documents", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    },
  });

  const { mutate, isLoading, isError, error } = mutation;

  useEffect(() => {
    if (isError) {
      toast.error(error.message || "Submission failed");
    }
  }, [isError, error]);

  // const handleSubmit = async (file) => {
  //   const data = {
  //     content,
  //     filePriority,
  //     isConfidential,
  //     documents: rows.map((row) => ({
  //       docSubject: row.subject,
  //       letterType: row.type,
  //       letterNumber: row.type === "LETTER" ? row.letterNumber : null,
  //       letterDate: row.date,
  //     })),
  //     uploadedDocuments: rows.map((row) => row.document).filter(Boolean),
  //   };
  //   try {
  //     mutate(data, {
  //       onSuccess: async (response) => {
  //         console.log("API success:", response);
  //         toast.success("Document uploaded successfully!");

  //         const token = useAuthStore.getState().token;
  //         const payload2 = encryptPayload({ fileId: fileDetails.fileId });
  //         const response2 = await api.post(
  //           "/file/get-draft-notesheet",
  //           { dataObject: payload2 },
  //           { headers: { Authorization: `Bearer ${token}` } }
  //         );
  //         try {
  //           const [response2] = await Promise.all([
  //             api.post(
  //               "/file/get-draft-notesheet",
  //               { dataObject: payload2 },
  //               { headers: { Authorization: `Bearer ${token}` } }
  //             ),
  //           ]);

  //           // You can now handle response2 inside onSuccess
  //           console.log("Draft notesheet fetched:", response2);

  //           // Optionally show a success toast for the second API
  //           toast.success("Draft notesheet fetched successfully!");
  //         } catch (error) {
  //           // Handle errors for the second API call
  //           console.error("Error fetching draft notesheet:", error);
  //           toast.error(error.message || "Failed to fetch draft notesheet");
  //         }
  //       },
  //       onError: (error) => {
  //         console.error("API error:", error);
  //         toast.error(error.message || "Submission failed");
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Submission error:", error);
  //     toast.error(error.message || "Submission failed");
  //   }
  // };
  const handleSubmit = async (file) => {
    console.log('Submitting...');
    const data = {
      content,
      filePriority,
      isConfidential,
      documents: rows.map((row) => ({
        docSubject: row.subject,
        letterType: row.type,
        letterNumber: row.type === "LETTER" ? row.letterNumber : null,
        letterDate: row.date,
      })),
      uploadedDocuments: rows.map((row) => row.document).filter(Boolean),
    };
  
    try {
      mutate(data, {
        onSuccess: async (response) => {
          console.log("API success:", response);
          toast.success("Document uploaded successfully!");
        },
        onError: (error) => {
          console.error("API error:", error);
          toast.error(error.message || "Submission failed");
        },
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message || "Submission failed");
    }
  };
  
  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "auto", marginTop: "20px" }}>
      <Accordion defaultActiveKey="0" className="custom-accordion">
        <AccordionItem eventKey="0">
          <Card>
            <Accordion.Header onClick={() => setIsOpen(!isOpen)}>
              <div className="d-flex justify-content-between align-items-center w-100">
                <h5 className="mb-0">Upload Document</h5>
                <span className="toggle-icon">
                  {isOpen ? <FaPlus /> : <FaMinus />}
                </span>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <IconButton
                  onClick={handleAddRow}
                  sx={{ bgcolor: "green", "&:hover": { bgcolor: "darkgreen" } }}
                >
                  <FaPlus style={{ color: "white" }} />
                </IconButton>
              </Box>

              <Box sx={{ mt: 2.5 }}>
                {rows.map((row, index) => (
                  <Grid
                    container
                    spacing={2}
                    key={index}
                    sx={{ mb: 2, alignItems: "center" }}
                  >
                    <Grid item xs={2.4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Subject*"
                        value={row.subject}
                        onChange={(e) =>
                          handleInputChange(index, "subject", e.target.value)
                        }
                        sx={{ height: "54px" }}
                      />
                    </Grid>

                    <Grid item xs={2.4}>
                      <FormControl
                        fullWidth
                        size="small"
                        sx={{ height: "54px" }}
                      >
                        <InputLabel>Type*</InputLabel>
                        <Select
                          value={row.type}
                          onChange={(e) =>
                            handleInputChange(index, "type", e.target.value)
                          }
                          label="Type*"
                        >
                          <MenuItem value="LETTER">LETTER</MenuItem>
                          <MenuItem value="DOCUMENT">DOCUMENT</MenuItem>
                          <MenuItem value="FILE">FILE</MenuItem>
                          <MenuItem value="REPORT">REPORT</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={2.4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Letter Number*"
                        value={row.letterNumber}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "letterNumber",
                            e.target.value
                          )
                        }
                        disabled={row.type !== "LETTER"}
                        sx={{ height: "54px" }}
                      />
                    </Grid>

                    <Grid item xs={2.4}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <MobileDatePicker
                          label="Date*"
                          value={
                            row.date ? dayjs(row.date, "DD/MM/YYYY") : null
                          } // Ensure correct parsing
                          onChange={(date) => {
                            if (date) {
                              handleInputChange(
                                index,
                                "date",
                                dayjs(date).format("DD/MM/YYYY")
                              );
                            } else {
                              handleInputChange(index, "date", "");
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              size="small"
                              sx={{ height: "54px" }}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </Grid>

                    <Grid item xs={1.6}>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<FaFolderOpen />}
                        sx={{
                          bgcolor: "#1976d2",
                          "&:hover": { bgcolor: "#1565c0" },
                          height: "54px",
                        }}
                      >
                        Upload File
                        <input
                          type="file"
                          hidden
                          accept=".jpg,.png"
                          onChange={(e) =>
                            handleFileChange(index, e.target.files[0])
                          }
                        />
                      </Button>
                    </Grid>

                    {rows.length > 1 && !isRowFilled(row) && (
                      <Grid item xs={0.8}>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveRow(index)}
                          sx={{
                            bgcolor: "red",
                            "&:hover": { bgcolor: "darkred" },
                          }}
                        >
                          <FaMinus style={{ color: "white" }} />
                        </IconButton>
                      </Grid>
                    )}
                  </Grid>
                ))}
              </Box>

              <Grid container spacing={2} sx={{ mt: 4 }}>
                <Grid item xs={6}>
                  <FormControl fullWidth sx={{ height: "54px" }}>
                    <InputLabel>File Priority</InputLabel>
                    <Select
                      value={filePriority}
                      onChange={(e) => setFilePriority(e.target.value)}
                      label="File Priority"
                    >
                      <MenuItem value="Normal">Normal</MenuItem>
                      <MenuItem value="Urgent">Urgent</MenuItem>
                      <MenuItem value="Same day top priority">
                        Same day top priority
                      </MenuItem>
                      <MenuItem value="Immediate most">Immediate most</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      height: "54px",
                    }}
                  >
                    <Typography sx={{ mr: 2 }}>
                      Is confidential file?
                    </Typography>
                    <Switch
                      checked={isConfidential}
                      onChange={handleConfidentialChange}
                    />
                    <Typography sx={{ ml: 1 }}>
                      {isConfidential ? "Confidential" : "Non-confidential"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box
                sx={{
                  mt: 4,
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FaSave />}
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<FaArrowUp />}
                  onClick={handleMarkUp}
                >
                  Mark Up
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<FaArrowDown />}
                  onClick={handleMarkDown}
                >
                  Mark Down
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<FaPaperPlane />}
                  onClick={handleSendTo}
                >
                  Send To
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<FaCheckCircle />}
                  onClick={handleEndTask}
                >
                  End-Task
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<FaBan />}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </Box>
            </Accordion.Body>
          </Card>
        </AccordionItem>
      </Accordion>

      <Modal
        open={confirmationModalOpen}
        onClose={() => setConfirmationModalOpen(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 1,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {pendingConfidential
              ? "Set as Confidential"
              : "Set as Non-Confidential"}
          </Typography>
          <Typography sx={{ mb: 3 }}>
            {pendingConfidential
              ? "Are you sure you want to mark this file as confidential?"
              : "Are you sure you want to mark this file as non-confidential?"}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setIsConfidential(pendingConfidential);
                setConfirmationModalOpen(false);
                toast.success("Confidentiality updated!");
              }}
            >
              Yes
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setConfirmationModalOpen(false);
                toast.error("Confidentiality update cancelled!");
              }}
            >
              No
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default React.memo(UploadDocument);
