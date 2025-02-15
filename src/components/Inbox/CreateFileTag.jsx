import React, { useState, useEffect } from "react";
import useApiListStore from "../ManageFile/ApiListStore";
import api from "../../Api/Api";
import { encryptPayload } from "../../utils/encrypt";
import useAuthStore from "../../store/Store";
import { toast } from "react-toastify";
import { Autocomplete, TextField, Button } from "@mui/material";
import { useLocation } from "react-router-dom";


const ManageFile = () => {
  const location = useLocation();
  const fetchedData = location.state?.data; 
  const letterReceiptId = fetchedData.letterReceiptId;
  const metadataId = fetchedData.metadataId;
   
    

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

  const employeeDeptMapId = custodians?.[0]?.employeeDeptMapId;
  
  console.log("check employeeDeptMapId", employeeDeptMapId);

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
    // setSubmitError("");

    if (!formTitle || !selectedRack || !selectedRoom) {
      alert("Please fill out all required fields.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      metadataId:metadataId,
      letterReceiptId:letterReceiptId,
      empOfficeMapIdascustodian:employeeDeptMapId,
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
        "letter/create-file-add-letter",
        { dataObject: encryptedMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if(response.status == 200){
          toast.success(response.data);
        }
        else{
          toast.error(response.data);
          fetchFilteredData();
        }
      
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSelectChange = (setter, event) => {
    setter(event.target.value); 
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
    
          <form className="row" onSubmit={handleSubmit}>
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

         
            <div className="form-group col-md-3">
             
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

         
            <div className="form-group col-md-3">
             
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

         
            <div className="form-group col-md-3 mt-3">
            
              <TextField
                id="subjectInput"
                label="Subject"
                variant="outlined"
                fullWidth
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
              />
            </div>

           
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

           
            <div className="form-group col-md-3 mt-3">
             
              <TextField
                id="keywordInput"
                variant="outlined"
                label="Keyword"
                fullWidth
                value={formKeyword}
                onChange={(e) => setFormKeyword(e.target.value)}
              />
            </div>

       
            <div className="form-group col-md-3 mt-3">
           
              <TextField
                id="fileNameInput"
                variant="outlined"
                label="File Name"
                fullWidth
                value={formFileName}
                onChange={(e) => setFormFileName(e.target.value)}
              />
            </div>

        
            <div className="form-group col-md-3 mt-3">
              
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

         
            <div className="form-group col-md-3 mt-3 mt-3">
            
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
            <div className="form-group col-md-3 mt-3">
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
               
              >
               Create file & tag Letter to file
              </Button>
            </div>
          </form>
    </div>
  );
};

export default ManageFile;