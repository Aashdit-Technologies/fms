import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa6";
import "./ManageFile.css";
import useApiListStore from "./ApiListStore";
import api from "../../Api/Api";
import { encryptPayload } from "../../utils/encrypt";
import useAuthStore from "../../store/Store";
import NewRequest from "../NewRequest/NewRequest";
import RequestStatus from "../RequestStatus/RequestStatus";

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



  const [roomData, setRoomData] = useState([]); 
  const [rackData, setRackData] = useState([]);

  const {
    activities,
    custodians,
    departments,
    fileModules,
    fileRelatedToList,
    office,
    isLoading,
    error,
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
        setRoomData(response.data.roomList);
        
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
        console.log("Fetched Rack Data:", response.data.rackList);
        setRackData(response.data.rackList);
      } catch (error) {
        console.error("Error fetching rack data:", error);
        setRackData([]); // Clear rack data on error
      }
    };
  
    fetchRackData();
  }, [selectedRoom]); // Add selectedRoom as a dependency
  


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

      console.log("API Response:", response.data);
      alert("File data saved successfully!");

      // Reset form
      setSelectedRack("");
      setSelectedRoom("");
      setSelectedCell("");
      setSelectedDepartment("");
      setSelectedActivity("");
      setSelectedCustodian("");
      setSelectedFileModule("");
      setSelectedFileRTL("");
      setSelectedOffice("");
      setFormTitle("");
      setFormKeyword("");
      setFormFileName("");
      setFormSubject("");
    } catch (error) {
      console.error("Error saving data:", error);
      setSubmitError("Failed to save data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };



  const toggleFormAccordion = () => {
    setIsFormOpen((prev) => !prev);
  };

  const toggleTableAccordion = () => {
    setIsTableOpen((prev) => !prev);
  };

  const handleSelectChange = (setter, event) => {
    setter(event.target.value); // Update the state with the selected value
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };


  

  useEffect(() => {
    debugger;
    console.log("Activities:", activities);
    console.log("Selected Activity:", selectedActivity);
  
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
      <div className="accordion-header" onClick={toggleFormAccordion}>
        <span className="accordion-title">Manage File</span>
        <span className="accordion-icon">
          {isFormOpen ? <FaMinus /> : <FaPlus />}
        </span>
      </div>
      {isFormOpen && (
        <div className="accordion-body">
          <form className="row" onSubmit={handleSubmit}>

              {/* Office */}
            <div className="form-group col-md-3">
              <label htmlFor="officeSelect">Office</label>
              <select
                id="officeSelect"
                className="form-control form-select"
                value={selectedOffice}
                onChange={(e) => handleSelectChange(setSelectedOffice, e)}
              >
                <option value="" disabled>
                  Select Office
                </option>
                {office.map((offices) => (
                  <option key={offices.officeOrgId} value={offices.officeOrgId}>
                    {offices.officeOrgName}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div className="form-group col-md-3">
              <label htmlFor="departmentSelect">Select Department</label>
              <select
                id="departmentSelect"
                className="form-control form-select"
                value={selectedDepartment}
                onChange={(e) => handleSelectChange(setSelectedDepartment, e)}
              >
                <option value="" disabled>
                  Select Department
                </option>
                {departments.map((department) => (
                  <option key={department.departmentId} value={department.departmentId}>
                    {department.departmentName}
                  </option>
                ))}
              </select>
            </div>

            {/* File Related To */}
            <div className="form-group col-md-3">
              <label htmlFor="fileRTLSelect">File Related To</label>
              <select
                id="fileRTLSelect"
                className="form-control form-select"
                value={selectedFileRTL}
                onChange={(e) => handleSelectChange(setSelectedFileRTL, e)}
              >
                <option value="" disabled>
                  Select File Related To
                </option>
                {fileRelatedToList.map((fileRtl) => (
                  <option key={fileRtl.fileRelatedId} value={fileRtl.fileRelatedId}>
                    {fileRtl.fileRelatedName}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="form-group col-md-3">
              <label htmlFor="titleInput">Title</label>
              <input
                id="titleInput"
                type="text"
                className="form-control"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            {/* Subject */}
            <div className="form-group col-md-3">
              <label htmlFor="subjectInput">Subject</label>
              <input
                id="subjectInput"
                type="text"
                className="form-control"
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
            <div className="form-group col-md-3">
              <label htmlFor="keywordInput">Keyword</label>
              <input
                id="keywordInput"
                type="text"
                className="form-control"
                value={formKeyword}
                onChange={(e) => setFormKeyword(e.target.value)}
              />
            </div>

            {/* File Name */}
            <div className="form-group col-md-3">
              <label htmlFor="fileNameInput">File Name</label>
              <input
                id="fileNameInput"
                type="text"
                className="form-control"
                value={formFileName}
                onChange={(e) => setFormFileName(e.target.value)}
              />
            </div>

            {/* Custodian */}
            <div className="form-group col-md-3">
              <label htmlFor="custodianSelect">Select Custodian</label>
              <select
                id="custodianSelect"
                className="form-control form-select"
                value={selectedCustodian}
                onChange={(e) => handleSelectChange(setSelectedCustodian, e)}
              >
                <option value="" disabled>
                  Select Custodian
                </option>
                {custodians.map((custodian) => (
                  <option
                    key={custodian.employeeDeptMapId}
                    value={custodian.employeeDeptMapId}
                  >
                    {`${custodian.employee.firstName} ${custodian.employee.middleName} ${custodian.employee.lastName} (${custodian.office.officeName} / ${custodian.department.departmentName})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Room */}
            <div className="form-group col-md-3">
              <label htmlFor="roomSelect">Select Room</label>
              <select
                id="roomSelect"
                className="form-control form-select"
                value={selectedRoom}
                onChange={(e) => handleSelectChange(setSelectedRoom, e)}
              >
                <option value="" disabled>
                  Select Room
                </option>
                {roomData.map((room) => (
                  <option key={room.docRoomId} value={room.docRoomId}>
                    {room.roomNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Rack */}
            <div className="form-group col-md-3">
              <label htmlFor="rackSelect">Select Rack</label>
              <select
                id="rackSelect"
                className="form-control form-select"
                value={selectedRack}
                onChange={(e) => handleSelectChange(setSelectedRack, e)}
              >
                <option value="" disabled>
                  Select Rack
                </option>
                {rackData.map((rack) => (
                  <option key={rack.rackId} value={rack.rackId}>
                    {rack.rackNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group col-md-3">
              <label htmlFor="cellSelect">Select Cell No</label>
              <select
                id="cellSelect"
                className="form-control form-select"
                value={selectedCell}
                onChange={(e) => handleSelectChange(setSelectedCell, e)}
              >
                <option value="" disabled>
                  Select Cell
                </option>

                {[1, 2, 3, 4, 5].map((cellValue) => (
                        <option key={cellValue} value={cellValue}>
                          {cellValue}
                        </option>
                      ))}
              </select>
            </div>

            <div className="form-group col-md-3">
              <label htmlFor="fileModuleSelect">Select File Module</label>
              <select
                id="fileModuleSelect"
                className="form-control form-select"
                value={selectedFileModule}
                onChange={(e) => handleSelectChange(setSelectedFileModule, e)}
              >
                <option value="" disabled>
                  Select File Module
                </option>
                {fileModules.map((fileModule) => (
                  <option key={fileModule.moduleId} value={fileModule.moduleId}>
                    {fileModule.moduleName}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-12 text-center">
              <button
                type="submit"
                className="btn btn-primary mt-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Submit"}
              </button>
              {submitError && <p className="text-danger mt-2">{submitError}</p>}
            </div>
          </form>
        </div>
      )}

      {/* Table Accordion */}
      <div className="accordion-header mt-5" onClick={toggleTableAccordion}>
        <span className="accordion-title">View File</span>
        <span className="accordion-icon">
          {isTableOpen ? <FaMinus /> : <FaPlus />}
        </span>
      </div>
      {isTableOpen && (
        <div className="accordion-body">
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
                Tab 3
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
                <h5>Content for Tab 3</h5>
                <p>Details related to Tab 3 go here.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFile;
