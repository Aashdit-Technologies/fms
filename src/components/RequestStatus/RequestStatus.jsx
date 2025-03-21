import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import useApiListStore from "../ManageFile/ApiListStore";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { toast } from "react-toastify";
import {
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
} from "@mui/material";
import { encryptPayload } from "../../utils/encrypt.js";
import dayjs from "dayjs";
import { PageLoader } from "../pageload/PageLoader";
import { useNavigate } from "react-router-dom";
import { FaHistory, FaRedoAlt } from "react-icons/fa";
import { FaEye } from "react-icons/fa6";

const customStyles = {
  table: {
    style: {
      border: "1px solid #ddd",
      borderRadius: "10px",
      overflow: "hidden",
      boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#ffffff",
      marginBottom: "1rem",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#005f73",
      color: "#ffffff",
      // fontSize: "14px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      minHeight: "52px",
      borderBottom: "2px solid #003d4c",
    },
  },
  headCells: {
    style: {
      padding: "16px",
      textAlign: "center",
      fontWeight: "bold",
      borderRight: "1px solid rgba(255, 255, 255, 0.1)",
    },
  },
  rows: {
    style: {
      fontSize: "14px",
      fontWeight: "400",
      color: "#333",
      backgroundColor: "#ffffff",
      minHeight: "50px",
      transition: "background-color 0.2s ease-in-out",
      "&:not(:last-of-type)": {
        borderBottom: "1px solid #ddd",
      },
      "&:hover": {
        backgroundColor: "#e6f2f5",
        cursor: "pointer",
      },
    },
    stripedStyle: {
      backgroundColor: "#f9f9f9",
    },
  },
  cells: {
    style: {
      padding: "12px 16px",
      textAlign: "center",
      borderRight: "1px solid #ddd",
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid #ddd",
      padding: "10px",
      backgroundColor: "#f9f9f9",
    },
  },
  noData: {
    style: {
      padding: "24px",
      textAlign: "center",
      fontSize: "14px",
      color: "#777",
      backgroundColor: "#f9f9f9",
    },
  },
};

const RequestStatus = ({ onSwitchTab }) => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [rqstStsData, setRqstStsData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [fileDetails, setFileDetails] = useState(null);
  const [fileDetailsModalVisible, setFileDetailsModalVisible] = useState(false);
  const [rowSize, setRowSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);

  const Navigate = useNavigate();

  const conditionalRowStyles = [
    {
      when: (row) => row.status === "RECALLED" || row.isRecalled === true,
      style: {
        backgroundColor: "#e6f2f5 !important",
        "&:hover": {
          cursor: "pointer",
          backgroundColor: "#d1e9ed !important",
        },
      },
    },
  ];

  useEffect(() => {
    fetchFilteredData(fromDate, toDate);
  }, [fromDate, toDate, pageNo, rowSize]);

  const fetchFilteredData = async (fromDate, toDate) => {
    setLoading(true);
    try {
      const token = useAuthStore.getState().token;
      const params = {};

      if (fromDate)
        params.fromDate = dayjs(fromDate).format("DD/MM/YYYY") || "";
      if (toDate) params.toDate = dayjs(toDate).format("DD/MM/YYYY") || "";

      const payload = {
        fromDate: params.fromDate,
        toDate: params.toDate,
        pageNo: pageNo,
        rowSize: rowSize,
      };

      const encryptedMessage = encryptPayload(payload);

      const response = await api.get("/file/view-status", {
        headers: { Authorization: `Bearer ${token}` },
        params: { dataObject: encryptedMessage },
      });
      setRqstStsData((prevData) => {
        const newData = response.data.data || [];
        return newData.map((newItem) => {
          const existingItem = prevData.find(
            (item) => item.fileId === newItem.fileId
          );
          return {
            ...newItem,
            status: existingItem ? existingItem.status : newItem.status,
            isRecalled: existingItem ? existingItem.isRecalled : false,
            seenfile: newItem.seenfile || "No",
            seenActive: newItem.seenActive || "N",
            senderJobRoleId: newItem.senderJobRoleId,
            currentUserJobRoleId: newItem.currentUserJobRoleId,
          };
        });
      });
      // setRqstStsData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setLoading(false);
    }
  };

  // const handleCallFor = async (fileId, fileReceiptId) => {
  //   setLoading(true);
  //   try {
  //     const token = useAuthStore.getState().token;
  //     // const payload = encryptPayload({ fileId, fileReceiptId });

  //     const payload = { fileReceiptId: fileReceiptId, fileId: fileId, calltype:"callfor"};
  //     const encryptedMessage = encryptPayload(payload);
  //     const response = await api.post("file/call-for-recall",
  //       { dataObject: encryptedMessage },
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     if(response.data.outcome == true){
  //       toast.success(response.data.message);
  //       fetchFilteredData();
  //     }
  //     else{
  //       toast.error(response.data.message);
  //     }
  //   } catch (error) {
  //     console.error("Error in Call For request:", error);
  //   }finally{
  //     setLoading(false);
  //   }
  // };

  const handleReCall = async (fileId, fileReceiptId) => {
    setLoading(true);
    try {
      const token = useAuthStore.getState().token;
      // const payload = encryptPayload({ fileId, fileReceiptId });

      const payload = {
        fileReceiptId: fileReceiptId,
        fileId: fileId,
        calltype: "recall",
      };
      const encryptedMessage = encryptPayload(payload);
      const response = await api.post(
        "file/call-for-recall",
        { dataObject: encryptedMessage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.outcome == true) {
        setRqstStsData((prevData) =>
          prevData.map((item) =>
            item.fileId === fileId
              ? {
                  ...item,
                  status: "RECALLED",
                  isRecalled: true,
                }
              : item
          )
        );
        toast.success(response.data.message);
        await fetchFilteredData(fromDate, toDate);
        onSwitchTab();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error in Call For request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDetailsClick = (file) => {
    setFileDetails(file);
    setFileDetailsModalVisible(true);
  };

  const handleHistoryClick = async (file) => {
    setLoading(true);

    const payload = { fileId: file.fileId };

    try {
      const token = useAuthStore.getState().token;

      const encryptedMessage = encryptPayload(payload);

      const response = await api.get("file/view-file-history", {
        headers: { Authorization: `Bearer ${token}` },

        params: {
          dataObject: encryptedMessage,
        },
      });

      console.log("History Data Response:", response.data);

      setHistoryData(response.data.fileHist || []);

      setHistoryModalVisible(true);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStatus = (file, tabPanelId) => {
    setLoading(true);
    console.log("Edit Clicked:view", file);

    if (!file) return;

    Navigate(
      "/main-file",
      { state: { file: file, tabPanelId: 2 } },
      { replace: true }
    );
  };
  const columns = [
    {
      name: "SL",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "80px",
    },
    {
      name: "File Number",
      selector: (row) => row.fileNo,
      sortable: true,
      cell: (row) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
            textAlign: "left",
            gap: "8px",
          }}
        >
          <a href="#" onClick={() => handleFileDetailsClick(row)}>
            {row.fileNo}
          </a>
          <span className="bg-primary rounded text-white p-1">
            {row.priority}
          </span>
        </div>
      ),
      width: "400px",
    },
    {
      name: "File Name",
      selector: (row) => row.fileName,
      sortable: true,
      width: "280px",
    },
    {
      name: "From",
      selector: (row) => row.fromEmployee,
      sortable: true,
      width: "150px",
    },
    {
      name: "Send On",
      selector: (row) => row.sentOn,
      sortable: true,
      width: "155px",
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={`rounded p-1 text-white ${
            row.status === "APPROVED"
              ? "bg-success"
              : row.status === "PENDING"
              ? "bg-warning"
              : "bg-secondary"
          }`}
        >
          {row.status}
        </span>
      ),
      width: "130px",
    },
    {
      name: "Action",
      cell: (row) => {
        // Check if recall is allowed based on conditions
        const canRecall =
          !row.isRecalled && // Not already recalled
          (row.seenfile === "No" || row.seenfile === "N") && // Not seen
          (row.seenActive === "N" || row.seenActive === "") && // Not actively viewed
          row.senderJobRoleId === row.currentUserJobRoleId; // Current user is sender

        return (
          <div className="d-flex">
            {canRecall && (
              <Button
                variant="contained"
                color="error"
                size="small"
                title="Recall"
                // className="ms-2"
                onClick={() => handleReCall(row.fileId, row.fileReceiptId)}
                sx={{
                  minWidth: "auto",
                  padding: "6px 10px",
                  marginRight: "8px",
                }}
              >
                <FaRedoAlt />
              </Button>
            )}
            <Button
              variant="contained"
              color="success"
              size="small"
              title="View"
              sx={{
                minWidth: "auto",
                padding: "6px 10px",
                marginRight: "8px",
              }}
              onClick={() => handleViewStatus(row)}
            >
              <FaEye />
            </Button>

            <Button
              variant="contained"
              color="secondary"
              size="small"
              title="History"
              sx={{
                minWidth: "auto",
                padding: "6px 10px",
                marginRight: "8px",
              }}
              onClick={() => handleHistoryClick(row)}
              disabled={loading}
            >
              <FaHistory />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleFromDateChange = (newValue) => {
    setFromDate(newValue);
    if (toDate && newValue && dayjs(newValue).isAfter(dayjs(toDate))) {
      setToDate(null);
      setError("To Date cannot be before From Date");
    } else {
      setError("");
    }
  };

  const handleToDateChange = (newValue) => {
    if (fromDate && newValue && dayjs(newValue).isBefore(dayjs(fromDate))) {
      toast.error("To Date cannot be before From Date");
      setToDate(null);
    } else {
      setToDate(newValue);
      setError("");
    }
  };

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="row mb-3">
          <div className="form-group col-md-3">
            <DatePicker
              label="From Date"
              value={fromDate}
              onChange={handleFromDateChange}
              format="DD/MM/YYYY"
              renderInput={(params) => (
                <TextField {...params} fullWidth variant="outlined" />
              )}
            />
          </div>

          <div className="form-group col-md-3">
            <DatePicker
              label="To Date"
              value={toDate}
              onChange={handleToDateChange}
              format="DD/MM/YYYY"
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  variant="outlined"
                  error={!!error}
                  helperText={error}
                />
              )}
            />
          </div>
        </div>
      </LocalizationProvider>
      {loading && <PageLoader />}
      <DataTable
        columns={columns}
        data={rqstStsData}
        progressPending={loading}
        striped
        bordered
        pagination
        highlightOnHover
        paginationServer
        customStyles={customStyles}
        conditionalRowStyles={conditionalRowStyles}
        paginationPerPage={rowSize}
        paginationDefaultPage={pageNo}
        onChangePage={(page) => setPageNo(page)}
        onChangeRowsPerPage={(newRowSize) => {
          setRowSize(newRowSize);
          setPageNo(1);
        }}
      />

      <Modal
        open={fileDetailsModalVisible}
        onClose={() => setFileDetailsModalVisible(false)}
      >
        <Dialog
          open={fileDetailsModalVisible}
          onClose={() => setFileDetailsModalVisible(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>File Details</DialogTitle>
          <DialogContent>
            {fileDetails && (
              <Table>
                <TableBody>
                  {Object.entries({
                    "File No": fileDetails.fileNo,
                    "File Type": (
                      <span
                        style={{
                          backgroundColor: "#47A447",
                          color: "white",
                          padding: "5px",
                          borderRadius: "5px",
                        }}
                      >
                        {fileDetails.fileType}
                      </span>
                    ),

                    "File Name": fileDetails.fileName,
                    Subject: fileDetails.subject || "NA",
                    Title: fileDetails.title || "NA",
                    Activity: fileDetails.activity || "NA",
                    Custodian: fileDetails.custodian || "NA",

                    // "From Employee": fileDetails.fromEmployee,

                    // Status: fileDetails.status,

                    // Priority: fileDetails.priority,

                    // "File Module": fileDetails.fileType,

                    Room: fileDetails.roomNumber,

                    Rack: fileDetails.rackNumber,

                    Cell: fileDetails.cellNumber,
                    "Created By": fileDetails.createdBy || "NA",
                    "Created Date": fileDetails.sentOn,
                  }).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell component="th" scope="row">
                        {key}
                      </TableCell>

                      <TableCell>{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions>
            {/* <Button variant="contained" color="success" onClick={() => handleVolumeFile(fileDetails)}>
            Create New Volume
          </Button>
          <Button variant="contained" color="success" onClick={() => handlePartFile(fileDetails)}>
            Create Part File
          </Button> */}
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setFileDetailsModalVisible(false)}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Modal>
      <Modal
        open={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
      >
        <Dialog
          open={historyModalVisible}
          onClose={() => setHistoryModalVisible(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>File History</DialogTitle>

          <DialogContent>
            <Table sx={{ borderCollapse: "collapse", width: "100%" }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      border: "1px solid #ccc",
                      backgroundColor: "#005F73",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    Sl
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "1px solid #ccc",
                      backgroundColor: "#005F73",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    File Number
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "1px solid #ccc",
                      backgroundColor: "#005F73",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    Sender
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "1px solid #ccc",
                      backgroundColor: "#005F73",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    Receiver
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "1px solid #ccc",
                      backgroundColor: "#005F73",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    Docket No.
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "1px solid #ccc",
                      backgroundColor: "#005F73",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    Action Date
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "1px solid #ccc",
                      backgroundColor: "#005F73",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {historyData.map((historyItem, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ border: "1px solid #ccc" }}>
                      {historyData.length - index}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #ccc" }}>
                      {historyItem.fileNo}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #ccc" }}>
                      {historyItem.sender || "NA"}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #ccc" }}>
                      {historyItem.receiver || "NA"}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #ccc" }}>
                      {historyItem.docketNo || "NA"}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #ccc" }}>
                      {historyItem.actionDate || "NA"}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #ccc" }}>
                      {index === 0 ? "Present" : "Sent"}{" "}
                      {/* Conditional rendering */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>

          <DialogActions>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setHistoryModalVisible(false)}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Modal>
    </div>
  );
};

export default RequestStatus;
