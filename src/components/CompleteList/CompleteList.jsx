import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button } from "@mui/material";
import { FaEdit } from "react-icons/fa";
import useAuthStore from "../../store/Store";
import api from "../../Api/Api";
import MainFile from "../FileSection/MainFile.jsx";
import { useNavigate } from "react-router-dom";
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


const CompleteList = () => {
  const [completeListData, setCompleteListData] = useState([]);
  const [loading, setLoading] = useState(false);

   const [fileDetails, setFileDetails] = useState(null);
  const [fileDetailsModalVisible, setFileDetailsModalVisible] = useState(false);

  const [rowSize, setRowSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);

  const Navigate = useNavigate();
  useEffect(() => {
    fetchData();
  }, [pageNo, rowSize]);


  const handleFileDetailsClick = (file) => {
    setFileDetails(file);
    setFileDetailsModalVisible(true);
  };


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


  const handleVolumeFile = async (fileDetails) => {
    debugger;
    const payload = { fileId: fileDetails.fileId };

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

      if (response?.data?.outcome === true) {
        toast.success(response.data.message);
      } else {
        toast.error(response?.data?.message || "An error occurred");
      }
      
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  const handlePartFile = async (fileDetails) => {
    const payload = { fileReceiptId: fileDetails.fileReceiptId };

    try {
      const token = useAuthStore.getState().token;
      const encryptedMessage = encryptPayload(payload); // Ensure it's properly awaited

      const response = await api.post(
        "file/create-part-file",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { dataObject: encryptedMessage },
        }
      );

      if (response?.data?.outcome === true) {
        toast.success(response.data.message);
      } else {
        toast.error(response?.data?.message || "An error occurred");
      }
      
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {

            const payload = {
              pageNo: pageNo,
              rowSize:rowSize,
            };
      
            const encryptedMessage = encryptPayload(payload);
      const token = useAuthStore.getState().token;

      const response = await api.get("/file/complete-list", {
        headers: { Authorization: `Bearer ${token}` },
        params: { dataObject: encryptedMessage },
      });
     

      setCompleteListData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching complete list data:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      name: "SL",
      selector: (row, index) => index + 1,
      sortable: true,
    },
    {
      name: "File Number",
      selector: (row) => row.fileNo, // This correctly selects fileNo
      cell: (row) => (
        <div style={{ display: "flex", flexDirection:"column", alignItems: "start", gap: "8px" }}>
          <a href="#" onClick={() => handleFileDetailsClick(row)}>
            {row.fileNo}
          </a>
          <span className="bg-primary rounded text-white p-1">{row.priority}</span>
        </div>
      ),
      sortable: true,
    },
    {
      name: "File Name",
      selector: (row) => row.fileName,
      sortable: true,
    },
    {
      name: "From",
      selector: (row) => row.fromEmployee,
      sortable: true,
    },
    {
      name: "Completed On",
      selector: (row) => row.completedOn,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <>
          <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      title="Edit"
                      className="ms-2"
                      startIcon={<FaEdit />}
                      onClick={() => handleEditClick(row)}
                    ></Button>
          {/* <Button variant="contained" color="error" size="small">
            Delete
          </Button> */}
        </>
      ),
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={completeListData}
        progressPending={loading}
        pagination
        highlightOnHover
        paginationServer 
        customStyles={customStyles}  
        paginationPerPage={rowSize} 
        paginationDefaultPage={pageNo}
        onChangePage={(page) => setPageNo(page)}
        onChangeRowsPerPage={(newRowSize) => {
          setRowSize(newRowSize);
          setPageNo(1);  
        }}
      />


{/* {fileDetailsModalVisible && fileDetails && (
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
      )} */}

<Modal open={fileDetailsModalVisible} onClose={() => setFileDetailsModalVisible(false)}>
      <Dialog open={fileDetailsModalVisible} onClose={() => setFileDetailsModalVisible(false)} maxWidth="md" fullWidth>
        <DialogTitle>File Details</DialogTitle>
        <DialogContent>
          {fileDetails && (
            <Table>
              <TableBody>
                {Object.entries({
                  "File No": fileDetails.fileNo,
                  "File Name": fileDetails.fileName,
                  "From Employee": fileDetails.fromEmployee,
                  "Sent On": fileDetails.sentOn,
                  Status: fileDetails.status,
                  Priority: fileDetails.priority,
                  "File Module": fileDetails.fileType,
                  Room: fileDetails.roomNumber,
                  Rack: fileDetails.rackNumber,
                  Cell: fileDetails.cellNumber,
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
          <Button variant="contained" color="success" onClick={() => handleVolumeFile(fileDetails)}>
            Create New Volume
          </Button>
          <Button variant="contained" color="success" onClick={() => handlePartFile(fileDetails)}>
            Create Part File
          </Button>
          <Button variant="contained" color="secondary" onClick={() => setFileDetailsModalVisible(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Modal>
    </div>
  );
};

export default CompleteList;