import { Box, Grid, Typography } from "@mui/material";
import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import ReactSelect from "react-select";
import { useMutation } from "@tanstack/react-query";
import { encryptPayload } from "../../../utils/encrypt";
import api from "../../../Api/Api";

const UploadDocumentsModal = ({ open, onClose, organizations }) => {
  const [selectedValues, setSelectedValues] = useState({
    organization: null,
    company: null,
    office: null,
    department: null,
    designation: null,
  });

  const [options, setOptions] = useState({
    companies: [],
    offices: [],
    departments: [],
    designations: [],
  });

  // Generic API Fetch Function
  const fetchData = useMutation({
    mutationFn: async ({ endpoint, payload }) => {
      const encryptedData = encryptPayload(payload);
      const response = await api.post(endpoint, { dataObject: encryptedData });
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (data.outcome) {
        const { endpoint } = variables;
        if (endpoint.includes("get-companies")) setOptions(prev => ({ ...prev, companies: data.data }));
        if (endpoint.includes("get-offices")) setOptions(prev => ({ ...prev, offices: data.data }));
        if (endpoint.includes("get-departments")) setOptions(prev => ({ ...prev, departments: data.data }));
        if (endpoint.includes("get-designations")) setOptions(prev => ({ ...prev, designations: data.data }));
      }
    },
  });

  // Handle Organization Selection
  const handleSelectionChange = (field, selectedOption) => {
    setSelectedValues(prev => ({ ...prev, [field]: selectedOption }));

    // Reset dependent fields
    if (field === "organization") {
      setOptions({ companies: [], offices: [], departments: [], designations: [] });
      fetchData.mutate({ endpoint: "/level/get-companies", payload: { organizationId: selectedOption.value } });
    } else if (field === "company") {
      setOptions(prev => ({ ...prev, offices: [], departments: [], designations: [] }));
      fetchData.mutate({ endpoint: "/level/get-offices", payload: { organizationId: selectedValues.organization.value, companyId: selectedOption.value } });
    } else if (field === "office") {
      setOptions(prev => ({ ...prev, departments: [], designations: [] }));
      fetchData.mutate({ endpoint: "/level/get-departments", payload: { organizationId: selectedValues.organization.value, companyId: selectedValues.company.value, officeId: selectedOption.value } });
    } else if (field === "department") {
      setOptions(prev => ({ ...prev, designations: [] }));
      fetchData.mutate({ endpoint: "/level/get-designations", payload: { organizationId: selectedValues.organization.value, companyId: selectedValues.company.value, officeId: selectedValues.office.value, departmentId: selectedOption.value } });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ bgcolor: "background.paper", padding: 3, borderRadius: 2, maxWidth: "800px", margin: "auto", marginTop: "50px" }}>
        <Typography variant="h6" sx={{ textAlign: "center", bgcolor: "#1976d2", color: "white", padding: 1 }}>
          Send To
        </Typography>

        {/* Organization Dropdown */}
        <Grid container spacing={2} sx={{ mb: 3, mt: 2 }}>
          <Grid item xs={6}>
            <label>Organization</label>
            <ReactSelect
              options={organizations?.map(org => ({ value: org.organizationId, label: org.organizationName })) || []}
              value={selectedValues.organization}
              onChange={(option) => handleSelectionChange("organization", option)}
              isSearchable
            />
          </Grid>

          {/* Company Dropdown */}
          <Grid item xs={6}>
            <label>Company</label>
            <ReactSelect
              options={options.companies?.map(comp => ({ value: comp.companyId, label: comp.companyName })) || []}
              value={selectedValues.company}
              onChange={(option) => handleSelectionChange("company", option)}
              isSearchable
              isDisabled={!selectedValues.organization}
            />
          </Grid>

          {/* Office Dropdown */}
          <Grid item xs={6}>
            <label>Office</label>
            <ReactSelect
              options={options.offices?.map(office => ({ value: office.officeId, label: office.officeName })) || []}
              value={selectedValues.office}
              onChange={(option) => handleSelectionChange("office", option)}
              isSearchable
              isDisabled={!selectedValues.company}
            />
          </Grid>

          {/* Department Dropdown */}
          <Grid item xs={6}>
            <label>Department</label>
            <ReactSelect
              options={options.departments?.map(dept => ({ value: dept.departmentId, label: dept.departmentName })) || []}
              value={selectedValues.department}
              onChange={(option) => handleSelectionChange("department", option)}
              isSearchable
              isDisabled={!selectedValues.office}
            />
          </Grid>

          {/* Designation Dropdown */}
          <Grid item xs={6}>
            <label>Designation</label>
            <ReactSelect
              options={options.designations?.map(desig => ({ value: desig.designationId, label: desig.designationName })) || []}
              value={selectedValues.designation}
              onChange={(option) => handleSelectionChange("designation", option)}
              isSearchable
              isDisabled={!selectedValues.department}
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button variant="contained" color="primary" disabled={!selectedValues.designation}>
            Send
          </Button>
          <Button variant="contained" color="error" onClick={onClose} sx={{ ml: 2 }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UploadDocumentsModal;
