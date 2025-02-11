import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus, FaLock, FaLockOpen, FaEdit } from "react-icons/fa";
import { Accordion } from "react-bootstrap";
import { TextField, Button } from "@mui/material";
import api from "../../Api/Api";
import { encryptPayload } from "../../utils/encrypt";
import useAuthStore from "../../store/Store";
import "./ManageActivity.css";
import DataTable from "react-data-table-component"; // Import DataTable

// import { Button } from "@mui/material";

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

  const fetchActivityData = async () => {
    try {
      const token = useAuthStore.getState().token;
      const response = await api.get("/manage-activity", {
        headers: { Authorization: `Bearer ${token}` },
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
      alert("Please fill out all required fields.");
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

      alert(
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
      alert("Failed to save data.");
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

      alert(
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
      alert("Failed to update activity status.");
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
          <Accordion.Header onClick={() => setIsFormOpen((prev) => !prev)}>
            <span className="accordion-title">
              {editingActivityId
                ? "Edit Activity Details"
                : "Add Activity Details"}
            </span>
            <span className="accordion-icon">
              {isFormOpen ? <FaMinus /> : <FaPlus />}
            </span>
          </Accordion.Header>
          <Accordion.Body>
            <form onSubmit={handleSubmit} className="row">
              <div className="form-group col-md-3">
                <TextField
                  fullWidth
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
              <div className="form-group col-md-3">
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
          <Accordion.Header onClick={() => setIsTableOpen((prev) => !prev)}>
            <span className="accordion-title">View Activities</span>
            <span className="accordion-icon">
              {isTableOpen ? <FaMinus /> : <FaPlus />}
            </span>
          </Accordion.Header>
          <Accordion.Body>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive">
                  {/* <table className="table">
                    <thead>
                      <tr>
                        <th>Sl</th>
                        <th>Activity Code</th>
                        <th>Activity Name</th>
                        <th>Activity Remarks</th>
                        <th>Active</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityData.length > 0 ? (
                        activityData.map((activity, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{activity.activityCode}</td>
                            <td>{activity.activityName}</td>
                            <td>{activity.activityRemarks}</td>
                            <td>{activity.isActive ? "Yes" : "No"}</td>
                            <td
                              className="d-flex"
                              style={{ width: "max-content" }}
                            >
                              <button
                                className={`btn btn-sm ${
                                  activity.isActive
                                    ? "btn-danger"
                                    : "btn-success"
                                }`}
                                onClick={() => handleStatusToggle(activity)}
                              >
                                {activity.isActive ? (
                                  <FaLock />
                                ) : (
                                  <FaLockOpen />
                                )}
                              </button>
                              <button
                                className="btn btn-sm btn-warning ms-2"
                                onClick={() => handleEdit(activity)}
                              >
                                <FaEdit />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5">No data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table> */}

                <DataTable
                      columns={columns}
                      data={activityData}
                      pagination
                      highlightOnHover
                      responsive
                      noDataComponent="No data available"
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
