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
import { TextField, Button } from "@mui/material"; // Importing Button from Material-UI
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

const ManageRoom = () => {
  const [activeKey, setActiveKey] = useState("1");
  const [isFormOpen, setIsFormOpen] = useState();
  const [isTableOpen, setIsTableOpen] = useState();
  const [room, setRoom] = useState({ roomNumber: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roomData, setRoomData] = useState([]);
  const [editingRoomId, setEditingRoomId] = useState(null);
//  const [rowSize, setRowSize] = useState(10);
//   const [pageNo, setPageNo] = useState(1);
//   const [totalRows, setTotalRows] = useState(0);
  const token = useAuthStore.getState().token;

  // Fetch Room Data
  const fetchRoomData = useCallback(async () => {
    try {
      //  const payload = {
      //         pageNo: pageNo,
      //         rowSize:rowSize,
      //       };
      
            // Encrypt the payload
      // const encryptedMessage = encryptPayload(payload);
      const { data } = await api.get("/manage-room", {
        headers: { Authorization: `Bearer ${token}` },
        // params: { dataObject: encryptedMessage },
      });
      if(data.outcome != true){
        toast.error(data.message);
      }
      setRoomData(data.data || []);
      setTotalRows(data.totalCount || 0);
    } catch (error) {
      console.error("Error fetching room data:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData]);

  // Handle Input Changes
  const handleInputChange = (e) => {
    setRoom((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Reset Form
  const handleReset = () => {
    setRoom({ roomNumber: "", description: "" });
    setEditingRoomId(null);
  };

  // Handle Submit (Add/Edit Room)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!room.roomNumber || room.roomNumber <= 0 || !room.description) {
      toast.warning("Please fill in all fields correctly.");
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
      if(data.outcome != true){
        toast.error(data.message);
      }
      else{
        toast.success(data.message);
      }
      fetchRoomData();
      handleReset();
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
      debugger
      if(data.outcome != true){
        toast.error(data.message);
      }
      else{
        toast.success(data.message);
      }
      setRoomData((prev) =>
        prev.map((item) =>
          item.docRoomId === room.docRoomId
            ? { ...item, isActive: updatedStatus }
            : item
        )
      );
      

     
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

  // Columns configuration for DataTable with Serial Number
  const columns = [
    {
      name: "Sl No.",
      selector: (row, index) => index + 1, // Add Serial Number column
      sortable: false,
    },
    {
      name: "Room Number",
      selector: (row) => row.roomNumber,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.description,
      sortable: true,
    },
    {
      name: "Rack Count",
      selector: (row) => row.rackCount || "N/A",
    },
    {
      name: "Active",
      cell: (row) =>
        row.isActive ? (
          <FaCheck className="text-success" title="Active" />
        ) : (
          <FaTimes className="text-danger" title="Inactive" />
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div>
          {/* Use Material UI Button for toggling status */}
          <Button
            variant="contained"
            color={row.isActive ? "error" : "success"}
            size="small"
            sx={{ minWidth: "auto" }}
            onClick={() => handleStatusToggle(row)}
            startIcon={row.isActive ? <FaLock /> : <FaLockOpen />}
            title={row.isActive ? "In-Active" : "Active"}
          >
          </Button>
          {/* Use Material UI Button for editing */}
          <Button
            variant="outlined"
            color="warning"
            size="small"
            sx={{ minWidth: "auto" }}
            onClick={() => handleEdit(row)}
            startIcon={<FaEdit />}
            className="ms-2"
            title="Edit"
          >
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
          <Accordion.Header onClick={() => setIsFormOpen((prev) => !prev)} className="custbg">
            <div className="mstaccodion d-flex" style={{justifyContent:"space-between", width:"100%"}}>
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
              <div className="form-group col-md-3">
                <TextField
                  label="Room Number"
                  variant="outlined"
                  fullWidth
                  id="roomNumber"
                  name="roomNumber"
                  value={room.roomNumber}
                  onChange={handleInputChange}
                  placeholder="Enter Room"
                />
              </div>
              <div className="form-group col-md-12 mt-3">
                <TextField
                  label="Room Description"
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={3}
                  id="description"
                  name="description"
                  value={room.description}
                  onChange={handleInputChange}
                  placeholder="Enter room description"
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
                    ? "Update Room"
                    : "Save"}
                </Button>
                <Button
                  variant="outlined"
                  type="button"
                  color="secondary"
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
          <Accordion.Header onClick={() => setIsTableOpen((prev) => !prev)} className="custbg">
          <div className="mstaccodion d-flex" style={{justifyContent:"space-between", width:"100%"}}>
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
              responsive
              highlightOnHover
              pointerOnHover
              className="custom-data-table table table-bordered"
  //             paginationServer
  // paginationTotalRows={totalRows} // Set total rows for server-side pagination
  // paginationPerPage={rowSize}
  // paginationDefaultPage={pageNo}
  // onChangePage={(page) => setPageNo(page)} // Update page state
  // onChangeRowsPerPage={(newRowSize) => {
  //   setRowSize(newRowSize);
  //   setPageNo(1); // Reset to first page when changing rows per page
  // }}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default ManageRoom;
