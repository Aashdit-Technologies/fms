import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa6";
import "./ManageFile.css";
import useApiListStore from "./ApiListStore";
import api from "../../Api/Api";
import { encryptPayload } from "../../utils/encrypt";
import useAuthStore from "../../store/Store";
import NewRequest from "../NewRequest/NewRequest";
import RequestStatus from "../RequestStatus/RequestStatus";
import { toast } from "react-toastify";
import { Autocomplete, TextField, Button, MenuItem } from "@mui/material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
// import Accordion from "react-bootstrap/Accordion";
import CompleteList from "../CompleteList/CompleteList";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

const ManageFile = () => {
  const [selectedRack, setSelectedRack] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedCustodian, setSelectedCustodian] = useState("");
  const [selectedFileModule, setSelectedFileModule] = useState("");
  const [selectedFileRTL, setSelectedFileRTL] = useState("");
  const [selectedOffice, setSelectedOffice] = useState("1");
  const [selectedDepartment, setSelectedDepartment] = useState("1"); // Set your default department ID
  const [isRoomSelected, setIsRoomSelected] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formKeyword, setFormKeyword] = useState("");
  const [formFileName, setFormFileName] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [modalMessage, setModalMessage] = useState("");
  // console.log("formFileName:", formFileName);

  const [formSubject, setFormSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activeTab, setActiveTab] = useState("tab1");

  // const [activeKey, setActiveKey] = useState("1");

  const [expanded, setExpanded] = useState(false);
  const [expandedTab, setExpandedTab] = useState(true);

  const [roomData, setRoomData] = useState([]);
  const [rackData, setRackData] = useState([]);
  const [shouldRefreshNewRequest, setShouldRefreshNewRequest] = useState(false);
  const [currentRackCells, setCurrentRackCells] = useState(0);
  console.log("currentRackCells-->", currentRackCells);
  const naviget = useNavigate();
  const switchToCompleteTab = () => {
    setActiveTab("tab3");
  };

  const {
    activities,
    custodians,
    departments,
    fileModules,
    fileRelatedToList,
    office,
    fetchAllData,
  } = useApiListStore();

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (office.length > 0 && departments.length > 0) {
      setSelectedOffice(office[0].officeOrgId);
      setSelectedDepartment(departments[0].departmentId);
    }
  }, [office, departments]);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const token = useAuthStore.getState().token;

        const response = await api.get("/manage-room", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoomData(response.data.data);
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };
    fetchRoomData();
  }, []);

  useEffect(() => {
    const fetchRackData = async () => {
      if (!selectedRoom) {
        setRackData([]);
        return;
      }

      const payload = { docRoomId: selectedRoom };

      try {
        const token = useAuthStore.getState().token;
        const encryptedMessage = encryptPayload(payload);
        const response = await api.get("/manage-file-rack", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            dataObject: encryptedMessage,
          },
        });
        console.log("Fetched Rack Data:", response.data.data);
        setRackData(response.data.data);
      } catch (error) {
        console.error("Error fetching rack data:", error);
        setRackData([]);
      }
    };

    fetchRackData();
  }, [selectedRoom]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    // Validate form fields
    if (!selectedOffice) return toast.error("Please select an office.");
    if (!selectedDepartment) return toast.error("Please select a department.");
    if (!selectedFileRTL)
      return toast.error("Please select a file related to.");
    if (!formTitle.trim()) return toast.error("Please enter a title.");
    if (!formSubject.trim()) return toast.error("Please enter a subject.");
    if (!formFileName.trim()) return toast.error("Please enter a file name.");
    if (!selectedCustodian) return toast.error("Please select a custodian.");
    if (!selectedFileModule) return toast.error("Please select a file module.");
    if (selectedRoom && !selectedRack)
      return toast.error("Please select rack.");
    if (selectedRoom && !selectedCell)
      return toast.error("Please select cell.");
    if (!selectedFileModule) return toast.error("Please select a file module.");

    const payload = {
      rackId: selectedRack,
      roomId: selectedRoom,
      noOfCell: selectedCell,
      departmentId: selectedDepartment,
      activityType: selectedActivity,
      custodian: selectedCustodian,
      fileModuleId: selectedFileModule,
      fileRelatedToId: selectedFileRTL,
      officeUniverId: selectedOffice,
      title: formTitle,
      keyword: formKeyword,
      fileName: formFileName,
      subject: formSubject,
    };

    try {
      const token = useAuthStore.getState().token;
      const encryptedMessage = encryptPayload(payload);

      const response = await api.post(
        "/file/create-file",
        { dataObject: encryptedMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.outcome === true) {
        setModalMessage(response.data.message);
        toast.success(response.data.message);
        resetForm();
        setShouldRefreshNewRequest((prev) => !prev);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to create file");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedOffice(null);
    setSelectedDepartment(null);
    setSelectedFileRTL(null);
    setFormTitle("");
    setFormSubject("");
    setFormFileName("");
    setFormKeyword("");
    setSelectedCustodian(null);
    setSelectedFileModule(null);
    setSelectedRack(null);
    setSelectedRoom(null);
    setSelectedCell(null);
    setSelectedActivity(null);
  };
  // const handleSelectChange = (setter, event) => {
  //   setter(event.target.value); // Update the state with the selected value
  // };
  const handleRackChange = (event, newValue) => {
    setSelectedRack(newValue ? newValue.rackId : "");
    setSelectedCell(null);

    if (newValue) {
      setCurrentRackCells(newValue.noOfCell);
    } else {
      setCurrentRackCells(0);
    }
  };

  const handleRoomChange = (event, newValue) => {
    setSelectedRoom(newValue ? newValue.docRoomId : "");
    setIsRoomSelected(!!newValue);
    setSelectedRack(null);
    setSelectedCell(null);
    setCurrentRackCells(0);
  };
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleExpandClickTab = () => {
    setExpandedTab(!expandedTab);
  };
  const handleSelectChange = (event) => {
    const selectedActivity = event.target.value;
    setSelectedActivity(selectedActivity);

    if (!activities || activities.length === 0) {
      console.error("Activities data is still loading or empty.");
      return;
    }

    const selectedActivityObj = Array.isArray(activities)
      ? activities.find(
          (activity) => activity.activityId === Number(selectedActivity)
        )
      : null; // If activities is not an array, return null or handle as needed

    console.log("Selected Activity Object:", selectedActivityObj);

    if (formTitle && formSubject && selectedActivityObj) {
      setFormFileName(
        `${formTitle}/${formSubject}/${selectedActivityObj.activityName}`
      );
    } else {
      setFormFileName("");
    }
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormTitle(newTitle);
    
    // Call handleSelectChange with the current activity value
    if (selectedActivity) {
      handleSelectChange({ target: { value: selectedActivity } });
    }
  };

  const handleSubjectChange = (e) => {
    const newSubject = e.target.value;
    setFormSubject(newSubject);
    
    // Call handleSelectChange with the current activity value
    if (selectedActivity) {
      handleSelectChange({ target: { value: selectedActivity } });
    }
  };

  return (
    <div>
      <Box>
        <Accordion expanded={expanded} sx={{ boxShadow: 3 }}>
          <AccordionSummary
            expandIcon={
              <IconButton
                onClick={handleExpandClick}
                sx={{
                  backgroundColor: "#1a5f6a",
                  color: "#fff",
                  width: 30,
                  height: 30,
                  "&:hover": {
                    backgroundColor: "#207785",
                  },
                }}
              >
                {expanded ? <RemoveIcon /> : <AddIcon />}
              </IconButton>
            }
            aria-controls="panel1a-content"
            id="panel1a-header"
            sx={{
              backgroundColor: "#e9ecef",
              borderBottom: "1px solid #1a5f6a",
            }}
          >
            <Typography variant="h6">Create File</Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              backgroundColor: "#fafafa",
              p: 3,
              borderRadius: "0 0 10px 10px",
            }}
          >
            <Box>
              <form className="row" onSubmit={handleSubmit}>
                {/* Office */}
                <div className="form-group col-md-3">
                  <Autocomplete
                    id="officeSelect"
                    options={office}
                    size="small"
                    getOptionLabel={(option) => option.officeOrgName}
                    value={
                      office.find((o) => o.officeOrgId === selectedOffice) ||
                      null
                    }
                    onChange={(event, newValue) =>
                      setSelectedOffice(newValue ? newValue.officeOrgId : "")
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Select Office{" "}
                            <span style={{ color: "red" }}>*</span>
                          </span>
                        }
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </div>

                {/* Department */}
                <div className="form-group col-md-3">
                  {/* <label htmlFor="departmentSelect">Select Department</label> */}
                  <Autocomplete
                    id="departmentSelect"
                    options={departments}
                    size="small"
                    getOptionLabel={(option) => option.departmentName}
                    value={
                      departments.find(
                        (d) => d.departmentId === selectedDepartment
                      ) || null
                    }
                    onChange={(event, newValue) =>
                      setSelectedDepartment(
                        newValue ? newValue.departmentId : ""
                      )
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Select Department{" "}
                            <span style={{ color: "red" }}>*</span>
                          </span>
                        }
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </div>

                {/* File Related To */}
                <div className="form-group col-md-3">
                  {/* <label htmlFor="fileRTLSelect">File Related To</label> */}
                  <Autocomplete
                    id="fileRTLSelect"
                    size="small"
                    options={fileRelatedToList}
                    getOptionLabel={(option) => option.fileRelatedName}
                    value={
                      fileRelatedToList.find(
                        (f) => f.fileRelatedId === selectedFileRTL
                      ) || null
                    }
                    onChange={(event, newValue) =>
                      setSelectedFileRTL(newValue ? newValue.fileRelatedId : "")
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Select File Related To{" "}
                            <span style={{ color: "red" }}>*</span>
                          </span>
                        }
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </div>

                {/* Title */}
                <div className="form-group col-md-3">
                  <TextField
                    id="titleInput"
                    size="small"
                    label={
                      <span>
                        Title <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    variant="outlined"
                    fullWidth
                    value={formTitle}
                    onChange={handleTitleChange}
                  />
                </div>

                {/* Subject */}
                <div className="form-group col-md-3 mt-3">
                  {/* <label htmlFor="subjectInput">Subject</label> */}
                  <TextField
                    id="subjectInput"
                    size="small"
                    label={
                      <span>
                        Subject <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    variant="outlined"
                    fullWidth
                    value={formSubject}
                    onChange={handleSubjectChange}
                  />
                </div>

                {/* Activity */}
                <div className="form-group col-md-3 mt-3">
                  <TextField
                    id="activitySelect"
                    size="small"
                    select
                    label={
                      <span>
                        Select Activity <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    value={selectedActivity || ""}
                    onChange={handleSelectChange}
                    variant="outlined"
                    fullWidth
                  >
                    <MenuItem value="" disabled>
                      Select Activity
                    </MenuItem>
                    {activities.map((activity) => (
                      <MenuItem
                        key={activity.activityId}
                        value={activity.activityId}
                      >
                        {activity.activityName}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>

                {/* Keyword */}
                <div className="form-group col-md-3 mt-3">
                  {/* <label htmlFor="keywordInput">Keyword</label> */}
                  <TextField
                    id="keywordInput"
                    size="small"
                    variant="outlined"
                    label="Keyword"
                    fullWidth
                    value={formKeyword}
                    onChange={(e) => setFormKeyword(e.target.value)}
                  />
                </div>

                {/* File Name */}
                <div className="form-group col-md-3 mt-3">
                  {/* <label htmlFor="fileNameInput">File Name</label> */}

                  <TextField
                    id="fileNameInput"
                    variant="outlined"
                    size="small"
                    label={
                      <span>
                        File Name <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    fullWidth
                    aria-readonly
                    value={formFileName}
                    // onChange={(e) => setFormFileName(e.target.value)}
                  />
                </div>

                {/* Custodian */}
                <div className="form-group col-md-3 mt-3">
                  <Autocomplete
                    id="custodianSelect"
                    size="small"
                    options={custodians}
                    getOptionLabel={(option) => option.empNameWithDesgAndDept} // Display empNameWithDesgAndDept in the options
                    value={
                      custodians.find(
                        (c) => c.empDeptRoleId === selectedCustodian
                      ) || null
                    }
                    onChange={(event, newValue) =>
                      setSelectedCustodian(
                        newValue ? newValue.empDeptRoleId : "" // Set empDeptRoleId as the value
                      )
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Select Custodian{" "}
                            <span style={{ color: "red" }}>*</span>
                          </span>
                        }
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </div>

                {/* Room */}
                <div className="form-group col-md-3 mt-3 mt-3">
                  {/* <label htmlFor="roomSelect">Select Room</label> */}
                  <Autocomplete
                    id="roomSelect"
                    size="small"
                    options={roomData}
                    getOptionLabel={(option) => option.roomNumber}
                    value={
                      roomData.find((r) => r.docRoomId === selectedRoom) || null
                    }
                    onChange={handleRoomChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Select Room
                            {selectedRoom && (
                              <span style={{ color: "red" }}>*</span>
                            )}
                          </span>
                        }
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </div>

                {/* Rack */}
                <div className="form-group col-md-3 mt-3">
                  {/* <label htmlFor="rackSelect">Select Rack</label> */}
                  <Autocomplete
                    id="rackSelect"
                    size="small"
                    options={rackData}
                    getOptionLabel={(option) => option.rackNumber}
                    value={
                      rackData.find((r) => r.rackId === selectedRack) || null
                    }
                    onChange={handleRackChange}
                    disabled={!selectedRoom}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Select Rack{" "}
                            {isRoomSelected && (
                              <span style={{ color: "red" }}>*</span>
                            )}
                          </span>
                        }
                        variant="outlined"
                        fullWidth
                        error={isRoomSelected && !selectedRack}
                        helperText={
                          isRoomSelected && !selectedRack
                            ? "Rack is required when room is selected"
                            : ""
                        }
                      />
                    )}
                  />
                </div>

                <div className="form-group col-md-3 mt-3">
                  {/* <label htmlFor="cellSelect">Select Cell No</label> */}
                  <Autocomplete
                    id="cellSelect"
                    size="small"
                    options={[...Array(currentRackCells)].map(
                      (_, index) => index + 1
                    )}
                    getOptionLabel={(option) => option.toString()}
                    value={selectedCell}
                    onChange={(event, newValue) => setSelectedCell(newValue)}
                    disabled={!selectedRack}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Select Cell{" "}
                            {isRoomSelected && (
                              <span style={{ color: "red" }}>*</span>
                            )}
                          </span>
                        }
                        variant="outlined"
                        fullWidth
                        error={isRoomSelected && !selectedCell}
                        helperText={
                          isRoomSelected && !selectedCell
                            ? "Cell is required when room is selected"
                            : ""
                        }
                      />
                    )}
                  />
                </div>

                <div className="form-group col-md-3 mt-3">
                  <Autocomplete
                    id="fileModuleSelect"
                    size="small"
                    options={fileModules}
                    getOptionLabel={(option) => option.moduleName}
                    value={
                      fileModules.find(
                        (f) => f.moduleId === selectedFileModule
                      ) || null
                    }
                    onChange={(event, newValue) =>
                      setSelectedFileModule(newValue ? newValue.moduleId : "")
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Select File Module
                            <span style={{ color: "red" }}>*</span>
                          </span>
                        }
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </div>

                <div className="col-md-12 text-center d-flex justify-content-center gap-1">
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3 }}
                    // disabled={isSubmitting}
                  >
                    Submit
                  </Button>
                  <Button
                    // type="button"ddddd
                    variant="contained"
                    color="error"
                    sx={{ mt: 3 }}
                    // disabled={isSubmitting}
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>

      <Box>
        <Accordion
          expanded={expandedTab}
          sx={{ boxShadow: 3, marginTop: 3 }}
          className="mt-3"
        >
          <AccordionSummary
            expandIcon={
              <IconButton
                onClick={handleExpandClickTab}
                sx={{
                  backgroundColor: "#1a5f6a",
                  color: "#fff",
                  width: 30,
                  height: 30,
                  "&:hover": {
                    backgroundColor: "#207785",
                  },
                }}
              >
                {expandedTab ? <RemoveIcon /> : <AddIcon />}
              </IconButton>
            }
            aria-controls="panel1a-content"
            id="panel1a-header"
            sx={{
              backgroundColor: "#e9ecef",
              borderBottom: "1px solid #1a5f6a",
            }}
          >
            <Typography variant="h6">File List</Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              backgroundColor: "#fafafa",
              p: 3,
              borderRadius: "0 0 10px 10px",
            }}
          >
            <Box>
              <ul className="nav nav-tabs" role="tablist">
                <li className="nav-item">
                  <button
                    className={`nav-link ${
                      activeTab === "tab1" ? "active" : ""
                    }`}
                    onClick={() => handleTabChange("tab1")}
                  >
                    New Request
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${
                      activeTab === "tab2" ? "active" : ""
                    }`}
                    onClick={() => handleTabChange("tab2")}
                  >
                    View Status
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${
                      activeTab === "tab3" ? "active" : ""
                    }`}
                    onClick={() => handleTabChange("tab3")}
                  >
                    Complete List
                  </button>
                </li>
              </ul>

              <div className="tab-content mt-3">
                {activeTab === "tab1" && (
                  <div className="tab-pane fade show active">
                    <NewRequest
                      handelRefecthNew={shouldRefreshNewRequest}
                      onSwitchTab={switchToCompleteTab}
                    />
                  </div>
                )}

                {activeTab === "tab2" && (
                  <div className="tab-pane fade show active">
                    <RequestStatus />
                  </div>
                )}

                {activeTab === "tab3" && (
                  <div className="tab-pane fade show active">
                    <CompleteList />
                  </div>
                )}
              </div>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </div>
  );
};

export default ManageFile;
