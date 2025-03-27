import React, { useState } from "react";
import { Accordion, Overlay } from "react-bootstrap";
import { FaPlus, FaMinus } from "react-icons/fa";
import "./FileDetails.css";
import { Modal, Box, Typography, Button, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { toast } from "react-toastify";

const DetailItem = ({ label, value }) => (
  <Box sx={{ mb: 1.5, borderBottom: "1px solid #ccc", pb: 1 }}>
    <Typography
      variant="caption"
      color="textSecondary"
      sx={{ fontWeight: 600 }}
    >
      {label}
    </Typography>
    <Typography variant="body1" fontWeight="500" sx={{ color: "text.primary" }}>
      {value || "N/A"}
    </Typography>
  </Box>
);

const FileDetails = ({ fileDetails }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const allDetails = fileDetails?.data || {};
  const navigate = useNavigate();

  const handleShowDetails = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    navigate("/file");
    // toast.warning("Task cancelled!");
  };

 

  return (
    <>
      <div className="">
        <Accordion defaultActiveKey="0" className="custom-accordion">
          <Accordion.Item eventKey="0">
            <Accordion.Header
              onClick={() => setIsOpen(!isOpen)}
              className="d-flex align-items-center"
            >
              <div className="d-flex align-items-center w-100 justify-content-between">
                <h5 className="mb-0">File Details</h5>
                <span className="toggle-icon me-2 d-flex gap-5 align-items-center">
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={<IoMdArrowBack />}
                    onClick={handleCancel}
                  >
                    Back
                  </Button>
                  {isOpen ? <FaMinus /> : <FaPlus />}
                </span>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              {fileDetails ? (
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card h-100 border-0 bg-light">
                      <div className="card-body">
                        <div className="mb-3">
                          <label
                            className="  "
                            style={{
                              fontWeight: "700",
                              color: "#207785",
                              fontSize: "14px",
                              textTransform: "capitalize",
                            }}
                          >
                            File Number :
                          </label>
                          <p
                            className="mb-0 fw-medium clickable-text"
                            style={{
                              fontWeight: "500",
                              fontSize: "15px",
                              textTransform: "capitalize",
                            }}
                            onClick={handleShowDetails}
                          >
                            {allDetails.fileNo || "N/A"}
                          </p>
                        </div>
                        <div className="mb-3">
                          <label className="" style={{fontWeight:"700", color:"#207785", fontSize:"15px", textTransform:"capitalize"}}>
                            File Name :
                          </label>
                          <p className="mb-0 fw-medium" style={{fontWeight:"500", fontSize:"14px", textTransform:"capitalize"}}>
                            {allDetails.fileName || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card h-100 border-0 bg-light">
                      <div className="card-body">
                        <div className="mb-3">
                          <label style={{fontWeight:"700", color:"#207785", fontSize:"15px", textTransform:"capitalize"}}>
                            Subject :
                          </label>
                          <p className="mb-0 fw-medium" style={{fontWeight:"500",  fontSize:"14px", textTransform:"capitalize"}}>
                            {allDetails.subject || "N/A"}
                          </p>
                        </div>
                        <div className="mb-3">
                          <label style={{fontWeight:"700", color:"#207785", fontSize:"15px", textTransform:"capitalize"}}>
                            Title :
                          </label>
                          <p className="mb-0 fw-medium" style={{fontWeight:"500", fontSize:"14px", textTransform:"capitalize"}}>
                            {allDetails.title || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="alert alert-info" role="alert">
                  <i className="bi bi-info-circle me-2"></i>
                  No file details available.
                </div>
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>

      {/* Modal to Show File Details */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={modalStyle}
          style={{
            width: "100%",
            maxWidth: "1200px",
            maxHeight: "90vh",
            overflowY: "auto",
            margin: "auto",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              mb: 2,
              textAlign: "center",
              color: "#1976d2",
              borderBottom: "2px solid #1976d2",
            }}
          >
            File Details: {allDetails.fileNo || "N/A"}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {/* Column 1 */}
            <Grid item xs={12} sm={6}>
              <DetailItem label="File Number" value={allDetails.fileNo}  />
              <DetailItem label="File Type" value={allDetails.fileType} />
              <DetailItem label="File Name" value={allDetails.fileName} />
              <DetailItem label="Subject" value={allDetails.subject} />
              <DetailItem label="Title" value={allDetails.title} />
              <DetailItem label="Activity" value={allDetails.activity} />
            </Grid>

            {/* Column 2 */}
            <Grid item xs={12} sm={6}>
              <DetailItem label="Custodian" value={allDetails.custodian} />
              <DetailItem label="Room Number" value={allDetails.room} />
              <DetailItem label="Rack Number" value={allDetails.rack} />
              <DetailItem label="Cell Number" value={allDetails.cell} />
              <DetailItem label="Created By" value={allDetails.createdBy} />
              <DetailItem label="Created Date" value={allDetails.createdDate} />
            </Grid>
          </Grid>

          <Box sx={{ textAlign: "right", mt: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      <style>{`
      
      
        .MuiTypography-caption{
          font-weight: 600;
          color: #207785;
          font-size: 14px;
          text-transform: capitalize;,
        }
      `}
        </style>
    </>
  );
};

// Modal Styling
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 600,
  bgcolor: "white",
  boxShadow: 24,
  p: 3,
  borderRadius: 2,
  border: "2px solid #1976d2",
  outline: "none",
};

export default FileDetails;
