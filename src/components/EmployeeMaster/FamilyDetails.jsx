import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, MobileDatePicker } from "@mui/x-date-pickers";
import { CalendarToday, AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
import dayjs from "dayjs";
import useFormStore from "../EmployeeMaster/store";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import { toast } from "react-toastify";
import { PageLoader } from "../pageload/PageLoader";

const FamilyDetails = () => {
  const { updateFormData, setActiveTab, formData, activeTab } = useFormStore();
  const [isLoading, setIsLoading] = useState(false);
  const [relationship,setRelationship]=useState([]);


  const [rows, setRows] = useState([
    { firstName: "", lastName: "", dateOfBirth: "", relationshipId : "", employeeId: null, },
  ]);

   const token = useAuthStore.getState().token;

  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([...rows, { firstName: "", lastName: "", dateOfBirth: "", relationshipId : "" , employeeId: null,}]);
  };

  const removeRow = (index) => {
    if (rows.length > 1) {
      const updatedRows = rows.filter((_, i) => i !== index);
      setRows(updatedRows);
    }
  };

  

  const handleBack = () => {
    updateFormData("familyDetails", rows);
    setActiveTab(1);
  };

  const fetchrelationData = async () => {
    setIsLoading(true);
    try {
      const token = useAuthStore.getState().token; 
      if (!token) {
        console.error("Token is missing");
        return;
      }

      const response = await api.get(
        "governance/relationship-list",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    setRelationship(response.data.data)
    
    } catch (error) {
      console.error("Error fetching family  data:", error);
    }
    finally{
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchrelationData();
}, []);



const handleSaveAndNext = async () => {
  const storedEmployeeId = useFormStore.getState().employeeId;

  if (!rows || rows.length === 0) {
    toast.error("No family details provided.");
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


useEffect(() => {
 

  if (activeTab === "FAMILY_DETAILS") {
    const storedData = formData?.familyDetails?.familyDetails || [];

  

    if (storedData.length > 0) {
      const formattedRows = storedData.map((row) => ({
        familyId: row?.familyId ?? null,
        firstName: row?.firstName ?? "",
        lastName: row?.lastName ?? "",
        dateOfBirth: row?.dateOfBirth ? dayjs(row.dateOfBirth).format("YYYY-MM-DD") : "",
        relationshipId: row?.relationsipId ?? "",
        employeeId: row?.employeeId ?? null,
      }));

     
      setRows(formattedRows);
    } else {
      
      setRows([{ firstName: "", lastName: "", dateOfBirth: "", relationshipId: "", employeeId: null }]);
    }
  }
}, [activeTab, formData]);


  return (
    <>
     {isLoading && <PageLoader/>}
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mt:5 }}>
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
                InputProps={{ sx: { height: '50px' } }}
              />
            </Grid>

            {/* Last Name */}
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Last Name"
                value={row.lastName}
                onChange={(e) => handleChange(index, "lastName", e.target.value)}
                InputProps={{ sx: { height: '50px' } }}
              />
            </Grid>

            {/* Birth Date */}
            <Grid item xs={3}>
              <MobileDatePicker
                label="Date Of Birth"
                value={row.dateOfBirth ? dayjs(row.dateOfBirth) : null}
                onChange={(newValue) =>
                  handleChange(index, "dateOfBirth", newValue ? newValue.format("YYYY-MM-DD") : "")
                }
                format="YYYY-MM-DD"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    InputProps: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <CalendarToday />
                        </InputAdornment>
                      ),
                    },
                    sx: {
                      '& .MuiInputBase-root': {
                        height: '50px', 
                      },
                    },
                    
                  },
                  actionBar: {
                    actions: [], 
                  },
                }}
                closeOnSelect={true}
              />
            </Grid>

            {/* Relationship Dropdown */}
            <Grid item xs={2}>
              <TextField
                select
                fullWidth
                label="Relationship"
                value={row.relationshipId}
                onChange={(e) => handleChange(index, "relationshipId", e.target.value)}
                InputProps={{ sx: { height: '50px' } }}
              >
                {relationship.map((option) => (
                  <MenuItem key={option.relationshipId} value={option.relationshipId}>
                    {option.relationshipName}
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
          <Button variant="contained" color="primary" onClick={handleSaveAndNext}>
            Save & Next
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
    </>
  );
};

export default FamilyDetails ;
