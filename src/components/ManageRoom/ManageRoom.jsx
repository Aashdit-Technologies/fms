import React, { useState, useEffect, useCallback } from "react";
import { Accordion } from "react-bootstrap";
import {
  FaPlus,
  FaMinus,
  FaCheck,
  FaTimes,
  FaEdit,
  FaLock,
  FaLockOpen,
} from "react-icons/fa";
import { TextField, Button } from "@mui/material";
import { toast } from "react-toastify";
import api from "../../Api/Api";
import { encryptPayload } from "../../utils/encrypt";
import useAuthStore from "../../store/Store";
import DataTable from "react-data-table-component";

import "react-toastify/dist/ReactToastify.css";
import "./ManageRoom.css";

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

      letterSpacing: "0.5px",
      minHeight: "52px",
      borderBottom: "2px solid #1a5f6a",
    },
  },
  headCells: {
    style: {
      padding: "16px",
      "&:not(:last-of-type)": {
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
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
        borderBottom: "1px solid #e0e0e0",
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
      color: "#666666",
    },
  },
};
const ManageRoom = () => {
  const [activeKey, setActiveKey] = useState("1");
  const [isFormOpen, setIsFormOpen] = useState();
  const [isTableOpen, setIsTableOpen] = useState();
  const [room, setRoom] = useState({ roomNumber: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roomData, setRoomData] = useState([]);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const token = useAuthStore.getState().token;
  const [totalRows, setTotalRows] = useState(0);
  

  // Fetch Room Data
  const fetchRoomData = useCallback(async () => {
    try {
      const { data } = await api.get("/manage-room", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.outcome !== true) {
        toast.error(data.message);
      }
      setRoomData(data.data || []);
      setTotalRows(data.data?.length || 0);
    } catch (error) {
      console.error("Error fetching room data:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData]);

  const isValidInput = (value) => {
    const regex = /^[a-zA-Z0-9.,/\-&() ]*$/;
    return regex.test(value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (isValidInput(value)) {
      setRoom((prev) => ({ ...prev, [name]: value }));
    } else {
      // toast.warning("Only alphanumeric characters and .,/- & () are allowed");
    }
  };

  // Reset Form
  const handleReset = () => {
    setRoom({ roomNumber: "", description: "" });
    setEditingRoomId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!room.roomNumber.trim() || !room.description.trim()) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    if (!isValidInput(room.roomNumber) || !isValidInput(room.description)) {
      toast.error(
        "Invalid characters detected. Only alphanumeric and .,/- & () are allowed"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = encryptPayload({
        roomNumber: room.roomNumber,
        description: room.description,
        ...(editingRoomId && { docRoomId: editingRoomId }),
      });

      const { data } = await api.post(
        "/save-room-details",
        { dataObject: payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.outcome !== true) {
        toast.error(data.message);
      } else {
        toast.success(data.message);
        fetchRoomData(); // Refresh the table data
        handleReset(); // Reset the form
        setActiveKey("1"); // Open the table section
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Room Active/Inactive Status
  const handleStatusToggle = async (room) => {
    const updatedStatus = !room.isActive;
    try {
      const payload = encryptPayload({
        docRoomId: room.docRoomId,
        isActive: updatedStatus,
      });

      const { data } = await api.post(
        "/update-room-status",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { dataObject: payload },
        }
      );

      if (data.outcome !== true) {
        toast.error(data.message);
      } else {
        toast.success(data.message);
        setRoomData((prev) =>
          prev.map((item) =>
            item.docRoomId === room.docRoomId
              ? { ...item, isActive: updatedStatus }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error updating room status:", error);
      toast.error("Failed to update room status.");
    }
  };

  // Edit Room (Ensure form section opens)
  const handleEdit = (room) => {
    setRoom({ roomNumber: room.roomNumber, description: room.description });
    setEditingRoomId(room.docRoomId);
    setActiveKey("0");
  };

  const columns = [
    {
      name: "Sl No.",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Room Number",
      selector: (row) => row.roomNumber,
      sortable: true,
      width: "550px",
    },
    {
      name: "Description",
      selector: (row) => row.description,
      sortable: true,
      width: "550px",
    },
    // {
    //   name: "Rack Count",
    //   selector: (row) => row.rackCount || "N/A",
    // },
    // {
    //   name: "Active",
    //   cell: (row) =>
    //     row.isActive ? (
    //       <FaCheck className="text-success" title="Active" />
    //     ) : (
    //       <FaTimes className="text-danger" title="Inactive" />
    //     ),
    //   sortable: true,
    // },
    {
      name: "Actions",
      cell: (row) => (
        <div>
          <Button
            variant="contained"
            color={row.isActive ? "error" : "success"}
            size="small"
            sx={{ minWidth: "auto" }}
            onClick={() => handleStatusToggle(row)}
            title={row.isActive ?  "Inactivate": "Activate"}
          >
            {row.isActive ? <FaLock /> : <FaLockOpen />}
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ minWidth: "auto" }}
            onClick={() => handleEdit(row)}
            className="ms-2"
            title="Edit"
          >
            <FaEdit />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="room-section-container">
      {/* Form & Table Accordion */}
      <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
        {/* Form Accordion */}
        <Accordion.Item eventKey="0">
          <Accordion.Header
            onClick={() => setIsFormOpen((prev) => !prev)}
            className="custbg"
          >
            <div
              className="mstaccodion d-flex"
              style={{ justifyContent: "space-between", width: "100%" }}
            >
              <span className="accordion-title">
                {editingRoomId ? "Edit Room Details" : "Add Room Details"}
              </span>
              <span className="accordion-icon ms-auto">
                {isFormOpen ? <FaMinus /> : <FaPlus />}
              </span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <form className="row">
              <div className="form-group col-md-6">
                <TextField
                  label={
                    <span>
                      Room Number <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  variant="outlined"
                  fullWidth
                  id="roomNumber"
                  name="roomNumber"
                  value={room.roomNumber}
                  onChange={handleInputChange}
                  placeholder="Enter Room"
                  helperText="Only alphanumeric characters and .,/- & () are allowed"
                 
                  inputProps={{
                    maxLength: 50,
                  }}
                />
              </div>
              <div className="form-group col-md-6">
                <TextField
                  label={
                    <span>
                      Room Description <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  variant="outlined"
                  fullWidth
                  multilines
                  minRows={3}
                  maxRows={6}
                  id="description"
                  name="description"
                  value={room.description}
                  onChange={handleInputChange}
                  placeholder="Enter room description"
                  helperText="Only alphanumeric characters and .,/- & () are allowed"
                  inputProps={{
                    maxLength: 500,
                  }}
                />
              </div>
              <div className="col-md-12 text-center mt-3">
                <Button
                  onClick={handleSubmit}
                  type="button"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingRoomId
                    ? "Update "
                    : "Save"}
                </Button>
                <Button
                  variant="contained"
                  type="button"
                  color="error"
                  className="ms-2"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </div>
            </form>
          </Accordion.Body>
        </Accordion.Item>

        {/* Table Accordion */}
        <Accordion.Item eventKey="1" className="mt-3">
          <Accordion.Header
            onClick={() => setIsTableOpen((prev) => !prev)}
            className="custbg"
          >
            <div
              className="mstaccodion d-flex"
              style={{ justifyContent: "space-between", width: "100%" }}
            >
              <span className="accordion-title">View Rooms</span>
              <span className="accordion-icon">
                {isTableOpen ? <FaPlus /> : <FaMinus />}
              </span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <DataTable
              columns={columns}
              data={roomData}
              customStyles={customStyles}
              pagination
              paginationServer={false}
              paginationTotalRows={totalRows}
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 30, 50]}
              responsive
              highlightOnHover
              pointerOnHover
              className="custom-data-table table table-bordered"
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default ManageRoom;
