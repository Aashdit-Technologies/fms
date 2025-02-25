import React, { useState, useEffect } from "react";
import useApiListStore from "../ManageFile/ApiListStore";
import api from "../../Api/Api";
import { encryptPayload } from "../../utils/encrypt";
import useAuthStore from "../../store/Store";
import { toast } from "react-toastify";
import { Autocomplete, TextField, Button, MenuItem } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
//  const Navigate = useNavigate();

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
   
    if (!selectedOffice) return toast.error("Please select an office.");
    if (!selectedDepartment) return toast.error("Please select a department.");
    if (!selectedFileRTL) return toast.error("Please select a file related to.");
    if (!formTitle.trim()) return toast.error("Please enter a title.");
    if (!formKeyword.trim()) return toast.error("Please enter a KeyWord.");
    if (!formSubject.trim()) return toast.error("Please enter a subject.");
    if (!formFileName.trim()) return toast.error("Please enter a file name.");
    if (!selectedCustodian) return toast.error("Please select a custodian.");
    if (!selectedFileModule) return toast.error("Please select a file module.");
  
    const payload = {
      metadataId,
      letterReceiptId,
      empOfficeMapIdascustodian: employeeDeptMapId,
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
  
      if (response.status === 200) {
        toast.success("Form have been submitted successfully!");
        // Navigate("/system/setup/menu/init");
        resetForm(); 
      } else {
        toast.error("An error occurred while submitting the form.");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error(error.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to Reset Form Fields
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
  


  // const handleSelectChange = (event) => {
  //   setSelectedActivity(event.target.value);
  // };

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
  : null;  // If activities is not an array, return null or handle as needed

  
    console.log("Selected Activity Object:", selectedActivityObj);
  
    if (formTitle && formSubject && selectedActivityObj) {
      setFormFileName(
        `${formTitle}/${formSubject}/${selectedActivityObj.activityName}`
      );
    } else {
      setFormFileName(""); 
    }
  };
  
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
            <TextField {...params}
            label={
              <span>
                Select Office{" "}
                <span style={{ color: "red" }}>*</span>
              </span>
            }
             variant="outlined" fullWidth />
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
            <TextField {...params}
            label={
              <span>
                Select Department{" "}
                <span style={{ color: "red" }}>*</span>
              </span>
            }
              variant="outlined" fullWidth />
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
            <TextField {...params}
            label={
              <span>
                Select File Related To{" "}
                <span style={{ color: "red" }}>*</span>
              </span>
            }
              variant="outlined" fullWidth />
          )}
        />
      </div>

     
      <div className="form-group col-md-3">
        <TextField
          id="titleInput"
          label={
            <span>
              Title <span style={{ color: "red" }}>*</span>
            </span>
          }
          variant="outlined"
          fullWidth
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
        />
      </div>

      <div className="form-group col-md-3 mt-3">
        <TextField
          id="subjectInput"
          label={
            <span>
              Subject <span style={{ color: "red" }}>*</span>
            </span>
          }
          variant="outlined"
          fullWidth
          value={formSubject}
          onChange={(e) => setFormSubject(e.target.value)}
        />
      </div>

          

             <div className="form-group col-md-3 mt-3">
               <TextField
                            id="activitySelect"
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
                              <MenuItem key={activity.activityId} value={activity.activityId}>
                                {activity.activityName}
                              </MenuItem>
                            ))}
                              </TextField>
            </div>

            <div className="form-group col-md-3 mt-3">
             
             <TextField
               id="keywordInput"
               variant="outlined"
               label={
                <span>
                  Keyword <span style={{ color: "red" }}>*</span>
                </span>
              }
               fullWidth
               value={formKeyword}
               onChange={(e) => setFormKeyword(e.target.value)}
             />
           </div>


      
      <div className="form-group col-md-3 mt-3">
        <TextField
          id="fileNameInput"
          variant="outlined"
          label={
            <span>
              File Name <span style={{ color: "red" }}>*</span>
            </span>
          }
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
            <TextField {...params}
            label={
              <span>
                Select Custodian <span style={{ color: "red" }}>*</span>
              </span>
            }
             variant="outlined" fullWidth />
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
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
          Create file & tag Letter to file
        </Button>
      </div>
    </form> 
    </div>
  );
};

export default ManageFile;