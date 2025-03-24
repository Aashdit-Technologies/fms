import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Box,
  Button,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
} from "@mui/material";
import { IconButton, Typography } from "@mui/joy";
import CloseIcon from "@mui/icons-material/Close";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import api from "../../Api/Api";
import { PageLoader } from "../pageload/PageLoader";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

const SendToRackModal = ({ open, onClose, selectedFile, onSuccess }) => {
  const [roomData, setRoomData] = useState([]);
  const [rackData, setRackData] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedRack, setSelectedRack] = useState("");
  const [selectedCell, setSelectedCell] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentRackCells, setCurrentRackCells] = useState(0);
  const [isChecked, setIsChecked] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  console.log(selectedFile, "selectedFile");
  

  const token = useAuthStore.getState().token;

  const sendToRackMutation = useMutation({
    mutationFn: async () => {
      debugger
      const payload = {
        actionTaken: selectedFile.status || "APPROVED",
        fileId: selectedFile.fileId,
        fileRecptId: selectedFile.fileReceiptId,
        roomId: selectedRoom || selectedFile.roomId,
        rackId: selectedRack || selectedFile.rackId,
        cellNo: selectedCell || selectedFile.cellNumber,
        checkFlag: isChecked ? "Y" : "N",
      };
      console.log("payload",payload);
      

      const encryptedMessage = encryptPayload(payload);

      return api.post(
        "/file/close-file",
        { dataObject: encryptedMessage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: (response) => {
      if (response.data.outcome === true) {
        toast.success("File successfully sent to rack");
        resetForm();
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(response.data.message || "Operation failed");
      }
    },
    onError: (error) => {
      toast.error("Error sending file to rack");
      console.error("Error:", error);
    },
  });

  useEffect(() => {
    const fetchRackData = async () => {
      if (!selectedRoom) {
        setRackData([]);
        return;
      }

      setIsLoading(true);
      try {
        const payload = { docRoomId: selectedRoom };
        const encryptedMessage = encryptPayload(payload);

        const response = await api.get("/manage-file-rack", {
          headers: { Authorization: `Bearer ${token}` },
          params: { dataObject: encryptedMessage },
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
  }, [selectedRoom, token]);

  const handleRoomChange = (e) => {
    const roomId = e.target.value;
    setSelectedRoom(roomId);
    setSelectedRack("");
    setSelectedCell("");
  };

  const handleRackChange = (e) => {
    const rackId = e.target.value;
    setSelectedRack(rackId);
    setSelectedCell("");

    const selectedRackData = rackData.find((rack) => rack.rackId === rackId);
    if (selectedRackData) {
      setCurrentRackCells(selectedRackData.noOfCell);
    } else {
      setCurrentRackCells(0);
    }
  };

  const resetForm = () => {
    setSelectedRoom("");
    setSelectedRack("");
    setSelectedCell("");
    setRackData([]);
    setCurrentRackCells(0);
  };

  const handleSubmit = () => {
    if (!isChecked) {
      setConfirmOpen(true);
    } else {
      sendToRackMutation.mutate();
    }
  };
  const handleConfirm = () => {
    setConfirmOpen(false);
    sendToRackMutation.mutate();
  };
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!isChecked) return;

      setIsLoading(true);
      try {
        const response = await api.get("/manage-room", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoomData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching room data:", error);
        toast.error("Error loading rooms");
      } finally {
        setIsLoading(false);
      }
    };

    if (open && isChecked) {
      fetchRoomData();
    }
  }, [open, token, isChecked]);

  return (
    <>
      <Modal
        open={open}
        onClose={(event, reason) => {
          if (reason === "backdropClick") return;
          resetForm();
          onClose();
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography level="h5">Send to Rack</Typography>
            <IconButton
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {isLoading && <PageLoader />}

          <Box>
            <Typography
              variant="body1"
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              File No: {selectedFile?.fileNo}
            </Typography>
            <Typography variant="body1">
              Room : {selectedFile?.roomNumber}
            </Typography>
            <Typography variant="body1">
              Rack: {selectedFile?.rackNumber}
            </Typography>
            <Typography variant="body1">
              Cell: {selectedFile?.cellNumber}
            </Typography>
          </Box>
          <Box
            mt={2}
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
          >
            {isChecked && (
              <Box display="flex" gap={2} mb={3}>
                <FormControl fullWidth>
                  <Typography level="body2" mb={1}>
                    Room
                  </Typography>
                  <Select
                    value={selectedRoom}
                    onChange={handleRoomChange}
                    displayEmpty
                    size="small"
                  >
                    <MenuItem value="">Select Room</MenuItem>
                    {roomData.map((room) => (
                      <MenuItem key={room.docRoomId} value={room.docRoomId}>
                        {room.roomNumber}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <Typography level="body2" mb={1}>
                    Rack
                  </Typography>
                  <Select
                    value={selectedRack}
                    onChange={handleRackChange}
                    displayEmpty
                    size="small"
                    disabled={!selectedRoom}
                  >
                    <MenuItem value="">Select Rack</MenuItem>
                    {rackData.map((rack) => (
                      <MenuItem key={rack.rackId} value={rack.rackId}>
                        {rack.rackNumber}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <Typography level="body2" mb={1}>
                    Cell
                  </Typography>
                  <Select
                    value={selectedCell}
                    onChange={(e) => setSelectedCell(e.target.value)}
                    displayEmpty
                    size="small"
                    disabled={!selectedRack}
                  >
                    <MenuItem value="">Select Cell</MenuItem>
                    {[...Array(currentRackCells)].map((_, index) => (
                      <MenuItem key={index + 1} value={index + 1}>
                        {index + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
            <Box display="flex" alignItems="center" mb={3}>
              <Checkbox
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                id="change-location"
              />
              <Typography
                component="label"
                htmlFor="change-location"
                sx={{ cursor: "pointer", userSelect: "none", ml: 1 }}
              >
                Change Room Details
              </Typography>
            </Box>

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={
                  (isChecked &&
                    (!selectedRoom || !selectedRack || !selectedCell)) ||
                  sendToRackMutation.isLoading
                }
              >
                Submit
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
          <Typography>Do you want to send this file to Rack?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            color="error"
            variant="contained"
            onClick={() => setConfirmOpen(false)}
          >
            No
          </Button>
          <Button color="primary" variant="contained" onClick={handleConfirm}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

SendToRackModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedFile: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default SendToRackModal;
