import React, { useState, useEffect } from "react";

import { useMutation } from "@tanstack/react-query";

import useApiListStore from "../ManageFile/ApiListStore";

import api from "../../Api/Api";

import { FaEdit, FaHistory } from "react-icons/fa";

import useAuthStore from "../../store/Store";

import { encryptPayload } from "../../utils/encrypt.js";

import MainFile from "../FileSection/MainFile.jsx";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import "./NewRequest.css";

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
  Pagination,
} from "@mui/material";

import DataTable from "react-data-table-component";

import { Autocomplete, TextField, Button } from "@mui/material";

import { MdOutlineMoveDown } from "react-icons/md";

import { PageLoader } from "../pageload/PageLoader";
import SendToRackModal from "./SendToRackModal.jsx";

const customStyles = {
  table: {
    style: {
      border: "1px solid #ddd",
      borderRadius: "10px",
      backgroundColor: "#ffffff",
      marginBottom: "1rem",
    },
  },
  tableWrapper: {
    style: {
      display: "block",
      maxHeight: "450px",
      overflowY: "auto",
      boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
      // backgroundColor: "#ffffff",
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

const NewRequest = ({ handelRefecthNew, onSwitchTab }) => {
  const [selectedFileModule, setSelectedFileModule] = useState("0");

  const [priority, setPriority] = useState("All");

  const [prioritylyst, setPrioritylyst] = useState("");

  const [nRData, setNRData] = useState({ prioritylst: [], receiptList: [] });

  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const [roomId, setRoom] = useState("");

  const [rackId, setRack] = useState("");

  const [cellNo, setCell] = useState("");

  const { fileModules, fetchAllData } = useApiListStore();

  const [roomData, setRoomData] = useState([]);

  const [rackData, setRackData] = useState([]);

  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  const [historyData, setHistoryData] = useState([]);

  const [fileDetails, setFileDetails] = useState(null);

  const [fileDetailsModalVisible, setFileDetailsModalVisible] = useState(false);

  const [rowSize, setRowSize] = useState(50);
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  console.log("filedetails", fileDetails);

  const Navigate = useNavigate();

  const conditionalRowStyles = [
    {
      when: (row) => row.seenFile === "No",

      style: {
        backgroundColor: "#b2c0ff82",

        color: "#000000", // Black text color
      },
    },
  ];

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    const fetchRoomData = async () => {
      setLoading(true);
      try {
        const token = useAuthStore.getState().token;

        const response = await api.get("/manage-room", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRoomData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching room data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, []);

  useEffect(() => {
    const fetchRackData = async () => {
      setLoading(true);
      if (!roomId) {
        setRackData([]);

        return;
      }

      const payload = { docRoomId: roomId };

      try {
        const token = useAuthStore.getState().token;

        const encryptedMessage = encryptPayload(payload);

        const response = await api.get("/manage-file-rack", {
          headers: {
            Authorization: `Bearer ${token}`,
          },

          params: {
            dataObject: encryptedMessage,
          },
        });

        setRackData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching rack data:", error);

        setRackData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRackData();
  }, [roomId]);

  const fetchFilteredData = async (
    priority,
    fileModule,
    page = pageNo,
    size = rowSize
  ) => {
    setLoading(true);

    try {
      const token = useAuthStore.getState().token;

      const payload = {
        priority: priority || null,

        fileModule: fileModule || null,

        pageNo: page,
        rowSize: size,
      };

      const encryptedMessage = encryptPayload(payload);

      // Send the encrypted data as a parameter

      const response = await api.get("file/new-request", {
        headers: { Authorization: `Bearer ${token}` },

        params: { dataObject: encryptedMessage },
      });

      setNRData(response.data.data || []);
      setPrioritylyst(response.data.data.prioritylst || []);
      // setTotalPages(response.data.totalPages || 0);
      const totalRecords = response.data.data.totalPages;
      console.log("totalRecords", totalRecords);

      setTotalPages(totalRecords);

      console.log(response.data.data);
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredData(priority, selectedFileModule, pageNo, rowSize);
  }, [priority, selectedFileModule]);

  // Update handlePageChange function
  const handlePageChange = (event, newPage) => {
    if (newPage !== pageNo) {
      setPageNo(newPage);
      fetchFilteredData(priority, selectedFileModule, newPage, rowSize);
    }
  };

  // Update handleRowSizeChange function
  const handleRowSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setRowSize(newSize);
    setPageNo(1); // Reset to first page when changing row size
    fetchFilteredData(priority, selectedFileModule, 1, newSize);
  };

  useEffect(() => {
    if (handelRefecthNew) {
      fetchFilteredData(priority, selectedFileModule);
    }
  }, [handelRefecthNew]);

  const handleEditClick = (file) => {
    setLoading(true);
    console.log("Edit Clicked:edit", file);

    if (!file) return;

    Navigate(
      "/main-file",
      { state: { file: file, tabPanelId: 1 } },
      { replace: true }
    );
  };

  const handleSelectChange = (setter, event) => {
    setter(event.target.value);
  };

  const handleSendToRack = (file) => {
    setSelectedFile(file);

    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);

    setSelectedFile(null);

    setRoom("");

    setRack("");

    setCell("");
  };

  const handleFormSubmit = async (e) => {
    setLoading(true);

    e.preventDefault();

    try {
      const token = useAuthStore.getState().token;

      const payload = {
        fileId: selectedFile.fileId,

        roomId,

        rackId,

        cellNo,
      };

      const encryptedMessage = encryptPayload(payload);

      const response = await api.post(
        "/file/update-room-rack-cell",

        { dataObject: encryptedMessage },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("File successfully sent to rack:", response.data);

      closeModal();
    } catch (error) {
      console.error("Error submitting the form:", error);
    } finally {
      setLoading(false);
    }
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

  const handleFileDetailsClick = (file, e) => {
    e.preventDefault();
    setFileDetails(file);

    setFileDetailsModalVisible(true);
    toggleBodyScroll(false);
  };

  const handleVolumeFile = async (fileDetails) => {
    setLoading(true);

    const payload = {
      fileId: fileDetails.fileId,

      fileTypeId: fileDetails.fileTypeId,
    };

    try {
      const token = useAuthStore.getState().token;

      const encryptedMessage = encryptPayload(payload); // Ensure it's properly awaited

      const response = await api.post(
        "file/create-volume-file",

        {},

        {
          headers: { Authorization: `Bearer ${token}` },

          params: { dataObject: encryptedMessage },
        }
      );

      if (response.data.outcome == true) {
        toast.success(response.data.message);

        setFileDetailsModalVisible(false);

        fetchFilteredData(priority, selectedFileModule);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePartFile = async (fileDetails) => {
    setLoading(true);

    const payload = {
      fileReceiptId: fileDetails.fileReceiptId,
      fileTypeId: fileDetails.fileTypeId,
    };

    try {
      const token = useAuthStore.getState().token;

      const encryptedMessage = encryptPayload(payload);

      const response = await api.post(
        "file/create-part-file",

        {},

        {
          headers: { Authorization: `Bearer ${token}` },

          params: { dataObject: encryptedMessage },
        }
      );

      if (response.data.outcome == true) {
        toast.success(response.data.message);

        setFileDetailsModalVisible(false);

        fetchFilteredData(priority, selectedFileModule);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      setLoading(false);
    }
  };
  const toggleBodyScroll = (disable) => {
    if (disable) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
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
          <button
            onClick={(e) => handleFileDetailsClick(row, e)}
            style={{
              background: "none",
              border: "none",
              color: "#0066cc",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
              textAlign: "left",
            }}
          >
            {row.fileNo}
          </button>
          <span className="bg-primary rounded text-white p-1">
            {row.priority}
          </span>
        </div>
      ),

      sortable: true,

      width: "400px",
    },

    {
      name: "File Name",

      selector: (row) => row.fileName,

      sortable: true,
      width: "300px",
    },
    {
      name: "Send On",

      selector: (row) => row.sentOn,

      sortable: true,
    },

    {
      name: "Status",

      selector: (row) => row.status,

      sortable: true,

      cell: (row) => (
        <span className="bg-warning text-white rounded p-1">{row.status}</span>
      ),
    },

    {
      name: "Action",

      cell: (row) => (
        <>
          <div className="main_btn d-flex justify-content-between">
            <div className="main_btn_fst  ">
              <Button
                variant="contained"
                color="warning"
                size="small"
                title="Send to Rack"
                sx={{
                  minWidth: "auto",
                  padding: "6px 10px",
                  marginRight: "8px",
                }}
                onClick={() => handleSendToRack(row)}
                disabled={loading}
              >
                <MdOutlineMoveDown />
              </Button>

              <Button
                variant="contained"
                color="primary"
                size="small"
                title="Edit"
                sx={{
                  minWidth: "auto",
                  padding: "6px 10px",
                  marginRight: "8px",
                }}
                onClick={() => handleEditClick(row)}
                disabled={loading}
              >
                <FaEdit />
              </Button>
            </div>

            <div className="main_btn_snd mr-2">
              <Button
                variant="contained"
                color="secondary"
                size="small"
                title="Edit"
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
          </div>
        </>
      ),
    },
  ];

  return (
    <div>
      <div className="row">
        <div className="form-group col-md-3">
          {/* <label htmlFor="prioritySelect">Priority</label> */}

          <Autocomplete
            id="prioritySelect"
            size="small"
            options={["All", ...prioritylyst]}
            getOptionLabel={(option) => option}
            value={priority || null}
            onChange={(event, newValue) => setPriority(newValue || "")}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Priority"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </div>

        <div className="form-group col-md-3">
          {/* <label htmlFor="fileModuleSelect">File Module</label> */}

          <Autocomplete
            size="small"
            id="fileModuleSelect"
            options={[{ moduleId: "0", moduleName: "All" }, ...fileModules]}
            getOptionLabel={(option) => option.moduleName}
            value={
              fileModules.find((f) => f.moduleId === selectedFileModule) || null
            }
            onChange={(event, newValue) =>
              setSelectedFileModule(newValue ? newValue.moduleId : "")
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select File Module"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </div>

        <div className="col-md-12 mt-3">
          <div className="table-responsive p-3">
            <DataTable
              columns={columns}
              data={nRData.data || []}
              progressPending={loading}
              progressComponent={<PageLoader />}
              customStyles={customStyles}
              striped
              bordered
              noDataComponent={<div>No data available</div>}
              pagination={false}
              conditionalRowStyles={conditionalRowStyles}
              responsive
              fixedHeader
              fixedHeaderScrollHeight="450px"
            />
            <div className="d-flex justify-content-end align-items-center mt-3 gap-2">
              <div className="d-flex align-items-center">
                <span className="me-2">Rows per page:</span>
                <select
                  value={rowSize}
                  onChange={handleRowSizeChange}
                  className="form-select form-select-sm"
                  style={{ width: "80px", marginLeft: "8px" }}
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={150}>150</option>
                </select>
              </div>

              <div className="d-flex align-items-center">
                <Pagination
                  count={totalPages}
                  page={pageNo}
                  onChange={handlePageChange}
                  variant="outlined"
                  color="primary"
                  size="medium"
                  showFirstButton
                  showLastButton
                  siblingCount={1}
                  boundaryCount={1}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      margin: "0 2px",
                      minWidth: "32px",
                      height: "32px",
                    },
                    "& .Mui-selected": {
                      backgroundColor: "#1a5f6a !important",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#1a5f6a",
                      },
                    },
                  }}
                />
                <span className="ms-3">
                  Page {pageNo} of {totalPages}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalVisible && selectedFile && (
        <SendToRackModal
          open={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedFile(null);
          }}
          selectedFile={selectedFile}
          onSuccess={() => {
            fetchFilteredData(priority, selectedFileModule);
            onSwitchTab();
          }}
        />
      )}

      <Modal
        open={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
      >
        <Dialog
          open={historyModalVisible}
          onClose={() => setHistoryModalVisible(false)}
          maxWidth="xl"
          fullWidth
        >
          <DialogTitle>File History</DialogTitle>

          <DialogContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sl</TableCell>

                  <TableCell>File Number</TableCell>

                  <TableCell>Sender</TableCell>

                  <TableCell>Receiver</TableCell>

                  <TableCell>Docket No.</TableCell>

                  <TableCell>Action Date</TableCell>

                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {historyData.map((historyItem, index) => (
                  <TableRow key={index}>
                    <TableCell>{historyData.length - index}</TableCell>

                    <TableCell>{historyItem.fileNo}</TableCell>

                    <TableCell>{historyItem.sender || "NA"}</TableCell>

                    <TableCell>{historyItem.receiver || "NA"}</TableCell>

                    <TableCell>{historyItem.docketNo || "NA"}</TableCell>

                    <TableCell>{historyItem.actionDate || "NA"}</TableCell>

                    <TableCell>
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

      <Modal
        open={fileDetailsModalVisible}
        onClose={() => setFileDetailsModalVisible(false)}
      >
        <Dialog
          open={fileDetailsModalVisible}
          onClose={() => {
            setFileDetailsModalVisible(false);
            toggleBodyScroll(false); // Enable scroll when closing modal
          }}
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
                    Activity:fileDetails.activity || "NA",
                    Custodian:fileDetails.custodian || "NA",

                    // "From Employee": fileDetails.fromEmployee,

                    // Status: fileDetails.status,

                    // Priority: fileDetails.priority,

                    // "File Module": fileDetails.fileType,

                    Room: fileDetails.roomNumber,

                    Rack: fileDetails.rackNumber,

                    Cell: fileDetails.cellNumber,
                    "Created By":fileDetails.createdBy || "NA",
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
            {!fileDetails?.parentFileId && (
              <Button
                variant="contained"
                color="success"
                onClick={() => handleVolumeFile(fileDetails)}
              >
                Create New Volume
              </Button>
            )}

            {!fileDetails?.parentFileId && (
              <Button
                variant="contained"
                color="success"
                onClick={() => handlePartFile(fileDetails)}
              >
                Create Part File
              </Button>
            )}

            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setFileDetailsModalVisible(false);
                toggleBodyScroll(false);
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Modal>
    </div>
  );
};

export default NewRequest;
