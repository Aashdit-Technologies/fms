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
import { encryptPayload } from "../../utils/encrypt.js";
import dayjs from "dayjs";

const RequestStatus = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [rqstStsData, setRqstStsData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [fileDetails, setFileDetails] = useState(null);
  const [fileDetailsModalVisible, setFileDetailsModalVisible] = useState(false);
 const [rowSize, setRowSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
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
        rowSize:rowSize,
      };

      const encryptedMessage = encryptPayload(payload);

      const response = await api.get("/file/view-status", {
        headers: { Authorization: `Bearer ${token}` },
        params: { dataObject: encryptedMessage },
      });

      setRqstStsData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleCallFor = async (fileId, fileReceiptId) => {
    try {
      const token = useAuthStore.getState().token;
      // const payload = encryptPayload({ fileId, fileReceiptId });

      const payload = { fileReceiptId: fileReceiptId, fileId: fileId, calltype:"callfor"};
      const encryptedMessage = encryptPayload(payload);
      const response = await api.post("file/call-for-recall",
        { dataObject: encryptedMessage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if(response.data.outcome == true){
        toast.success(response.data.message);
        fetchFilteredData();
      }
      else{
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error in Call For request:", error);
    }
  };

  const handleReCall = async (fileId, fileReceiptId) => {
    try {
      const token = useAuthStore.getState().token;
      // const payload = encryptPayload({ fileId, fileReceiptId });

      const payload = { fileReceiptId: fileReceiptId, fileId: fileId, calltype:"recall"};
      const encryptedMessage = encryptPayload(payload);
      const response = await api.post("file/call-for-recall",
        { dataObject: encryptedMessage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if(response.data.outcome == true){
        toast.success(response.data.message);
        fetchFilteredData();
      }
      else{
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error in Call For request:", error);
    }
  };

  const handleFileDetailsClick = (file) => {
    setFileDetails(file);
    setFileDetailsModalVisible(true);
  };

  const columns = [
    {
      name: "SL",
      selector: (row, index) => index + 1,
      sortable: true,
    },
    {
      name: "File Number",
      selector: (row) => row.fileNo,
      sortable: true,
      cell : (row) => (
        <div style={{ display: "flex", flexDirection:"column", alignItems: "start", gap: "8px" }}>
          <a href="#" onClick={() => handleFileDetailsClick(row)}>
            {row.fileNo}
          </a>
          <span className="bg-primary rounded text-white p-1">{row.priority}</span>
        </div>
      ),
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
      name: "Send On",
      selector: (row) => row.sentOn,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span className="bg-secondary text-white rounded p-1">
          {row.status}
        </span>
      ),
      
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="d-flex">
          <Button
            variant="contained"
            color="primary"
            size="small"
            title="Call For"
            className="ms-2"
            onClick={() => handleCallFor(row.fileId, row.fileReceiptId)}
          >
            Call For
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            title="Recall"
            className="ms-2"
            onClick={() => handleReCall(row.fileId, row.fileReceiptId)}
          >
            Recall
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="row mb-3">
          <div className="form-group col-md-3">
            <DatePicker
              label="From Date"
              value={fromDate}
              onChange={(newValue) => setFromDate(newValue)}
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
              onChange={(newValue) => setToDate(newValue)}
              format="DD/MM/YYYY"
              renderInput={(params) => (
                <TextField {...params} fullWidth variant="outlined" />
              )}
            />
          </div>
        </div>
      </LocalizationProvider>

      <DataTable
        columns={columns}
        data={rqstStsData}
        progressPending={loading}
        striped
        bordered
        pagination
        highlightOnHover
        paginationServer
            
        paginationPerPage={rowSize} 
        paginationDefaultPage={pageNo}
        onChangePage={(page) => setPageNo(page)}
        onChangeRowsPerPage={(newRowSize) => {
          setRowSize(newRowSize);
          setPageNo(1);  
        }}
      />

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

export default RequestStatus;
