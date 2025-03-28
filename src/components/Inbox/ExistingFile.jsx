import React, { useState, useEffect } from "react";

import useApiListStore from "../ManageFile/ApiListStore";

import api from "../../Api/Api";

import { FaEdit, FaHistory } from "react-icons/fa";

import useAuthStore from "../../store/Store";

import { encryptPayload } from "../../utils/encrypt.js";

import { useLocation, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,Autocomplete, TextField, IconButton, Pagination, Modal, Table, TableHead, TableRow, TableCell, TableBody  } from "@mui/material";

import DataTable from "react-data-table-component";

import CloseIcon from "@mui/icons-material/Close";
import useLetterStore from "../Inbox/useLetterStore.js";

import { MdOutlineMoveDown } from "react-icons/md";

import { PageLoader } from "../pageload/PageLoader";

import SendToRackModal from "../NewRequest/SendToRackModal.jsx";
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

const NewRequest = ({ handelRefecthNew }) => {
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
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const token = useAuthStore.getState().token; 
  const [isLoading, setIsLoading] = useState(false);
  const Navigate = useNavigate();

  const conditionalRowStyles = [
    {
      when: (row) => row.seenFile === "No",

      style: {
        backgroundColor: "#b2c0ff82",

        color: "#000000",
      },
    },
  ];

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);


  const location = useLocation();
  const [letterReceiptId, setLetterReceiptId] = useState(null);
  const [metadataId, setMetadataId] = useState(null);

  useEffect(() => {
    const fetchedData = location.state?.data || {};
    const receiptId = fetchedData?.letterReceiptId || null;
    const metadataId = fetchedData.metadataId;
    setLetterReceiptId(receiptId);
    setMetadataId(metadataId)
  }, [location.state]);


  useEffect(() => {
    const fetchRoomData = async () => {
      setIsLoading(true);
      try {
        const token = useAuthStore.getState().token;

        const response = await api.get("/manage-room", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRoomData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching room data:", error);
      } finally {
        setIsLoading(false);

      }
    };

    fetchRoomData();
  }, []);

  useEffect(() => {
    const fetchRackData = async () => {
      
      if (!roomId) {
        setRackData([]);

        return;
      }

      const payload = { docRoomId: roomId };
      setIsLoading(true);
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
        setIsLoading(false);
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
    setIsLoading(true);

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
     

      setTotalPages(totalRecords);

    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setIsLoading(false);
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
  const handleSave = () => {
    if (selectedRows.length === 0) {
      setModalMessage("Please select a file to tag letter or create a new file");
      setShowModal(true);
      setIsConfirming(false); 
      return;
    }

    setModalMessage("Do you want to tag letter to this file?");
    setShowModal(true);
    setIsConfirming(true); 
  };

  const handleConfirm = async () => {
    setShowModal(false); 

    if (!isConfirming) {
      return; 
    }
    setIsLoading(true);
    try {
      const payload = {
        metadataId,
        letterReceiptId,
        fileRecId: selectedRows.map(Number),
      };

      const encryptedPayload = encryptPayload(payload);

      const response = await api.post(
        "letter/add-letter-to-file",
        { dataObject: encryptedPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        useLetterStore.getState().setSuccessMessage(response.data.message);
        //toast.success(response.data.message); 
        setSelectedRows([]);
        Navigate("/letter");
      } else {
        toast.error("Failed to send data.");
      }
    } catch (error) {
      console.error("Error sending data:", error);
      toast.error("An error occurred while sending data.");
    }
    finally{
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (fileReceiptId) => {
    setSelectedRows((prevSelected) => {
      if (prevSelected.includes(fileReceiptId)) {
        
        return prevSelected.filter((id) => id !== fileReceiptId);
      } else {
        
        return [...prevSelected, fileReceiptId];
      }
    });
  };



  const columns = [
    {
      name: "Select",
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.fileReceiptId)} 
          onChange={() => handleCheckboxChange(row.fileReceiptId)} 
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "70px",
    },

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
          </div>
        </>
      ),
    },
  ];

  return (
    <div>
       {isLoading && <PageLoader />}
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
             <div className="mt-3 d-flex align-items-center justify-content-center">
          <Button
           variant="contained"
           color="success" 
           sx={{ textTransform: 'none', }}
           onClick={handleSave}>
            Save
          </Button>
          <Button 
          sx={{
            textTransform: 'none', 
          }}
           className=" ms-2"
            variant="contained"
             color="error"
              onClick={() => Navigate("/letter")}>
          Cancel
      </Button>
       
    

      </div>
     
     

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

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
  
  {/* Dialog Title with Close Icon */}
  <DialogTitle
      sx={{ 
        backgroundColor: "#207785", 
        color: "#fff",             
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        height: "60px",              
        fontWeight: "bold",
        fontSize: "1.2rem",
        padding: "10px 20px"         
      }}
  >
    Confirmation
    <IconButton onClick={() => setShowModal(false)} sx={{ color: "white" }}>
      <CloseIcon />
    </IconButton>
  </DialogTitle>

  {/* Dialog Content */}
  <DialogContent>
    <Typography variant="body1" sx={{ p: 2, color: "#1a5f6a" }}>
      {modalMessage}
    </Typography>
  </DialogContent>

  {/* Dialog Actions */}
  <DialogActions  sx={{ 
        backgroundColor: "#F5F5F5", // Light gray for footer
        height: "50px",            // Set footer height
        padding: "10px 20px",
        display: "flex",
        justifyContent: "flex-end" // Align button to the right
      }}>
    <Button
      onClick={() => setShowModal(false)}
      variant="contained"
      sx={{
        borderRadius: "8px",
        textTransform: 'none', 
        
        px: 3,
        color: "#fff",
        background: "red",
      }}
    >
      Cancel
    </Button>
    <Button
      onClick={handleConfirm}
      variant="contained"
      sx={{
        borderRadius: "8px",
        textTransform: 'none', 
        px: 3,
        bgcolor: "#1b5e20",
      }}
    >
      OK
    </Button>
  </DialogActions>

       </Dialog>
      







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
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>File History</DialogTitle>

          <DialogContent>
            <Table sx={{ borderCollapse: "collapse", width: "100%" }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ border: "1px solid #ccc",backgroundColor: '#005F73', fontWeight: "bold",color: '#fff' }}
                  >
                    Sl
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid #ccc",backgroundColor: '#005F73', fontWeight: "bold",color: '#fff' }}
                  >
                    File Number
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid #ccc",backgroundColor: '#005F73', fontWeight: "bold",color: '#fff' }}
                  >
                    Sender
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid #ccc",backgroundColor: '#005F73', fontWeight: "bold",color: '#fff' }}
                  >
                    Receiver
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid #ccc", backgroundColor: '#005F73',fontWeight: "bold",color: '#fff' }}
                  >
                    Docket No.
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid #ccc",backgroundColor: '#005F73', fontWeight: "bold" ,color: '#fff'}}
                  >
                    Action Date
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid #ccc",backgroundColor: '#005F73', fontWeight: "bold" ,color: '#fff'}}
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