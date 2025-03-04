import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  IconButton,
  MenuItem,
  Grid,
  Box,
} from "@mui/material";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
import useFormStore from "../EmployeeMaster/store";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import { toast } from "react-toastify";
import { PageLoader } from "../pageload/PageLoader";



const EducationForm = () => {

  const [educationFields, setEducationFields] = useState([
    { qualificationId: "", universitySchoolName: "", institution: "", yearOfPassing: "", percentageCgpa: "", stream: "", file: null }
  ]);

  const [edqulification,setEdqulification]=useState([]); 
  const [isLoading, setIsLoading] = useState(false); 
   const token = useAuthStore.getState().token;

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
    setEdqulification(response.data.data)
      console.log("education qulification",edqulification)
    } catch (error) {
      console.error("Error fetching education   data:", error);
    }
    finally{
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchqulificationData();
}, []);

  const addRow = () => {
    setEducationFields([
      ...educationFields,
      { qualificationId: "", universitySchoolName: "", institution: "", yearOfPassing: "",percentageCgpa: "", stream: "", file: null }
    ]);
  };


  const handleRemoveField = (index) => {
    const newFields = educationFields.filter((_, i) => i !== index);
    setEducationFields(newFields);
  };

 
  const handleChange = (index, event) => {
    const { name, value, type } = event.target;
    const newFields = [...educationFields];
    newFields[index][name] = type === "file" ? event.target.files[0] : value;
    setEducationFields(newFields);
  };


  const handleBack = () => {
    console.log("Back button clicked");
  };


  
const handleSaveAndNext = async () => {
  const storedEmployeeId = useFormStore.getState().employeeId;

  if (!rows || rows.length === 0) {
    toast.error("No Education details provided.");
    return;
  }

  setIsLoading(true);

  try {
    const payload = {
      employeeId: storedEmployeeId ?? null,
      familyDetails: rows.map((row) => ({
        familyId :row?.familyId ?? null,
        firstName: row?.firstName ?? null,
        lastName: row?.lastName ?? null,
        dateOfBirth : row?.dateOfBirth ?? null,
        relationshipId : row?.relationshipId ?? null,
      })),
    };

    const encryptedPayload = encryptPayload(payload);

    const response = await api.post(
      "governance/save-or-update-employee-family-details",
      { dataObject: encryptedPayload },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data?.outcome) {
      const { employeeCode, employeeId } = response.data.data;

      useFormStore.getState().setEmployeeCode(employeeCode);
      useFormStore.getState().setEmployeeId(employeeId);

      updateFormData("familyDetails", payload.familyDetails); 


      toast.success("Family details saved successfully!", { position: "top-right", autoClose: 3000 });

      setActiveTab("ADDRESS");
    } else {
      toast.error(response.data?.message || "Failed to save family details.");
    }
  } catch (error) {
    console.error("Error saving family details:", error);
    toast.error("An error occurred while saving. Please try again.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="mt-5">
      {educationFields.map((field, index) => (
        <Grid container spacing={3} alignItems="center" key={index} sx={{ mb: 3 }}>
          {/* Educational Qualification */}
          <Grid item xs={3} sx={{mb:2}}>
            <TextField
              select
              label="Educational Qualification"
              name="qualificationId"
              value={field.qualificationId}
              onChange={(e) => handleChange(index, e)}
              fullWidth
              InputProps={{ sx: { height: '50px' }}}
            >
              {edqulification.map((option) => (
                <MenuItem key={option.qualificationId} value={option.qualificationId}>{option.qualificationName}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* University/Board */}
          <Grid item xs={3} sx={{mb:2}}>
            <TextField
              label="University/Board"
              name="universitySchoolName"
              value={field.universitySchoolName}
              onChange={(e) => handleChange(index, e)}
              fullWidth
              InputProps={{ sx: { height: '50px' }}}
            />
          </Grid>

          {/* Institution */}
          <Grid item xs={3} sx={{mb:2}}>
            <TextField
              label="Institution"
              name="institution"
              value={field.institution}
              onChange={(e) => handleChange(index, e)}
              fullWidth
              InputProps={{ sx: { height: '50px' }}}
            />
          </Grid>

          {/* Year of Passing */}
          <Grid item xs={3} sx={{mb:2}}>
            <TextField
              label="Year of Passing"
              name="yearOfPassing"
              value={field.yearOfPassing}
              onChange={(e) => handleChange(index, e)}
              fullWidth
              InputProps={{ sx: { height: '50px' }}}
            />
          </Grid>

          {/* Percentage */}
          <Grid item xs={3} sx={{mb:2}}>
            <TextField
              label="Percentage"
              name="percentageCgpa"
              value={field.percentageCgpa}
              onChange={(e) => handleChange(index, e)}
              fullWidth
              InputProps={{ sx: { height: '50px' }}}
            />
          </Grid>

          {/* Stream */}
          <Grid item xs={3} sx={{mb:2}}>
            <TextField
              label="Stream"
              name="stream"
              value={field.stream}
              onChange={(e) => handleChange(index, e)}
              fullWidth
              InputProps={{ sx: { height: '50px' }}}
            />
          </Grid>

          {/* Upload Certificate */}
          <Grid item xs={2} sx={{mb:2}}>
            <Button variant="contained" component="label">
              Upload Certificate
              <input type="file" name="file" hidden onChange={(e) => handleChange(index, e)} />
            </Button>
          </Grid>

          {/* Add/Remove Buttons */}
          <Grid item xs={0.5}  sx={{ display: "flex", justifyContent: "flex-end",mb:2 }}>
            {index === 0 && ( // Show "+" button only in the first row
              <IconButton color="primary" onClick={addRow}>
                <AddCircleOutline />
              </IconButton>
            )}
            {index > 0 && ( // Show "-" button only for rows after the first
              <IconButton color="error" onClick={() => handleRemoveField(index)}>
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
        <Button variant="contained" color="primary" onClick={handleSaveAndNext} >
          Save & Next
        </Button>
      </Box>
    </div>
  );
};

export default EducationForm;