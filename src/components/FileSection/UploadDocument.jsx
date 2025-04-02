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
  FaCloudUploadAlt,
  FaFile,
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
import MoveToRackModal from "./Modal/MoveToRackModal";
import { CalendarToday } from "@mui/icons-material";
import { type } from "jquery";
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
      type: "",
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
  // const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  // const [pendingConfidential, setPendingConfidential] = useState(false);
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
  const [isDragging, setIsDragging] = useState(false);

  const moveToRack = fileDetails?.data?.btnValue || null;
  const [selectedFiles, setSelectedFiles] = useState({});
  const [isMoveToRackModalOpen, setIsMoveToRackModalOpen] = useState(false);

  const options = [
    { value: "LETTER", label: "Letter" },
    { value: "DOCUMENT", label: "Document" },
    { value: "DRAWING", label: "Drawing" },
    { value: "MAP", label: "Map" },
    { value: "SKETCH", label: "Sketch" },
    { value: "OTHER", label: "Other" },
  ];

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
    if (selectedRow !== null && selectedRow !== undefined) {
      newEndpointMutation.mutate();
    } else {
      console.log("Invalid selectedRow:", selectedRow); 
      toast.error("Please select a valid row.");
    }
  };

  const handleAddRow = useCallback(() => {
    setRows((prevRows) => [
      ...prevRows,
      {
        subject: "",
        type: "",
        letterNumber: "",
        date: null,
        document: null,
      },
    ]);
  }, [setRows]); 

  const handleRemoveRow = (index) => {
    if (rows.length === 1) {
      return;
    }

    setRows((prevRows) => prevRows.filter((_, i) => i !== index));
    setSelectedFiles((prev) => {
      const updatedFiles = { ...prev };
      delete updatedFiles[index];
      return updatedFiles;
    });
  };

  

  const handleInputChange = (index, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]: value,
              ...(field === "type" && value !== "LETTER"
                ? { letterNumber: "" }
                : {}),
            }
          : row
      )
    );
  };

  const handleFileChange = (index, file) => {
    if (!file) {
      console.log("No file selected.");
      toast.error("Please select a file");
      return;
    }

    if (file.name.length > 50) {
      console.log("File name too long.");
      toast.error("File name is too long. Maximum 50 characters allowed");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      console.log("File size exceeds 5MB.");
      toast.error("File size exceeds 5MB limit");
      return;
    }

    if (file && file.type === "application/pdf") {
      setSelectedFiles((prev) => ({
        ...prev,
        [index]: file,
      }));
      const newRows = [...rows];
      newRows[index].document = file;
      setRows(newRows);
    } else {
      console.log("Not a PDF file.");
      toast.error("Please select a PDF file only");
    }
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleFileChange(index, file);
  };
  const handleConfidentialChange = (e) => {
    setIsConfidential(e.target.checked);
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
    const cleanedContent = initialContent
      ?.replace(/(&nbsp;|\s|<p>|<\/p>|<br>)/g, "")
      .trim();
    const isContentEmpty = !cleanedContent || cleanedContent === "";

    if (isContentEmpty) {
      toast.error("Please write some notes");
      return;
    }
    setIsLoading(true);
    try {
      const isSubmissionSuccessful = await handleSubmit(); // ✅ Ensure handleSubmit succeeds

      if (!isSubmissionSuccessful) {
        return;
      }

      await fetchOrganizations.mutateAsync();
      setIsSendToModalOpen(true);
    } catch (error) {
      toast.error("Failed to open modal.");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };



  const handleCancel = () => {
    navigate("/file");
    // toast.warning("Task cancelled!");
  };

  const formatDateToString = (date) => {
    if (!date) return "";
    return dayjs(date).format("DD/MM/YYYY");
  };

  
  const validateForm = (rows, initialContent, Mark) => {
    debugger;
    const cleanedContent = initialContent
      ?.replace(/(&nbsp;|\s|<p>|<\/p>|<br>)/g, "")
      .trim();
    const isContentEmpty = !cleanedContent || cleanedContent === "";

    if (Mark === "MARKDOWN") {
      return true;
    }

    if (!isContentEmpty) {
      return true;
    }

    const hasAnyRowWithData = rows.some(
      (row) =>
        row.subject?.trim() ||
        row.type ||
        row.date ||
        row.letterNumber?.trim() ||
        row.document
    );

    if (!hasAnyRowWithData && isContentEmpty) {
      toast.error("Please Write some notes");
      return false;
    }

    if (hasAnyRowWithData) {
      for (const [index, row] of rows.entries()) {
       
        if (row.type === "SELECT") {
          row.type = "";
        }
  
        const isRowEmpty =
          !row.subject?.trim() &&
          !row.type &&
          !row.date &&
          !row.letterNumber?.trim() &&
          !row.document;

 
        if (!isRowEmpty) {
          if (!row.subject?.trim()) {
            toast.error(`Row ${index + 1}: Subject is required`);
            return false;
          }
          if (!row.type) {
            toast.error(`Row ${index + 1}: Type is required`);
            return false;
          }
          if (!row.date) {
            toast.error(`Row ${index + 1}: Date is required`);
            return false;
          }
          if (!row.document) {
            toast.error(`Row ${index + 1}: Document is required`);
            return false;
          }
          if (row.type === "LETTER" && !row.letterNumber?.trim()) {
            toast.error(
              `Row ${index + 1}: Letter Number is required for Letter type`
            );
            return false;
          }
        } else {
          
          const previousRowHasData = rows
            .slice(0, index)
            .some(
              (prevRow) =>
                prevRow.subject?.trim() ||
                prevRow.type ||
                prevRow.date ||
                prevRow.letterNumber?.trim() ||
                prevRow.document
            );

          if (previousRowHasData) {
            toast.error(
              `Row ${
                index + 1
              }: All rows must be filled when using multiple rows`
            );
            return false;
          }
        }
      }
    }

    return true;
  };

  const handleDirectSubmit = async () => {
    await handleSubmit("Save");
  };
  const handleSubmit = async (action) => {
    const cleanedContent = initialContent.replace(/\s|&nbsp;/g, "").trim();
    const isContentEmpty = !cleanedContent || cleanedContent === "<p><br></p>";

    if (action !== "MARKDOWN") {
      const isValid = validateForm(rows, initialContent, action);

      if (isContentEmpty && !isValid) {
        return false;
      }

      if (!isValid) {
        return false;
      }
    }

    const documents = rows.map((row) => ({
      docSubject: row.subject,
      letterType: row.type,
      letterNumber: row.type === "LETTER" ? row.letterNumber : null,
      letterDate: row.date,
    }));

    const uploadedDocuments = rows.map((row) => row.document).filter(Boolean);

    try {
      const response = await mutation.mutateAsync({
        documents,
        uploadedDocuments,
        filePriority,
        isConfidential,
        initialContent,
      });
      if (action === "Save") {
        toast.success(response.message || "Operation successful!");
      }
      if (response.outcome === true) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log("API Error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong!"
      );
      return false;
    }
  };
  const mutation = useMutation({
    mutationFn: async (data) => {
      setIsLoading(true);
      try {
        const payload = {
          fileId: fileDetails.data.fileId,
          note: initialContent || null,
          filerecptId: fileDetails.data.fileReceiptId,
          prevNoteId: additionalDetails?.data?.prevNoteId,
          priority: data.filePriority,
          isConfidential: data.isConfidential,
        };
        console.log(payload, "payload");
        const encryptedDataObject = encryptPayload(payload);

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
          setFilePriority("Normal");
          setIsConfidential(false);
          setSelectedFiles({});

          if (refetchData && typeof refetchData === "function") {
            refetchData();
          }
          return response.data;
        } else {
          throw new Error(response.data?.message);
          toast.error(response.data?.message || "Operation failed!");
        }
      } catch (error) {
        console.log("API Error:", error);

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {},
    onError: (error) => {},
  });

  const { mutate, isError, error } = mutation;

  useEffect(() => {
    if (isError) {
      toast.error(error.message || "Submission failed");
    }
  }, [isError, error]);

  const markActionMutation = useMutation({
    mutationFn: async (action) => {
      setIsLoading(true);
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
        return true;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      } finally {
        setIsLoading(false);
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

  // const handleMarkupOrMarkdown = async (action) => {
  //   setModalAction(action);

  //   const isSubmissionSuccessful = await handleSubmit(action);

  //   if (!isSubmissionSuccessful) {
  //     return;
  //   }

  //   try {
  //     await triggerMarkAction(action);

  //     setIsModalOpen(true);
  //   } catch (error) {
  //     toast.error("Failed to trigger mark action.");
  //   }
  // };
  const handleMarkupOrMarkdown = async (action) => {
    if (action === "MARKUP" && !initialContent.trim()) {
      toast.error(
        "Please write some notes"
      );
      return;
    }

    setModalAction(action);
    const isSubmissionSuccessful = await handleSubmit(action);

    if (!isSubmissionSuccessful) {
      return;
    }

    try {
      await triggerMarkAction(action);
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Failed to trigger mark action.");
    }
  };

  const approveFileMutation = useMutation({
    mutationFn: async (data) => {
      if (!fileDetails || !additionalDetails) {
        toast.error("File details or additional details are missing.");
        return;
      }
      setIsLoading(true);
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
      setIsLoading(false);
      toast.error(error.message || "API call failed!");
    },
  });

  const handleApprove = (action) => {
    const data = { action };
    approveFileMutation.mutate(data);
  };

  const handleEndTaskClick = async () => {
    if (!initialContent.trim()) {
      toast.error("Please write some notes ");
      return;
    }

    const isSubmissionSuccessful = await handleSubmit("APPROVED");

    if (isSubmissionSuccessful) {
      handleApprove("APPROVED");
    } else {
      console.warn("❌ handleSubmit failed, End-Task won't proceed.");
    }
  };

  const handleMoveToRackClick = async () => {
    if (!initialContent.trim()) {
      toast.error("Please write some notes.");
      return;
    }

    const isSubmissionSuccessful = await handleSubmit("MOVE_TO_RACK");

    if (isSubmissionSuccessful) {
      setIsMoveToRackModalOpen(true);
    } else {
      console.warn("❌ handleSubmit failed, Move-To-Rack modal won't open.");
    }
  };

  const newEndpointMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
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

        if (!sendfilepayload.fileId || !sendfilepayload.filerecptId) {
          console.log("Required file details are missing");
          throw new Error("Required file details are missing");
        }

        console.log("Encrypting payload...");
        const encryptedDataObjectUpDown = encryptPayload(sendfilepayload);

        const SendformData = new FormData();
        SendformData.append("dataObject", encryptedDataObjectUpDown);

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
      } finally {
        setIsLoading(false);
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
      setIsLoading(false);
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
                {/* <Box
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
                </Box> */}

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
                          size="small"
                          // sx={{ height: "30px" }}
                        />
                      </Grid>
                      <Grid item xs={2.4}>
                        <FormControl fullWidth>
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={row.type}
                            onChange={(e) =>
                              handleInputChange(index, "type", e.target.value)
                            }
                            label="Type"
                            size="small"
                          >
                            {options.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
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
                          size="small"
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
                            format="DD/MM/YYYY"
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
                            closeOnSelect={true}
                            disableOpenPicker={true}
                            onAccept={(date) => {
                              if (date && date.isValid()) {
                                handleInputChange(
                                  index,
                                  "date",
                                  dayjs(date).format("DD/MM/YYYY")
                                );
                              }
                            }}
                            slotProps={{
                              textField: {
                                size: "small",
                                fullWidth: true,
                                // style: {
                                //   width: "200px",
                                // },

                                InputProps: {
                                  style: {
                                    height: "40px",
                                    fontSize: "14px",
                                  },
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <CalendarToday fontSize="small" />
                                    </InputAdornment>
                                  ),
                                },
                                sx: {
                                  "& .MuiInputBase-root": {
                                    height: "40px",
                                  },
                                  "& .MuiOutlinedInput-root": {
                                    height: "40px",
                                  },
                                  "& .MuiOutlinedInput-input": {
                                    padding: "8.5px 14px",
                                    height: "40px",
                                  },
                                },
                              },
                              actionBar: {
                                actions: [],
                              },
                              toolbar: {
                                hidden: true,
                              },
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                fullWidth
                                inputProps={{
                                  ...params.inputProps,
                                  placeholder: "DD/MM/YYYY",
                                }}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </Grid>

                      <Grid item xs={2.2}>
                        <Button
                          variant="contained"
                          component="label"
                          startIcon={
                            isDragging ? <FaCloudUploadAlt /> : <FaFolderOpen />
                          }
                          sx={{
                            bgcolor: isDragging
                              ? "rgba(32, 119, 133, 0.1)"
                              : "#207785",
                            "&:hover": { bgcolor: "#207785" },
                            height: "40px",
                            width: "100%",
                            border: isDragging ? "2px dashed #207785" : "none",
                            position: "relative",
                            transition: "all 0.3s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onDragEnter={(e) => handleDragEnter(e, index)}
                          onDragLeave={handleDragLeave}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "100%",
                            }}
                          >
                            <Typography
                              noWrap
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                color: isDragging ? "#207785" : "white",
                              }}
                            >
                              {selectedFiles[index] ? (
                                <>
                                  <FaFile />
                                  {selectedFiles[index].name}
                                </>
                              ) : (
                                <>
                                  {isDragging ? (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <FaCloudUploadAlt size={20} />
                                      <span style={{ fontSize: "12px" }}>
                                        Drop PDF here
                                      </span>
                                    </Box>
                                  ) : (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <span style={{ fontSize: "10px" }}>
                                        Browse or drag & drop
                                      </span>
                                      <span
                                        style={{
                                          color: "red",
                                          marginLeft: "4px",
                                        }}
                                      >
                                        *
                                      </span>
                                      <span
                                        style={{
                                          fontSize: "10px",
                                          // marginLeft: "4px",
                                        }}
                                      >
                                        (PDF, max 5MB)
                                      </span>
                                    </Box>
                                  )}
                                </>
                              )}
                            </Typography>
                          </Box>
                          <input
                            type="file"
                            hidden
                            accept=".pdf,application/pdf"
                            onChange={(e) =>
                              handleFileChange(index, e.target.files[0])
                            }
                          />
                        </Button>
                      </Grid>
                      {/* {rows.length > 1 && (
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
                      )} */}
                      <Grid item xs={0.8}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {/* Always show plus icon on first row */}
                          {index === 0 && (
                            <IconButton
                              size="small"
                              onClick={handleAddRow}
                              variant="outlined"
                              sx={{
                                bgcolor: "#207785",
                                "&:hover": { bgcolor: "#207785" },
                                height: "25px",
                                width: "25px",
                              }}
                            >
                              <FaPlus style={{ color: "white" }} />
                            </IconButton>
                          )}

                          {/* Show minus icon if there's more than one row or if it's not the last remaining row */}
                          {rows.length > 1 && (
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveRow(index)}
                              sx={{
                                bgcolor: "red",
                                "&:hover": { bgcolor: "darkred" },
                                height: "25px",
                                width: "25px",
                              }}
                            >
                              <FaMinus style={{ color: "white" }} />
                            </IconButton>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  ))}
                </Box>

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>File Priority</InputLabel>
                      <Select
                        value={filePriority}
                        onChange={(e) => setFilePriority(e.target.value)}
                        label="File Priority"
                        size="small"
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
                        height: "40px",
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
                  {/* Save Button */}
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<FaSave />}
                    onClick={() => handleSubmit("Save")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </Button>

                  {/* Mark Up Button */}
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FaArrowUp />}
                    onClick={() => handleMarkupOrMarkdown("MARKUP")}
                    disabled={isSubmittingAction}
                  >
                    {isSubmittingAction ? "Marking Up..." : "Mark Up"}
                  </Button>

                  {/* Mark Down Button */}
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FaArrowDown />}
                    onClick={() => handleMarkupOrMarkdown("MARKDOWN")}
                    disabled={isSubmittingAction}
                  >
                    {isSubmittingAction ? "Marking Down..." : "Mark Down"}
                  </Button>

                  {/* Send To Button */}
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FaPaperPlane />}
                    onClick={handleOpenModal}
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send To"}
                  </Button>

                  {/* Move-To-Rack or End-Task Button */}
                  {moveToRack === "MOVE_TO_RACK" ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<FaCheckCircle />}
                      onClick={handleMoveToRackClick}
                      disabled={isLoading}
                    >
                      Move-To-Rack
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<FaCheckCircle />}
                      onClick={handleEndTaskClick}
                      disabled={isLoading}
                    >
                      End-Task
                    </Button>
                  )}

                  {/* Cancel Button */}
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

        {/* <Modal
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
                  // toast.success("Confidentiality updated!");
                }}
              >
                Yes
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  setConfirmationModalOpen(false);
                  // toast.error("Confidentiality update cancelled!");
                }}
              >
                No
              </Button>
            </Box>
          </Box>
        </Modal> */}
        {/* Modal for Table and Send Button */}
        <Modal
          open={isModalOpen}
          onClose={(event, reason) => {
            if (reason === "backdropClick") {
              return;
            }
            handleCloseModal();
          }}
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
            <Typography
              variant="h6"
              sx={{ mb: 2 }}
              style={{
                backgroundColor: "#207785",
                color: "white",
                padding: "10px",
                width: "100%",
                textAlign: "center",
              }}
            >
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
        <MoveToRackModal
          open={isMoveToRackModalOpen}
          onClose={() => setIsMoveToRackModalOpen(false)}
          fileDetails={fileDetails}
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
