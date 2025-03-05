import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Checkbox,
  Box,
  Button,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { IconButton, Typography } from "@mui/joy";
import CloseIcon from "@mui/icons-material/Close";
import useAuthStore from "../../../store/Store";
import { encryptPayload } from "../../../utils/encrypt";
import api from "../../../Api/Api";
import { PageLoader } from "../../pageload/PageLoader";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MoveToRackModal = ({ open, onClose, fileDetails }) => {
  const details = fileDetails?.data || {};
  const [isChecked, setIsChecked] = useState(false);
  const [roomData, setRoomData] = useState([]);
  const [rackData, setRackData] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedRack, setSelectedRack] = useState("");
  const [selectedCell, setSelectedCell] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [currentRackCells, setCurrentRackCells] = useState(0);
  const navigate = useNavigate();
  const token =
    useAuthStore.getState().token || sessionStorage.getItem("token");
  const rackAlldata = rackData || [];
  console.log("fileDetails", rackAlldata);

  const moveToRackMutation = useMutation({
    mutationFn: async () => {
      const sendfilepayload = {
        actionTaken: details.actionTaken || "APPROVED",
        fileId: details.fileId,
        fileRecptId: details.fileReceiptId,
        roomId: selectedRoom || details.roomId,
        rackId: selectedRack || details.rackId,
        cellNo: selectedCell || details.cell,
        checkFlag: isChecked ? "Y" : "N",
      };
      console.log("sendfilepayload", sendfilepayload);

      const encryptedDataObject = encryptPayload(sendfilepayload);
      const formData = new FormData();
      formData.append("dataObject", encryptedDataObject);

      return api.post("/file/close-file", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: (response) => {
      const data = response.data;
      if (data.outcome === true) {
        toast.success(data.message || "File moved successfully!");
        resetForm();
        onClose();
        navigate("/file");
      } else {
        toast.error(data.message || "Operation failed!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to move file!");
    },
  });

  const handleMoveToRack = () => {
    if (!isChecked) {
      setConfirmOpen(true);
    } else {
      moveToRackMutation.mutate();
    }
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    moveToRackMutation.mutate();
  };

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!isChecked) return;

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

    if (isChecked) {
      fetchRoomData();
    }
  }, [isChecked]);

  useEffect(() => {
    const fetchRackData = async () => {
      if (!selectedRoom) {
        setRackData([]);
        return;
      }

      setIsLoading(true);
      try {
        const token = useAuthStore.getState().token;
        const payload = { docRoomId: selectedRoom };
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

    if (selectedRoom) {
      fetchRackData();
    }
  }, [selectedRoom]);

  const handleRackChange = (e) => {
    const selectedRackId = e.target.value;
    setSelectedRack(selectedRackId);
    setSelectedCell("");
  
    const selectedRackData = rackData.find(rack => rack.rackId === selectedRackId);
    if (selectedRackData) {
      setCurrentRackCells(selectedRackData.noOfCell);
    } else {
      setCurrentRackCells(0);
    }
  };

  const handleRoomChange = (e) => {
    const roomId = e.target.value;
    setSelectedRoom(roomId);
    setSelectedRack("");
    setSelectedCell("");
  };

  const selectFields = (
    <Box
      sx={{
        display: isChecked ? "flex" : "none",
        justifyContent: "space-between",
        gap: 2,
        mt: 2,
        width: "100%",
        maxWidth: 400,
        mx: "auto",
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            zIndex: 1,
          }}
        >
          <PageLoader />
        </Box>
      )}
      <FormControl fullWidth size="small">
        <Typography variant="subtitle2" mb={1}>
          Room
        </Typography>
        <Select
          value={selectedRoom}
          onChange={handleRoomChange}
          disabled={isLoading}
        >
          <MenuItem value="">Select Room</MenuItem>
          {roomData.map((room) => (
            <MenuItem key={room.docRoomId} value={room.docRoomId}>
              {room.roomNumber}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <Typography variant="subtitle2" mb={1}>
          Rack
        </Typography>
        <Select
          value={selectedRack}
          onChange={handleRackChange} 
          disabled={!selectedRoom || isLoading}
        >
          <MenuItem value="">Select Rack</MenuItem>
          {rackData.map((rack) => (
            <MenuItem key={rack.rackId} value={rack.rackId}>
              {rack.rackNumber}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <Typography variant="subtitle2" mb={1}>
          Cell
        </Typography>
        <Select
          value={selectedCell}
          onChange={(e) => setSelectedCell(e.target.value)}
          disabled={!selectedRack || isLoading}
        >
          <MenuItem value="">Select Cell</MenuItem>
          {currentRackCells > 0 &&
            [...Array(currentRackCells)].map((_, index) => (
              <MenuItem key={index + 1} value={index + 1}>
                 {index + 1}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  );

  const resetForm = () => {
    setIsChecked(false);
    setSelectedRoom("");
    setSelectedRack("");
    setSelectedCell("");
    setRoomData([]);
    setRackData([]);
    setCurrentRackCells(0);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={(event, reason) => {
          if (reason && reason === "backdropClick") return;
          onClose();
          resetForm();
        }}
      >
        <Box
          sx={{
            width: "800px",
            padding: "20px",
            background: "#fff",
            borderRadius: "10px",
            margin: "auto",
            mt: "5vh",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Move to Rack</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box>
            <Typography
              variant="body1"
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              File No: {details.fileNo}
            </Typography>
            <Typography variant="body1">Room : {details.room}</Typography>
            <Typography variant="body1">Rack: {details.rack}</Typography>
            <Typography variant="body1">Cell: {details.cell}</Typography>
          </Box>

          <Box
            mt={2}
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
          >
            <Box display="flex" alignItems="center">
              <Checkbox
                color="primary"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                id="confirm-checkbox"
              />
              <Typography
                component="label"
                htmlFor="confirm-checkbox"
                sx={{ cursor: "pointer", userSelect: "none", ml: 1 }}
              >
                Change Room Details
              </Typography>
            </Box>

            {selectFields}

            <Box display="flex" justifyContent="center" gap={2} mt={2}>
              <Button
                variant="contained"
                color="success"
                disabled={
                  (isChecked &&
                    (!selectedRoom || !selectedRack || !selectedCell)) ||
                  moveToRackMutation.isLoading
                }
                onClick={handleMoveToRack}
              >
                Move
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Move</DialogTitle>
        <DialogContent>
          <Typography>
            Do you want to close the file and send it to Rack?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            color="error"
            variant="contained"
            onClick={() => setConfirmOpen(false)}
          >
            No
          </Button>
          <Button variant="contained" color="primary" onClick={handleConfirm}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

MoveToRackModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fileDetails: PropTypes.object,
};

MoveToRackModal.defaultProps = {
  fileDetails: {},
};

export default MoveToRackModal;
