

import React, { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Grid,
  Box,
  IconButton,
} from "@mui/material";
import { LocalizationProvider, MobileDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { CalendarToday, AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
const organisations = ["Organisation 1", "Organisation 2", "Organisation 3"];
const countries = ["Country 1", "Country 2", "Country 3"];
const states = ["State 1", "State 2", "State 3"];
const cities = ["City 1", "City 2", "City 3"];
const designations = ["Designation 1", "Designation 2", "Designation 3"];

const PreviousEmployment = () => {
  const [experienceFields, setExperienceFields] = useState([
    {
      organisation: "",
      country: "",
      state: "",
      city: "",
      designation: "",
      fromDate: null,
      toDate: null,
      description: "",
    },
  ]);

  const handleChange = (index, field, value) => {
    const newFields = [...experienceFields];
    newFields[index][field] = value;
    setExperienceFields(newFields);
  };

  const addRow = () => {
    setExperienceFields([
      ...experienceFields,
      {
        organisation: "",
        country: "",
        state: "",
        city: "",
        designation: "",
        fromDate: null,
        toDate: null,
        description: "",
      },
    ]);
  };

  const removeRow = (index) => {
    if (experienceFields.length > 1) {
      const newFields = experienceFields.filter((_, i) => i !== index);
      setExperienceFields(newFields);
    }
  };

  const handleNext = () => {
    console.log("Next button clicked");
  };

  const handleBack = () => {
    console.log("Back button clicked");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        {experienceFields.map((field, index) => (
          <Grid container spacing={3} alignItems="center" key={index} sx={{ mb: 3 }}>
            {/* Organisation */}
            <Grid item xs={3}>
              <TextField
                select
                label="Organisation"
                value={field.organisation}
                onChange={(e) => handleChange(index, "organisation", e.target.value)}
                fullWidth
              >
                {organisations.map((org) => (
                  <MenuItem key={org} value={org}>
                    {org}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Country */}
            <Grid item xs={3}>
              <TextField
                select
                label="Country"
                value={field.country}
                onChange={(e) => handleChange(index, "country", e.target.value)}
                fullWidth
              >
                {countries.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* State */}
            <Grid item xs={3}>
              <TextField
                select
                label="State"
                value={field.state}
                onChange={(e) => handleChange(index, "state", e.target.value)}
                fullWidth
              >
                {states.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* City/Town/Village */}
            <Grid item xs={3}>
              <TextField
                select
                label="City/Town/Village"
                value={field.city}
                onChange={(e) => handleChange(index, "city", e.target.value)}
                fullWidth
              >
                {cities.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Designation */}
            <Grid item xs={3}>
              <TextField
                select
                label="Designation"
                value={field.designation}
                onChange={(e) => handleChange(index, "designation", e.target.value)}
                fullWidth
              >
                {designations.map((designation) => (
                  <MenuItem key={designation} value={designation}>
                    {designation}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* From-Date */}
            <Grid item xs={3}>
    <MobileDatePicker
      label="From-Date"
      value={field.fromDate}
      onChange={(newValue) => handleChange(index, "fromDate", newValue)}
      format="DD/MM/YYYY"
      slotProps={{
        textField: {
          fullWidth: true,
          sx: { width: "100%" },
        },
      }}
    />
  </Grid>

  {/* To-Date */}
  <Grid item xs={3}>
    <MobileDatePicker
      label="To-Date"
      value={field.toDate}
      onChange={(newValue) => handleChange(index, "toDate", newValue)}
      format="DD/MM/YYYY"
      slotProps={{
        textField: {
          fullWidth: true,
          sx: { width: "100%" },
        },
      }}
    />
  </Grid>

            {/* Description */}
            <Grid item xs={3}>
              <TextField
                label="Description"
                value={field.description}
                onChange={(e) => handleChange(index, "description", e.target.value)}
                fullWidth
                multiline
                rows={1}
              />
            </Grid>

            {/* Add/Remove Buttons */}
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
              {index === 0 && (
                <IconButton color="primary" onClick={addRow}>
                  <AddCircleOutline />
                </IconButton>
              )}
              {experienceFields.length > 1 && (
                <IconButton color="error" onClick={() => removeRow(index)}>
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
      </Box>
    </LocalizationProvider>
  );
};

export default PreviousEmployment;