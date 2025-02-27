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
import { PageLoader } from "../pageload/PageLoader";
const UploadDocument = ({
  fileDetails,
  initialContent,
  additionalDetails,
  refetchData,
}) => {
  const navigate = useNavigate();

  const token =
    useAuthStore((state) => state.token) || sessionStorage.getItem("token");
  const [rows, setRows] = useState([
    {
      subject: "",
      type: "Select",
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
  const [isLoading, setIsLoading] = useState(false);

  const moveToRack = fileDetails?.data?.btn || null;
  const [selectedFiles, setSelectedFiles] = useState({});

  const handleRadioButtonChange = (index) => {
    console.log("Selected Row:", index); // Debugging
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
    console.log("Selected Row:", selectedRow); // Log for debugging
    console.log("Receiver Emp Role Map:", receiverEmpRoleMap); // Log for debugging
    console.log("Modal Action:", modalAction); // Log for debugging

    if (selectedRow !== null && selectedRow !== undefined) {
      newEndpointMutation.mutate();
    } else {
      console.log("Invalid selectedRow:", selectedRow); // Log invalid row
      toast.error("Please select a valid row.");
    }
  };

  const handleAddRow = useCallback(() => {
    setRows((prevRows) => [
      ...prevRows,
      {
        subject: "",
        type: "SELECT",
        letterNumber: "",
        date: null,
        document: null,
      },
    ]);
  }, []);

  const handleRemoveRow = (index) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
  
      setSelectedFiles((prev) => {
        const updatedFiles = { ...prev };
        delete updatedFiles[index]; 
        return updatedFiles;
      });
  
      toast.warning("Row removed successfully!");
    }
  };
  

  const getMissingFields = (row) => {
    const missingFields = [];
    if (!row.subject?.trim()) missingFields.push("Subject");
    if (row.type === "SELECT") missingFields.push("Type");
    if (row.type === "LETTER" && !row.letterNumber?.trim()) {
      missingFields.push("Letter Number");
    }
    if (!row.date) missingFields.push("Date");
    if (!row.document) missingFields.push("Document");
    return missingFields;
  };

  const isAnyFieldFilled = (row) => {
    return (
      row.subject?.trim() ||
      row.type !== "SELECT" ||
      (row.type === "LETTER" ? row.letterNumber?.trim() : false) ||
      row.date ||
      row.document
    );
  };

  const isRowEmpty = (row) => {
    if (row.type === "LETTER") {
      return (
        !row.subject?.trim() &&
        row.type === "SELECT" &&
        !row.letterNumber?.trim() &&
        !row.date &&
        !row.document
      );
    } else {
      return (
        !row.subject?.trim() &&
        row.type === "SELECT" &&
        !row.date &&
        !row.document
      );
    }
  };

  const handleInputChange = (index, field, value) => {
    const newRows = [...rows];

    // If type is changed and it's not LETTER, reset letter number
    if (field === "type" && value !== "LETTER") {
      newRows[index].letterNumber = "";
    }

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
      setSelectedFiles((prev) => ({
        ...prev,
        [index]: file,
      }));
      const newRows = [...rows];
      newRows[index].document = file;
      setRows(newRows);
      toast.success("File uploaded successfully!");
    } else {
      toast.error(
        "Please select a valid document (JPG, PNG or PDF files only)"
      );
    }
  };

  const handleConfidentialChange = (e) => {
    setPendingConfidential(e.target.checked);
    setConfirmationModalOpen(true);
  };

  const fetchOrganizations = useMutation({
    mutationFn: async () => {
      const response = await api.get("/level/get-organizations");
      if (response.status === 200 && response.data?.outcome) {
        setOrganizationsData(response.data.data);
        setIsSendToModalOpen(true);
      }
      return response.data;
    },
  });

  const handleOpenModal = async () => {
    setIsLoading(true);
    try {
      await handleSubmit();
      await fetchOrganizations.mutateAsync();
      setIsSendToModalOpen(true);
    } catch (error) {
      toast.error("Failed to open modal.");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndTask = () => {
    toast.warning("Task ended!");
  };

  const handleCancel = () => {
    navigate("/file");
    toast.warning("Task cancelled!");
  };

  const formatDateToString = (date) => {
    if (!date) return "";
    return dayjs(date).format("DD/MM/YYYY");
  };


  const validateDocuments = (rows) => {
    alert("validateDocuments");
    for (const row of rows) {
      const { subject: docSubject, type: letterType, letterNumber, date: letterDate, document } = row;
  
      // Check if mandatory fields (except letterNumber) are filled
      const areMandatoryFieldsFilled = docSubject && letterType && letterDate;
  
      if (letterType === "LETTER") {
        if (!areMandatoryFieldsFilled || !letterNumber) {
          toast.error("All fields are required when Letter Type is 'LETTER'.", { position: "top-right" });
          return false;
        } 
      } else {
        if (!areMandatoryFieldsFilled) {
          toast.error("Subject, Letter Type, and Letter Date are required.", { position: "top-right" });
          return false;
        }
      }
  
      // If a document is uploaded, all mandatory fields must be filled
      if (document && !areMandatoryFieldsFilled) {
        toast.error("All fields must be filled when a document is uploaded.", { position: "top-right" });
        return false;
      }
    }
  
    return true;
  };
  const handleSubmit = () => {
    const documents = rows.map((row) => ({
      docSubject: row.subject,
      letterType: row.type,
      letterNumber: row.type === "LETTER" ? row.letterNumber : null,
      letterDate: row.date,
    }));

    const uploadedDocuments = rows.map((row) => row.document).filter(Boolean);
    if (!validateDocuments(rows)) {
      return; // Stop submission if validation fails
    }
    // mutation.mutate({
    //   documents,
    //   uploadedDocuments,
    //   filePriority,
    //   isConfidential,
    //   editorContent,
    // });
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

        const response = await api.post(
          "/file/save-notesheet-and-documents",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data && response.data.outcome === true) {
          setRows([
            {
              subject: "",
              type: "SELECT",
              letterNumber: "",
              date: null,
              document: null,
            },
          ]);
          setEditorContent("");
          setFilePriority("Normal");
          setIsConfidential(false);
          toast.success(response.data.message);
          if (refetchData && typeof refetchData === "function") {
            refetchData();
          }
        } else {
          throw new Error(response.data?.message || "Upload failed");
        }

        return response.data;
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(error.message || "Upload failed. Please try again.");
        throw error;
      }
    },
  });

  const { mutate, isError, error } = mutation;

  useEffect(() => {
    if (isError) {
      toast.error(error.message || "Submission failed");
    }
  }, [isError, error]);

  const markActionMutation = useMutation({
    mutationFn: async (action) => {
      console.log("Action to be taken:", action);

      try {
        const markupPayloads = {
          actionTaken: action,
        };

        const encryptedDataObject = encryptPayload(markupPayloads);

        const formData = new FormData();
        formData.append("dataObject", encryptedDataObject);

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
      // toast.success(data.message || "Operation successful!");
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

  const handleMarkupOrMarkdown = async (action) => {
    // Then proceed with markup/markdown
    setModalAction(action);
    triggerMarkAction(action);
    setIsModalOpen(true);
    // await handleSubmit();
  };

  const approveFileMutation = useMutation({
    mutationFn: async (data) => {
      if (!fileDetails || !additionalDetails) {
        toast.error("File details or additional details are missing.");
        return;
      }

      const sendfilepayload = {
        actionTaken: data.action,
        fileId: fileDetails.data.fileId,
        note: additionalDetails.data.note,
        filerecptId: fileDetails.data.fileReceiptId,
        notesheetId: additionalDetails?.data?.prevNoteId,
      };
      console.log("Payload before encryption:", sendfilepayload);

      const encryptedDataObject = encryptPayload(sendfilepayload);

      const formData = new FormData();
      formData.append("dataObject", encryptedDataObject);

      const response = await api.post("/file/approve-file", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Operation successful!");
      if (data.outcome === true) {
        navigate("/file");
      }
    },
    onError: (error) => {
      toast.error(error.message || "API call failed!");
    },
  });

  const handleApprove = (action) => {
    const data = { action };
    approveFileMutation.mutate(data);
  };

  const newEndpointMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log("Validating form...");

        console.log("Preparing payload...");
        const sendfilepayload = {
          actionTaken: modalAction,
          fileId: fileDetails?.data?.fileId,
          note: editorContent || "",
          filerecptId: fileDetails?.data?.fileReceiptId,
          notesheetId: additionalDetails?.data?.prevNoteId,
          receiverEmpRoleMap: receiverEmpRoleMap,
        };
        console.log("Payload before encryption:", sendfilepayload);

        if (!sendfilepayload.fileId || !sendfilepayload.filerecptId) {
          console.log("Required file details are missing");
          throw new Error("Required file details are missing");
        }

        console.log("Encrypting payload...");
        const encryptedDataObjectUpDown = encryptPayload(sendfilepayload);

        const SendformData = new FormData();
        SendformData.append("dataObject", encryptedDataObjectUpDown);

        console.log("Calling API...");
        const response = await api.post("/file/send-file", SendformData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.data) {
          throw new Error("No data received from the server");
        }

        console.log("API Response:", response);
        return response.data;
      } catch (error) {
        console.error("New API Error:", error);
        console.error("Error Response:", error.response); // Log the full response
        console.error("Error Message:", error.message); // Log the error message

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Something went wrong during the API call";
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      console.log("API Call Successful:", data);
      toast.success(data.message || "Operation successful!");
      if (data.outcome === true) {
        navigate("/file");
      }
    },
    onError: (error) => {
      console.error("API Call Failed:", error);
      toast.error(error.message || "New API call failed!");
    },
  });

  return (
    <>
      {isLoading && <PageLoader />}

      <Box
        sx={{ width: "100%", margin: "auto", marginTop: "20px" }}
        className="uploaddocument"
      >
        <Accordion defaultActiveKey="0" className="custom-accordion">
          <AccordionItem eventKey="0">
            <Card>
              <Accordion.Header onClick={() => setIsOpen(!isOpen)}>
                <div className="d-flex justify-content-between align-items-center w-100">
                  <h5 className="mb-0">Upload Document</h5>
                  <span className="toggle-icon">
                    {isOpen ? <FaMinus /> : <FaPlus />}
                  </span>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}
                >
                  <IconButton
                    onClick={handleAddRow}
                    sx={{
                      bgcolor: "#207785",
                      "&:hover": { bgcolor: "#207785" },
                    }}
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
                          label={
                            <Typography>
                              Subject <span style={{ color: "red" }}>*</span>
                            </Typography>
                          }
                          value={row.subject}
                          onChange={(e) =>
                            handleInputChange(index, "subject", e.target.value)
                          }
                          sx={{ height: "54px" }}
                        />
                      </Grid>

                      <Grid item xs={2.4}>
                        <FormControl fullWidth>
                          <TextField
                            select
                            label={
                              <Typography>
                                Type <span style={{ color: "red" }}>*</span>
                              </Typography>
                            }
                            value={row.type || ""}
                            onChange={(e) =>
                              handleInputChange(index, "type", e.target.value)
                            }
                            sx={{ height: "54px" }}
                            SelectProps={{
                              displayEmpty: true,
                              renderValue: (value) => {
                                if (value === "") {
                                  return (
                                    <em style={{ color: "gray" }}>
                                      Select Letter Type
                                    </em>
                                  );
                                }
                                return value;
                              },
                            }}
                          >
                            <MenuItem value="" disabled>
                              <em>Select Letter Type</em>
                            </MenuItem>
                            <MenuItem value="LETTER">Letter</MenuItem>
                            <MenuItem value="DOCUMENT">Document</MenuItem>
                            <MenuItem value="DRAWING">Drawing</MenuItem>
                            <MenuItem value="MAP">Map</MenuItem>
                            <MenuItem value="SKETCH">Sketch</MenuItem>
                            <MenuItem value="OTHER">Other</MenuItem>
                          </TextField>
                        </FormControl>
                      </Grid>

                      <Grid item xs={2}>
                        <TextField
                          fullWidth
                          label={
                            <Typography>
                              Letter Number
                              {row.type === "LETTER" ? (
                                <span style={{ color: "red" }}>*</span>
                              ) : (
                                ""
                              )}
                            </Typography>
                          }
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

                      <Grid item xs={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <MobileDatePicker
                            label={
                              <Typography>
                                Date <span style={{ color: "red" }}>*</span>
                              </Typography>
                            }
                            inputProps={{ "aria-label": "Without label" }}
                            value={
                              row.date ? dayjs(row.date, "DD/MM/YYYY") : null
                            }
                            onChange={(date) => {
                              try {
                                if (date && date.isValid()) {
                                  const formattedDate =
                                    dayjs(date).format("DD/MM/YYYY");
                                  handleInputChange(
                                    index,
                                    "date",
                                    formattedDate
                                  );
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

                      <Grid item xs={2.4}>
                        <Button
                          variant="contained"
                          component="label"
                          startIcon={<FaFolderOpen />}
                          sx={{
                            bgcolor: "#207785",
                            "&:hover": { bgcolor: "#207785" },
                            height: "54px",
                          }}
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
                              {selectedFiles[index]
                                ? selectedFiles[index].name
                                : "Upload File"}
                              <span style={{ color: "red" }}>*</span>
                            </Typography>
                          }
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
                        <MenuItem value="Immediate most">
                          Immediate most
                        </MenuItem>
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
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send To"}
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<FaCheckCircle />}
                    onClick={() => handleApprove("APPROVED")}
                    disabled={isLoading}
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
                {Array.isArray(apiResponseData) &&
                apiResponseData.length > 0 ? (
                  apiResponseData.map((data, index) => {
                    const employeeName =
                      data.empNameWithDesgAndDept || data.name;
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
    </>
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
