import React, { useState } from 'react';
import { Box, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import BasicDetails from '../EmployeeMaster/BasicDetails';
import EmploymentDetails from '../EmployeeMaster/EmploymentDetails';
import FamilyDetails from '../EmployeeMaster/FamilyDetails';
import Address from '../EmployeeMaster/Address';
import Education from '../EmployeeMaster/Education';
// import PreviousEmployment from '../EmployeeMaster/PreviousEmployment';
// import Bank from '../EmployeeMaster/Bank';
// import OtherSkills from '../EmployeeMaster/OtherSkills';
import useFormStore from '../EmployeeMaster/store';
import { PageLoader } from "../pageload/PageLoader";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import { toast } from "react-toastify";



const EmployeeForm = () => {

  const { activeTab, setActiveTab } = useFormStore();
  const employeeId = useFormStore((state) => state.employeeId);
  const [expanded, setExpanded] = useState(true); 
  const [isLoading, setIsLoading] = useState(false);


  const toggleAccordion = (event) => {
    event.stopPropagation(); 
    setExpanded(!expanded);
  };

 
  const handleTabChange = async (_, newValue) => {

    if (newValue === "EMPLOYMENT_DETAILS" && !employeeId) {
      toast.error("Please fill the Basic Details first.");
      return; 
    }
    setActiveTab(newValue);
  
    if (employeeId) {
      setIsLoading(true);
      try {
        const token = useAuthStore.getState().token;
        const payload = {
          employeeId: employeeId,
          tabCode: newValue,
        };
  
        const response = await api.post(
          "governance/get-employee-details-by-empid-tabcode",
          { dataObject: encryptPayload(payload) },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (response.status === 200) {
          const employeeData = response.data.data;
          if (newValue === "BASIC_DETAILS") {
            useFormStore.getState().updateFormData("basicDetails", employeeData);
            useFormStore.getState().setEmployeeId(employeeData.employeeId);
          } else if (newValue === "EMPLOYMENT_DETAILS") {
            useFormStore.getState().updateFormData("employmentDetails", employeeData);
            useFormStore.getState().setEmployeeId(employeeData.employeeId);
          } else if (newValue === "FAMILY_DETAILS") {
            useFormStore.getState().updateFormData("familyDetails", employeeData);
          } else if (newValue === "ADDRESS") {
            useFormStore.getState().updateFormData("address", employeeData);
          } else if (newValue === "EDUCATION") {
            useFormStore.getState().updateFormData("education", employeeData);
          } else if (newValue === "PREVIOUS_EMPLOYMENT") {
            useFormStore.getState().updateFormData("previousEmployment", employeeData);
          } else if (newValue === "BANK") {
            useFormStore.getState().updateFormData("bank", employeeData);
          } else if (newValue === "OTHER_SKILLS") {
            useFormStore.getState().updateFormData("otherSkills", employeeData);
          }
        }
      } catch (error) {
        console.error("Error fetching employee details:", error);
        toast.error("Error fetching employee details");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const tabComponents = [
  { key: "BASIC_DETAILS", label: "Basic Details", component: <BasicDetails /> },
  { key: "EMPLOYMENT_DETAILS", label: "Employment Details",  component: <EmploymentDetails handleTabChange={handleTabChange}/>},
  { key: "FAMILY_DETAILS", label: "Family Details", component: <FamilyDetails handleTabChange={handleTabChange} /> },
  { key: "ADDRESS", label: "Address", component: <Address handleTabChange={handleTabChange} /> },
  { key: "EDUCATION", label: "Education", component: <Education  handleTabChange={handleTabChange}/> },
  // { key: "PREVIOUS_EMPLOYMENT", label: "Previous Employment", component: <PreviousEmployment /> },
  // { key: "BANK", label: "Bank", component: <Bank /> },
  // { key: "OTHER_SKILLS", label: "Other Skills", component: <OtherSkills /> },
];
  return (
    < >
      {isLoading && <PageLoader />}
    <Box sx={{ width: '100%', margin: 'auto', mt: 3 }}>
     <Accordion expanded={expanded} square elevation={0} sx={{ backgroundColor: '#f5f8fa' }}>
     <AccordionSummary
      expandIcon={
        <IconButton 
        onClick={toggleAccordion} 
        sx={{
          backgroundColor: "#1a5f6a",
          color: "#fff",
          width: 30, 
          height: 30, 
          
          "&:hover": {
            backgroundColor: "#207785",
          },
        }}>
          {expanded ? <RemoveIcon /> : <AddIcon />}
        </IconButton>
      }
      aria-controls="panel1a-content"
      id="panel1a-header"
      sx={{
        backgroundColor: "#e9ecef",
        borderBottom: "1px solid #1a5f6a",
      }}
    >
      <Typography variant="h6" >
      {employeeId ? 'Update Employee Details'  :'Save Employee Details'}
      </Typography>
    </AccordionSummary > 
        <AccordionDetails>
      
            <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTabs-indicator": {
                display: "none",
              },
              "& .MuiTab-root": {
                backgroundColor: "#0f6773",
                color: "#fff",
                fontWeight: "bold",
                borderRadius: "5px",
                marginRight: 1,
                marginTop: 5,
                transition: "0.3s",
              },
              "& .Mui-selected": {
                backgroundColor: "#fff",
                color: "#0f6773",
                border: "2px solid #0f6773",
              },
            }}
          >
            {tabComponents.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                value={tab.key}
                disabled={
                  ["FAMILY_DETAILS", "ADDRESS", "EDUCATION", "EMPLOYMENT_DETAILS"].includes(tab.key) &&
                  !employeeId
                }
                sx={{
                  color: "white", 
                  "&.Mui-disabled": {
                    color: "white", 
                    opacity: 0.5,
                  },
                }}
              />
            ))}
          </Tabs>
          <Box sx={{ mt: 3 }}>{tabComponents.find((tab) => tab.key === activeTab)?.component || null}</Box>
        </AccordionDetails>
      </Accordion>
    </Box>
    </>
  );
};

export default EmployeeForm;


