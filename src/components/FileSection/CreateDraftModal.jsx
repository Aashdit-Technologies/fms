import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Box,
  IconButton,
  Button,
  Typography,
  Grid,
} from "@mui/material";
import { FaPlus, FaMinus } from "react-icons/fa";
import CorrespondenceEditor from "./CorrespondenceEditor";
import ReactSelect from "react-select";
import { encryptPayload } from "../../utils/encrypt";
import api from "../../Api/Api";
import { toast } from "react-toastify";
// import useAuthStore from "../../../store/Store";
import { useMutation } from "@tanstack/react-query";

const CreateDraftModal = ({ open, onClose, officeNames, organizations, allDetails, editMalady }) => {
    
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [contents, setContents] = useState('');

  const [selectedValues, setSelectedValues] = useState({
    organization: null,
    company: null,
    office: null,
    department: null,
    designation: null,
    authorities: null,
  });
  const [options, setOptions] = useState({
    companies: [],
    offices: [],
    departments: [],
    designations: [],
    // authorities: [],
  });
  const [formData, setFormData] = useState({
    subject: "",
    referenceNo: "",
    addedBy: "",
    content: "",
    office: "",
    tempType: "",
  });
  
  const editorContentRef = useRef(formData.content);
  useEffect(() => {
    if (officeNames && officeNames.data) {
      setData(officeNames.data);
    }
  }, [officeNames]);
  useEffect(() => {
    if (open) {
      setShowForm(false);
      resetForm();
    }
  }, [open]);
  useEffect(() => {
    setFormData({
      subject: "",
      referenceNo: "",
      addedBy: "",
      office: "",
      content: "",
      tempType: "",
    });
    editorContentRef.current = "";
    setContents("");
  }, []);

 

  const resetForm = () => {
    setSelectedValues({
      organization: null,
      company: null,
      office: null,
      department: null,
      designation: null,
      authorities: null,
    });
    setOptions({
      companies: [],
      offices: [],
      departments: [],
      designations: [],
      authorities: [],
    });
    editorContentRef.current = ""; 
    setContents("");
    // setTableData([]);
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
        if (endpoint.includes("get-send-to-list")) {
          const mappedAuthorities = data.data.map((authority) => ({
            value: authority.empDeptRoleId,
            label: authority.empNameWithDesgAndDept,
          }));
          console.log("Mapped Authorities:", mappedAuthorities);
          setOptions((prev) => ({ ...prev, authorities: mappedAuthorities }));
          console.log("Options after setting authorities:", options);
          
        }
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
      fetchData.mutate({
        endpoint: "/file/get-send-to-list",
        payload: {
          organizationId: selectedValues.organization?.value || 0,
          companyId: selectedValues.company?.value || 0,
          officeId: selectedValues.office?.value || 0,
          departmentId: selectedValues.department?.value || 0,
          designationId: selectedValues.designation?.value || 0,
        },
      });
    } else if (field === "company") {
      setOptions((prev) => ({
        ...prev,
        offices: [],
        departments: [],
        designations: [],
        authorities: [],
      }));
      fetchData.mutate({
        endpoint: "/level/get-offices",
        payload: {
          organizationId: selectedValues.organization.value,
          companyId: selectedOption.value,
        },
      });
    } else if (field === "office") {
      setOptions((prev) => ({
        ...prev,
        departments: [],
        designations: [],
        authorities: [],
      }));
      fetchData.mutate({
        endpoint: "/level/get-departments",
        payload: {
          organizationId: selectedValues.organization.value,
          companyId: selectedValues.company.value,
          officeId: selectedOption.value,
        },
      });
    } else if (field === "department") {
      setOptions((prev) => ({ ...prev, designations: [], authorities: [] }));
      fetchData.mutate({
        endpoint: "/level/get-designations",
        payload: {
          organizationId: selectedValues.organization.value,
          companyId: selectedValues.company.value,
          officeId: selectedValues.office.value,
          departmentId: selectedOption.value,
        },
      });
    } else if (field === "designation") {
      fetchData.mutate({
        endpoint: "/file/get-send-to-list",
        payload: {
          organizationId: selectedValues.organization?.value || 0,
          companyId: selectedValues.company?.value || 0,
          officeId: selectedValues.office?.value || 0,
          departmentId: selectedValues.department?.value || 0,
          designationId: selectedValues.designation?.value || 0,
        },
      });
    }
  };
  const searchMutation = useMutation({

    mutationFn: async () => {
      const payload = {
        correspondenceId: null,
        fileId: allDetails?.fileId,
        fileReceiptId: allDetails?.fileReceiptId,
        subject: contents,
        approverEmpRoleMapId: selectedValues.authorities?.value || null,
        letterContent: formData.content,
        letterNo: null,
        correspondenceDate: null,
        displayType: null,
        currEmpDeptMapId: null,
        employeeDeptMapVo: {
          organizationId: selectedValues.organization?.value || 0,
          companyId: selectedValues.company?.value || 0,
          officeId: selectedValues.office?.value || 0,
          departmentId: selectedValues.department?.value || 0,
          designationId: selectedValues.designation?.value || 0,
        },
      };
     
      console.log("Payload before encryption:", payload);
  
      const encryptedPayload = encryptPayload(payload);
  
      const response = await api.post("/file/create-draft-in-file", {
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
  
  const handleSave = async () => {
    const payload = {
      correspondenceId: editMalady?.id || null,
      fileId: allDetails?.fileId,
      fileReceiptId: allDetails?.fileReceiptId,
      subject: contents,
      approverEmpRoleMapId: selectedValues.authorities?.value || null,
      letterContent: editorContentRef.current,
      letterNo: null,
      correspondenceDate: null,
      displayType: null,
      currEmpDeptMapId: null,
      employeeDeptMapVo: {
        organizationId: selectedValues.organization?.value || 0,
        companyId: selectedValues.company?.value || 0,
        officeId: selectedValues.office?.value || 0,
        departmentId: selectedValues.department?.value || 0,
        designationId: selectedValues.designation?.value || 0,
      },
    };

    try {
      const encryptedPayload = encryptPayload(payload);
      const endpoint = editMalady ? "/file/create-draft-in-file" : "/file/create-draft-in-file";
      
      const response = await api.post(endpoint, {
        dataObject: encryptedPayload,
      });

      if (response.data.outcome) {
        toast.success(editMalady ? "Draft updated successfully!" : "Draft created successfully!");
        onClose();
      } else {
        toast.error(response.data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft");
    }
  };

  const officeOptions = Array.isArray(data)
    ? data.map((item) => ({
        label: item.tempType,
        value: item.templateId,
        tempContent: item.tempContent,
      }))
    : [];

  const handleOfficeChange = (selectedOption) => {
    if (selectedOption) {
      setFormData((prev) => ({
        ...prev,
        office: selectedOption.value,
        tempType: selectedOption.label,
        content: selectedOption.tempContent,
      }));
      editorContentRef.current = selectedOption.tempContent;
    }
  };
  
  useEffect(() => {
    if (open && editMalady) {
      setShowForm(true);
      setFormData({
        subject: editMalady.subject || "",
        referenceNo: editMalady.referenceNo || "",
        addedBy: editMalady.addedBy || "",
        office: editMalady.office || "",
        content: editMalady.content || "",
        tempType: editMalady.tempType || "",
      });
      editorContentRef.current = editMalady.content || "";
      setContents(editMalady.subject || "");
  
      // Safeguard against undefined objects/arrays
      const findInArray = (array, key, value) => array && Array.isArray(array) ? array.find(item => item[key] === value) : null;
  
      setSelectedValues({
        organization: findInArray(organizations, 'organizationId', editMalady.organizationId) || null,
        company: findInArray(options.companies, 'companyId', editMalady.companyId) || null,
        office: findInArray(options.offices, 'officeId', editMalady.officeId) || null,
        department: findInArray(options.departments, 'departmentId', editMalady.departmentId) || null,
        designation: findInArray(options.designations, 'id', editMalady.designationId) || null,
        authorities: findInArray(options.authorities, 'value', editMalady.approverEmpRoleMapId) || null,
      });
    }
  }, [open, editMalady, organizations, options]);
  

  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        if (reason && reason === "backdropClick") {
          return;
        }
        onClose();
      }}
    >
      <Box
        sx={{
          width: 1000,
          bgcolor: "white",
          p: 3,
          borderRadius: 2,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: 24,
          height: "80vh",
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Create Draft</Typography>
          <IconButton onClick={() => setShowForm(!showForm)} color="primary">
            {showForm ? <FaMinus /> : <FaPlus />}
          </IconButton>
        </Box>

        {showForm && (
          <Box sx={{ mt: 2, display: "grid", gap: 2 }}>
            <Grid item xs={12}>
              <label>Letter Content</label>
              <ReactSelect
                options={officeOptions}
                value={officeOptions.find(
                  (option) => option.value === formData.office
                )}
                onChange={handleOfficeChange}
                isSearchable
              />
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <label htmlFor="subject">Subject:</label>
                <textarea
                  id="subject"
                  value={contents}
                  onChange={(e) => setContents(e.target.value)}
                  rows={1}
                  placeholder="Enter content..."
                  style={{ width: "100%", padding: "8px" }}
                />
              </Grid>
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
                  onChange={(option) =>
                    handleSelectionChange("company", option)
                  }
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
                  onChange={(option) =>
                    handleSelectionChange("department", option)
                  }
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
              <Grid item xs={6}>
                <label>Approving Authority</label>
                <ReactSelect
                  options={options.authorities}
                  value={selectedValues.authorities}
                  onChange={(option) =>
                    setSelectedValues((prev) => ({
                      ...prev,
                      authorities: option,
                    }))
                  }
                  isSearchable
                  isDisabled={
                    !selectedValues.designation &&
                    !selectedValues.organization &&
                    !selectedValues.company &&
                    !selectedValues.office &&
                    !selectedValues.department
                  }
                />
              </Grid>
            </Grid>
          </Box>
        )}

        <Box sx={{ mt: 2 }} className="editor-containers">
            <CorrespondenceEditor
              initialContent={formData.content} // Pass initial content
              onContentChange={(value) => {
                editorContentRef.current = value; // Update the ref with the latest content
              }}
            />
        </Box>

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
        >
          <Button variant="contained" color="success" onClick={handleSave}>
            Save
          </Button>
          <Button
            variant="contained"
            color="warning"
            // onClick={resetForm}

            onClick={() => {
              setFormData({
                subject: "",
                referenceNo: "",
                addedBy: "",
                content: "",
                office: "",
                tempType: "",
              });
              editorContentRef.current = "";
              resetForm();
            }}
          >
            Reset
          </Button>
          <Button variant="contained" color="error" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateDraftModal;
