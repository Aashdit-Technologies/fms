import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Accordion, Modal, Button } from "react-bootstrap";
import { FaPlus, FaMinus, FaEdit, FaTrash, FaCalendarPlus } from "react-icons/fa";
import DataTable from "react-data-table-component";
import "./ScheduledMeetingDetails.css";

const ScheduledMeetingDetails = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleScheduleMeeting = () => {
    handleClose();
    navigate("/scheduling");
  };

  // Sample data - replace with your actual data
  const data = [];

  const columns = [
    {
      name: "Sl.no",
      selector: row => row.slNo,
      sortable: true,
      width: "80px",
    },
    {
      name: "Meeting Subject",
      selector: row => row.subject,
      sortable: true,
      wrap: true,
    },
    {
      name: "Date",
      selector: row => row.date,
      sortable: true,
      width: "120px",
    },
    {
      name: "Date & Time",
      selector: row => row.dateTime,
      sortable: true,
      width: "150px",
    },
    {
      name: "Venue Location",
      selector: row => row.venue,
      sortable: true,
      wrap: true,
    },
    {
      name: "Agenda",
      selector: row => row.agenda,
      sortable: true,
      wrap: true,
    },
    {
      name: "Status",
      selector: row => row.status,
      sortable: true,
      width: "120px",
      cell: row => (
        <span className={`badge bg-${row.status === 'Active' ? 'success' : 'danger'}`}>
          {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      width: "100px",
      cell: row => (
        <div className="d-flex gap-2">
          <button 
            className="btn btn-sm btn-link text-primary p-0" 
            onClick={() => handleEdit(row)}
          >
            <FaEdit />
          </button>
          <button 
            className="btn btn-sm btn-link text-danger p-0" 
            onClick={() => handleDelete(row)}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e9ecef',
      },
    },
    headCells: {
      style: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#495057',
        paddingLeft: '1rem',
        paddingRight: '1rem',
      },
    },
    cells: {
      style: {
        paddingLeft: '1rem',
        paddingRight: '1rem',
      },
    },
  };

  const noDataComponent = (
    <div className="text-center py-4">
      <p className="text-muted mb-0">No Record Found</p>
    </div>
  );

  return (
    <div className="py-4">
      <Accordion activeKey={isOpen ? "0" : null} className="custom-accordion">
        <Accordion.Item eventKey="0">
          <Accordion.Header 
            onClick={() => setIsOpen(!isOpen)}
            className="d-flex align-items-center"
          >
            <div className="d-flex align-items-center w-100 justify-content-between">
              <h5 className="mb-0">Scheduled Meeting Details</h5>
              <div className="d-flex align-items-center gap-3">
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShow();
                  }}
                  className="d-flex align-items-center gap-2 schedule-btn"
                >
                  <FaCalendarPlus />
                  <span>Schedule Meeting</span>
                </Button>
                <span className="toggle-icon">
                  {isOpen ? <FaMinus /> : <FaPlus />}
                </span>
              </div>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <div className="mb-3">
              <DataTable
                columns={columns}
                data={data}
                customStyles={customStyles}
                pagination
                paginationPerPage={5}
                paginationRowsPerPageOptions={[5, 10, 15, 20]}
                noDataComponent={noDataComponent}
                responsive
                striped
                highlightOnHover
              />
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Schedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">Do you want to schedule a meeting?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            No
          </Button>
          <Button variant="primary" onClick={handleScheduleMeeting}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ScheduledMeetingDetails;