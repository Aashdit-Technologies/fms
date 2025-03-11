import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  IconButton,
  MenuItem,
  Grid,
  Box,
  InputAdornment,
} from "@mui/material";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
import useFormStore from "../EmployeeMaster/store";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import { toast } from "react-toastify";
import { PageLoader } from "../pageload/PageLoader";
import VisibilityIcon from "@mui/icons-material/Visibility";

const EducationForm = ({handleTabChange}) => {
  const { updateFormData, setActiveTab, formData, activeTab } = useFormStore();
  const [educationFields, setEducationFields] = useState([
    {
      qualificationId: null,
      universitySchoolName: "",
      institution: "",
      yearOfPassing: "",
      percentageCgpa: "",
      stream: "",
      file: null,
      educationId: null,
      fileName: "",
      filePath: "",
    },
  ]);

  const [edqulification, setEdqulification] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthStore.getState().token;
 const [errors, setErrors] = useState({});
 const [hasChanges, setHasChanges] = useState(false);
  const fetchqulificationData = async () => {
    setIsLoading(true);
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        console.error("Token is missing");
        return;
      }

      const response = await api.get(
        "governance/education-qualification-list",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEdqulification(response.data.data);
      
    } catch (error) {
      console.error("Error fetching education   data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchqulificationData();
  }, []);


  const addRow = () => {
    
    const isAllRowsValid = educationFields.every((field, index) => {
      return (
        field.qualificationId &&
        field.universitySchoolName &&
        field.yearOfPassing &&
        field.percentageCgpa &&
        (field.educationId || field.file)
      );
    });
  
    if (!isAllRowsValid) {
      toast.error("Please fill all mandatory fields in all rows before adding a new row.");
      return; 
    }
  
    setEducationFields((prevFields) => [
      ...prevFields,
      {
        qualificationId: null,
        universitySchoolName: "",
        institution: "",
        yearOfPassing: "",
        percentageCgpa: "",
        stream: "",
        file: null,
        educationId: null,
      },
    ]);
    setHasChanges(true);
  };

  const handleRemoveField = (index) => {
    const newFields = educationFields.filter((_, i) => i !== index);
    setEducationFields(newFields);
    setHasChanges(true);

  };



  const handleChange = (index, event) => {
    const { name, value, type } = event.target;
    const newFields = [...educationFields];
    newFields[index][name] = type === "file" ? event.target.files[0] : value;
    setEducationFields(newFields);
    setHasChanges(true);
    const newErrors = { ...errors };
    delete newErrors[`${name}_${index}`];
    setErrors(newErrors);
  };

  const handleBack = () => {
    if (typeof handleTabChange !== "function") {
      console.error("handleTabChange is not a function! Received:", handleTabChange);
      return;
    }
    handleTabChange(null, "ADDRESS");
  };

  const handleSaveAndNext = async () => {
    
    const storedEmployeeId = useFormStore.getState().employeeId;
debugger
  
  if (!educationFields || educationFields.length === 0) {
    toast.error("No Education details provided.");
    return;
  }

  const isEducationValid = validateEducationFields(educationFields);
  if (!isEducationValid) {
    toast.error("Please fill all the required fields");
    return;
  }

    setIsLoading(true);

    try {
  
      const formData = new FormData();
      const educationDetails = educationFields.map((field) => {
        return {
          educationId: field.educationId ?? null,
          qualificationId: field.qualificationId ?? null,
          universitySchoolName: field.universitySchoolName ?? null,
          institution: field.institution ?? null,
          yearOfPassing: field.yearOfPassing ?? null,
          percentageCgpa: field.percentageCgpa ?? null,
          stream: field.stream ?? null,
        };
      });

      formData.append(
        "dataObject",
        encryptPayload({
          employeeId: storedEmployeeId ?? null,
          educationDetails,
        })
      );

      educationFields.forEach((field) => {
        if (field.file) {
          formData.append("documentFiles", field.file);
        }
        else {
          // Append an empty Blob to maintain the array structure
          formData.append("documentFiles", new Blob([], { type: "application/octet-stream" }));
        }
      });

      const response = await api.post(
        "governance/save-or-update-employee-education",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.outcome) {
        // const { employeeCode, employeeId,educationDetailss } = response.data.data;

        //useFormStore.getState().setEmployeeCode(employeeCode);
        useFormStore.getState().setEmployeeId(response.data.data.employeeId);

        // updateFormData("educationDetails", response.data.data.educationDetails.educationDetails);

        toast.success(response.data.message);

        setActiveTab("BASIC_DETAILS");
        setHasChanges(false);
      } else {
        toast.error(
          response.data?.message || "Failed to save education details."
        );
      }
    } catch (error) {
      console.error("Error saving education details:", error);
      toast.error("An error occurred while saving. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "EDUCATION") {
      const storedEducationDetails = formData?.education.educationDetails || [];

      if (storedEducationDetails.length > 0) {
        const formattedRows = storedEducationDetails.map((row) => ({
          educationId: row?.educationId ?? null,
          qualificationId: row?.qualificationId ?? null,
          universitySchoolName: row?.universitySchoolName ?? "",
          institution: row?.institution ?? "",
          yearOfPassing: row?.yearOfPassing ?? "",
          percentageCgpa: row?.percentageCgpa ?? "",
          stream: row?.stream ?? "",
          fileName:row?.fileName ?? "",
          filePath:row?.filePath ?? "",
            
        }));

        setEducationFields(formattedRows);
      } else {
        setEducationFields([
          {
            educationId: null,
            qualificationId: null,
            universitySchoolName: "",
            institution: "",
            yearOfPassing: "",
            percentageCgpa: "",
            stream: "",
            file: null,
          },
        ]);
      }
    }
  }, [activeTab, formData]);

  const handleDocumentView = async (fileName, filePath) => {
    if (!fileName || !filePath) {
      toast.error("No document available to view.");
      return;
    }

    try {
      setIsLoading(true);

     
      const formattedPath = filePath.replace(/\\/g, "/");

      const payload = { documentName: fileName, documentPath: formattedPath };
      const encryptedPayload = encryptPayload(payload);
    

      const response = await api.post(
        "download/view-document",
        { dataObject: encryptedPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.data) {
        const base64String = response.data.data.includes(",")
          ? response.data.data.split(",")[1]
          : response.data.data; 

        const byteCharacters = atob(base64String);
        const byteNumbers = new Uint8Array(
          [...byteCharacters].map((char) => char.charCodeAt(0))
        );
        const blob = new Blob([byteNumbers], { type: "application/pdf" });

        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else {
        toast.error("Failed to load PDF.");
      }
    } catch (error) {
      console.error("Error fetching PDF:", error);
      toast.error("Failed to fetch PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateEducationFields = (educationFields) => {
    const newErrors = {};
    let isValid = true;
  
    educationFields.forEach((field, index) => {
      
      if (!field.qualificationId) {
        newErrors[`qualificationId_${index}`] = "Educational qualification is required.";
        isValid = false;
      }
  
      
      if (!field.universitySchoolName) {
        newErrors[`universitySchoolName_${index}`] = "University/Board is required.";
        isValid = false;
      }
  
     
      if (!field.yearOfPassing) {
        newErrors[`yearOfPassing_${index}`] = "Year of passing is required.";
        isValid = false;
      } else if (!/^\d{4}$/.test(field.yearOfPassing)) {
        newErrors[`yearOfPassing_${index}`] = "Year of passing must be a valid 4-digit year.";
        isValid = false;
      }
  
      if (!field.percentageCgpa) {
        newErrors[`percentageCgpa_${index}`] = "Percentage/CGPA is required.";
        isValid = false;
      } else if (!/^\d+\.\d{2}$/.test(field.percentageCgpa)) {
        newErrors[`percentageCgpa_${index}`] = "Percentage/CGPA must be a valid number with exactly two decimal places (e.g., 9.00 or 8.99).";
        isValid = false;
      }
  
      
      if (!field.educationId && !field.file ) {
        newErrors[`file_${index}`] = "Upload document is required.";
        isValid = false;
      }
    });
  
    setErrors(newErrors); 
    return isValid;
  };
  return (
    <>
      {isLoading && <PageLoader />}
      <div className="mt-5">
        {educationFields.map((field, index) => (
          <Grid
            container
            spacing={3}
            
            key={index}
            sx={{ mb: 3 }}
          >
            {/* Educational Qualification */}
            <Grid item xs={3} sx={{ mb: 2 }}>
              <TextField
                select
              
                label={
                  <>
                  Educational Qualification <span style={{color:"red"}}>*</span>
                  </>
                }
                name="qualificationId"
                value={field.qualificationId}
                
                onChange={(e) => {
                  handleChange(index, e);
                  setErrors((prevErrors) => ({ ...prevErrors, [`qualificationId_${index}`]: "" })); 
                }}
                fullWidth
                variant="outlined" 
                InputLabelProps={{ shrink: true }}
                InputProps={{ sx: { height: "50px" } }}
                error={!!errors[`qualificationId_${index}`]}
                helperText={errors[`qualificationId_${index}`]}
              >
                {edqulification.map((option) => (
                  <MenuItem
                    key={option.qualificationId}
                    value={option.qualificationId}
                  >
                    {option.qualificationName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* University/Board */}
            <Grid item xs={3} sx={{ mb: 2 }}>
              <TextField
              
                label={
                  <>
                University/Board <span style={{color:"red"}}>*</span>
                  </>
                }
                name="universitySchoolName"
                value={field.universitySchoolName}
                
                onChange={(e) => {
                  handleChange(index, e);
                  setErrors((prevErrors) => ({ ...prevErrors, [`universitySchoolName_${index}`]: "" })); 
                }}
                fullWidth
                inputProps={{maxLength:70}}
                autoComplete="off"
                InputProps={{ sx: { height: "50px" } }}
                error={!!errors[`universitySchoolName_${index}`]}
                helperText={errors[`universitySchoolName_${index}`]}
              />
            </Grid>

            {/* Institution */}
            <Grid item xs={3} sx={{ mb: 2 }}>
              <TextField
                label="Institution"
                name="institution"
                value={field.institution}
                inputProps={{maxLength:70}}
                autoComplete="off"
                onChange={(e) => handleChange(index, e)}
                fullWidth
                InputProps={{ sx: { height: "50px" } }}
              />
            </Grid>
        <Grid item xs={3} sx={{ mb: 2 }}>
          <TextField
            label={
              <>
                Year of Passing <span style={{ color: "red" }}>*</span>
              </>
            }
            name="yearOfPassing"
            value={field.yearOfPassing}
            onChange={(e) => {
              const value = e.target.value;

              
              if (/^\d*$/.test(value)) {
                handleChange(index, e); 
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  [`yearOfPassing_${index}`]: "",
                }));
              }
            }}
            onKeyDown={(e) => {
              
              if (!/\d/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab") {
                e.preventDefault(); 
              }
            }}
            fullWidth
            inputProps={{ maxLength: 4 }} 
            autoComplete="off"
            InputProps={{ sx: { height: "50px" } }}
            error={!!errors[`yearOfPassing_${index}`]}
            helperText={errors[`yearOfPassing_${index}`]}
          />
        </Grid>

            {/* Percentage */}
            <Grid item xs={3} sx={{ mb: 2 }}>
              <TextField
                label={
                  <>
                    Percentage/CGPA<span style={{ color: "red" }}>*</span>
                  </>
                }
                name="percentageCgpa"
                value={field.percentageCgpa}
                onChange={(e) => {
                  const value = e.target.value;

                  
                  if (/^\d*\.?\d{0,2}$/.test(value)) {
                    handleChange(index, e);
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      [`percentageCgpa_${index}`]: "",
                    }));
                  }
                }}
                onKeyDown={(e) => {
                  
                  if (
                    !/\d|\./.test(e.key) && 
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault(); 
                  }

                  
                  if (e.key === "." && field.percentageCgpa.includes(".")) {
                    e.preventDefault();
                  }
                }}
                autoComplete="off"
                inputProps={{ maxLength: 5 }} 
                fullWidth
                InputProps={{ sx: { height: "50px" } }}
                error={!!errors[`percentageCgpa_${index}`]}
                helperText={errors[`percentageCgpa_${index}`]}
              />
            </Grid>

            {/* Stream */}
            <Grid item xs={3} sx={{ mb: 2 }}>
              <TextField
                label="Stream"
                name="stream"
                value={field.stream}
                onChange={(e) => handleChange(index, e)}
                fullWidth
                InputProps={{ sx: { height: "50px" } }}
                inputProps={{maxLength:50}}
                autoComplete="off"
              />
            </Grid>

            {/* Upload Certificate */}

            <Grid item xs={3} sx={{ mb: 2 }}>
              <TextField
                
                label={
                  <>
                  Upload Document <span style={{color:"red"}}>*</span>
                  </>
                }
                type="file"
                name="file"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    if (file.type !== "application/pdf") {
                      toast.error("Only PDF files are allowed!");
                      e.target.value = ""; 
                      return;
                    }
            
                    handleChange(index, e);
                    setErrors((prevErrors) => ({ ...prevErrors, [`file_${index}`]: "" }));
                  }
                }}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  sx: { height: "50px", alignItems: "center" },
                  endAdornment: (
                    <InputAdornment position="end">
                      {educationFields[index]?.fileName &&
                        educationFields[index]?.filePath && (
                          <IconButton
                            onClick={() =>
                              handleDocumentView(
                                educationFields[index]?.fileName,
                                educationFields[index]?.filePath
                              )
                            }
                            edge="end"
                            color="primary"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        )}
                    </InputAdornment>
                  ),
                }}
                error={!!errors[`file_${index}`]}
                helperText={errors[`file_${index}`]}
              />
            </Grid>

            {/* Add/Remove Buttons */}
            <Grid
              item
              xs={0.5}
              sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}
            >
              {index === 0 && (
                <IconButton color="primary" onClick={addRow}>
                  <AddCircleOutline />
                </IconButton>
              )}
              {index > 0 && (
                <IconButton
                  color="error"
                  onClick={() => handleRemoveField(index)}
                >
                  <RemoveCircleOutline />
                </IconButton>
              )}
            </Grid>
          </Grid>
        ))}

        {/* Navigation Buttons */}
        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          <Button variant="contained" color="secondary" onClick={handleBack}>
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAndNext}
          >
            {formData?.education.educationDetails && formData?.education.educationDetails.length > 0 ? "Update" : "Save"}
          </Button>
        </Box>
      </div>
    </>
  );
};

export default EducationForm;
