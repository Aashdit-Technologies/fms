import { Box, Grid, Typography, Button, Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import ReactSelect from "react-select";
import { useMutation } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
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
  const [tableData, setTableData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  const [options, setOptions] = useState({
    companies: [],
    offices: [],
    departments: [],
    designations: [],
  });

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);
  const resetForm = () => {
    setSelectedValues({
      organization: null,
      company: null,
      office: null,
      department: null,
      designation: null,
    });
    setOptions({
      companies: [],
      offices: [],
      departments: [],
      designations: [],
    });
    setTableData([]);
    setSelectedRow(null);
  };
  const fetchData = useMutation({
    mutationFn: async ({ endpoint, payload }) => {
      const encryptedData = encryptPayload(payload);
      const response = await api.post(endpoint, { dataObject: encryptedData });
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (data.outcome) {
        const { endpoint } = variables;
        if (endpoint.includes("get-companies"))
          setOptions((prev) => ({ ...prev, companies: data.data }));
        if (endpoint.includes("get-offices"))
          setOptions((prev) => ({ ...prev, offices: data.data }));
        if (endpoint.includes("get-departments"))
          setOptions((prev) => ({ ...prev, departments: data.data }));
        if (endpoint.includes("get-designations"))
          setOptions((prev) => ({ ...prev, designations: data.data }));
      }
    },
  });

  const handleSelectionChange = (field, selectedOption) => {
    setSelectedValues((prev) => ({ ...prev, [field]: selectedOption }));

    if (field === "organization") {
      setOptions({
        companies: [],
        offices: [],
        departments: [],
        designations: [],
      });
      fetchData.mutate({
        endpoint: "/level/get-companies",
        payload: { organizationId: selectedOption.value },
      });
    } else if (field === "company") {
      setOptions((prev) => ({
        ...prev,
        offices: [],
        departments: [],
        designations: [],
      }));
      fetchData.mutate({
        endpoint: "/level/get-offices",
        payload: {
          organizationId: selectedValues.organization.value,
          companyId: selectedOption.value,
        },
      });
    } else if (field === "office") {
      setOptions((prev) => ({ ...prev, departments: [], designations: [] }));
      fetchData.mutate({
        endpoint: "/level/get-departments",
        payload: {
          organizationId: selectedValues.organization.value,
          companyId: selectedValues.company.value,
          officeId: selectedOption.value,
        },
      });
    } else if (field === "department") {
      setOptions((prev) => ({ ...prev, designations: [] }));
      fetchData.mutate({
        endpoint: "/level/get-designations",
        payload: {
          organizationId: selectedValues.organization.value,
          companyId: selectedValues.company.value,
          officeId: selectedValues.office.value,
          departmentId: selectedOption.value,
        },
      });
    }
  };

  const searchMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        organizationId: selectedValues.organization?.value || 0,
        companyId: selectedValues.company?.value || 0,
        officeId: selectedValues.office?.value || 0,
        departmentId: selectedValues.department?.value || 0,
        designationId: selectedValues.designation?.value || 0,
      };
      const encryptedPayload = encryptPayload(payload);
      const response = await api.post("/level/search-users", {
        dataObject: encryptedPayload,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.outcome) {
        setTableData(data.data);
      }
    },
  });

  const handleSearch = () => {
    searchMutation.mutate();
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name || "N/A",
      sortable: true,
    },
    {
      name: "Action",
      cell: (row, index) => (
        <input
          type="radio"
          name="selectedEmployee"
          checked={selectedRow === index}
          onChange={() => setSelectedRow(index)}
        />
      ),
      center: true,
    },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          maxWidth: "800px",
          margin: "auto",
          marginTop: "50px",
          paddingBottom: "20px",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            bgcolor: "#1976d2",
            color: "white",
            padding: 1,
          }}
        >
          Send To
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3, mt: 2, pl: 2 }}>
          <Grid item xs={6}>
            <label>Organization</label>
            <ReactSelect
              options={
                organizations?.map((org) => ({
                  value: org.organizationId,
                  label: org.organizationName,
                })) || []
              }
              value={selectedValues.organization}
              onChange={(option) =>
                handleSelectionChange("organization", option)
              }
              isSearchable
            />
          </Grid>

          <Grid item xs={6}>
            <label>Company</label>
            <ReactSelect
              options={
                options.companies?.map((comp) => ({
                  value: comp.companyId,
                  label: comp.name,
                })) || []
              }
              value={selectedValues.company}
              onChange={(option) => handleSelectionChange("company", option)}
              isSearchable
              isDisabled={!selectedValues.organization}
            />
          </Grid>

          <Grid item xs={6}>
            <label>Office</label>
            <ReactSelect
              options={
                options.offices?.map((office) => ({
                  value: office.officeId,
                  label: office.officeName,
                })) || []
              }
              value={selectedValues.office}
              onChange={(option) => handleSelectionChange("office", option)}
              isSearchable
              isDisabled={!selectedValues.company}
            />
          </Grid>

          <Grid item xs={6}>
            <label>Department</label>
            <ReactSelect
              options={
                options.departments?.map((dept) => ({
                  value: dept.departmentId,
                  label: dept.departmentName,
                })) || []
              }
              value={selectedValues.department}
              onChange={(option) => handleSelectionChange("department", option)}
              isSearchable
              isDisabled={!selectedValues.office}
            />
          </Grid>

          <Grid item xs={6}>
            <label>Designation</label>
            <ReactSelect
              options={
                options.designations?.map((desig) => ({
                  value: desig.id,
                  label: desig.name,
                })) || []
              }
              value={selectedValues.designation}
              onChange={(option) =>
                handleSelectionChange("designation", option)
              }
              isSearchable
              isDisabled={!selectedValues.department}
            />
          </Grid>
          <Grid item xs={6} style={{ paddingTop: "40px" }}>
            <Button variant="contained" color="primary" onClick={handleSearch}>
              Search
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={resetForm}
              sx={{ ml: 2 }}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>

        <DataTable
          columns={columns}
          data={tableData}
          pagination
          paginationPerPage={5} 
          paginationRowsPerPageOptions={[5, 10, 20]} 
          highlightOnHover
          striped
        //   selectableRows={false}
        />

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            variant="contained"
            color="primary"
            disabled={selectedRow === null}
          >
            Send
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onClose}
            sx={{ ml: 2 }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UploadDocumentsModal;
