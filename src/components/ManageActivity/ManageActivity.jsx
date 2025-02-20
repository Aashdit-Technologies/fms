import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus, FaLock, FaLockOpen, FaEdit } from "react-icons/fa";
import { Accordion } from "react-bootstrap";
import { TextField, Button } from "@mui/material";
import api from "../../Api/Api";
import { encryptPayload } from "../../utils/encrypt";
import useAuthStore from "../../store/Store";
import "./ManageActivity.css";
import DataTable from "react-data-table-component"; // Import DataTable
import { toast } from "react-toastify";

// import { Button } from "@mui/material";

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


const ManageActivity = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(true);
  const [activity, setActivity] = useState({
    activityCode: "",
    activityName: "",
    activityRemarks: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityData, setActivityData] = useState([]);
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [activeKey, setActiveKey] = useState("1");
  // const [rowSize, setRowSize] = useState(10);
  // const [pageNo, setPageNo] = useState(1);
  // const [totalRows, setTotalRows] = useState(0);
  const fetchActivityData = async () => {
    try {
      // const payload = {
      //   pageNo: pageNo,
      //   rowSize:rowSize,
      // };

      // Encrypt the payload
// const encryptedMessage = encryptPayload(payload);
      const token = useAuthStore.getState().token;
      const response = await api.get("/manage-activity", {
        headers: { Authorization: `Bearer ${token}` },
        // params: { dataObject: encryptedMessage },
      });
      setActivityData(response.data.data);
    } catch (error) {
      console.error("Error fetching activity data:", error);
    }
  };

  useEffect(() => {
    fetchActivityData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setActivity((prevActivity) => ({
      ...prevActivity,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!activity.activityCode || !activity.activityName) {
      toast.warning("Please fill out all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = useAuthStore.getState().token;
      const payload = {
        activityCode: activity.activityCode,
        activityName: activity.activityName,
        activityRemarks: activity.activityRemarks,
      };

      if (editingActivityId) {
        payload.activityId = editingActivityId;
      }

      const encryptedMessage = encryptPayload(payload);

      const response = await api.post(
        "/save-edit-activity",
        { dataObject: encryptedMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(
        editingActivityId
          ? "Activity updated successfully!"
          : "Activity added successfully!"
      );
      fetchActivityData();

      setActivityData((prevData) =>
        editingActivityId
          ? prevData.map((item) =>
              item.activityId === editingActivityId ? response.data : item
            )
          : [...prevData, response.data]
      );

      handleReset();
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setActivity({ activityCode: "", activityName: "", activityRemarks: "" });
    setEditingActivityId(null);
    setIsFormOpen(false);
  };

  const handleStatusToggle = async (activity) => {
    const updatedStatus = !activity.isActive;
    try {
      const token = useAuthStore.getState().token;
      const payload = {
        activityId: activity.activityId,
        isActive: updatedStatus,
      };

      const encryptedMessage = encryptPayload(payload);

      await api.post(
        "/update-activity-status",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { dataObject: encryptedMessage },
        }
      );

      toast.success(
        `Activity status updated to ${updatedStatus ? "Active" : "Inactive"}!`
      );
      setActivityData((prevData) =>
        prevData.map((item) =>
          item.activityId === activity.activityId
            ? { ...item, isActive: updatedStatus }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating activity status:", error);
      toast.error("Failed to update activity status.");
    }
  };

  const handleEdit = (activity) => {
    setActivity({
      activityCode: activity.activityCode,
      activityName: activity.activityName,
      activityRemarks: activity.activityRemarks,
    });
    setEditingActivityId(activity.activityId);
    setIsFormOpen(true);
    setActiveKey("0");
  };


  const columns = [
    {
      name: "Sl",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "70px",
    },
    {
      name: "Activity Code",
      selector: (row) => row.activityCode,
      sortable: true,
    },
    {
      name: "Activity Name",
      selector: (row) => row.activityName,
      sortable: true,
    },
    {
      name: "Activity Remarks",
      selector: (row) => row.activityRemarks,
    },
    {
      name: "Active",
      selector: (row) => (row.isActive ? "Yes" : "No"),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex" style={{ width: "max-content" }}>
          <Button
            variant="contained"
            color={row.isActive ? "error" : "success"}
            size="small"
            sx={{ minWidth: "auto" }}
            title={row.isActive ? "Deactivate" : "Activate"}
            startIcon={row.isActive ? <FaLock /> : <FaLockOpen />}
            onClick={() => handleStatusToggle(row)}
          >
            
          </Button>
          <Button
            variant="outlined"
            color="warning"
            size="small"
            title="Edit"
            sx={{ minWidth: "auto" }}
            startIcon={<FaEdit />}
            onClick={() => handleEdit(row)}
            style={{ marginLeft: "8px" }}
          >
            {/* Edit */}
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="activity-section-container">
      <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
        {/* Add/Edit Activity Accordion */}
        <Accordion.Item eventKey="0">
          <Accordion.Header onClick={() => setIsFormOpen((prev) => !prev)} className="custbg">
          <div className="mstaccodion d-flex" style={{justifyContent:"space-between", width:"100%"}}>
            <span className="accordion-title">
              {editingActivityId
                ? "Edit Activity Details"
                : "Add Activity Details"}
            </span>
            <span className="accordion-icon">
              {isFormOpen ? <FaMinus /> : <FaPlus />}
            </span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <form onSubmit={handleSubmit} className="row">
              <div className="form-group col-md-3">
                <TextField
                  fullWidth
                  type="number"
                  label="Activity Code"
                  variant="outlined"
                  id="activityCode"
                  name="activityCode"
                  value={activity.activityCode}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-3">
                <TextField
                  fullWidth
                  label="Activity Name"
                  variant="outlined"
                  id="activityName"
                  name="activityName"
                  value={activity.activityName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-12 mt-3">
                <TextField
                  fullWidth
                  label="Activity Remarks"
                  variant="outlined"
                  multiline
                  rows={3}
                  id="activityRemarks"
                  name="activityRemarks"
                  value={activity.activityRemarks}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-12 text-center mt-3">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingActivityId
                    ? "Update Activity"
                    : "Save"}
                </Button>
                <Button
                  variant="outlined"
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

        {/* View Activity Table Accordion */}
        <Accordion.Item eventKey="1" className="mt-3">
          <Accordion.Header onClick={() => setIsTableOpen((prev) => !prev)} className="custbg">
          <div className="mstaccodion d-flex" style={{justifyContent:"space-between", width:"100%"}}>
            <span className="accordion-title">View Activities</span>
            <span className="accordion-icon">
              {isTableOpen ? <FaMinus /> : <FaPlus />}
            </span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive">
                 

                <DataTable
                      columns={columns}
                      data={activityData}
                      pagination
                      highlightOnHover
                      responsive
                      noDataComponent="No data available"
                      customStyles={customStyles}
                      // paginationServer
                      // paginationTotalRows={totalRows} // Set total rows for server-side pagination
                      // paginationPerPage={rowSize}
                      // paginationDefaultPage={pageNo}
                      // onChangePage={(page) => setPageNo(page)} // Update page state
                      // onChangeRowsPerPage={(newRowSize) => {
                      //   setRowSize(newRowSize);
                      //   setPageNo(1); // Reset to first page when changing rows per page
                      // }}
                    />
                </div>
              </div>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default ManageActivity;
