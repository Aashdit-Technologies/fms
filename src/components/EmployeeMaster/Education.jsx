import React, { useState } from "react";
import {
  TextField,
  Button,
  IconButton,
  MenuItem,
  Grid,
  Box,
} from "@mui/material";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";

const qualifications = ["10 Th", "12 Th", "Diploma", "Graduation", "Post Graduation"];

const EducationForm = () => {
  const [educationFields, setEducationFields] = useState([
    { qualification: "10 Th", university: "", institution: "", year: "", percentage: "", stream: "", file: null }
  ]);

  // Function to add a new row
  const addRow = () => {
    setEducationFields([
      ...educationFields,
      { qualification: "10 Th", university: "", institution: "", year: "", percentage: "", stream: "", file: null }
    ]);
  };

  // Function to remove a row
  const handleRemoveField = (index) => {
    const newFields = educationFields.filter((_, i) => i !== index);
    setEducationFields(newFields);
  };

  // Function to handle input changes
  const handleChange = (index, event) => {
    const { name, value, type } = event.target;
    const newFields = [...educationFields];
    newFields[index][name] = type === "file" ? event.target.files[0] : value;
    setEducationFields(newFields);
  };

  // Placeholder functions for navigation
  const handleNext = () => {
    console.log("Next button clicked");
  };

  const handleBack = () => {
    console.log("Back button clicked");
  };

  return (
    <div>
      {educationFields.map((field, index) => (
        <Grid container spacing={3} alignItems="center" key={index} sx={{ mb: 3 }}>
          {/* Educational Qualification */}
          <Grid item xs={2}>
            <TextField
              select
              label="Educational Qualification"
              name="qualification"
              value={field.qualification}
              onChange={(e) => handleChange(index, e)}
              fullWidth
            >
              {qualifications.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* University/Board */}
          <Grid item xs={2}>
            <TextField
              label="University/Board"
              name="university"
              value={field.university}
              onChange={(e) => handleChange(index, e)}
              fullWidth
            />
          </Grid>

          {/* Institution */}
          <Grid item xs={2}>
            <TextField
              label="Institution"
              name="institution"
              value={field.institution}
              onChange={(e) => handleChange(index, e)}
              fullWidth
            />
          </Grid>

          {/* Year of Passing */}
          <Grid item xs={2}>
            <TextField
              label="Year of Passing"
              name="year"
              value={field.year}
              onChange={(e) => handleChange(index, e)}
              fullWidth
            />
          </Grid>

          {/* Percentage */}
          <Grid item xs={1.5}>
            <TextField
              label="Percentage"
              name="percentage"
              value={field.percentage}
              onChange={(e) => handleChange(index, e)}
              fullWidth
            />
          </Grid>

          {/* Stream */}
          <Grid item xs={2}>
            <TextField
              label="Stream"
              name="stream"
              value={field.stream}
              onChange={(e) => handleChange(index, e)}
              fullWidth
            />
          </Grid>

          {/* Upload Certificate */}
          <Grid item xs={2}>
            <Button variant="contained" component="label">
              Upload Certificate
              <input type="file" name="file" hidden onChange={(e) => handleChange(index, e)} />
            </Button>
          </Grid>

          {/* Add/Remove Buttons */}
          <Grid item xs={1} sx={{ display: "flex", justifyContent: "flex-end" }}>
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
        <Button variant="contained" color="primary" onClick={handleNext}>
          Save & Next
        </Button>
      </Box>
    </div>
  );
};

export default EducationForm;