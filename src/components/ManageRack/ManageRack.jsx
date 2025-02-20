import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaMinus,
  FaCheck,
  FaTimes,
  FaEdit,
  FaLock,
  FaLockOpen,
} from "react-icons/fa";
import api from "../../Api/Api";
import { encryptPayload } from "../../utils/encrypt";
import useAuthStore from "../../store/Store";
import { toast } from "react-toastify"; // Import toast
import DataTable from "react-data-table-component"; // Import DataTable
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import Accordion from "react-bootstrap/Accordion";
import {
  TextField,
  FormControl,
  Button,
  CircularProgress,
  Autocomplete,
} from "@mui/material";

// toast.configure(); // Initialize toast notifications

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


const ManageRack = () => {
  const [activeKey, setActiveKey] = useState("1");
  const [rack, setRack] = useState({ rackNumber: "", noOfCell: "", roomId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rackData, setRackData] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [editingRackId, setEditingRackId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isTableOpen, setIsTableOpen] = useState(true);
  // const [rowSize, setRowSize] = useState(10);
  // const [pageNo, setPageNo] = useState(1);
  // const [totalRows, setTotalRows] = useState(0);

  const fetchRackData = async () => {
    try {

      // const payload = {
      //   pageNo: pageNo,
      //   rowSize:rowSize,
      // };

      // Encrypt the payload
        // const encryptedMessage = encryptPayload(payload);
      const token = useAuthStore.getState().token;
      const response = await api.get("/manage-rack", {
        headers: { Authorization: `Bearer ${token}` },
        // params: { dataObject: encryptedMessage },
      });
      setRackData(response.data?.data?.rackList?.data || []);
      setRoomList(response.data?.data?.roomList || []);
    } catch (error) {
      console.error("Error fetching rack data:", error);
      toast.error("Failed to fetch rack data.");
    }
  };

  useEffect(() => {
    fetchRackData();
  }, []);

  const handleInputChange = (e) => {
    setRack({ ...rack, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!rack.rackNumber || rack.rackNumber <= 0 || !rack.noOfCell || !rack.roomId) {
      toast.warning("Please fill out all fields correctly.");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = useAuthStore.getState().token;
      const payload = {
        rackNumber: rack.rackNumber,
        noOfCell: rack.noOfCell,
        roomId: rack.roomId,
      };
      if (editingRackId) payload.rackId = editingRackId;
      const encryptedMessage = encryptPayload(payload);

      await api.post(
        "/save-rack-details",
        { dataObject: encryptedMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchRackData();
      toast.success(editingRackId ? "Rack updated successfully!" : "Rack added successfully!");
      setRack({ rackNumber: "", noOfCell: "", roomId: "" });
      setEditingRackId(null);
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (rack) => {
    try {
      const token = useAuthStore.getState().token;
      const payload = { rackId: rack.rackId, isActive: !rack.isActive };
      const encryptedMessage = encryptPayload(payload);

      await api.post(
        "/update-rack-status/",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { dataObject: encryptedMessage },
        }
      );

      toast.success(`Rack status updated to ${!rack.isActive ? "Active" : "Inactive"}!`);
      fetchRackData();
    } catch (error) {
      console.error("Error updating rack status:", error);
      toast.error("Failed to update rack status.");
    }
  };

  const handleEdit = (rack) => {
    setRack({
      rackNumber: rack.rackNumber,
      noOfCell: rack.noOfCell,
      roomId: rack.docRoom?.docRoomId,
    });
    setEditingRackId(rack.rackId);
    setActiveKey("0");
  };

  const handleReset = () => {
    setRack({ rackNumber: "", noOfCell: "", roomId: "" });
    setEditingRackId(null);
  };

  // Define columns for DataTable
  const columns = [
    { name: "Sl", selector: (row, index) => index + 1, sortable: true, width: "60px" },
    { name: "Rack Number", selector: (row) => row.rackNumber, sortable: true },
    { name: "No of Cells", selector: (row) => row.noOfCell, sortable: true },
    { name: "Room", selector: (row) => row.docRoom?.roomNumber || "N/A", sortable: true },
    {
      name: "Active",
      cell: (row) =>
        row.isActive ? <FaCheck className="text-success" /> : <FaTimes className="text-danger" />,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div>
      {/* Use Material UI Button for toggling status */}
      <Button
        variant="contained"
        color={row.isActive ?  "error" : "success"}
        size="small"
        sx={{ minWidth: "auto" }}
        onClick={() => handleStatusToggle(row)}
        startIcon={row.isActive ? <FaLock /> : <FaLockOpen />}
        title={row.isActive ? "In-Active" : "Active"}
      />
      
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
      />
    </div>
      ),
      ignoreRowClick: true,
    },
  ];

  return (
    <div className="rack-section-container">
      <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
        <Accordion.Item eventKey="0">
          <Accordion.Header onClick={() => setIsFormOpen((prev) => !prev)} className="custbg">
          <div className="mstaccodion d-flex" style={{justifyContent:"space-between", width:"100%"}}>
            <span className="accordion-title">
              {editingRackId ? "Edit Rack Details" : "Add Rack Details"}
            </span>
            <span className="accordion-icon">{isFormOpen ? <FaPlus /> : <FaMinus /> }</span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
          <form onSubmit={handleSubmit} className="row">
            <div className="form-group col-md-3">
                <FormControl fullWidth style={{ marginTop: "17px" }}>
                  <Autocomplete
                    options={roomList}
                    getOptionLabel={(option) => option.roomNumber.toString()}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Room" variant="outlined" />
                    )}
                    value={roomList.find((room) => room.docRoomId === rack.roomId) || null}
                    onChange={(_, newValue) => {
                      setRack({ ...rack, roomId: newValue ? newValue.docRoomId : "" });
                    }}
                  />
                </FormControl>
              </div>
              <div className="form-group col-md-3">
                <TextField
                  label="Rack Number"
                  id="rackNumber"
                  name="rackNumber"
                  value={rack.rackNumber}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  placeholder="Enter rack number"
                />
              </div>
              <div className="form-group col-md-3">
                <TextField
                  label="Number of Cells"
                  id="noOfCell"
                  name="noOfCell"
                  value={rack.noOfCell}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  type="number"
                  placeholder="Enter number of cells"
                />
              </div>
              <div className="col-md-12 text-center mt-3">
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isSubmitting}
                  startIcon={isSubmitting && <CircularProgress size={24} />}
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingRackId
                    ? "Update Rack"
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

        <Accordion.Item eventKey="1" className="mt-3">
          <Accordion.Header onClick={() => setIsTableOpen((prev) => !prev)} className="custbg">
          <div className="mstaccodion d-flex" style={{justifyContent:"space-between", width:"100%"}}>
            <span className="accordion-title">View Racks</span>
            <span className="accordion-icon">{isTableOpen ? <FaMinus /> : <FaPlus />}</span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <DataTable columns={columns} data={rackData} pagination highlightOnHover customStyles={customStyles}
            //  paginationServer
            // //  paginationTotalRows={totalRows} // Set total rows for server-side pagination
            //  paginationPerPage={rowSize}
            //  paginationDefaultPage={pageNo}
            //  onChangePage={(page) => setPageNo(page)} // Update page state
            //  onChangeRowsPerPage={(newRowSize) => {
            //    setRowSize(newRowSize);
            //    setPageNo(1); // Reset to first page when changing rows per page
            //  }} 
             />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default ManageRack;
