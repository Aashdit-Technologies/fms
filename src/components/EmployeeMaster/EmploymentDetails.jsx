import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  IconButton,
  Typography,
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
import { FormControl } from "react-bootstrap";


const fetchDropdownData = async () => {
  const endpoints = [
    "common/organization-list",
    "common/company-list",
    "common/get-department-list",
    "common/get-designation-list",
    "common/role-list",
    "common/get-service-status-list",
    "common/get-office-list",
  ];

  const requests = endpoints.map((endpoint) =>
    api
      .get(endpoint)
      .then((res) => {
       
        const data = res.data.data || res.data; 
        return { success: true, data };
      })
      .catch((error) => {
        console.error(`Error fetching ${endpoint}:`, error);
        return { success: false, data: [] };
      })
  );

  const responses = await Promise.allSettled(requests);

  return responses.map((res) =>
    res.status === "fulfilled" && res.value.success ? res.value.data : []
  );
};

const EmploymentDetails = ({ handleTabChange }) => {
  
  const { activeTab, updateFormData, setActiveTab ,formData,setEmployeeCode,employeeId,employeeCode} = useFormStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const token = useAuthStore((state) => state.token);
  const { data } = useQuery({
    queryKey: ["dropdownData"],
    queryFn: fetchDropdownData,
  });
  
  const [organizations, companies, departments, designations, roles, ServiceStatus, offices] =
    data || [[], [], [], [], [], [], []];
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
      isPrimary: "Yes",
      employeeId: null,
    },
  ]);

  const handleChange = (index, field, value) => {
    const updatedRows = rows.map((row, i) => {
      if (i === index) {
        return { ...row, [field]: value };
      }
      return row;
    });
  
    setRows(updatedRows);

    const newErrors = { ...errors };
    delete newErrors[`${field}_${index}`];
    setErrors(newErrors);
  };
  const addRow = () => {
    const isAllRowsValid = rows.every((row, index) => {
      return (
        row.organization &&
        row.department &&
        row.designation &&
        row.role &&
        row.fromDate &&
        row.isPrimary
      );
    });
  
    if (!isAllRowsValid) {
      toast.error("Please fill all mandatory fields in all rows before adding a new row.");
      return; 
    }
  
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
        EmployeeId: "",
      },
    ]);
  };

  const removeRow = (index) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const handleBack = () => {
    if (typeof handleTabChange !== "function") {
      console.error("handleTabChange is not a function! Received:", handleTabChange);
      return;
    }
    handleTabChange(null, "BASIC_DETAILS");
  };

  const handleSaveAndNext = async () => {
    const storedEmployeeId = useFormStore.getState().employeeId;
 
 const isValid = validateEmploymentFields(rows,serviceStatus);

 if (!isValid) {
   toast.error("Please fill all the required fields.");
   return; 
 }

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
        const { employeeCode, employeeId,success_msg } = response.data.data;
  
        useFormStore.getState().setEmployeeCode(employeeCode);
        useFormStore.getState().setEmployeeId(employeeId);
  
       
        updateFormData("employmentDetails", {
          employeeDeptMap: payload.employeeDeptMap,
          ServiceStatusId: serviceStatus ?? null,
        });
  
         toast.success(success_msg);
  
        setActiveTab("FAMILY_DETAILS");
      } else {
        toast.error(response.data?.message || "Failed to save employment details.");
      }
    } catch (error) {
     
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

      
        if (storedData?.employmentDetails && storedData?.employmentDetails.length > 0) {
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
        else {
          
          setRows([
            {
              organization: "",
              company: "",
              office: "",
              department: "",
              designation: "",
              role: "",
              fromDate: "",
              endDate: "",
              isPrimary: "Yes",
              employeeId: null,
            },
          ]);
      }
    }
    }
  }, [activeTab, formData]);

  const validateEmploymentFields = (rows) => {
    const newErrors = {};
    let isValid = true;
  
    if (!serviceStatus) {
      newErrors.serviceStatus = "Service Status is required.";
      isValid = false;
    }
  
    rows.forEach((row, index) => {
      if (!row.organization) {
        newErrors[`organization_${index}`] = "Organization is required.";
        isValid = false;
      }
      if (!row.department) {
        newErrors[`department_${index}`] = "Department is required.";
        isValid = false;
      }
      if (!row.designation) {
        newErrors[`designation_${index}`] = "Designation is required.";
        isValid = false;
      }
      if (!row.role) {
        newErrors[`role_${index}`] = "Role is required.";
        isValid = false;
      }
      if (!row.fromDate) {
        newErrors[`fromDate_${index}`] = "From Date is required.";
        isValid = false;
      }
      if (!row.isPrimary) {
        newErrors[`isPrimary_${index}`] = "Is Primary is required.";
        isValid = false;
      } 

      if (row.endDate && row.fromDate && dayjs(row.endDate).isBefore(dayjs(row.fromDate), "day")) {
        newErrors[`endDate_${index}`] = "End Date must be after From Date.";
        isValid = false;
      }
    });
  
    setErrors(newErrors);
    return isValid;
  };
  
 
  useEffect(() => {
    if (formData?.basicDetails?.employeeCode) {
      setEmployeeCode(formData.basicDetails.employeeCode);
    }
  }, [formData?.basicDetails?.employeeCode, setEmployeeCode]);
  
  return (
    <>
    {isLoading && <PageLoader />}
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Grid container spacing={2}  sx={{ mb: 5,mt:3 }}>
         
          <Grid item xs={3} sx={{ mb: 3 }}>
          
          <TextField
            fullWidth
            label="Employee Code"
            value={employeeCode || ""}
            InputProps={{ readOnly: true, sx: { height: "50px" } }}
          />
          
        </Grid>

          <Grid item xs={3} sx={{ mb: 3 }}>
            <TextField
              select
              fullWidth
              
              label={
                <>
                  Service Status <span style={{ color: "red" }}>*</span>
                </>
              }
              value={serviceStatus}
              InputProps={{ sx: { height: '50px' } }} 
           
              onChange={(e) => {
                setServiceStatus(e.target.value); 
                setErrors((prevErrors) => ({ ...prevErrors, serviceStatus: "" })); 
              }}
              error={!!errors.serviceStatus} 
              helperText={errors.serviceStatus} 
            >
               <MenuItem value="" >
                --Select ServiceStatus--
              </MenuItem>
              {ServiceStatus?.map((serv) => (
                <MenuItem key={serv.ServiceStatusId} value={serv.ServiceStatusId}>
                  {serv.ServiceStatusName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%", }}>
              <Typography sx={{ color: "red" }}>
                *Note: First row must be a primary role.
              </Typography>
            </Box>
          </Grid>
     </Grid>
        {rows.map((row, index) => (
          <Grid
            container
            spacing={2}
            // alignItems="center"
            key={index}
            sx={{ borderBottom: "1px solid #ddd", pb: 2, mb: 2 }}
          >
           <Grid item xs={3} sx={{ mb:3}} >
           <TextField
                select
                fullWidth
                
                label={
                  <>
                  Organization <span style={{color:"red"}}>*</span>
                  </>
                }
                value={row.organization} 
                InputProps={{ sx: { height: '50px' } }}
                onChange={(e) => handleChange(index, "organization", e.target.value)}
                error={!!errors[`organization_${index}`]}
                helperText={errors[`organization_${index}`]} 

              >
                 <MenuItem value="" >
                --Select organization--
              </MenuItem>
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
                 <MenuItem value="" >
                --Select Company--
              </MenuItem>
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
              value={row.office || ""}
              InputProps={{ sx: { height: '50px' } }}
              onChange={(e) => handleChange(index, "office", e.target.value)}
            >
              <MenuItem value="" >
                --Select office--
              </MenuItem>
              {(offices ?? []).map((ofc) => (
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
                
                label={
                  <>
                  Department <span style={{color:"red"}}>*</span>
                  </>
                }
                value={row.department}
                InputProps={{ sx: { height: '50px' } }}
                onChange={(e) => handleChange(index, "department", e.target.value)}
                error={!!errors[`department_${index}`]}
                helperText={errors[`department_${index}`]} 
              >
                 <MenuItem value="" >
                --Select department--
              </MenuItem>
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
                
                label={
                  <>
                  Designation <span style={{color:"red"}}>*</span>

                  </>
                }
                value={row.designation}
                InputProps={{ sx: { height: '50px' } }}
                onChange={(e) => handleChange(index, "designation", e.target.value)}
                error={!!errors[`designation_${index}`]}
                helperText={errors[`designation_${index}`]} 
              >
                 <MenuItem value="" >
                --Select designation--
              </MenuItem>
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
                
                label={
                  <>
                  Role<span style={{color:"red"}}>*</span>

                  </>
                }
                value={row.role}
                InputProps={{ sx: { height: '50px' } }}
                onChange={(e) => handleChange(index, "role", e.target.value)}
                error={!!errors[`role_${index}`]}
                helperText={errors[`role_${index}`]} 
              >
                <MenuItem value="" >
                --Select role--
              </MenuItem>
                {roles?.map((role) => (
                  <MenuItem key={role.RoleId} value={role.RoleId}>
                    {role.RoleName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={3} sx={{mb:3}}>
              <MobileDatePicker
               
                label={
                  <>
                 From Date <span style={{color:"red"}}>*</span>
                  </>
                }
                value={row.fromDate ? dayjs(row.fromDate) : null}
                onChange={(newValue) =>
                  handleChange(index, "fromDate", newValue ? newValue.format("YYYY-MM-DD") : "")
                }
                error={!!errors[`fromDate_${index}`]}
                helperText={errors[`fromDate_${index}`]} 
               
                format="YYYY-MM-DD"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors[`fromDate_${index}`], 
                    helperText: errors[`fromDate_${index}`], 
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

        

          <Grid item xs={3} sx={{ mb: 3 }}>
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
                  error: !!errors[`endDate_${index}`],  
                  helperText: errors[`endDate_${index}`] || "", 
                  InputProps: {
                    endAdornment: <CalendarToday color="action" />,
                  },
                  sx: {
                    "& .MuiInputBase-root": {
                      height: "50px",
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
                <TextField
                  select
                  fullWidth
                  label={
                    <>
                      Is Primary <span style={{ color: "red" }}>*</span>
                    </>
                  }
                  value={row.isPrimary} 
                  InputProps={{ sx: { height: "50px" } }}
                  onChange={(e) => handleChange(index, "isPrimary", e.target.value)}
                  error={!!errors[`isPrimary_${index}`]}
                  helperText={errors[`isPrimary_${index}`]}
                >
                  {index === 0 ? (
                    <MenuItem key="Yes" value="Yes">
                      Yes
                    </MenuItem>
                  ) : (
                    <MenuItem key="No" value="No">
                      No
                    </MenuItem>
                  )}
                </TextField>
              </Grid>


            <Grid item xs={1}>
              {index === 0 && (
                <IconButton color="primary" onClick={addRow}>
                  <AddCircleOutline />
                </IconButton>
              )}
              {index > 0 && (
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
             {employeeId ? 'Update & Next'  :'Save & Next'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
    </>
  );
};

export default EmploymentDetails;



