
import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  IconButton,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, MobileDatePicker } from "@mui/x-date-pickers";
import { CalendarToday, AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
import dayjs from "dayjs";
import useFormStore from "../EmployeeMaster/store";

const FamilyDetails = () => {
  const { updateFormData, setActiveTab } = useFormStore();
 

  const [rows, setRows] = useState([
    { firstName: "", lastName: "", birthDate: "", relationship: "" },
  ]);

  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([...rows, { firstName: "", lastName: "", birthDate: "", relationship: "" }]);
  };

  const removeRow = (index) => {
    if (rows.length > 1) {
      const updatedRows = rows.filter((_, i) => i !== index);
      setRows(updatedRows);
    }
  };

  const handleNext = () => {
    updateFormData("employmentDetails", rows);
    setActiveTab(3);
  };

  const handleBack = () => {
    updateFormData("employmentDetails", rows);
    setActiveTab(1);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
     

        {rows.map((row, index) => (
          <Grid
            container
            spacing={2}
            alignItems="center"
            key={index}
            sx={{ borderBottom: "1px solid #ddd", pb: 2, mb: 2 }}
          >
            {/* First Name */}
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="First Name"
                value={row.firstName}
                onChange={(e) => handleChange(index, "firstName", e.target.value)}
              />
            </Grid>

            {/* Last Name */}
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Last Name"
                value={row.lastName}
                onChange={(e) => handleChange(index, "lastName", e.target.value)}
              />
            </Grid>

            {/* Birth Date */}
            <Grid item xs={3}>
              <MobileDatePicker
                label="Birth Date"
                value={row.birthDate ? dayjs(row.birthDate) : null}
                onChange={(newValue) =>
                  handleChange(index, "birthDate", newValue ? newValue.format("YYYY-MM-DD") : "")
                }
                format="YYYY-MM-DD"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    InputProps: {
                      endAdornment: <CalendarToday color="action" />,
                    },
                  },
                }}
              />
            </Grid>

            {/* Relationship Dropdown */}
            <Grid item xs={2}>
              <TextField
                select
                fullWidth
                label="Relationship"
                value={row.relationship}
                onChange={(e) => handleChange(index, "relationship", e.target.value)}
              >
                {["Father", "Mother", "Spouse", "Sibling", "Child"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Add & Remove Buttons (Right-Aligned) */}
            <Grid item xs={1} sx={{ display: "flex", justifyContent: "flex-end" }}>
                {index === 0 && (
                              <IconButton color="primary" onClick={addRow}>
                                <AddCircleOutline />
                              </IconButton>
                            )}
              {rows.length > 1 && (
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

export default FamilyDetails ;
