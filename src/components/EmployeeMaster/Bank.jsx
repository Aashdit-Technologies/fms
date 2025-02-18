// import React from 'react'

// const Bank = () => {
//   return (
//     <div>Bank</div>
//   )
// }

// export default Bank

import React, { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Grid,
  Box,
} from "@mui/material";

const banks = ["SBI", "HDFC", "ICICI", "Axis Bank", "Kotak Mahindra"];

const Bank = () => {
  const [formData, setFormData] = useState({
    bankName: "",
    searchName: "",
    issc: "",
    accountNumber: "",
    selectedBank: "",
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
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
        {/* Bank Name */}
        <Grid item xs={3} >
          <TextField
            label="Bank Name"
            value={formData.bankName}
            onChange={(e) => handleChange("bankName", e.target.value)}
            fullWidth
            required
          />
        </Grid>

        {/* Search Name */}
        <Grid item xs={3} >
          <TextField
            label="Search Name"
            value={formData.searchName}
            onChange={(e) => handleChange("searchName", e.target.value)}
            fullWidth
            required
          />
        </Grid>

        {/* ISSC */}
        <Grid item xs={3} >
          <TextField
            label="ISSC"
            value={formData.issc}
            onChange={(e) => handleChange("issc", e.target.value)}
            fullWidth
            required
          />
        </Grid>

        {/* Account Number */}
        <Grid item xs={3} >
          <TextField
            label="Account Number"
            value={formData.accountNumber}
            onChange={(e) => handleChange("accountNumber", e.target.value)}
            fullWidth
            required
          />
        </Grid>

        {/* Select Bank */}
        <Grid item xs={3} >
          <TextField
            select
            label="Select Bank"
            value={formData.selectedBank}
            onChange={(e) => handleChange("selectedBank", e.target.value)}
            fullWidth
            required
          >
            {banks.map((bank) => (
              <MenuItem key={bank} value={bank}>
                {bank}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Buttons */}
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button variant="contained" color="secondary" onClick={handleCancel}>
            Back
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            save & Next 
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Bank;