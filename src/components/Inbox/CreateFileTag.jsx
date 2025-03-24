import React, { useState, useEffect } from "react";
import useApiListStore from "../ManageFile/ApiListStore";
import api from "../../Api/Api";
import { encryptPayload } from "../../utils/encrypt";
import useAuthStore from "../../store/Store";
import { toast } from "react-toastify";
import useLetterStore from "../Inbox/useLetterStore.js";
import { Autocomplete, TextField, Button, MenuItem } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
//  const Navigate = useNavigate();
import { PageLoader } from "../pageload/PageLoader";
const ManageFile = () => {
  // const location = useLocation();
  // const fetchedData = location.state?.data;
  // const letterReceiptId = fetchedData.letterReceiptId;
  // const metadataId = fetchedData.metadataId;
  const location = useLocation();
  const [letterReceiptId, setLetterReceiptId] = useState(null);
  const [metadataId, setMetadataId] = useState(null);

  useEffect(() => {
    const fetchedData = location.state?.data || {};
    const receiptId = fetchedData?.letterReceiptId || null;
    const metadataId = fetchedData.metadataId;
    setLetterReceiptId(receiptId);
    setMetadataId(metadataId);
  }, [location.state]);

  const Navigate = useNavigate();

  const [selectedRack, setSelectedRack] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
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
  const [isLoading, setIsLoading] = useState(false);
  const [isRoomSelected, setIsRoomSelected] = useState(false);
  const [shouldRefreshNewRequest, setShouldRefreshNewRequest] = useState(false);
  const [currentRackCells, setCurrentRackCells] = useState(0);
  const {
    activities,
    custodians,
    departments,
    fileModules,
    fileRelatedToList,
    office,
    fetchAllData,
  } = useApiListStore();

  const empDeptRoleId = custodians?.[0]?.empDeptRoleId || "Not Available";

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
      setIsLoading(true);
      try {
        const token = useAuthStore.getState().token;

        const response = await api.get("/manage-room", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoomData(response.data.data);
      } catch (error) {
        console.error("Error fetching room data:", error);
      } finally {
        setIsLoading(false);
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
      setIsLoading(true);
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

        setRackData(response.data.data);
      } catch (error) {
        console.error("Error fetching rack data:", error);
        setRackData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRackData();
  }, [selectedRoom]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    // setSubmitError("");
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
    const payload = {
      metadataId,
      letterReceiptId,
      empOfficeMapIdascustodian: selectedCustodian,
      rackId: selectedRack || null,
      roomId: selectedRoom || null,
      noOfCell: selectedCell || null,
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
    console.log("Payload:", payload);
    
    setIsLoading(true);
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
        useLetterStore.getState().setSuccessMessage(response.data);
        // toast.success(response.data);
        Navigate("/letter");
        resetForm();
        setShouldRefreshNewRequest((prev) => !prev);
      } else {
        toast.error("An error occurred while submitting the form.");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error(
        error.response?.data?.message || "An unexpected error occurred."
      );
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  // Function to Reset Form Fields
  const resetForm = () => {
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
      : null; // If activities is not an array, return null or handle as needed

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

 

  return (
    <>
      {isLoading && <PageLoader />}
      <div className="manageFile-section-container">
        <form className="row" onSubmit={handleSubmit}>
          <div className="form-group col-md-3">
            <Autocomplete
              id="officeSelect"
              size="small"
              options={office}
              getOptionLabel={(option) => option.officeOrgName}
              value={
                office.find((o) => o.officeOrgId === selectedOffice) || null
              }
              onChange={(event, newValue) =>
                setSelectedOffice(newValue ? newValue.officeOrgId : "")
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    <span>
                      Select Office <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  variant="outlined"
                  fullWidth
                />
              )}
            />
          </div>

          <div className="form-group col-md-3">
            <Autocomplete
              id="departmentSelect"
              size="small"
              options={departments}
              getOptionLabel={(option) => option.departmentName}
              value={
                departments.find(
                  (d) => d.departmentId === selectedDepartment
                ) || null
              }
              onChange={(event, newValue) =>
                setSelectedDepartment(newValue ? newValue.departmentId : "")
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    <span>
                      Select Department <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  variant="outlined"
                  fullWidth
                />
              )}
            />
          </div>

          <div className="form-group col-md-3">
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

          <div className="form-group col-md-3 mt-3">
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
              size="small"
              label={<span>Keyword</span>}
              fullWidth
              value={formKeyword}
              onChange={(e) => setFormKeyword(e.target.value)}
            />
          </div>

          <div className="form-group col-md-3 mt-3">
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
              value={formFileName}
              onChange={(e) => setFormFileName(e.target.value)}
            />
          </div>

          <div className="form-group col-md-3 mt-3">
            <Autocomplete
              id="custodianSelect"
              size="small"
              options={custodians}
              getOptionLabel={(option) => option.empNameWithDesgAndDept}
              value={
                custodians.find((c) => c.empDeptRoleId === selectedCustodian) ||
                null
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
                      Select Custodian <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  variant="outlined"
                  fullWidth
                />
              )}
            />
          </div>

          <div className="form-group col-md-3 mt-3 mt-3">
            <Autocomplete
              id="roomSelect"
              size="small"
              options={roomData}
              getOptionLabel={(option) => option.roomNumber}
              value={roomData.find((r) => r.docRoomId === selectedRoom) || null}
              onChange={handleRoomChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    <span>
                      Select Room
                      {selectedRoom && <span style={{ color: "red" }}>*</span>}
                    </span>
                  }
                  variant="outlined"
                  fullWidth
                />
              )}
            />
          </div>

          <div className="form-group col-md-3 mt-3">
            <Autocomplete
              id="rackSelect"
              size="small"
              options={rackData}
              getOptionLabel={(option) => option.rackNumber}
              value={rackData.find((r) => r.rackId === selectedRack) || null}
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
                />
              )}
            />
          </div>

          <div className="form-group col-md-3 mt-3">
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
                fileModules.find((f) => f.moduleId === selectedFileModule) ||
                null
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
          <div className="col-md-12 text-center">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, textTransform: "none" }}
            >
              Create file & tag Letter to file
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ManageFile;
