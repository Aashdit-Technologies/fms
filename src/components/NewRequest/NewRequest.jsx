import React, { useState, useEffect } from "react";
import useApiListStore from "../ManageFile/ApiListStore";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt.js";
import MainFile from "../FileSection/MainFile.jsx";
import { useNavigate } from "react-router-dom";

const NewRequest = () => {
  const [selectedFileModule, setSelectedFileModule] = useState("");
  const [priority, setPriority] = useState("");
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
  const Navigate = useNavigate();

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
        setRoomData(response.data.roomList);
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
        setRackData(response.data.rackList);
      } catch (error) {
        console.error("Error fetching rack data:", error);
        setRackData([]); // Clear rack data on error
      }
    };

    fetchRackData();
  }, [roomId]);

  const fetchFilteredData = async (priority, fileModule) => {
    setLoading(true);
    try {
      const token = useAuthStore.getState().token;
      const params = {};
      if (priority) params.priority = priority;
      if (fileModule) params.fileModule = fileModule;

      const response = await api.get("/file/new-request", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setNRData(response.data);
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredData(priority, selectedFileModule);
  }, [priority, selectedFileModule]);

  const handleEditClick = async (file) => {
    try {
      const token = useAuthStore.getState().token;

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

      const [response1, response2, response3] = await Promise.all([
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
      ]);
      useAuthStore.getState().setFileDetails(response1.data);
      useAuthStore.getState().setAdditionalDetails(response2.data);
      useAuthStore.getState().setCross(response3.data);
      Navigate("/main-file");
    } catch (error) {
      console.error("Error handling the edit request:", error);
    }
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

      console.log("History Data Response:", response.data); // Check the structure
      setHistoryData(response.data.history); // Assuming history is in response.data.history
      setHistoryModalVisible(true); // Show the history modal
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleFileDetailsClick = (file) => {
    setFileDetails(file);
    setFileDetailsModalVisible(true);
  };

  return (
    <div>
      <div className="row">
        <div className="form-group col-md-3">
          <label htmlFor="prioritySelect">Priority</label>
          <select
            id="prioritySelect"
            className="form-control form-select"
            value={priority}
            onChange={(e) => handleSelectChange(setPriority, e)}
          >
            <option value="">All</option>
            {nRData.prioritylst &&
              nRData.prioritylst.map((priorityItem, index) => (
                <option key={index} value={priorityItem}>
                  {priorityItem}
                </option>
              ))}
          </select>
        </div>

        <div className="form-group col-md-3">
          <label htmlFor="fileModuleSelect">File Module</label>
          <select
            id="fileModuleSelect"
            className="form-control form-select"
            value={selectedFileModule}
            onChange={(e) => handleSelectChange(setSelectedFileModule, e)}
          >
            <option value="">All</option>
            {fileModules &&
              fileModules.map((fileModule) => (
                <option key={fileModule.moduleId} value={fileModule.moduleId}>
                  {fileModule.moduleName}
                </option>
              ))}
          </select>
        </div>

        <div className="col-md-12 mt-5">
          <div className="table-responsive">
            {loading ? (
              <p>Loading data...</p>
            ) : (
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>SL</th>
                    <th>File Number</th>
                    <th>File Name</th>
                    <th>From</th>
                    <th>Send On</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {nRData.receiptList && nRData.receiptList.length > 0 ? (
                    nRData.receiptList.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <a
                            href="#"
                            onClick={() => handleFileDetailsClick(item)}
                          >
                            {item.fileNo}
                          </a>
                        </td>
                        <td>{item.fileName}</td>
                        <td>{item.fromEmployee}</td>
                        <td>{item.sentOn}</td>
                        <td>{item.status}</td>
                        <td>
                          <button onClick={() => handleSendToRack(item)}>
                            Send to Rack
                          </button>
                          <button onClick={() => handleEditClick(item)}>
                            Edit
                          </button>
                          <button onClick={() => handleHistoryClick(item)}>
                            History
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
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

      {/* History Modal */}
      {historyModalVisible && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
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
                      <th>Action</th>
                      <th>Timestamp</th>
                      <th>Performed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* {historyData.map((historyItem, index) => (
                      <tr key={index}>
                        <td>{historyItem.action}</td>
                        <td>{historyItem.timestamp}</td>
                        <td>{historyItem.performedBy}</td>
                      </tr>
                    ))} */}
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

export default NewRequest;
