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
import { PageLoader } from "../pageload/PageLoader";
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
  
  const { activeTab, updateFormData, setActiveTab ,formData,setEmployeeCode} = useFormStore();
  const [isLoading, setIsLoading] = useState(false);
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
    setActiveTab('BASIC_DETAILS');
  };

 
  
  const handleSaveAndNext = async () => {
    const storedEmployeeId = useFormStore.getState().employeeId;
    
    if (!rows || rows.length === 0) {
      toast.error("No employment data provided.");
      return;
    }
  setIsLoading(true)
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
  
      const encryptedPayload = encryptPayload(payload);
  
      const response = await api.post(
        "governance/save-or-update-employement",
        { dataObject: encryptedPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.data?.outcome) {
        const { employeeCode, employeeId } = response.data.data;
  
        useFormStore.getState().setEmployeeCode(employeeCode);
        useFormStore.getState().setEmployeeId(employeeId);
  
       
        updateFormData("employmentDetails", {
          employeeDeptMap: payload.employeeDeptMap,
          ServiceStatusId: serviceStatus ?? null,
        });
  
        toast.success("Data saved successfully!", { position: "top-right", autoClose: 3000 });
  
        setActiveTab("FAMILY_DETAILS");
      } else {
        toast.error(response.data?.message || "Failed to save employment details.");
      }
    } catch (error) {
      console.error("Error saving employment details:", error);
      toast.error("An error occurred while saving. Please try again.");
    }finally{
      setIsLoading(false)
    }
  };
  
  
  useEffect(() => {
    if (activeTab === "EMPLOYMENT_DETAILS") {
      const storedData = formData?.employmentDetails;

      if (storedData) {
        
        setEmployeeCode(storedData?.staffCode || ""); 
        setServiceStatus(storedData?.serviceStatusId || "");

      
        if (storedData?.employmentDetails) {
          const formattedRows = storedData.employmentDetails.map((row) => ({
            empDeptMapId: row?.employeeDeptMapId ?? null,
            role: row?.roleId ?? "",
            organization: row?.organizationId ?? "",
            company: row?.companyId ?? "",
            office: row?.officeId ?? "",
            department: row?.departmentId ?? "",
            designation: row?.designationId ?? "",
            fromDate: row?.fromDate ? new Date(row.fromDate).toISOString().split("T")[0] : "",
            endDate: row?.endDate ? new Date(row.endDate).toISOString().split("T")[0] : "",
            isPrimary: row?.isPrimary ? "Yes" : "No",
          }));

          setRows(formattedRows);
        }
      }
    }
  }, [activeTab, formData]);
  
  return (
    <>
    {isLoading && <PageLoader />}
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 5,mt:3 }}>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Employee Code"
              value={formData?.employmentDetails?.staffCode || ""}
              InputProps={{ readOnly: true ,sx: { height: '50px' }}}
              
            />
          </Grid>

          <Grid item xs={3}>
            <TextField
              select
              fullWidth
              label="Service Status"
              value={serviceStatus}
              InputProps={{ sx: { height: '50px' } }}
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
           <Grid item xs={3} sx={{mb:3}} >
           <TextField
                select
                fullWidth
                label="Organization"
                value={row.organization} 
                InputProps={{ sx: { height: '50px' } }}
                onChange={(e) => handleChange(index, "organization", e.target.value)}
              >
                {organizations.map((org) => (
                  <MenuItem key={org.OrganizationId} value={org.OrganizationId}>
                    {org.OrganizationName}
                  </MenuItem>
                ))}
         </TextField>
            </Grid>

            <Grid item xs={3} sx={{mb:3}}>
              <TextField
                select
                fullWidth
                label="Company"
                value={row.company}
                InputProps={{ sx: { height: '50px' } }}
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

            <Grid item xs={3} sx={{mb:3}}>
              <TextField
                select
                fullWidth
                label="Office"
                value={row.office}
                InputProps={{ sx: { height: '50px' } }}
                onChange={(e) => handleChange(index, "office", e.target.value)}
              >
                { offices.map((ofc) => (
                  <MenuItem key={ofc.officeId} value={ofc.officeId}>
                    {ofc.officeName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={3} sx={{mb:3}}>
              <TextField
                select
                fullWidth
                label="Department"
                value={row.department}
                InputProps={{ sx: { height: '50px' } }}
                onChange={(e) => handleChange(index, "department", e.target.value)}
              >
                {departments.map((dep) => (
                  <MenuItem key={dep.departmentId} value={dep.departmentId}>
                    {dep.departmentName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={3} sx={{mb:3}}>
              <TextField
                select
                fullWidth
                label="Designation"
                value={row.designation}
                InputProps={{ sx: { height: '50px' } }}
                onChange={(e) => handleChange(index, "designation", e.target.value)}
              >
                {designations.map((desi) => (
                  <MenuItem key={desi.designationId} value={desi.designationId}>
                    {desi.designationName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={3} sx={{mb:3}}>
              <TextField
                select
                fullWidth
                label="Role"
                value={row.role}
                InputProps={{ sx: { height: '50px' } }}
                onChange={(e) => handleChange(index, "role", e.target.value)}
              >
                {roles?.map((role) => (
                  <MenuItem key={role.RoleId} value={role.RoleId}>
                    {role.RoleName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

           

            <Grid item xs={3} sx={{mb:3}}>
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

            <Grid item xs={3} sx={{mb:3}}>
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
                    sx: {
                      '& .MuiInputBase-root': {
                        height: '50px', 
                      },
                    },
                  },
                  actionBar: {
                    actions: [], // Removes both "OK" and "Clear" buttons
                  },
                }}
                closeOnSelect={true}
              />
            </Grid>

            <Grid item xs={3} >
            <TextField
              select
              fullWidth
              label="Is Primary"
              value={row.isPrimary}
              InputProps={{ sx: { height: '50px' } }}
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
    </>
  );
};

export default EmploymentDetails;



