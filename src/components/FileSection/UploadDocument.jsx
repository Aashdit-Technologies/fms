import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

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
  Radio,
  InputAdornment,
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
  FaSearch,
} from "react-icons/fa";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { toast } from "react-toastify";
import "./FileDetails.css";
import "./UploadDocument.css";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { AccordionItem, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import UploadDocumentsModal from "./Modal/UploadDocumentsModal";
const UploadDocument = ({ fileDetails, initialContent, additionalDetails }) => {
  const navigate = useNavigate();

  const token =
    useAuthStore((state) => state.token) || sessionStorage.getItem("token");
  const [rows, setRows] = useState([
    {
      subject: "",
      type: "LETTER",
      letterNumber: "",
      date: null,
      document: null,
    },
  ]);

  const [editorContent, setEditorContent] = useState(initialContent || "");

  useEffect(() => {
    setEditorContent(initialContent || "");
  }, [initialContent]);
  const [filePriority, setFilePriority] = useState("Normal");
  const [isConfidential, setIsConfidential] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [pendingConfidential, setPendingConfidential] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSendToModalOpen, setIsSendToModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isSendEnabled, setIsSendEnabled] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [apiResponseData, setApiResponseData] = useState([]);
  const [organizationsData, setOrganizationsData] = useState([]);

  const [receiverEmpRoleMap, setReceiverEmpRoleMap] = useState(null);

  const handleRadioButtonChange = (index) => {
    setSelectedRow(index);
    setIsSendEnabled(true);
    const actionValue = apiResponseData[index]?.empDeptRoleId || null;
    setReceiverEmpRoleMap(actionValue);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };

  const handleSend = () => {
    if (selectedRow !== null) {
      newEndpointMutation.mutate();
    }
  };

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
    if (
      file &&
      (file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "application/pdf")
    ) {
      const newRows = [...rows];
      newRows[index].document = file;
      setRows(newRows);
      toast.success("File uploaded successfully!");
    } else {
      toast.error("Only JPG, PNG and PDF files are allowed.");
    }
  };

  const handleConfidentialChange = (e) => {
    setPendingConfidential(e.target.checked);
    setConfirmationModalOpen(true);
  };
  const fetchOrganizations  = useMutation({
    mutationFn: async () => {
      const response = await api.get("/level/get-organizations");
      if (response.status === 200 && response.data?.outcome) {
        setOrganizationsData(response.data.data); 
        setIsSendToModalOpen(true); 
      }
      return response.data;
    },
  });
  const handleOpenModal = () => {
    fetchOrganizations.mutate();
  };

  const handleEndTask = () => {
    toast.warning("Task ended!");
  };

  const handleCancel = () => {
    toast.error("Operation cancelled!");
  };

  const formatDateToString = (date) => {
    if (!date) return "";
    return dayjs(date).format("DD/MM/YYYY");
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      try {
        const encryptedDataObject = encryptPayload({
          fileId: fileDetails.data.fileId,
          note: editorContent || null,
          filerecptId: fileDetails.data.fileReceiptId,
          prevNoteId: additionalDetails?.data?.prevNoteId,
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

        const Response = await api.post(
          "/file/save-notesheet-and-documents",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (Response.status === 200) {
          const payload2 = encryptPayload({ fileId: fileDetails.data.fileId });
          return api.post(
            "/file/get-draft-notesheet",
            { dataObject: payload2 },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      } catch (error) {
        if (error.response?.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        throw error;
      }
    },
  });

  const { mutate, isLoading, isError, error } = mutation;

  useEffect(() => {
    if (isError) {
      toast.error(error.message || "Submission failed");
    }
  }, [isError, error]);

  const handleSubmit = async () => {
    if (!fileDetails) {
      toast.error("File details are missing");
      return;
    }

    const fileId = fileDetails?.data?.fileId || fileDetails.id;
    if (!fileId) {
      toast.error("File ID is missing");
      return;
    }

    const filerecptId =
      fileDetails?.data?.fileReceiptId ||
      fileDetails.fileReceiptId ||
      fileDetails.fileReceiptId;
    if (!filerecptId) {
      toast.error("File Receipt ID is missing");
      return;
    }

    const data = {
      fileId: fileId,
      filerecptId: filerecptId,
      filePriority,
      isConfidential,
      documents: rows.map((row) => ({
        docSubject: row.subject || "",
        letterType: row.type || "LETTER",
        letterNumber: row.letterNumber || "",
        letterDate: formatDateToString(row.date),
        content: editorContent,
      })),
      uploadedDocuments: rows.map((row) => row.document).filter(Boolean),
    };

    try {
      mutate(data, {
        onSuccess: async (response) => {
          console.log("API success:", response);
          toast.success("Document uploaded successfully!");
          setRows([
            {
              subject: "",
              type: "LETTER",
              letterNumber: "",
              date: null,
              document: null,
            },
          ]);
          setEditorContent("");
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

  const markActionMutation = useMutation({
    mutationFn: async (action) => {
      try {
        const markupPayloads = {
          actionTaken: action,
        };

        const encryptedDataObject = encryptPayload(markupPayloads);

        const formData = new FormData();
        formData.append("dataObject", encryptedDataObject);

        // Make the API call
        const response = await api.post(
          "/file/get-mark-up-or-mark-down",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setApiResponseData(response.data.data);
        return response.data;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success(data.message || "Operation successful!");
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong!");
    },
  });

  const {
    mutate: triggerMarkAction,
    isLoading: isSubmittingAction,
    isError: hasActionError,
    error: markActionError,
  } = markActionMutation;

  const newEndpointMutation = useMutation({
    mutationFn: async (data) => {
      if (!receiverEmpRoleMap) {
        toast.error("Please select an action.");
        return;
      }

      try {
        const sendfilepayload = {
          actionTaken: modalAction,
          fileId: fileDetails.data.fileId,
          note: additionalDetails.data.note,
          filerecptId: fileDetails.data.fileReceiptId,
          notesheetId: additionalDetails?.data?.prevNoteId,
          receiverEmpRoleMap: receiverEmpRoleMap,
        };

        const encryptedDataObjectUpDown = encryptPayload(sendfilepayload);

        const SendformData = new FormData();
        SendformData.append("dataObject", encryptedDataObjectUpDown);

        const response = await api.post("file/send-file", SendformData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data;
      } catch (error) {
        console.error("New API Error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success(data.message || "Operation successful!");
      if (data.outcome === true) {
        navigate("/file");
      }
    },
    onError: (error) => {
      toast.error(error.message || "New API call failed!");
    },
  });

  const handleMarkupOrMarkdown = (action) => {
    setModalAction(action);
    triggerMarkAction(action);
    setIsModalOpen(true);
  };

  return (
    <Box
      sx={{ p: 3, maxWidth: 1200, margin: "auto", marginTop: "20px" }}
      className="uploaddocument"
    >
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
                        label="Subject"
                        value={row.subject}
                        onChange={(e) =>
                          handleInputChange(index, "subject", e.target.value)
                        }
                        sx={{ height: "54px" }}
                      />
                    </Grid>

                    <Grid item xs={2.4}>
                      <FormControl fullWidth sx={{ height: "54px" }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={row.type}
                          onChange={(e) =>
                            handleInputChange(index, "type", e.target.value)
                          }
                          label="Type"
                        >
                          <MenuItem value="LETTER">LETTER</MenuItem>
                          <MenuItem value="DOCUMENT">DOCUMENT</MenuItem>
                          <MenuItem value="DRAWING">DRAWING</MenuItem>
                          <MenuItem value="MAP">MAP</MenuItem>
                          <MenuItem value="SKETCH">MAP</MenuItem>
                          <MenuItem value="OTHER">OTHER</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={2.4}>
                      <TextField
                        fullWidth
                        label="Letter Number"
                        value={row.letterNumber}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "letterNumber",
                            e.target.value
                          )
                        }
                        sx={{ height: "54px" }}
                        disabled={row.type !== "LETTER"}
                      />
                    </Grid>

                    <Grid item xs={2.4}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <MobileDatePicker
                          label="Date"
                          value={
                            row.date ? dayjs(row.date, "DD/MM/YYYY") : null
                          }
                          onChange={(date) => {
                            try {
                              if (date && date.isValid()) {
                                const formattedDate =
                                  dayjs(date).format("DD/MM/YYYY");
                                handleInputChange(index, "date", formattedDate);
                              } else {
                                handleInputChange(index, "date", "");
                              }
                            } catch (error) {
                              console.error("Date parsing error:", error);
                              handleInputChange(index, "date", "");
                            }
                          }}
                          maxDate={dayjs()}
                          shouldDisableDate={(date) =>
                            dayjs(date).isAfter(dayjs())
                          }
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
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) =>
                            handleFileChange(index, e.target.files[0])
                          }
                        />
                      </Button>
                    </Grid>

                    {rows.length > 1 && (
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
                  onClick={() => handleMarkupOrMarkdown("MARKUP")}
                  disabled={isSubmittingAction}
                >
                  {isSubmittingAction ? "Marking Up..." : "Mark Up"}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<FaArrowDown />}
                  onClick={() => handleMarkupOrMarkdown("MARKDOWN")}
                  disabled={isSubmittingAction}
                >
                  {isSubmittingAction ? "Marking Down..." : "Mark Down"}
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<FaPaperPlane />}
                  onClick={handleOpenModal}
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
      {/* Modal for Table and Send Button */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="markup-markdown-modal"
        aria-describedby="modal-to-select-action"
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            bgcolor: "background.paper",
            padding: 3,
            borderRadius: 2,
            maxWidth: "600px",
            margin: "auto",
            marginTop: "50px",
            overflow: "auto",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Select Action
          </Typography>

          <Table bordered>
            <thead>
              <tr>
                <th>EmployeeName</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(apiResponseData) && apiResponseData.length > 0 ? (
                apiResponseData.map((data, index) => {
                  const employeeName = data.empNameWithDesgAndDept || data.name;
                  const actionValue = data.empDeptRoleId || null;

                  // Debugging: Log the current row data
                  console.log("Row Data:", data);

                  return (
                    <tr key={index}>
                      <td>{employeeName}</td>
                      <td>
                        <Radio
                          checked={selectedRow === index}
                          onChange={() => handleRadioButtonChange(index)}
                          value={actionValue}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="2">No data available</td>
                </tr>
              )}
            </tbody>
          </Table>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              disabled={!isSendEnabled}
              onClick={handleSend}
            >
              Send
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleCloseModal}
              sx={{ ml: 2 }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
      <UploadDocumentsModal
        open={isSendToModalOpen}
        onClose={() => setIsSendToModalOpen(false)}
        organizations={organizationsData}
        fileDetails={fileDetails}
        additionalDetails={additionalDetails}
      />
    </Box>
  );
};

UploadDocument.propTypes = {
  fileDetails: PropTypes.shape({
    fileId: PropTypes.string,
    filerecptId: PropTypes.string,
  }),
  initialContent: PropTypes.string,
};

UploadDocument.defaultProps = {
  fileDetails: {
    fileId: null,
    filerecptId: null,
  },
  initialContent: "",
};

export default React.memo(UploadDocument);
