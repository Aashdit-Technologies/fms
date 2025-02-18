import React, { useState, useEffect } from "react";
import useApiListStore from "../ManageFile/ApiListStore";
import api from "../../Api/Api";
import { FaEdit, FaHistory } from "react-icons/fa";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt.js";
import { useLocation, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component"; 
import { MdOutlineMoveDown } from "react-icons/md";
import {toast, ToastContainer } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
import useLetterStore from "../Inbox/useLetterStore.js";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,Autocomplete, TextField, IconButton  } from "@mui/material";
const customStyles = {
  table: {
    style: {
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#ffffff",
      marginBottom: "1rem",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#207785",
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      minHeight: "52px",
      borderBottom: "2px solid #1a5f6a",
    },
  },
  headCells: {
    style: {
      padding: "16px",
      justifyContent: "center",
      "&:not(:last-of-type)": {
        // borderRight: "1px solid rgba(255, 255, 255, 0.1)",
      },
    },
  },
  rows: {
    style: {
      fontSize: "13px",
      fontWeight: "400",
      color: "#333333",
      backgroundColor: "#ffffff",
      minHeight: "48px",
      "&:not(:last-of-type)": {
        // borderBottom: "1px solid #e0e0e0",
      },
      "&:hover": {
        backgroundColor: "#f5f9fa",
        cursor: "pointer",
        transition: "all 0.2s ease",
      },
    },
    stripedStyle: {
      backgroundColor: "#f8f9fa",
    },
  },
  cells: {
    style: {
      padding: "12px 16px",
      justifyContent: "center",
      "&:not(:last-of-type)": {
        borderRight: "1px solid #e0e0e0",
      },
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid #e0e0e0",
      backgroundColor: "#f8f9fa",
      color: "#333333",
      fontSize: "13px",
      fontWeight: "500",
      padding: "8px 16px",
      "& .MuiButtonBase-root": {
        backgroundColor: "#207785",
        color: "#ffffff",
        "&:hover": {
          backgroundColor: "#1a5f6a",
        },
      },
    },
    pageButtonsStyle: {
      borderRadius: "4px",
      height: "32px",
      minWidth: "32px",
      padding: "0 6px",
      margin: "0 4px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      backgroundColor: "#207785",
      color: "#ffffff",
      "&:hover:not(:disabled)": {
        backgroundColor: "#1a5f6a",
        color: "#ffffff",
      },
      "&:disabled": {
        opacity: 0.5,
        cursor: "not-allowed",
      },
    },
  },
  noData: {
    style: {
      padding: "24px",
      textAlign: "center",
      color: "#666666",
    },
  },
};
const ExistingFile = () => {
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

  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const fetchedData = location.state?.data; 
  const letterReceiptId = fetchedData.letterReceiptId;
  const metadataId = fetchedData.metadataId;
  const token = useAuthStore.getState().token; 

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const token = useAuthStore.getState().token;
        const response = await api.get("/manage-room", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoomData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching room data:", error);
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
      }
    };

    fetchRackData();
  }, [roomId]);

  const fetchFilteredData = async (priority, fileModule) => {
    setLoading(true);
    try {
      const token = useAuthStore.getState().token;
      const payload = {
        priority: priority || null,
        fileModule: fileModule || null,
        pageno: 1,
      };

      const encryptedMessage = encryptPayload(payload);

      const response = await api.get("file/new-request", {
        headers: { Authorization: `Bearer ${token}` },
        params: { dataObject: encryptedMessage },
      });
      setNRData(response.data.data || []);
      setPrioritylyst(response.data.data.prioritylst || []);

      console.log(response.data.data);
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredData(priority, selectedFileModule);
  }, [priority, selectedFileModule]);

    const fetchFileDetails = async (file) => {
      if (!file) return;
      const token = sessionStorage.getItem("token");
      try {
        setLoading(true);
        
        const payload1 = encryptPayload({
          tabPanelId: 1,
          fileId: file.fileId,
          fileReceiptId: file.fileReceiptId,
        });
        const payload2 = encryptPayload({ fileId: file.fileId });
        const payload3 = encryptPayload({
          fileId: file.fileId,
          lastFileSentDate: "",
        });
    
        const [response1, response2, response3, response4] = await Promise.all([
          api.post(
            "/file/basic-details",
            { dataObject: payload1 },
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          api.post(
            "/file/get-draft-notesheet",
            { dataObject: payload2 },
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          api.post(
            "/file/file-correspondences",
            { dataObject: payload3 },
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          api.post(
            "/file/file-notesheets",
            { dataObject: payload3 },
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);
        const fileData = {
          fileDetails: response1.data,
          additionalDetails: response2.data,
          correspondence: response3.data,
          noteSheets: response4.data,
        };
    
        setFileDetails(fileData.fileDetails);
    
        Navigate("/main-file", {
          state: fileData,
          replace: true,
        });
    
      } catch (error) {
        console.error("Error fetching file details:", error);
      } finally {
        setLoading(false);
      }
    };
    const handleEditClick = (file) => {
      fetchFileDetails(file);
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
    }
  };

  const handleHistoryClick = async (file) => {
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
    }
  };

  const handleFileDetailsClick = (file) => {
    setFileDetails(file);
    setFileDetailsModalVisible(true);
  };

  const handleVolumeFile = async (fileDetails) => {
    debugger;
    const payload = { fileId: fileDetails.fileId };

    try {
      const token = useAuthStore.getState().token;
      const encryptedMessage = encryptPayload(payload); 

      const response = await api.post(
        "file/create-volume-file",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { dataObject: encryptedMessage },
        }
      );

      if (response.status === 200) {
        alert(response.data.message); 
      }
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  const handlePartFile = async (fileDetails) => {
    const payload = { fileReceiptId: fileDetails.fileReceiptId };

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

      if (response.status === 200) {
        alert(response.data.message); 
      }
    } catch (error) {
      console.error("Error fetching:", error);
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
        toast.success(response.data.message); 
        setSelectedRows([]);
        navigate("/system/setup/menu/init");
      } else {
        toast.error("Failed to send data.");
      }
    } catch (error) {
      console.error("Error sending data:", error);
      toast.error("An error occurred while sending data.");
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
      width: "100px",
    },
    {
      name: "SL NO",
      selector: (row, index) => index + 1,
      sortable: true,
    },
    {
      name: "File Number",
      selector: (row) => row.fileNo, 
      cell: (row) => (
        <div style={{ display: "flex", flexDirection:"column", alignItems: "start", gap: "8px" }}>
          <a href="#" onClick={() => handleFileDetailsClick(row)} className="text-success">
            {row.fileNo}
          </a>
          <span className="bg-primary rounded text-white p-1">{row.priority}</span>
        </div>
      ),
      sortable: true,
      width:"200px"
    },
    
    {
      name: "File Name",
      selector: (row) => row.fileName,
      sortable: true,
      width:"200px"
    },
    {
      name: "From",
      selector: (row) => row.fromEmployee,
      sortable: true,
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
        <span className="bg-warning text-white rounded p-1">
          {row.status}
        </span>
      ),
      
    },
    {
      name: "Action",
      width:"250px",
      cell: (row) => (
        <>
          <Button
            variant="contained"
            color="warning"
            size="small"
            title="Send to Rack"
            startIcon={<MdOutlineMoveDown />}
            onClick={() => handleSendToRack(row)}
          ></Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            title="Edit"
            className="ms-2"
            startIcon={<FaEdit />}
            onClick={() => handleEditClick(row)}
          ></Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            title="Edit"
            className="ms-2"
            startIcon={<FaHistory />}
            onClick={() => handleHistoryClick(row)}
          >
          </Button>
        </>
      ),
    },
  ];



  return (
    
    <div>
       <ToastContainer position="top-right" autoClose={1000} hideProgressBar={false} />
      <div className="row">
        <div className="form-group col-md-3">
          
          <Autocomplete
            id="prioritySelect"
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
        

          <Autocomplete
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

        <div className="col-md-12 mt-5">
          <div className="table-responsive">
            <DataTable
              columns={columns}
              
              data={nRData.data || []}
               keyField="fileReceiptId"
              pagination
              highlightOnHover
              progressPending={loading}
              striped
              bordered
              customStyles={customStyles}
              noDataComponent={<div>No data available</div>}
            />
          </div>
          <div className="mt-3 d-flex align-items-center justify-content-center">
          <Button variant="contained" color="success" onClick={handleSave}>
            Save
          </Button>
          <Button  className=" ms-2" variant="contained" color="error" onClick={() => navigate("/system/setup/menu/init")}>
          Cancel
      </Button>
       
    

      </div>
        </div>
     

        <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
  
  {/* Dialog Title with Close Icon */}
  <DialogTitle
    sx={{
      bgcolor: "#207785",
      color: "white",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between", // Ensures title & close button are aligned
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
  <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
    <Button
      onClick={() => setShowModal(false)}
      variant="contained"
      sx={{
        borderRadius: "8px",
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
        px: 3,
        bgcolor: "#1b5e20",
      }}
    >
      OK
    </Button>
  </DialogActions>

       </Dialog>
      </div>



   

      {modalVisible && selectedFile && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send to Rack</h5>
                <button type="button" className="close" onClick={closeModal}>
                  &times;
                </button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>File Number</th>
                            <th>Room</th>
                            <th>Rack</th>
                            <th>Cell</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{selectedFile.fileNo}</td>
                            <td>{selectedFile.roomNumber}</td>
                            <td>{selectedFile.rackNumber}</td>
                            <td>{selectedFile.cellNumber}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="form-group col-md-4">
                      <label htmlFor="roomSelect">Room</label>
                      <select
                        id="roomSelect"
                        className="form-control"
                        value={roomId}
                        onChange={(e) => handleSelectChange(setRoom, e)}
                      >
                        <option value="">Select Room</option>
                        {roomData.map((roomItem) => (
                          <option
                            key={roomItem.docRoomId}
                            value={roomItem.docRoomId}
                          >
                            {roomItem.roomNumber}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group col-md-4">
                      <label htmlFor="rackSelect">Rack</label>
                      <select
                        id="rackSelect"
                        className="form-control"
                        value={rackId}
                        onChange={(e) => handleSelectChange(setRack, e)}
                      >
                        <option value="">Select Rack</option>
                        {rackData.map((rackItem) => (
                          <option key={rackItem.rackId} value={rackItem.rackId}>
                            {rackItem.rackNumber}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group col-md-4">
                      <label htmlFor="cellSelect">Cell</label>
                      <select
                        id="cellSelect"
                        className="form-control"
                        value={cellNo}
                        onChange={(e) => handleSelectChange(setCell, e)}
                        disabled={!rackId}
                      >
                        <option value="">Select Cell</option>
                        {[1, 2, 3, 4, 5].map((cellValue) => (
                          <option key={cellValue} value={cellValue}>
                            {cellValue}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

     
      {historyModalVisible && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">File History</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setHistoryModalVisible(false)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Sl</th>
                      <th>File Number</th>
                      <th>Sender</th>
                      <th>Reciver</th>
                      <th>Docket No.</th>
                      <th>Action Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((historyItem, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{historyItem.fileNo}</td>
                        <td>{historyItem.sender || "NA"}</td>
                        <td>{historyItem.receiver || "NA"}</td>
                        <td>{historyItem.docketNo || "NA"}</td>
                        <td>{historyItem.actionDate || "NA"}</td>
                        <td>{historyItem.status || "NA"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setHistoryModalVisible(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {fileDetailsModalVisible && fileDetails && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">File Details</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setFileDetailsModalVisible(false)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <table className="table">
                  <tbody>
                    <tr>
                      <th>File No</th>
                      <td>{fileDetails.fileNo}</td>
                    </tr>
                    <tr>
                      <th>File Name</th>
                      <td>{fileDetails.fileName}</td>
                    </tr>
                    <tr>
                      <th>From Employee</th>
                      <td>{fileDetails.fromEmployee}</td>
                    </tr>
                    <tr>
                      <th>Sent On</th>
                      <td>{fileDetails.sentOn}</td>
                    </tr>
                    <tr>
                      <th>Status</th>
                      <td>{fileDetails.status}</td>
                    </tr>
                    <tr>
                      <th>Priority</th>
                      <td>{fileDetails.priority}</td>
                    </tr>
                    <tr>
                      <th>File Module</th>
                      <td>{fileDetails.fileType}</td>
                    </tr>
                    <tr>
                      <th>Room</th>
                      <td>{fileDetails.roomNumber}</td>
                    </tr>
                    <tr>
                      <th>Rack</th>
                      <td>{fileDetails.rackNumber}</td>
                    </tr>
                    <tr>
                      <th>Cell</th>
                      <td>{fileDetails.cellNumber}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleVolumeFile(fileDetails)}
                >
                  Create New Voume
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handlePartFile(fileDetails)}
                >
                  Create Part File
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setFileDetailsModalVisible(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExistingFile;