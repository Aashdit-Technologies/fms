import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa6";
import api from "../../Api/Api";
import { encryptPayload } from "../../utils/encrypt";
import useAuthStore from "../../store/Store";
import "./ManageRoom.css";

const ManageRoom = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(true);
  const [room, setRoom] = useState({
    roomNumber: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roomData, setRoomData] = useState([]);
  const [editingRoomId, setEditingRoomId] = useState(null); // Tracks the room being edited

  // Fetch room data when the component loads
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const token = useAuthStore.getState().token;
        const response = await api.get("/manage-room", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoomData(response.data.roomList);
      } catch (error) {
        console.error("Error fetching room data:", error);
        
      }
    };
    fetchRoomData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoom((prevRoom) => ({ ...prevRoom, [name]: value }));
  };

  // Reset form
  const handleReset = () => {
    setRoom({ roomNumber: "", description: "" });
    setEditingRoomId(null);
  };

  // Save or update room details
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!room.roomNumber || room.roomNumber <= 0) {
      alert("Please enter a valid room number.");
      setIsSubmitting(false);
      return;
    }

    if (!room.description) {
      alert("Please enter a room description.");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = useAuthStore.getState().token;
      const payload = {
        roomNumber: room.roomNumber,
        description: room.description,
        ...(editingRoomId && { docRoomId: editingRoomId }),
      };

      const encryptedMessage = encryptPayload(payload);
      const response = await api.post(
        "/save-room-details",
        { dataObject: encryptedMessage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(editingRoomId ? "Room updated successfully!" : "Room added successfully!");

      // Update the table with new or updated room data
      if (editingRoomId) {
        setRoomData((prevData) =>
          prevData.map((item) =>
            item.docRoomId === editingRoomId ? response.data : item
          )
        );
      } else {
        setRoomData((prevData) => [...prevData, response.data]);
      }

      handleReset();
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle room active/inactive status
  const handleStatusToggle = async (room) => {
    const updatedStatus = !room.isActive;
    try {
      const token = useAuthStore.getState().token;
      const payload = {
        docRoomId: room.docRoomId,
        isActive: updatedStatus,
      };

      const encryptedMessage = encryptPayload(payload);
      await api.post(
        "/update-room-status",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { dataObject: encryptedMessage },
        }
      );

      alert(`Room status updated to ${updatedStatus ? "Active" : "Inactive"}!`);

      // Update the status in the table
      setRoomData((prevData) =>
        prevData.map((item) =>
          item.docRoomId === room.docRoomId
            ? { ...item, isActive: updatedStatus }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating room status:", error);
      alert("Failed to update room status.");
    }
  };

  // Open the form for editing a room
  const handleEdit = (room) => {
    setRoom({
      roomNumber: room.roomNumber,
      description: room.description,
    });
    setEditingRoomId(room.docRoomId);
    setIsFormOpen(true);
  };

  // Toggle form and table accordions
  const toggleFormAccordion = () => setIsFormOpen(!isFormOpen);
  const toggleTableAccordion = () => setIsTableOpen(!isTableOpen);

  return (
    <div className="room-section-container">
      {/* Form Accordion */}
      <div className="accordion-header" onClick={toggleFormAccordion}>
        <span className="accordion-title">
          {editingRoomId ? "Edit Room Details" : "Add Room Details"}
        </span>
        <span className="accordion-icon">{isFormOpen ? <FaMinus /> : <FaPlus />}</span>
      </div>
      {isFormOpen && (
        <div className="accordion-body">
          <form onSubmit={handleSubmit} className="row">
            <div className="form-group col-md-3">
              <label htmlFor="roomNumber">Room:</label>
              <input
                type="text"
                className="form-control"
                id="roomNumber"
                name="roomNumber"
                value={room.roomNumber}
                onChange={handleInputChange}
                placeholder="Enter Room"
              />
            </div>
            <div className="form-group col-md-3">
              <label htmlFor="description">Room Description:</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={room.description}
                onChange={handleInputChange}
                placeholder="Enter room description"
              ></textarea>
            </div>
            <div className="col-md-12 text-center mt-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : editingRoomId
                  ? "Update Room"
                  : "Save"}
              </button>
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Accordion */}
      <div className="accordion-header mt-5" onClick={toggleTableAccordion}>
        <span className="accordion-title">View Rooms</span>
        <span className="accordion-icon">{isTableOpen ? <FaMinus /> : <FaPlus />}</span>
      </div>
      {isTableOpen && (
        <div className="accordion-body">
          <table className="table">
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Description</th>
                <th>Rack Count</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roomData && roomData.length > 0 ? (
                roomData.map((room) => (
                  <tr key={room.docRoomId}>
                    <td>{room.roomNumber}</td>
                    <td>{room.description}</td>
                    <td>{room.rackCount || "N/A"}</td>
                    <td>{room.isActive ? "Yes" : "No"}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${
                          room.isActive ? "btn-danger" : "btn-success"
                        }`}
                        onClick={() => handleStatusToggle(room)}
                      >
                        {room.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="btn btn-sm btn-warning ms-2"
                        onClick={() => handleEdit(room)}
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

export default ManageRoom;
