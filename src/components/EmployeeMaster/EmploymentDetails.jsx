import React, { useEffect, useState } from "react";
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
import { useQuery } from "@tanstack/react-query";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";

import { encryptPayload } from "../../utils/encrypt";
import {toast } from "react-toastify";
const fetchDropdownData = async () => {
  const endpoints = [
    "common/organization-list",
    "common/company-list",
    "common/get-department-list",
    "common/get-designation-list",
    "common/role-list",
    "common/get-service-status-list",
    "common/get-office-list"
  ];

  const requests = endpoints.map((endpoint) => api.get(endpoint));
  const responses = await Promise.all(requests);
  return responses.map((res) => res.data.data);
};

const EmploymentDetails = () => {
  const { employeeCode } = useFormStore();
  const {employeeId, activeTab, updateFormData, setActiveTab ,formData,} = useFormStore();
  const token = useAuthStore((state) => state.token);
  const { data } = useQuery({
    queryKey: ["dropdownData"],
    queryFn: fetchDropdownData,
  });
  const [serviceStatus, setServiceStatus] = useState("");
  const [rows, setRows] = useState([
    {
      organization: "",
      company: "",
      office: "",
      department: "",
      designation: "",
      role: "",
      fromDate: "",
      endDate: "",
      isPrimary: "No",
      employeeId: null,
    },
  ]);

  const [organizations, companies, departments, designations, roles, ServiceStatus,offices] = data || [[], [], [], [], [], [], []];

  const handleChange = (index, field, value) => {
    const updatedRows = rows.map((row, i) => {
      if (i === index) {
        
        return { ...row, [field]: value };
      } else if (field === "isPrimary" && value === "Yes") {
      
        return { ...row, isPrimary: "No" };
      }
      return row;
    });

    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        organization: "",
        company: "",
        office: "",
        department: "",
        designation: "",
        role: "",
        fromDate: "",
        endDate: "",
        isPrimary: "No",
        EmployeeId:""
      },
    ]);
  };

  const removeRow = (index) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

 

  const handleBack = () => {
    updateFormData("employmentDetails", rows);
    setActiveTab(0);
  };

 
  const handleSaveAndNext = async () => {
    const storedEmployeeId = useFormStore.getState().employeeId;
    console.log("Stored EmployeeId:", storedEmployeeId);
    
    
    if (!rows || rows.length === 0) {
      toast.error("No employment data provided.");
      return;
    }
  
    try {
      const payload = {
        ServiceStatusId: serviceStatus ?? null,
        EmployeeId: storedEmployeeId ?? null,
        employeeDeptMap: rows.map((row) => ({
          empDeptMapId: row?.empDeptMapId ?? null,
          roleId: row?.role ?? null,
          organizationId: row?.organization ?? null,
          companyId: row?.company ?? null,
          officeId: row?.office ?? null,
          departmentId: row?.department ?? null,
          sectionId: row?.section ?? null,
          designationId: row?.designation ?? null,
          fromDate: row?.fromDate ?? null,
          endDate: row?.endDate ?? null,
          isPrimary: row?.isPrimary === "Yes",
        })),
      };
  
      console.log("Payload before encryption:", JSON.stringify(payload, null, 2));
  
      const encryptedPayload = encryptPayload(payload);
  
      console.log("Encrypted Payload:", encryptedPayload);
  
      const response = await api.post(
        "governance/save-or-update-employement",
        { dataObject: encryptedPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log("Response:", response);
  
      if (response.data?.outcome) {
        const { EmployeeCode, EmployeeId } = response.data.data;
  
        useFormStore.getState().setEmployeeCode(EmployeeCode);
        useFormStore.getState().setEmployeeId(EmployeeId); 
  
        updateFormData("employmentDetails", { ...payload, EmployeeId });
  
        toast.success("Data saved successfully!", { position: "top-right", autoClose: 3000 });
        setActiveTab(2);
      } else {
        toast.error(response.data?.message || "Failed to save employment details.");
      }
    } catch (error) {
      console.error("Error saving employment details:", error);
      toast.error("An error occurred while saving. Please try again.");
    }
  };

  
  useEffect(() => {
    if (activeTab === 1) {
      const storedData = formData.employmentDetails;
      if (storedData && storedData.organization) {
        setRows([storedData]); 
        setServiceStatus(storedData.serviceStatus || "");
      } else {
        fetchEmployeeDetails();
      }
    }
  }, [activeTab]);

   
  const fetchEmployeeDetails = async () => {
    if (!employeeId) return;

    try {
      const response = await api.get("governance/get-employee-details-by-empid-tabcode", {
        params: { employeeId, tabCode: 2 },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.outcome) {
        const employeeData = response.data.data;

        // Set Service Status
        setServiceStatus(employeeData.serviceStatus || "");

        // Map response data to state
        const mappedRow = {
          empDeptMapId: employeeData.employeeDeptMapId || null,
          organization: employeeData.organizationId || "",
          company: employeeData.companyId || "",
          office: employeeData.officeId || "",
          department: employeeData.departmentId || "",
          designation: employeeData.designationId || "",
          role: employeeData.roleId || "",
          fromDate: employeeData.fromDate || "",
          endDate: employeeData.endDate || "",
          isPrimary: employeeData.isPrimary ? "Yes" : "No",
        };

        setRows([mappedRow]);

        // Store data in Zustand
        updateFormData("employmentDetails", mappedRow);
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
      toast.error("Failed to load employment details.");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Employee Code"
              value={employeeCode}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={3}>
            <TextField
              select
              fullWidth
              label="Service Status"
              value={serviceStatus}
              onChange={(e) => setServiceStatus(e.target.value)}
            >
              {ServiceStatus?.map((serv) => (
                <MenuItem key={serv.ServiceStatusId} value={serv.ServiceStatusId}>
                  {serv.ServiceStatusName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {rows.map((row, index) => (
          <Grid
            container
            spacing={2}
            alignItems="center"
            key={index}
            sx={{ borderBottom: "1px solid #ddd", pb: 2, mb: 2 }}
          >
           <Grid item xs={3}>
              <TextField
                select
                fullWidth
                label="Organization"
                value={row.organization}
                onChange={(e) => handleChange(index, "organization", e.target.value)}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: 300, 
                        width: 150, 
                      },
                    },
                  },
                }}
              
              >
                {organizations.map((org) => (
                  <MenuItem
                    key={org.OrganizationId}
                    value={org.OrganizationId}
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden", 
                      textOverflow: "ellipsis", 
                      display: "block", 
                    }}
                  >
                    {org.OrganizationName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={3}>
              <TextField
                select
                fullWidth
                label="Company"
                value={row.company}
                onChange={(e) => handleChange(index, "company", e.target.value)}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: 300, 
                        width: 150, 
                      },
                    },
                  },
                }}
              >
                {companies.map((cmpg) => (
                  <MenuItem key={cmpg.CompanyId} value={cmpg.CompanyId}
                  style={{
                    whiteSpace: "nowrap", 
                    overflow: "hidden", 
                    textOverflow: "ellipsis", 
                    display: "block", 
                  }} >
                    {cmpg.CompanyName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={3}>
              <TextField
                select
                fullWidth
                label="Office"
                value={row.office}
                onChange={(e) => handleChange(index, "office", e.target.value)}
              >
                { offices.map((ofc) => (
                  <MenuItem key={ofc.officeId} value={ofc.officeId}>
                    {ofc.officeName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={3}>
              <TextField
                select
                fullWidth
                label="Department"
                value={row.department}
                onChange={(e) => handleChange(index, "department", e.target.value)}
              >
                {departments.map((dep) => (
                  <MenuItem key={dep.departmentId} value={dep.departmentId}>
                    {dep.departmentName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={3}>
              <TextField
                select
                fullWidth
                label="Designation"
                value={row.designation}
                onChange={(e) => handleChange(index, "designation", e.target.value)}
              >
                {designations.map((desi) => (
                  <MenuItem key={desi.designationId} value={desi.designationId}>
                    {desi.designationName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={3}>
              <TextField
                select
                fullWidth
                label="Role"
                value={row.role}
                onChange={(e) => handleChange(index, "role", e.target.value)}
              >
                {roles?.map((role) => (
                  <MenuItem key={role.RoleId} value={role.RoleId}>
                    {role.RoleName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* <Grid item xs={3}>
              <TextField
                select
                fullWidth
                label="ServiceStatus"
                value={row.ServiceStatusId}
                onChange={(e) => handleChange(index, "ServiceStatusId", e.target.value)}
              >
                {ServiceStatus?.map((serv) => (
                  <MenuItem key={serv.ServiceStatusId} value={serv.ServiceStatusId}>
                    {serv.ServiceStatusName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid> */}

            <Grid item xs={3}>
              <MobileDatePicker
                label="From Date"
                value={row.fromDate ? dayjs(row.fromDate) : null}
                onChange={(newValue) =>
                  handleChange(index, "fromDate", newValue ? newValue.format("YYYY-MM-DD") : "")
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

            <Grid item xs={3}>
              <MobileDatePicker
                label="End Date"
                value={row.endDate ? dayjs(row.endDate) : null}
                onChange={(newValue) =>
                  handleChange(index, "endDate", newValue ? newValue.format("YYYY-MM-DD") : "")
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

            <Grid item xs={3}>
            <TextField
              select
              fullWidth
              label="Is Primary"
              value={row.isPrimary}
              onChange={(e) => handleChange(index, "isPrimary", e.target.value)}
            >
              {["Yes", "No"].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

            <Grid item xs={1}>
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

        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          <Button variant="contained" color="secondary" onClick={handleBack}>
            Back
          </Button>
          <Button variant="contained" color="primary"  onClick={handleSaveAndNext}>
            Save & Next
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default EmploymentDetails;



