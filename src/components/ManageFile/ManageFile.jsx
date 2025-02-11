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
import { Autocomplete, TextField, Button } from "@mui/material";

import Accordion from "react-bootstrap/Accordion";
import CompleteList from "../CompleteList/CompleteList";

const ManageFile = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(true);
  const [selectedRack, setSelectedRack] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedCell, setSelectedCell] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedCustodian, setSelectedCustodian] = useState("");
  const [selectedFileModule, setSelectedFileModule] = useState("");
  const [selectedFileRTL, setSelectedFileRTL] = useState("");
  const [selectedOffice, setSelectedOffice] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formKeyword, setFormKeyword] = useState("");
  const [formFileName, setFormFileName] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activeTab, setActiveTab] = useState("tab1"); 

  const [activeKey, setActiveKey] = useState("1");



  const [roomData, setRoomData] = useState([]); 
  const [rackData, setRackData] = useState([]);

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
    if (!formTitle || !selectedRack || !selectedRoom) {
      alert("Please fill out all required fields.");
      setIsSubmitting(false);
      return;
    }

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
      debugger;
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
      
      if(response.data.outcome != true){
          toast.error(response.data.message);
        }
        else{
          toast.success(response.data.message);
          fetchFilteredData();
        }
      
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSelectChange = (setter, event) => {
    setter(event.target.value); // Update the state with the selected value
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  useEffect(() => {
    const selectedActivityObj = activities.find(
      (activity) => String(activity.activityId) === selectedActivity
    );
  
    console.log("Selected Activity Object:", selectedActivityObj);
  
    if (formTitle && formSubject && selectedActivityObj) {
      setFormFileName(`${formTitle}/${formSubject}/${selectedActivityObj.activityName}`);
    } else {
      setFormFileName(""); 
    }
  }, [formTitle, formSubject, selectedActivity, activities]);
  
  return (
    <div className="manageFile-section-container">
      {/* Form Accordion */}
      <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
        <Accordion.Item eventKey="0">
          <Accordion.Header onClick={() => setIsFormOpen((prev) => !prev)}>
            <span className="accordion-title">
              Create File
            </span>
            <span className="accordion-icon">
              {isFormOpen ? <FaMinus /> : <FaPlus />}
            </span>
          </Accordion.Header>
          <Accordion.Body>
          <form className="row" onSubmit={handleSubmit}>

              {/* Office */}
              <div className="form-group col-md-3">
                <Autocomplete
                  id="officeSelect"
                  options={office}
                  getOptionLabel={(option) => option.officeOrgName}
                  value={office.find((o) => o.officeOrgId === selectedOffice) || null}
                  onChange={(event, newValue) => setSelectedOffice(newValue ? newValue.officeOrgId : "")}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Office" variant="outlined" fullWidth />
                  )}
                />
              </div>

            {/* Department */}
            <div className="form-group col-md-3">
              {/* <label htmlFor="departmentSelect">Select Department</label> */}
              <Autocomplete
                id="departmentSelect"
                options={departments}
                getOptionLabel={(option) => option.departmentName}
                value={departments.find((d) => d.departmentId === selectedDepartment) || null}
                onChange={(event, newValue) => setSelectedDepartment(newValue ? newValue.departmentId : "")}
                renderInput={(params) => (
                  <TextField {...params} label="Select Department" variant="outlined" fullWidth />
                )}
              />
            </div>

            {/* File Related To */}
            <div className="form-group col-md-3">
              {/* <label htmlFor="fileRTLSelect">File Related To</label> */}
              <Autocomplete
                id="fileRTLSelect"
                options={fileRelatedToList}
                getOptionLabel={(option) => option.fileRelatedName}
                value={fileRelatedToList.find((f) => f.fileRelatedId === selectedFileRTL) || null}
                onChange={(event, newValue) => setSelectedFileRTL(newValue ? newValue.fileRelatedId : "")}
                renderInput={(params) => (
                  <TextField {...params} label="Select File Related To" variant="outlined" fullWidth />
                )}
              />
            </div>

            {/* Title */}
            <div className="form-group col-md-3">
              <TextField
                id="titleInput"
                label="Title"
                variant="outlined"
                fullWidth
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            {/* Subject */}
            <div className="form-group col-md-3 mt-3">
              {/* <label htmlFor="subjectInput">Subject</label> */}
              <TextField
                id="subjectInput"
                label="Subject"
                variant="outlined"
                fullWidth
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
              />
            </div>

            {/* Activity */}
            <div className="form-group col-md-3">
              <label htmlFor="activitySelect">Select Activity</label>
              <select
                id="activitySelect"
                className="form-control form-select"
                value={selectedActivity}
                onChange={(e) => handleSelectChange(setSelectedActivity, e)}
              >
                <option value="" disabled>
                  Select Activity
                </option>
                {activities.map((activity) => (
                  <option key={activity.activityId} value={activity.activityId}>
                    {activity.activityName}
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword */}
            <div className="form-group col-md-3 mt-3">
              {/* <label htmlFor="keywordInput">Keyword</label> */}
              <TextField
                id="keywordInput"
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
                label="File Name"
                fullWidth
                value={formFileName}
                onChange={(e) => setFormFileName(e.target.value)}
              />
            </div>

            {/* Custodian */}
            <div className="form-group col-md-3 mt-3">
                {/* <label htmlFor="custodianSelect">Select Custodian</label> */}
                <Autocomplete
                  id="custodianSelect"
                  options={custodians}
                  getOptionLabel={(option) => `${option.employee.firstName} ${option.employee.middleName || ""} ${option.employee.lastName} (${option.office.officeName} / ${option.department.departmentName})`}
                  value={custodians.find((c) => c.employeeDeptMapId === selectedCustodian) || null}
                  onChange={(event, newValue) => setSelectedCustodian(newValue ? newValue.employeeDeptMapId : "")}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Custodian" variant="outlined" fullWidth />
                  )}
                />
              </div>

            {/* Room */}
            <div className="form-group col-md-3 mt-3 mt-3">
              {/* <label htmlFor="roomSelect">Select Room</label> */}
              <Autocomplete
                id="roomSelect"
                options={roomData}
                getOptionLabel={(option) => option.roomNumber}
                value={roomData.find((r) => r.docRoomId === selectedRoom) || null}
                onChange={(event, newValue) => setSelectedRoom(newValue ? newValue.docRoomId : "")}
                renderInput={(params) => (
                  <TextField {...params} label="Select Room" variant="outlined" fullWidth />
                )}
              />
            </div>

            {/* Rack */}
            <div className="form-group col-md-3 mt-3">
                {/* <label htmlFor="rackSelect">Select Rack</label> */}
                <Autocomplete
                  id="rackSelect"
                  options={rackData}
                  getOptionLabel={(option) => option.rackNumber}
                  value={rackData.find((r) => r.rackId === selectedRack) || null}
                  onChange={(event, newValue) => setSelectedRack(newValue ? newValue.rackId : "")}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Rack" variant="outlined" fullWidth />
                  )}
                />
              </div>

              <div className="form-group col-md-3 mt-3">
                {/* <label htmlFor="cellSelect">Select Cell No</label> */}
                <Autocomplete
                  id="cellSelect"
                  options={[1, 2, 3, 4, 5]}
                  getOptionLabel={(option) => option.toString()}
                  value={selectedCell || null}
                  onChange={(event, newValue) => setSelectedCell(newValue || "")}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Cell" variant="outlined" fullWidth />
                  )}
                />
              </div>

              <div className="form-group col-md-3 mt-3">
                {/* <label htmlFor="fileModuleSelect">Select File Module</label> */}
                <Autocomplete
                  id="fileModuleSelect"
                  options={fileModules}
                  getOptionLabel={(option) => option.moduleName}
                  value={fileModules.find((f) => f.moduleId === selectedFileModule) || null}
                  onChange={(event, newValue) => setSelectedFileModule(newValue ? newValue.moduleId : "")}
                  renderInput={(params) => (
                    <TextField {...params} label="Select File Module" variant="outlined" fullWidth />
                  )}
                />
              </div>

            <div className="col-md-12 text-center">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                disabled={isSubmitting}
                // disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Submit"}
              </Button>
              {/* {submitError && <p className="text-danger mt-2">{submitError}</p>} */}
            </div>
          </form>
          </Accordion.Body>
        </Accordion.Item>

      {/* Table Accordion */}
      <Accordion.Item eventKey="1" className="mt-3">
          <Accordion.Header onClick={() => setIsTableOpen((prev) => !prev)}>
            <span className="accordion-title">View File</span>
            <span className="accordion-icon">
              {isTableOpen ? <FaMinus /> : <FaPlus />}
            </span>
          </Accordion.Header>
          <Accordion.Body>
          {/* Bootstrap Tabs */}
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "tab1" ? "active" : ""}`}
                onClick={() => handleTabChange("tab1")}
              >
                New Request
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "tab2" ? "active" : ""}`}
                onClick={() => handleTabChange("tab2")}
              >
                View Status
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "tab3" ? "active" : ""}`}
                onClick={() => handleTabChange("tab3")}
              >
                Complete List
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content mt-3">
            {activeTab === "tab1" && (
              <div className="tab-pane fade show active">
                <NewRequest/>
              </div>
            )}

            {activeTab === "tab2" && (
              <div className="tab-pane fade show active">
                <RequestStatus/>
              </div>
            )}

            {activeTab === "tab3" && (
              <div className="tab-pane fade show active">
                <CompleteList/>
              </div>
            )}
          </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default ManageFile;
