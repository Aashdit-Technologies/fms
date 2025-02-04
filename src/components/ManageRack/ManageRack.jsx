import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa6";
import api from "../../Api/Api";
import { encryptPayload } from "../../utils/encrypt";
import useAuthStore from "../../store/Store";
import "./ManageRack.css";

const ManageRack = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(true);
  const [rack, setRack] = useState({
    rackNumber: "",
    noOfCell: "", // Added field for noOfCell
    roomId: "", // Added field for room selection
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rackData, setRackData] = useState([]);
  const [roomList, setRoomList] = useState([]); // For room list
  const [editingRackId, setEditingRackId] = useState(null); // Track rack being edited

  // Fetch room and rack data
  useEffect(() => {
    const fetchRackData = async () => {
      try {
        const token = useAuthStore.getState().token;
        const response = await api.get("/manage-rack", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched Rack Data:", response.data.rackList);
        setRackData(response.data.rackList);
        setRoomList(response.data.roomList);
      } catch (error) {
        console.error("Error fetching rack data:", error);
      }
    };

    

    fetchRackData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRack((prevRack) => ({
      ...prevRack,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!rack.rackNumber || rack.rackNumber <= 0) {
      alert("Please enter a valid rack number.");
      setIsSubmitting(false);
      return;
    }

    if (!rack.noOfCell) {
      alert("Please enter the number of cells.");
      setIsSubmitting(false);
      return;
    }

    if (!rack.roomId) {
      alert("Please select a room.");
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

      // Add rackId to the payload if editing
      if (editingRackId) {
        payload.rackId = editingRackId;
      }

      const encryptedMessage = encryptPayload(payload);

      const response = await api.post(
        "/save-rack-details",
        { dataObject: encryptedMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", response.data);
      alert(
        editingRackId
          ? "Rack details updated successfully!"
          : "Rack added successfully!"
      );

      if (editingRackId) {
        setRackData((prevData) =>
          prevData.map((item) =>
            item.rackId === editingRackId ? response.data : item
          )
        );
      } else {
        setRackData((prevData) => [...prevData, response.data]);
      }

      setRack({ rackNumber: "", noOfCell: "", roomId: "" });
      setEditingRackId(null);
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (rack) => {
    const updatedStatus = !rack.isActive;
    try {
      const token = useAuthStore.getState().token;
      const payload = {
        rackId: rack.rackId,
        isActive: updatedStatus,
      };

      
      
      const encryptedMessage = encryptPayload(payload);

      const response = await api.post(
        "/update-rack-status/",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            dataObject: encryptedMessage,
          },
        }
      );

      console.log("Status Update Response:", response.data);
      alert(`Rack status updated to ${updatedStatus ? "Active" : "Inactive"}!`);

      setRackData((prevData) =>
        prevData.map((item) =>
          item.rackId === rack.rackId
            ? { ...item, isActive: updatedStatus }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating rack status:", error);
      alert("Failed to update rack status.");
    }
  };

  const toggleFormAccordion = () => {
    setIsFormOpen(!isFormOpen);
  };

  const toggleTableAccordion = () => {
    setIsTableOpen(!isTableOpen);
  };

  const handleEdit = (rack) => {
    debugger;
    console.log("Editing Rack:", rack);
    console.log("Rack Room ID:", rack.docRoom.docRoomId);
    setRack({
      rackNumber: rack.rackNumber,
      noOfCell: rack.noOfCell,
      roomId: rack.docRoom.docRoomId, // Use the same key as in rackData
    });
    setEditingRackId(rack.rackId);
    setIsFormOpen(true); // Open the form if not already open
  };
  

  return (
    <div className="rack-section-container">
      {/* Form Accordion */}
      <div className="accordion-header" onClick={toggleFormAccordion}>
        <span className="accordion-title">
          {editingRackId ? "Edit Rack Details" : "Add Rack Details"}
        </span>
        <span className="accordion-icon">
          {isFormOpen ? <FaMinus /> : <FaPlus />}
        </span>
      </div>
      {isFormOpen && (
        <div className="accordion-body">
          <form onSubmit={handleSubmit} className="row">

            {/* Select Room */}
            <div className="form-group col-md-3">
              <label htmlFor="roomId">Select Room:</label>
              <select
                className="form-control"
                id="roomId"
                name="roomId"
                value={rack.roomId}
                onChange={handleInputChange}
              >
                <option value="">Select Room</option>
                {roomList.map((room) => (
                  <option key={room.docRoomId} value={room.docRoomId} >
                    {room.roomNumber}
                  </option>
                ))}
                ;
              </select>
            </div>

            <div className="form-group col-md-3">
              <label htmlFor="rackNumber">Rack Number:</label>
              <input
                type="text"
                className="form-control"
                id="rackNumber"
                name="rackNumber"
                value={rack.rackNumber}
                onChange={handleInputChange}
                placeholder="Enter rack number"
              />
            </div>

            <div className="form-group col-md-3">
              <label htmlFor="noOfCell">Number of Cells:</label>
              <input
                type="number"
                className="form-control"
                id="noOfCell"
                name="noOfCell"
                value={rack.noOfCell}
                onChange={handleInputChange}
                placeholder="Enter number of cells"
              />
            </div>

            

            <div className="col-md-12 text-center mt-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : editingRackId
                  ? "Update Rack"
                  : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Accordion */}
      <div className="accordion-header mt-5" onClick={toggleTableAccordion}>
        <span className="accordion-title">View Racks</span>
        <span className="accordion-icon">
          {isTableOpen ? <FaMinus /> : <FaPlus />}
        </span>
      </div>
      {isTableOpen && (
        <div className="accordion-body">
          <table className="table">
            <thead>
              <tr>
                <th>Rack Number</th>
                <th>No of Cells</th>
                <th>Room</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rackData && rackData.length > 0 ? (
                rackData.map((rack) => (
                  <tr key={rack.rackId}>
                    <td>{rack.rackNumber}</td>
                    <td>{rack.noOfCell}</td>
                    <td>{rack.docRoom?.roomNumber}</td>
                    <td>{rack.isActive ? "Yes" : "No"}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${
                          rack.isActive ? "btn-danger" : "btn-success"
                        }`}
                        onClick={() => handleStatusToggle(rack)}
                      >
                        {rack.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="btn btn-sm btn-warning ms-2"
                        onClick={() => handleEdit(rack)}
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

export default ManageRack;
