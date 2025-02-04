import React, { useState } from "react";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUserPlus, FaUsers,FaMinus } from "react-icons/fa";
import "./Scheduling.css";

const Scheduling = () => {
  const navigate = useNavigate();
  const [showInternalModal, setShowInternalModal] = useState(false);
  const [showOtherParticipantModal, setShowOtherParticipantModal] =
    useState(false);
  const [selectedOffice, setSelectedOffice] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [otherParticipant, setOtherParticipant] = useState({
    name: "",
    designation: "",
    organization: "",
    emailId: "",
  });

  const [formData, setFormData] = useState({
    chairperson: "internal",
    meetingType: "",
    meetingSubject: "",
    agenda: "",
    agendaAttachment: null,
    venueLocation: "",
    status: "",
    participants: [],
  });

  // Sample office data
  const offices = [
    "Head Office || HO",
    "Water Supply - I || WSEC-1",
    "BBSR Electrical || ELECT",
    "Cuttack Civil || CTC-C",
    "Balasore || BLS",
    "Angul || ANGUL",
  ];

  // Sample department data
  const departments = ["Architect", "Civil", "Electrical", "Admin"];

  // Sample participants data
  const [availableParticipants, setAvailableParticipants] = useState([
    {
      designation: "Division Head",
      officialName: "Sarita Mallik",
      emailId: "undefined",
    },
    {
      designation: "Dy. Manager (Fin)",
      officialName: "RAMANUJA PANDA",
      emailId: "undefined",
    },
    {
      designation: "Dy. Manager (Civil)",
      officialName: "SURYAKANTA TARAI",
      emailId: "undefined",
    },
    {
      designation: "OSD",
      officialName: "ARUN Kumar MOHAPATRA",
      emailId: "undefined",
    },
    {
      designation: "Assistant Engineer",
      officialName: "GHANASHYAMA BEHERA",
      emailId: "undefined",
    },
    {
      designation: "Asst. Manager (Fin)",
      officialName: "RAMANUJA PANDA",
      emailId: "undefined",
    },
  ]);

  const [searchOffice, setSearchOffice] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [showDepartments, setShowDepartments] = useState(false);
  const [externalParticipantChecked, setExternalParticipantChecked] = useState(false);

  // Filter offices based on search
  const filteredOffices = offices.filter(office => 
    office.toLowerCase().includes(searchOffice.toLowerCase())
  );

  // Filter departments based on search
  const filteredDepartments = departments.filter(dept => 
    dept.toLowerCase().includes(searchDepartment.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  const handleReset = () => {
    setFormData({
      chairperson: "internal",
      meetingType: "",
      meetingSubject: "",
      agenda: "",
      agendaAttachment: null,
      venueLocation: "",
      status: "",
      participants: [],
    });
  };

  const handleParticipantSelect = (participant) => {
    setFormData((prev) => {
      const isParticipantSelected = prev.participants.some(
        (p) => p.emailId === participant.emailId && p.designation === participant.designation
      );

      if (isParticipantSelected) {
        // Remove participant when unchecked
        return {
          ...prev,
          participants: prev.participants.filter(
            (p) => !(p.emailId === participant.emailId && p.designation === participant.designation)
          ),
        };
      } else {
        // Add participant when checked
        return {
          ...prev,
          participants: [...prev.participants, participant],
        };
      }
    });
  };

  const handleOfficeSelect = (office) => {
    setSelectedOffice(office);
    setShowDepartments(true);
    setSearchOffice("");
    // Update available participants based on selected office
    const officeParticipants = [
      {
        designation: "Division Head",
        officialName: "Sarita Mallik",
        emailId: "",
      },
      {
        designation: "Dy. Manager (Fin)",
        officialName: "RAMANUJA PANDA",
        emailId: "",
      },
      {
        designation: "Dy. Manager (Civil)",
        officialName: "SURYAKANTA TARAI",
        emailId: "",
      },
      {
        designation: "OSD",
        officialName: "ARUN Kumar MOHAPATRA",
        emailId: "",
      },
      {
        designation: "Assistant Engineer",
        officialName: "GHANASHYAMA BEHERA",
        emailId: "",
      },
      {
        designation: "Asst. Manager (Fin)",
        officialName: "RAMANUJA PANDA",
        emailId: "",
      },
    ];
    setAvailableParticipants(officeParticipants);
  };

  const handleDepartmentSelect = (dept) => {
    setSelectedDepartment(dept);
    setSearchDepartment("");
    setShowDepartments(false);
  };

  const handleAddOtherParticipant = () => {
    if (otherParticipant.name && otherParticipant.emailId) {
      setFormData((prev) => ({
        ...prev,
        participants: [...prev.participants, otherParticipant],
      }));
      setOtherParticipant({
        name: "",
        designation: "",
        organization: "",
        emailId: "",
      });
      setShowOtherParticipantModal(false);
    }
  };

  const handleRemoveParticipant = (participant) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.filter(
        (p) => !(p.emailId === participant.emailId && p.designation === participant.designation)
      ),
    }));
  };

  const handleInternalModalClose = () => {
    setShowInternalModal(false);
    setSelectedOffice("");
    setAvailableParticipants([]);
  };

  const handleOtherParticipantClose = () => {
    setShowOtherParticipantModal(false);
    setExternalParticipantChecked(false);
    setOtherParticipant({
      name: "",
      designation: "",
      organization: "",
      emailId: "",
    });
  };

  const handleAddExternalParticipant = () => {
    if (externalParticipantChecked && otherParticipant.name && otherParticipant.emailId) {
      setFormData((prev) => ({
        ...prev,
        participants: [...prev.participants, otherParticipant],
      }));
      // Reset the form
      setOtherParticipant({
        name: "",
        designation: "",
        organization: "",
        emailId: "",
      });
      setExternalParticipantChecked(false);
    }
  };

  const isExternalParticipantValid = () => {
    return (
      otherParticipant.name &&
      otherParticipant.designation &&
      otherParticipant.organization &&
      otherParticipant.emailId
    );
  };

  return (
    <div className="py-4">
      <Card>
        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Button
              variant="link"
              className="p-0 me-3 text-secondary"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft />
            </Button>
            <h5 className="mb-0">Schedule Meeting</h5>
          </div>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <div className="text-danger mb-3">
              Fields marked with (*) are mandatory.
            </div>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Chairperson <span className="text-danger">*</span>
                  </Form.Label>
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      label="Internal"
                      name="chairperson"
                      value="internal"
                      checked={formData.chairperson === "internal"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chairperson: e.target.value,
                        })
                      }
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="External"
                      name="chairperson"
                      value="external"
                      checked={formData.chairperson === "external"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chairperson: e.target.value,
                        })
                      }
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Meeting Type <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={formData.meetingType}
                    onChange={(e) =>
                      setFormData({ ...formData, meetingType: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Choose --</option>
                    <option value="1">Type 1</option>
                    <option value="2">Type 2</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>
                    Meeting Subject <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.meetingSubject}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        meetingSubject: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>
                    Agenda <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.agenda}
                    onChange={(e) =>
                      setFormData({ ...formData, agenda: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Agenda Attachment</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        agendaAttachment: e.target.files[0],
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Venue Location Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={formData.venueLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        venueLocation: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">-- Select --</option>
                    <option value="1">Location 1</option>
                    <option value="2">Location 2</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Status <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Select --</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <div className="border rounded p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Participants:</h6>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Official Name</th>
                          <th>Designation</th>
                          <th>Email ID</th>
                          <th style={{ width: "100px" }}>
                            <div className="d-flex gap-2">
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip>Add Internal Participant</Tooltip>
                                }
                              >
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => setShowInternalModal(true)}
                                >
                                  <FaUserPlus />
                                </Button>
                              </OverlayTrigger>
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip>Add External Participant</Tooltip>
                                }
                              >
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() =>
                                    setShowOtherParticipantModal(true)
                                  }
                                >
                                  <FaUsers />
                                </Button>
                              </OverlayTrigger>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.participants.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="text-center">
                              No data available in table
                            </td>
                          </tr>
                        ) : (
                          formData.participants.map((participant, index) => (
                            <tr key={index}>
                              <td>
                                {participant.officialName || participant.name}
                              </td>
                              <td>{participant.designation}</td>
                              <td>{participant.emailId}</td>
                              <td>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveParticipant(participant)
                                  }
                                >
                                  <FaMinus />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Col>
              <Col md={12}>
                <div className="d-flex justify-content-center gap-2 mt-3">
                  <Button variant="success" type="submit">
                    Submit
                  </Button>
                  <Button variant="warning" type="button" onClick={handleReset}>
                    Reset
                  </Button>
                  <Button
                    variant="danger"
                    type="button"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* External Participant Modal */}
      <Modal show={showOtherParticipantModal} onHide={handleOtherParticipantClose} size="lg">
        <Modal.Header closeButton className="bg-primary">
          <Modal.Title className="text-white">Select Other Participants</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Organization</th>
                  <th>E-Mail Id</th>
                  <th style={{ width: '80px' }}>Add</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Form.Control
                      type="text"
                      placeholder="Enter Name"
                      value={otherParticipant.name}
                      onChange={(e) =>
                        setOtherParticipant({
                          ...otherParticipant,
                          name: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      placeholder="Enter Designation"
                      value={otherParticipant.designation}
                      onChange={(e) =>
                        setOtherParticipant({
                          ...otherParticipant,
                          designation: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      placeholder="Enter Company Name"
                      value={otherParticipant.organization}
                      onChange={(e) =>
                        setOtherParticipant({
                          ...otherParticipant,
                          organization: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="email"
                      placeholder="Enter E-Mail Id"
                      value={otherParticipant.emailId}
                      onChange={(e) =>
                        setOtherParticipant({
                          ...otherParticipant,
                          emailId: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td className="text-center">
                    <Form.Check
                      type="checkbox"
                      checked={externalParticipantChecked}
                      onChange={(e) => setExternalParticipantChecked(e.target.checked)}
                    />
                  </td>
                </tr>
                {formData.participants
                  .filter(p => p.organization)
                  .map((participant, index) => (
                    <tr key={index}>
                      <td>{participant.name}</td>
                      <td>{participant.designation}</td>
                      <td>{participant.organization}</td>
                      <td>{participant.emailId}</td>
                      <td className="text-center">
                        <Button
                          variant="link"
                          className="p-0 text-danger"
                          onClick={() => handleRemoveParticipant(participant)}
                        >
                          <FaMinus />
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleAddExternalParticipant} disabled={!externalParticipantChecked}>
            Add
          </Button>
          <Button variant="danger" onClick={handleOtherParticipantClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Internal Participant Modal */}
      <Modal show={showInternalModal} onHide={handleInternalModalClose} size="lg">
        <Modal.Header closeButton className="bg-primary">
          <Modal.Title className="text-white">Select Participants</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-4">
            <Form.Label>
              Office Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={selectedOffice}
              onChange={(e) => handleOfficeSelect(e.target.value)}
              className="form-select selectpicker"
              data-live-search="true"
            >
              <option value="">Select Office</option>
              {filteredOffices.map((office, index) => (
                <option key={index} value={office} data-tokens={office}>
                  {office}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Designation</th>
                  <th>Official Name</th>
                  <th>E-Mail Id</th>
                  <th style={{ width: '80px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {availableParticipants.map((participant, index) => {
                  const isSelected = formData.participants.some(
                    (p) => p.emailId === participant.emailId && p.designation === participant.designation
                  );
                  return (
                    <tr key={index} className={isSelected ? 'table-light' : ''}>
                      <td>{participant.designation}</td>
                      <td>{participant.officialName}</td>
                      <td>{participant.emailId || 'undefined'}</td>
                      <td className="text-center">
                        <Form.Check
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleParticipantSelect(participant)}
                          className="participant-checkbox"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleInternalModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Scheduling;
