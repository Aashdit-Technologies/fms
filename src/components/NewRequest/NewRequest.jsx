import React, { useState } from "react";
import { Tooltip } from 'react-tooltip';
import { FaHistory, FaEdit, FaArchive, FaSearch, FaFilter } from 'react-icons/fa';
import { Tab, Tabs, Accordion } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Paper,
  Button,
  IconButton,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';
import './NewRequest.css';
import useApiListStore from "../ManageFile/ApiListStore";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt.js";
import { useNavigate } from "react-router-dom";

const NewRequest = () => {
  const [selectedFileModule, setSelectedFileModule] = useState("0");
  const [priority, setPriority] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [roomId, setRoom] = useState("");
  const [rackId, setRack] = useState("");
  const [cellNo, setCell] = useState("");
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [fileDetails, setFileDetails] = useState(null);
  const [fileDetailsModalVisible, setFileDetailsModalVisible] = useState(false);
  
  const Navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useAuthStore.getState().token;
  const { fileModules, fetchAllData } = useApiListStore();

  // Query for room data
  const { data: roomData = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await api.get("/manage-room", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.roomList;
    }
  });

  // Query for rack data based on roomId
  const { data: rackData = [] } = useQuery({
    queryKey: ['racks', roomId],
    queryFn: async () => {
      if (!roomId) return [];
      const payload = { docRoomId: roomId };
      const encryptedMessage = encryptPayload(payload);
      const response = await api.get("/manage-file-rack", {
        headers: { Authorization: `Bearer ${token}` },
        params: { dataObject: encryptedMessage },
      });
      return response.data.rackList;
    },
    enabled: !!roomId
  });

  // Query for filtered data
  const { data: nRData = { prioritylst: [], receiptList: [] }, isLoading } = useQuery({
    queryKey: ['newRequests', priority, selectedFileModule],
    queryFn: async () => {
      const payload = {
        priority: priority || null,
        fileModule: selectedFileModule || null,
        pageno: 1,
      };
      const encryptedMessage = encryptPayload(payload);
      const response = await api.get("/file/new-request", {
        headers: { Authorization: `Bearer ${token}` },
        params: { dataObject: encryptedMessage },
      });
      return response.data;
    }
  });

  // Query for file history
  const { data: historyData = [] } = useQuery({
    queryKey: ['fileHistory', selectedFile?.fileId],
    queryFn: async () => {
      if (!selectedFile?.fileId) return [];
      const payload = { fileId: selectedFile.fileId };
      const encryptedMessage = encryptPayload(payload);
      const response = await api.get("file/view-file-history", {
        headers: { Authorization: `Bearer ${token}` },
        params: { dataObject: encryptedMessage }
      });
      return response.data.history || [];
    },
    enabled: !!selectedFile?.fileId && historyModalVisible
  });

  // Mutation for editing file
  const editFileMutation = useMutation({
    mutationFn: async (file) => {
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
        api.post("/file/basic-details", { dataObject: payload1 }, { headers: { Authorization: `Bearer ${token}` } }),
        api.post("/file/get-draft-notesheet", { dataObject: payload2 }, { headers: { Authorization: `Bearer ${token}` } }),
        api.post("/file/file-correspondences", { dataObject: payload3 }, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      return { fileDetails: response1.data, additionalDetails: response2.data, correspondence: response3.data };
    },
    onSuccess: (data) => {
      setFileDetails(data.fileDetails);
      Navigate("/main-file", { 
        state: { 
          fileDetails: data.fileDetails, 
          additionalDetails: data.additionalDetails, 
          correspondence: data.correspondence 
        },
        replace: true 
      });
    }
  });

  // Mutation for sending file to rack
  const sendToRackMutation = useMutation({
    mutationFn: async ({ fileId, roomId, rackId, cellNo }) => {
      const payload = { fileId, roomId, rackId, cellNo };
      const encryptedMessage = encryptPayload(payload);
      const response = await api.post(
        "/file/update-room-rack-cell",
        { dataObject: encryptedMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['newRequests']);
      closeModal();
    }
  });

  // Mutation for creating volume file
  const createVolumeMutation = useMutation({
    mutationFn: async (fileId) => {
      const payload = { fileId };
      const encryptedMessage = encryptPayload(payload);
      const response = await api.post(
        "file/create-volume-file",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { dataObject: encryptedMessage },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      alert(data.message);
      queryClient.invalidateQueries(['newRequests']);
    }
  });

  // Mutation for creating part file
  const createPartMutation = useMutation({
    mutationFn: async (fileReceiptId) => {
      const payload = { fileReceiptId };
      const encryptedMessage = encryptPayload(payload);
      const response = await api.post(
        "file/create-part-file",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { dataObject: encryptedMessage },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      alert(data.message);
      queryClient.invalidateQueries(['newRequests']);
    }
  });

  // Event Handlers
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    sendToRackMutation.mutate({
      fileId: selectedFile.fileId,
      roomId,
      rackId,
      cellNo,
    });
  };

  const handleHistoryClick = (file) => {
    setSelectedFile(file);
    setHistoryModalVisible(true);
  };

  const handleFileDetailsClick = (file) => {
    setFileDetails(file);
    setFileDetailsModalVisible(true);
  };

  const handleVolumeFile = (fileDetails) => {
    createVolumeMutation.mutate(fileDetails.fileId);
  };

  const handlePartFile = (fileDetails) => {
    createPartMutation.mutate(fileDetails.fileReceiptId);
  };

  return (
    <Box className="new-request-container">
      <Accordion defaultActiveKey="0" className="mb-4">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <FaFilter className="me-2" /> Filter Options
          </Accordion.Header>
          <Accordion.Body>
            <Paper elevation={3} className="filter-section p-4">
        <div className="row">
          <div className="col-md-4">
            <FormControl fullWidth variant="outlined">
              <Select
                value={priority}
                onChange={(e) => handleSelectChange(setPriority, e)}
                label="Priority"
              >
                <MenuItem value="All">All</MenuItem>
                {nRData.prioritylst?.map((priorityItem, index) => (
                  <MenuItem key={index} value={priorityItem}>
                    {priorityItem}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="col-md-4">
            <FormControl fullWidth variant="outlined">
              <Select
                value={selectedFileModule}
                onChange={(e) => handleSelectChange(setSelectedFileModule, e)}
                label="File Module"
              >
                <MenuItem value="0">All</MenuItem>
                {fileModules?.map((fileModule) => (
                  <MenuItem key={fileModule.moduleId} value={fileModule.moduleId}>
                    {fileModule.moduleName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
            </Paper>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion defaultActiveKey="0">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <FaSearch className="me-2" /> File List
          </Accordion.Header>
          <Accordion.Body>
            <Paper elevation={3} className="p-4">
              <Tabs defaultActiveKey="files" className="mb-4">
          <Tab eventKey="files" title="Files">
            <TableContainer>
              {isLoading ? (
                <Box className="text-center py-4">
                  <CircularProgress />
                  <Typography className="mt-2">Loading data...</Typography>
                </Box>
              ) : (
                <Table className="custom-table">
                  <TableHead>
                    <TableRow>
                      <TableCell>SL</TableCell>
                      <TableCell>File Number</TableCell>
                      <TableCell>File Name</TableCell>
                      <TableCell>From</TableCell>
                      <TableCell>Send On</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {nRData.receiptList && nRData.receiptList.length > 0 ? (
                      nRData.receiptList.map((item, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Button
                              color="primary"
                              onClick={() => handleFileDetailsClick(item)}
                              sx={{ textTransform: 'none' }}
                            >
                              {item.fileNo}
                            </Button>
                          </TableCell>
                          <TableCell>{item.fileName}</TableCell>
                          <TableCell>{item.fromEmployee}</TableCell>
                          <TableCell>{item.sentOn}</TableCell>
                          <TableCell>
                            <Typography 
                              color={item.status === 'Active' ? 'success.main' : 'text.primary'}
                            >
                              {item.status}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box className="action-buttons">
              <IconButton
                sx={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  '&:hover': { backgroundColor: '#1976d2' }
                }}
                size="small"
                onClick={() => handleSendToRack(item)}
                data-tooltip-id="send-tooltip"
                data-tooltip-content="Send to Rack"
              >
                <FaArchive />
              </IconButton>
              <IconButton
                sx={{
                  backgroundColor: '#2e7d32',
                  color: 'white',
                  '&:hover': { backgroundColor: '#2e7d32' }
                }}
                size="small"
                onClick={() => editFileMutation.mutate(item)}
                data-tooltip-id="edit-tooltip"
                data-tooltip-content="Edit File"
              >
                <FaEdit />
              </IconButton>
              <IconButton
                sx={{
                  backgroundColor: '#0288d1',
                  color: 'white',
                  '&:hover': { backgroundColor: '#0288d1' }
                }}
                size="small"
                onClick={() => handleHistoryClick(item)}
                data-tooltip-id="history-tooltip"
                data-tooltip-content="View History"
              >
                <FaHistory />
              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="text.secondary">
                            No data available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </Tab>
        </Tabs>
              </Paper>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {/* Tooltips */}
      <Tooltip id="send-tooltip" />
      <Tooltip id="edit-tooltip" />
      <Tooltip id="history-tooltip" />

      {/* Send to Rack Modal */}
      <Dialog 
        open={modalVisible} 
        onClose={closeModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Send to Rack
        </DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent>
            {sendToRackMutation.isError && (
              <Alert severity="error" className="mb-3">
                Error sending file to rack. Please try again.
              </Alert>
            )}
            
            <TableContainer component={Paper} className="mb-4">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>File Number</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Rack</TableCell>
                    <TableCell>Cell</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{selectedFile?.fileNo}</TableCell>
                    <TableCell>{selectedFile?.roomNumber}</TableCell>
                    <TableCell>{selectedFile?.rackNumber}</TableCell>
                    <TableCell>{selectedFile?.cellNumber}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <div className="row">
              <div className="col-md-4">
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Room</InputLabel>
                  <Select
                    value={roomId}
                    onChange={(e) => handleSelectChange(setRoom, e)}
                    label="Room"
                  >
                    <MenuItem value="">Select Room</MenuItem>
                    {roomData.map((roomItem) => (
                      <MenuItem
                        key={roomItem.docRoomId}
                        value={roomItem.docRoomId}
                      >
                        {roomItem.roomNumber}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div className="col-md-4">
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Rack</InputLabel>
                  <Select
                    value={rackId}
                    onChange={(e) => handleSelectChange(setRack, e)}
                    label="Rack"
                  >
                    <MenuItem value="">Select Rack</MenuItem>
                    {rackData.map((rackItem) => (
                      <MenuItem key={rackItem.rackId} value={rackItem.rackId}>
                        {rackItem.rackNumber}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div className="col-md-4">
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Cell</InputLabel>
                  <Select
                    value={cellNo}
                    onChange={(e) => handleSelectChange(setCell, e)}
                    label="Cell"
                    disabled={!rackId}
                  >
                    <MenuItem value="">Select Cell</MenuItem>
                    {[1, 2, 3, 4, 5].map((cellValue) => (
                      <MenuItem key={cellValue} value={cellValue}>
                        {cellValue}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
          </DialogContent>

          <DialogActions>
            <Button onClick={closeModal} color="inherit">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={sendToRackMutation.isPending}
            >
              {sendToRackMutation.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* History Modal */}
      <Dialog
        open={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>File History</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Performed By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyData.map((historyItem, index) => (
                  <TableRow key={index}>
                    <TableCell>{historyItem.action}</TableCell>
                    <TableCell>{historyItem.timestamp}</TableCell>
                    <TableCell>{historyItem.performedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryModalVisible(false)} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Details Modal */}
      <Dialog
        open={fileDetailsModalVisible && !!fileDetails}
        onClose={() => setFileDetailsModalVisible(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>File Details</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell component="th" width="30%">File No</TableCell>
                  <TableCell>{fileDetails?.fileNo}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">File Name</TableCell>
                  <TableCell>{fileDetails?.fileName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">From Employee</TableCell>
                  <TableCell>{fileDetails?.fromEmployee}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">Sent On</TableCell>
                  <TableCell>{fileDetails?.sentOn}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">Status</TableCell>
                  <TableCell>{fileDetails?.status}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">Priority</TableCell>
                  <TableCell>{fileDetails?.priority}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">Room</TableCell>
                  <TableCell>{fileDetails?.roomNumber}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">Rack</TableCell>
                  <TableCell>{fileDetails?.rackNumber}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">Cell</TableCell>
                  <TableCell>{fileDetails?.cellNumber}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained" 
            color="success" 
            onClick={() => handleVolumeFile(fileDetails)}
            disabled={createVolumeMutation.isPending}
          >
            {createVolumeMutation.isPending ? 'Creating...' : 'Create New Volume'}
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={() => handlePartFile(fileDetails)}
            disabled={createPartMutation.isPending}
          >
            {createPartMutation.isPending ? 'Creating...' : 'Create Part File'}
          </Button>
          <Button 
            onClick={() => setFileDetailsModalVisible(false)} 
            color="inherit"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NewRequest;
