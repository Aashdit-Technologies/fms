import React, { useState } from 'react';
import { Box, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import BasicDetails from '../EmployeeMaster/BasicDetails';
import EmploymentDetails from '../EmployeeMaster/EmploymentDetails';
import FamilyDetails from '../EmployeeMaster/FamilyDetails';
import Address from '../EmployeeMaster/Address';
import Education from '../EmployeeMaster/Education';
import PreviousEmployment from '../EmployeeMaster/PreviousEmployment';
import Bank from '../EmployeeMaster/Bank';
import OtherSkills from '../EmployeeMaster/OtherSkills';
import useFormStore from '../EmployeeMaster/store';

const tabComponents = [
  { label: 'Basic Details', component: <BasicDetails /> },
  { label: 'Employment Details', component: <EmploymentDetails /> },
  { label: 'Family Details', component: <FamilyDetails /> },
  { label: 'Address', component: <Address /> },
  { label: 'Education', component: <Education /> },
  { label: 'Previous Employment', component: <PreviousEmployment /> },
  { label: 'Bank', component: <Bank /> },
  { label: 'Other Skills', component: <OtherSkills /> },
];

const EmployeeForm = () => {
  const { activeTab, setActiveTab } = useFormStore();
  const [expanded, setExpanded] = useState(true); 

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  const toggleAccordion = (event) => {
    event.stopPropagation(); 
    setExpanded(!expanded);
  };

  return (
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
      Update Employee Details
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
                marginTop:5,
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
                <Tab key={index} label={tab.label} />
            ))}
            </Tabs>
          <Box sx={{ mt: 3 }}>{tabComponents[activeTab].component}</Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default EmployeeForm;


