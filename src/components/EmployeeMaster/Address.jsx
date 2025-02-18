import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Typography,
} from "@mui/material";

const AddressForm = () => {
  const [presentAddress, setPresentAddress] = useState({
    country: "",
    state: "",
    district: "",
    city: "",
    pin: "",
    street: "",
  });

  const [isSameAddress, setIsSameAddress] = useState(false);
  const [permanentAddress, setPermanentAddress] = useState({ ...presentAddress });

  const handleChange = (event, section) => {
    const { name, value } = event.target;
    if (section === "present") {
      setPresentAddress((prev) => ({ ...prev, [name]: value }));
      if (isSameAddress) {
        setPermanentAddress((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setPermanentAddress((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (event) => {
    setIsSameAddress(event.target.checked);
    if (event.target.checked) {
      setPermanentAddress({ ...presentAddress });
    }
  };

  const countries = ["India", "USA", "Canada"];
  const states = ["Odisha", "Maharashtra", "Punjab"];
  const districts = ["Mayurbhanj", "Cuttack", "Pune"];
  const cities = ["Bhubaneswar", "Cuttack", "Mumbai"];


  const handleNext = () => {
    updateFormData("employmentDetails", rows);
    setActiveTab(4);
  };

  const handleBack = () => {
    updateFormData("employmentDetails", rows);
    setActiveTab(2);
  };
  return (
    <Box p={3}>
        <Typography variant="h6" sx={{ color: "red", mb: 1 }}>
        Present Address
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={3}>
          <TextField select fullWidth label="Country" name="country" value={presentAddress.country} onChange={(e) => handleChange(e, "present")}>
            {countries.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={3}>
          <TextField select fullWidth label="State" name="state" value={presentAddress.state} onChange={(e) => handleChange(e, "present")}>
            {states.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={3}>
          <TextField select fullWidth label="District" name="district" value={presentAddress.district} onChange={(e) => handleChange(e, "present")}>
            {districts.map((d) => (
              <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={3}>
          <TextField select fullWidth label="City" name="city" value={presentAddress.city} onChange={(e) => handleChange(e, "present")}>
            {cities.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={3}>
          <TextField fullWidth label="Pin" name="pin" value={presentAddress.pin} onChange={(e) => handleChange(e, "present")} />
        </Grid>
        
      </Grid>

      <FormControlLabel
        control={<Checkbox checked={isSameAddress} onChange={handleCheckboxChange} />}
        label="Permanent address is same as present address?"
        sx={{ mb: 2 }}
      />

      {!isSameAddress && (
        <>
          <Typography variant="h6" sx={{ color: "red", mb: 1 }}>
            Permanent Address
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={3}>
              <TextField select fullWidth label="Country" name="country" value={permanentAddress.country} onChange={(e) => handleChange(e, "permanent")}>
                {countries.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField select fullWidth label="State" name="state" value={permanentAddress.state} onChange={(e) => handleChange(e, "permanent")}>
                {states.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField select fullWidth label="District" name="district" value={permanentAddress.district} onChange={(e) => handleChange(e, "permanent")}>
                {districts.map((d) => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField select fullWidth label="City" name="city" value={permanentAddress.city} onChange={(e) => handleChange(e, "permanent")}>
                {cities.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth label="Pin" name="pin" value={permanentAddress.pin} onChange={(e) => handleChange(e, "permanent")} />
            </Grid>
           
          </Grid>
        </>
      )}

      <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                <Button variant="contained" color="secondary" onClick={handleBack}>
                  Back
                </Button>
                <Button variant="contained" color="primary" onClick={handleNext}>
                  Save & Next
                </Button>
              </Box>
    </Box>
  );
};

export default AddressForm;



