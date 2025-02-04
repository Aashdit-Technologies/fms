import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa6";
import api from "../../Api/Api";
import { encryptPayload } from "../../utils/encrypt";
import useAuthStore from "../../store/Store";
import "./ManageActivity.css";

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
  

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const token = useAuthStore.getState().token;
        const response = await api.get("/manage-activity", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched Activity Data:", response.data.activityList);
        setActivityData(response.data.activityList);
      } catch (error) {
        console.error("Error fetching activity data:", error);
      }
    };

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
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        editingActivityId
          ? "Activity updated successfully!"
          : "Activity added successfully!"
      );

      setActivityData((prevData) =>
        editingActivityId
          ? prevData.map((item) =>
              item.activityId === editingActivityId ? response.data : item
            )
          : [...prevData, response.data]
      );

      setActivity({ activityCode: "", activityName: "", activityRemarks: "" });
      setEditingActivityId(null);
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data.");
    } finally {
      setIsSubmitting(false);
    }
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

      const response = await api.post(
        "/update-activity-status",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { dataObject: encryptedMessage },
        }
      );

      alert(`Activity status updated to ${updatedStatus ? "Active" : "Inactive"}!`);
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
  };

  return (
    <div className="activity-section-container">
   
      <div className="accordion-header" onClick={() => setIsFormOpen(!isFormOpen)}>
        <span className="accordion-title">
          {editingActivityId ? "Edit Activity Details" : "Add Activity Details"}
        </span>
        <span className="accordion-icon">
          {isFormOpen ? <FaMinus /> : <FaPlus />}
        </span>
      </div>
      {isFormOpen && (
        <div className="accordion-body">
          <form onSubmit={handleSubmit} className="row">
            <div className="form-group col-md-3">
              <label htmlFor="activityCode">Activity Code:</label>
              <input
                type="number"
                className="form-control"
                id="activityCode"
                name="activityCode"
                value={activity.activityCode}
                onChange={handleInputChange}
                placeholder="Enter Activity Code"
              />
            </div>
            <div className="form-group col-md-3">
              <label htmlFor="activityName">Activity Name:</label>
              <input
                type="text"
                className="form-control"
                id="activityName"
                name="activityName"
                value={activity.activityName}
                onChange={handleInputChange}
                placeholder="Enter Activity Name"
              />
            </div>
            <div className="form-group col-md-3">
              <label htmlFor="activityRemarks">Activity Remarks:</label>
              <textarea
                className="form-control"
                id="activityRemarks"
                name="activityRemarks"
                value={activity.activityRemarks}
                onChange={handleInputChange}
                placeholder="Enter Activity Remarks"
              ></textarea>
            </div>
            <div className="col-md-12 text-center mt-3">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingActivityId ? "Update Activity" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      
      <div className="accordion-header mt-5" onClick={() => setIsTableOpen(!isTableOpen)}>
        <span className="accordion-title">View Activities</span>
        <span className="accordion-icon">
          {isTableOpen ? <FaMinus /> : <FaPlus />}
        </span>
      </div>
      {isTableOpen && (
        <div className="accordion-body">
          <table className="table">
            <thead>
              <tr>
                <th>Activity Code</th>
                <th>Activity Name</th>
                <th>Activity Remarks</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activityData && activityData.length > 0 ? (
                activityData.map((activity) => (
                  <tr key={activity.activityId}>
                    <td>{activity.activityCode}</td>
                    <td>{activity.activityName}</td>
                    <td>{activity.activityRemarks}</td>
                    <td>{activity.isActive ? "Yes" : "No"}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${
                          activity.isActive ? "btn-danger" : "btn-success"
                        }`}
                        onClick={() => handleStatusToggle(activity)}
                      >
                        {activity.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="btn btn-sm btn-warning ms-2"
                        onClick={() => handleEdit(activity)}
                      >
                        Edit
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
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageActivity;
