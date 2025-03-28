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
import { toast } from "react-toastify";
import DataTable from "react-data-table-component";
import "react-toastify/dist/ReactToastify.css";
import Accordion from "react-bootstrap/Accordion";
import {
  TextField,
  FormControl,
  Button,
  CircularProgress,
  Autocomplete,
} from "@mui/material";

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

const ManageRack = () => {
  const [activeKey, setActiveKey] = useState("1");
  const [rack, setRack] = useState({
    rackNumber: "",
    noOfCell: 1,
    roomId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rackData, setRackData] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [editingRackId, setEditingRackId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isTableOpen, setIsTableOpen] = useState(true);

  const sortData = (data, field = "isActive", direction = "desc") => {
    return [...data].sort((a, b) => {
      // First sort by active status
      if (field === "isActive") {
        if (a.isActive !== b.isActive) {
          return direction === "desc"
            ? b.isActive
              ? 1
              : -1
            : a.isActive
            ? 1
            : -1;
        }
      }

      // Then sort by the selected field
      if (field === "rackNumber") {
        return direction === "desc"
          ? b.rackNumber.localeCompare(a.rackNumber, undefined, {
              numeric: true,
            })
          : a.rackNumber.localeCompare(b.rackNumber, undefined, {
              numeric: true,
            });
      }

      if (field === "noOfCell") {
        return direction === "desc"
          ? b.noOfCell - a.noOfCell
          : a.noOfCell - b.noOfCell;
      }

      if (field === "room") {
        const roomA = a.docRoom?.roomNumber || "";
        const roomB = b.docRoom?.roomNumber || "";
        return direction === "desc"
          ? roomB.localeCompare(roomA)
          : roomA.localeCompare(roomB);
      }

      return 0;
    });
  };

  const fetchRackData = async () => {
    try {
      const token = useAuthStore.getState().token;
      const response = await api.get("/manage-rack", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rawData = response.data?.data?.rackList?.data || [];
      setRackData(sortData(rawData)); // Sort data before setting
      setRoomList(response.data?.data?.roomList || []);
    } catch (error) {
      console.error("Error fetching rack data:", error);
      toast.error("Failed to fetch rack data.");
    }
  };

  useEffect(() => {
    fetchRackData();
  }, []);

  const validateInput = (value) => {
    const regex = /^[a-zA-Z0-9.,/\-&() ]*$/;
    return regex.test(value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "noOfCell") {
      if (/^\d*$/.test(value)) {
        setRack((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    if (name === "rackNumber") {
      if (validateInput(value)) {
        setRack((prev) => ({ ...prev, [name]: value }));
      } else {
        // toast.warning("Only alphanumeric characters and .,/- & () are allowed");
      }
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!rack.roomId) {
      toast.warning("Please select a room");
      setIsSubmitting(false);
      return;
    }

    const selectedRoom = roomList.find(
      (room) => room.docRoomId === rack.roomId
    );
    if (selectedRoom && !validateInput(selectedRoom.roomNumber.toString())) {
      toast.error("Selected room contains invalid characters");
      setIsSubmitting(false);
      return;
    }
    if (!rack.rackNumber || !rack.noOfCell) {
      toast.warning("Please fill out all fields");
      setIsSubmitting(false);
      return;
    }
    if (!validateInput(rack.rackNumber)) {
      toast.error(
        "Invalid characters in rack number. Only alphanumeric and .,/- & () are allowed"
      );
      setIsSubmitting(false);
      return;
    }

    if (isNaN(rack.noOfCell) || rack.noOfCell <= 0) {
      toast.error("Number of cells must be greater than 0");
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

      fetchRackData(); // Refresh the table data
      toast.success(
        editingRackId
          ? "Rack updated successfully!"
          : "Rack added successfully!"
      );
      setRack({ rackNumber: "", roomId: "" }); // Reset the form
      setEditingRackId(null); 
      setActiveKey("1"); 
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
      const updatedData = rackData.map((item) =>
        item.rackId === rack.rackId
          ? { ...item, isActive: !item.isActive }
          : item
      );
      setRackData(sortData(updatedData));
      toast.success(
        `Rack Status is ${rack.isActive ? "Inactivated" : "Activated "} successfully`
      );
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
    setRack({ rackNumber: ""  , roomId: "",noOfCell:1, });
    setEditingRackId(null);
  };

  const columns = [
    {
      name: "Sl",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "60px",
    },
    {
      name: "Rack Number",
      selector: (row) => row.rackNumber,
      sortable: true,
      sortField: "rackNumber",
    },
    {
      name: "No of Cells",
      selector: (row) => row.noOfCell,
      sortable: true,
      sortField: "noOfCell",
    },
    {
      name: "Room",
      selector: (row) => row.docRoom?.roomNumber || "N/A",
      sortable: true,
      sortField: "room",
    },
    // {
    //   name: "Active",
    //   cell: (row) =>
    //     row.isActive ? <FaCheck className="text-success" /> : <FaTimes className="text-danger" />,
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
            title={row.isActive ? "Inactive" : "Active"}
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
      ignoreRowClick: true,
    },
  ];

  return (
    <div className="rack-section-container">
      <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
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
                {editingRackId ? "Edit Rack Details" : "Add Rack Details"}
              </span>
              <span className="accordion-icon">
                {isFormOpen ? <FaPlus /> : <FaMinus />}
              </span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <form onSubmit={handleSubmit} className="row">
              <div className="form-group col-md-4">
                <FormControl fullWidth style={{ marginTop: "17px" }}>
                  <Autocomplete
                    options={roomList.filter((room) =>
                      validateInput(room.roomNumber.toString())
                    )}
                    getOptionLabel={(option) => option.roomNumber.toString()}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Select Room <span style={{ color: "red" }}>*</span>
                          </span>
                        }
                        variant="outlined"
                        size="small"
                        // error={!rack.roomId}
                        // helperText={!rack.roomId ? "Please select a room" : ""}
                      />
                    )}
                    value={
                      roomList.find((room) => room.docRoomId === rack.roomId) ||
                      null
                    }
                    onChange={(_, newValue) => {
                      if (
                        newValue &&
                        validateInput(newValue.roomNumber.toString())
                      ) {
                        setRack({
                          ...rack,
                          roomId: newValue.docRoomId,
                        });
                      } else if (!newValue) {
                        setRack({
                          ...rack,
                          roomId: "",
                        });
                      } else {
                        toast.warning(
                          "Room number contains invalid characters"
                        );
                      }
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option.docRoomId === value.docRoomId
                    }
                    filterOptions={(options, params) => {
                      const filtered = options.filter(
                        (option) =>
                          validateInput(option.roomNumber.toString()) &&
                          option.roomNumber
                            .toString()
                            .toLowerCase()
                            .includes(params.inputValue.toLowerCase())
                      );
                      return filtered;
                    }}
                  />
                </FormControl>
              </div>
              <div className="form-group col-md-4">
                <TextField
                  label={
                    <span>
                      rackNumber <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  id="rackNumber"
                  size="small"
                  name="rackNumber"
                  value={rack.rackNumber}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  placeholder="Enter rack number"
                  error={
                    !validateInput(rack.rackNumber) && rack.rackNumber !== ""
                  }
                  helperText={
                    !validateInput(rack.rackNumber) && rack.rackNumber !== ""
                      ? "Only alphanumeric and .,/- & () characters allowed"
                      : ""
                  }
                  inputProps={{
                    maxLength: 50,
                  }}
                />
              </div>
              <div className="form-group col-md-4">
                <TextField
                  label={
                    <span>
                      Number of Cells <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  id="noOfCell"
                  name="noOfCell"
                  size="small"
                  value={rack.noOfCell}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  type="number"
                  placeholder="Enter number of cells"
                  error={rack.noOfCell < 1}
                  helperText={
                    rack.noOfCell < 1 ? "Number must be greater than 0" : ""
                  }
                  inputProps={{
                    min: 1,
                    max: 9999,
                  }}
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
                    ? "Update "
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
          <Accordion.Header
            onClick={() => setIsTableOpen((prev) => !prev)}
            className="custbg"
          >
            <div
              className="mstaccodion d-flex"
              style={{ justifyContent: "space-between", width: "100%" }}
            >
              <span className="accordion-title">View Racks</span>
              <span className="accordion-icon">
                {isTableOpen ? <FaMinus /> : <FaPlus />}
              </span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <DataTable
              columns={columns}
              data={rackData}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 30, 50]}
              highlightOnHover
              customStyles={customStyles}
              defaultSortFieldId={2}
              defaultSortAsc={false}
              sortServer={false}
              onSort={(column, direction) => {
                const sortedData = sortData(
                  rackData,
                  column.sortField,
                  direction
                );
                setRackData(sortedData);
              }}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default ManageRack;
