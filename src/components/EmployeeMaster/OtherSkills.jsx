// import React from 'react'

// const OtherSkills = () => {
//   return (
//     <div>OtherSkills</div>
//   )
// }

// export default OtherSkills
import React, { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Box,
} from "@mui/material";

const OtherSkills = () => {
  const [formData, setFormData] = useState({
    otherSkills: "",
    training: "",
    description: "",
    file: null,
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (event) => {
    setFormData({ ...formData, file: event.target.files[0] });
  };

  const handleSubmit = () => {
    console.log("Form Data:", formData);
  };

  const handleCancel = () => {
    console.log("Form cancelled");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Other Skills */}
        <Grid item xs={3} >
          <TextField
            label="Other Skills"
            value={formData.otherSkills}
            onChange={(e) => handleChange("otherSkills", e.target.value)}
            fullWidth
          />
        </Grid>

        {/* Training */}
        <Grid item xs={3} >
          <TextField
            label="Training"
            value={formData.training}
            onChange={(e) => handleChange("training", e.target.value)}
            fullWidth
          />
        </Grid>

        {/* Description */}
        <Grid item xs={3}>
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            fullWidth
            multiline
            rows={1}
          />
        </Grid>

        {/* Upload Document */}
        <Grid item xs={3}>
          <Button variant="contained" component="label">
            Upload Document
            <input
              type="file"
              hidden
              fullWidth
              onChange={handleFileChange}
            />
          </Button>
         
        </Grid>

        {/* Buttons */}
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button variant="contained" color="secondary" onClick={handleCancel}>
            Back
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Update
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OtherSkills;