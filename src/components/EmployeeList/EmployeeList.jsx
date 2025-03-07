import React, { useEffect, useState } from "react";
import { 
  Box, MenuItem, Select, TextField, IconButton, 
  AccordionSummary, Typography, AccordionDetails 
} from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import Accordion from "@mui/material/Accordion";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import DataTable from 'react-data-table-component';
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FaPencilAlt } from "react-icons/fa";
import { encryptPayload } from "../../utils/encrypt";
import useFormStore from '../EmployeeMaster/store';
import { PageLoader } from "../pageload/PageLoader";
const customStyles = {
  table: {
    style: {
      border: "1px solid #ddd",
      borderRadius: "10px",
      overflow: "hidden",
      boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#ffffff",
      marginBottom: "1rem",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#005f73",
      color: "#ffffff",
      // fontSize: "14px",
      fontWeight: "600",
      // textTransform: "uppercase",
      letterSpacing: "0.5px",
      minHeight: "52px",
      borderBottom: "2px solid #003d4c",
    },
  },
  headCells: {
    style: {
      padding: "16px",
      textAlign: "center",
      fontWeight: "bold",
      borderRight: "1px solid rgba(255, 255, 255, 0.1)",
    },
  },
  rows: {
    style: {
      fontSize: "14px",
      fontWeight: "400",
      color: "#333",
      backgroundColor: "#ffffff",
      minHeight: "50px",
      transition: "background-color 0.2s ease-in-out",
      "&:not(:last-of-type)": {
        borderBottom: "1px solid #ddd",
      },
      "&:hover": {
        backgroundColor: "#e6f2f5",
        cursor: "pointer",
      },
    },
    stripedStyle: {
      backgroundColor: "#f9f9f9",
    },
  },
  cells: {
    style: {
      padding: "12px 16px",
      textAlign: "center",
      borderRight: "1px solid #ddd",
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid #ddd",
      padding: "10px",
      backgroundColor: "#f9f9f9",
    },
  },
  noData: {
    style: {
      padding: "24px",
      textAlign: "center",
      fontSize: "14px",
      color: "#777",
      backgroundColor: "#f9f9f9",
    },
  },
};
 


const EmployeeList = () => {
 const [serviceStatusList, setServiceStatusList] = useState([]);
const [serviceStatus, setServiceStatus] = useState("");
const [employeeList, setEmployeeList] = useState([]);
const [rowSize, setRowSize] = useState(10);
const [pageno, setPageno] = useState(1);
const [totalRows, setTotalRows] = useState(0);
const [filteredEmployees, setFilteredEmployees] = useState([]); 
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(true);
  const token = useAuthStore.getState().token;
  const [isLoading, setIsLoading] = useState(false);

const navigate = useNavigate();

const handleServiceStatusChange = (event) => {
  setServiceStatus(event.target.value);
  setPageno(1);
};

useEffect(() => {
  if (!search) {
    setFilteredEmployees(employeeList);
  } else {
    const filteredData = employeeList.filter(
      (row) =>
        row.StaffCode?.toLowerCase().includes(search.toLowerCase()) ||
        row.FirstName?.toLowerCase().includes(search.toLowerCase()) ||
        row.LastName?.toLowerCase().includes(search.toLowerCase()) ||
        row.ServiceStatus?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredEmployees(filteredData);
  }
}, [search, employeeList]);
  const handleExpandClick = (event) => {
    event.stopPropagation(); 
    setExpanded(!expanded);
  };
  useEffect(() => {
    if (serviceStatusList != null && serviceStatusList.length > 0) {
      const defaultStatus = serviceStatusList.find(status => status.ServiceStatusId === 1);
      if (defaultStatus) {
        setServiceStatus(defaultStatus.ServiceStatusId); 
      }
    }
  }, [serviceStatusList]);
  useEffect(() => {
    const fetchServiceStatus = async () => {
      setIsLoading(true)
      try {
        const response = await api.get("common/get-service-status-list", {
          headers: { Authorization: `Bearer ${token}` }, 
        });
    
        if (Array.isArray(response.data.data)) {
          setServiceStatusList(response.data.data);
        } else {
          setServiceStatusList([]);
        }
      } catch (err) {
        console.error("Error fetching service status:", err);
       
      }finally{
        setIsLoading(false)
      }
    };
  
    fetchServiceStatus();
}, [token]);
 


  const fetchEmployeeList = async (serviceId) => {
    setIsLoading(true)
    try { 
      const payload = {
        serviceId: serviceId,
        pageno: pageno,
        rowSize : rowSize,
      };
      const response = await api.post(
        "governance/get-employee-List",
        { dataObject: encryptPayload(payload) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
     
      const list = response.data?.data?.employeeList;
      if (Array.isArray(list)) {
        setEmployeeList(list);
      } else {
        console.error("Invalid employee list format:", response.data);
        setEmployeeList([]);
      }
    } catch (err) {
      console.error("Error fetching employee list:", err);
      alert("Error fetching employee list");
      setEmployeeList([]);
    }
    finally{
      setIsLoading(false)
    }
  };
  useEffect(() => {
  fetchEmployeeList();
}, [token]);

useEffect(() => {
  if (serviceStatus) {  
    fetchEmployeeList(serviceStatus);
  }
}, [token, rowSize, pageno, serviceStatus]);


const columns = [
  {
    name: "Sl No",
    cell: (row, index) => index + 1,
    sortable: true,
    width:"100px"
  },
  {
    name: "Employee Code",
    selector: (row) => row.StaffCode || "",
    cell: row => (
      <div 
        style={{
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          maxWidth: '150px'
        }} 
        title={row.StaffCode || ''}
      >
        {row.StaffCode || ''}
      </div>
    ),
    sortable: true,
  },
  {
    name: "First Name",
    selector: (row) => row.FirstName || "",
    cell: row => (
      <div 
        style={{
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          maxWidth: '150px'
        }} 
        title={row.FirstName || ''}
      >
        {row.FirstName || ''}
      </div>
    ),
    sortable: true,
  },
  {
    name: "Last Name",
    selector: (row) => row.LastName || "",
    cell: row => (
      <div 
        style={{
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          maxWidth: '150px'
        }} 
        title={row.LastName || ''}
      >
        {row.LastName || ''}
      </div>
    ),
    sortable: true,
  },
  {
    name: "Service Status",
    selector: (row) => row.ServiceStatus || "",
    cell: row => (
      <div 
        style={{
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          maxWidth: '150px'
        }} 
        title={row.ServiceStatus || ''}
      >
        {row.ServiceStatus || ''}
      </div>
    ),
    sortable: true,
  },
  {
    name: "Action",
     width:"150px",
    cell: (row) => (
      <Button
        variant="contained"
        size="small"
        onClick={() => handleEdit(row)}
        sx={{
            
          bgcolor: "#207785",
          color: "white",
          "&:hover": {
            bgcolor: "#1a5f6a",
          },
          minWidth: "auto",
          px: 2,
        }}
      >
        <Box
          sx={{
            bgcolor: "#1a5f6a", 
           
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 50, 
            height: 35,
            color: "#fff", 
            borderRadius:"5px"
          }}
        >
          <FaPencilAlt size={16} />
        </Box>
      </Button>
    ),
  }
  
  
];

const handleEdit = async (row) => {
 setIsLoading(true)
  try {

    const payload ={
      employeeId : row.EmployeeId,
      tabCode : 'BASIC_DETAILS'
    };
    const response = await api.post(
      `governance/get-employee-details-by-empid-tabcode`,
      { dataObject: encryptPayload(payload) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
    );

    if (response.status === 200) {
      const employeeData = response.data.data;

   
      useFormStore.getState().updateFormData("basicDetails", employeeData);
      useFormStore.getState().setEmployeeId(employeeData.employeeId);
     
     
      
      navigate("/employee-master");
    }
  } catch (error) {
    console.error("Error fetching employee details:", error);
    alert("Error fetching employee details");
  }finally{
    setIsLoading(false)
  }
};



const handleRowsPerPageChange = (newRowSize) => {
  setRowSize(prev => (prev !== newRowSize ? newRowSize : prev));
  setPageno(1);
};


  return (
    <>
    {isLoading && <PageLoader />}
    <Box sx={{ width: "100%", p: 2 }}>
      <Accordion expanded={expanded} sx={{ boxShadow: 3 }}>
        <AccordionSummary
          expandIcon={
            <IconButton
              onClick={handleExpandClick}
              sx={{
                backgroundColor: "#1a5f6a",
                color: "#fff",
                width: 30, 
                height: 30, 
                "&:hover": {
                  backgroundColor: "#207785",
                },
              }}
            >
              {expanded ? <RemoveIcon /> : <AddIcon />}
            </IconButton>
          }
          sx={{
            backgroundColor: "#e9ecef",
            borderBottom: "1px solid #1a5f6a",
          }}
        >
          <Typography variant="h6">Employee Master</Typography>
        </AccordionSummary>

        <AccordionDetails sx={{ backgroundColor: "#fafafa", p: 3 }}>
       
          <Box sx={{ display: "flex", justifyContent: "start", mb: 2 }}>
          <Select
      value={serviceStatus}
      onChange={handleServiceStatusChange}
      sx={{ minWidth: 200 }}
      displayEmpty
    >
      <MenuItem key="0" value="0">All</MenuItem>
      {serviceStatusList.map((status) => (
        <MenuItem key={status.ServiceStatusId} value={status.ServiceStatusId}>
          {status.ServiceStatusName}
        </MenuItem>
      ))}
    </Select>
    </Box>
          <Box sx={{ display: "flex", justifyContent:"space-between", gap: 2, mb: 2 }}>
          <Select
              value={rowSize}
              onChange={(e) => handleRowsPerPageChange(e.target.value)}
              size="small"
              sx={{ width: 150 }}
              displayEmpty
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
              <MenuItem value={200}>200</MenuItem>
          </Select>
            
          <TextField
              label="Search"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 250 }}
            />     
          </Box>
          <Box sx={{ width: "100%", overflowX: "auto" }}>
      <DataTable
        columns={columns}
        // data={employeeList}
        data={filteredEmployees}
        pagination
        paginationServer
            paginationTotalRows={totalRows}
            paginationPerPage={rowSize} 
            paginationDefaultPage={pageno}
            onChangePage={(page) => setPageno(page)}
            onChangeRowsPerPage={(newRowSize) => {
              setRowSize(newRowSize);
              setPageno(1);  
            }}
        customStyles={customStyles}
        responsive
      />
    </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
    </>
  );
};

export default EmployeeList;
