import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  Modal,
  Box,
  IconButton,
  Button,
  Typography,
  Grid,
} from "@mui/material";
import { FaPlus, FaMinus } from "react-icons/fa";
import ModalEditor from "./ModalEditor";
import ReactSelect from "react-select";
import { encryptPayload } from "../../utils/encrypt";
import api from "../../Api/Api";
import { toast } from "react-toastify";
import useAuthStore from "../../store/Store";
import { useMutation } from "@tanstack/react-query";

const CreateDraftModal = ({
  open,
  onClose,
  officeNames,
  organizations,
  allDetails,
  editMalady,
  refetchData,
}) => {
  const token =
    useAuthStore((state) => state.token) || sessionStorage.getItem("token");

  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [contents, setContents] = useState("");

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
    authorities: [],
  });

  const [formData, setFormData] = useState({
    subject: "",
    referenceNo: "",
    addedBy: "",
    contentss: "",
    office: "",
    tempType: "",
  });

  const updatedContentRef = useRef(formData.contentss);

  // Update formData.content when editor content changes
  const handleTextUpdate = useCallback((value) => {
    // Store the content in the ref and state, but keep it isolated from other editors
    updatedContentRef.current = value;

    setFormData((prevState) => ({
      ...prevState,
      contentss: value,
    }));
  }, []);

  useEffect(() => {
    if (officeNames?.data) {
      // Set the data for letter content dropdown
      setData(officeNames.data);
      if (editMalady && editMalady.tempType) {
        const selectedTemplate = officeNames.data.find(
          (template) => template.tempType === editMalady.tempType
        );
        if (selectedTemplate) {
          setFormData((prev) => ({
            ...prev,
            office: selectedTemplate.templateId,
            tempType: selectedTemplate.tempType,
            contentss:
              selectedTemplate.tempContent || editMalady.letterContent || "",
          }));
          updatedContentRef.current =
            selectedTemplate.tempContent || editMalady.letterContent || "";
        }
      }
    }
  }, [officeNames, editMalady]);

  useEffect(() => {
    if (open) {
      if (editMalady) {
        setShowForm(true);
        populateEditData();
      } else {
        setShowForm(false);
        resetForm();
      }
    }
  }, [open, editMalady]);

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
    setFormData({
      subject: "",
      referenceNo: "",
      addedBy: "",
      content: "",
      office: "",
      tempType: "",
    });
    updatedContentRef.current = "";
    setContents("");
  };

  const populateEditData = async () => {
    if (editMalady) {
      // Set basic form data
      setFormData({
        subject: editMalady.subject || "",
        referenceNo: editMalady.referenceNo || "",
        addedBy: editMalady.addedBy || "",
        office: editMalady.office || "",
        contentss: editMalady.letterContent || "",
        tempType: editMalady.tempType || "",
      });
      updatedContentRef.current = editMalady.letterContent || "";
      setContents(editMalady.subject || "");

      const empDeptMapVo = editMalady.employeeDeptMapVo || {};

      // Set organization and fetch companies
      if (empDeptMapVo.organizationId) {
        const organization = organizations?.find(
          (org) => org.organizationId === empDeptMapVo.organizationId
        );
        if (organization) {
          const orgOption = {
            value: organization.organizationId,
            label: organization.organizationName,
          };
          setSelectedValues((prev) => ({ ...prev, organization: orgOption }));

          // Fetch companies
          const companiesResponse = await fetchData.mutateAsync({
            endpoint: "/level/get-companies",
            payload: { organizationId: organization.organizationId },
          });

          // Set company and fetch offices
          if (companiesResponse.outcome && empDeptMapVo.companyId) {
            const company = companiesResponse.data.find(
              (comp) => comp.companyId === empDeptMapVo.companyId
            );
            if (company) {
              const companyOption = {
                value: company.companyId,
                label: company.name,
              };
              setSelectedValues((prev) => ({
                ...prev,
                company: companyOption,
              }));

              // Fetch offices
              const officesResponse = await fetchData.mutateAsync({
                endpoint: "/level/get-offices",
                payload: {
                  organizationId: organization.organizationId,
                  companyId: company.companyId,
                },
              });

              // Set office and fetch departments
              if (officesResponse.outcome && empDeptMapVo.officeId) {
                const office = officesResponse.data.find(
                  (off) => off.officeId === empDeptMapVo.officeId
                );
                if (office) {
                  const officeOption = {
                    value: office.officeId,
                    label: office.officeName,
                  };
                  setSelectedValues((prev) => ({
                    ...prev,
                    office: officeOption,
                  }));

                  // Fetch departments
                  const departmentsResponse = await fetchData.mutateAsync({
                    endpoint: "/level/get-departments",
                    payload: {
                      organizationId: organization.organizationId,
                      companyId: company.companyId,
                      officeId: office.officeId,
                    },
                  });

                  // Set department and fetch designations
                  if (
                    departmentsResponse.outcome &&
                    empDeptMapVo.departmentId
                  ) {
                    const department = departmentsResponse.data.find(
                      (dept) => dept.departmentId === empDeptMapVo.departmentId
                    );
                    if (department) {
                      const departmentOption = {
                        value: department.departmentId,
                        label: department.departmentName,
                      };
                      setSelectedValues((prev) => ({
                        ...prev,
                        department: departmentOption,
                      }));

                      // Fetch designations
                      const designationsResponse = await fetchData.mutateAsync({
                        endpoint: "/level/get-designations",
                        payload: {
                          organizationId: organization.organizationId,
                          companyId: company.companyId,
                          officeId: office.officeId,
                          departmentId: department.departmentId,
                        },
                      });

                      // Set designation and fetch authorities
                      if (
                        designationsResponse.outcome &&
                        empDeptMapVo.designationId
                      ) {
                        const designation = designationsResponse.data.find(
                          (desig) => desig.id === empDeptMapVo.designationId
                        );
                        if (designation) {
                          const designationOption = {
                            value: designation.id,
                            label: designation.name,
                          };
                          setSelectedValues((prev) => ({
                            ...prev,
                            designation: designationOption,
                          }));

                          // Fetch authorities
                          const authoritiesResponse =
                            await fetchData.mutateAsync({
                              endpoint: "/file/get-send-to-list",
                              payload: {
                                organizationId: organization.organizationId,
                                companyId: company.companyId,
                                officeId: office.officeId,
                                departmentId: department.departmentId,
                                designationId: designation.id,
                                action: "DRAFT",
                              },
                            });

                          // Set authority if it exists in the response
                          if (
                            authoritiesResponse.outcome &&
                            editMalady.approverEmpRoleMapId
                          ) {
                            const authority = authoritiesResponse.data.find(
                              (auth) =>
                                auth.empDeptRoleId ===
                                editMalady.approverEmpRoleMapId
                            );
                            if (authority) {
                              const authorityOption = {
                                value: authority.empDeptRoleId,
                                label: authority.empNameWithDesgAndDept,
                              };
                              setSelectedValues((prev) => ({
                                ...prev,
                                authorities: authorityOption,
                              }));
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
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
          setOptions((prev) => ({ ...prev, authorities: mappedAuthorities }));
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
          organizationId: selectedOption?.value || 0,
          companyId: selectedValues.company?.value || 0,
          officeId: selectedValues.office?.value || 0,
          departmentId: selectedValues.department?.value || 0,
          designationId: selectedValues.designation?.value || 0,
          action: "DRAFT",
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
      setSelectedValues((prev) => ({
        ...prev,
        authorities: "",
      }));
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
          designationId: selectedOption?.value || 0,
          action: "DRAFT",
        },
      });
    }
  };
  const validateForm = () => {
    const errors = [];

    if (!contents) errors.push("Subject is required");
    else if (!selectedValues.organization)
      errors.push("Organization is required");
    else if (selectedValues.company && !selectedValues.office)
      errors.push("Office is required");
    else if (selectedValues.office && !selectedValues.department)
      errors.push("Department is required");
    else if (selectedValues.department && !selectedValues.designation)
      errors.push("Designation is required");
    else if (!selectedValues.authorities)
      errors.push("Approving Authority is required");
    else if (!updatedContentRef.current)
      errors.push("Letter content is required");

    return errors;
  };
  const handleSave = async (action) => {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }
    const payload = {
      correspondenceId: editMalady?.correspondenceId || null,
      fileId: allDetails?.fileId,
      fileReceiptId: allDetails?.fileReceiptId,
      subject: contents,
      approverEmpRoleMapId: selectedValues.authorities?.value || null,
      letterContent: updatedContentRef.current,
      letterNo: formData.office || null,
      correspondenceDate: null,
      displayType: null,
      currEmpDeptMapId: editMalady?.currEmpDeptMapId || null,
      employeeDeptMapVo: {
        organizationId: selectedValues.organization?.value || 0,
        companyId: selectedValues.company?.value || 0,
        officeId: selectedValues.office?.value || 0,
        departmentId: selectedValues.department?.value || 0,
        designationId: selectedValues.designation?.value || 0,
      },
    };

    console.log("Save/Approve Payload:", {
      ...payload,
      action,
      isApproveEnabled:
        editMalady?.approverEmpRoleMapId === editMalady?.currEmpDeptMapId,
      currentFormData: formData,
    });

    try {
      const encryptedPayload = encryptPayload(payload);
      const endpoint =
        action === "APPROVE"
          ? "/file/approve-draft"
          : "/file/create-draft-in-file";

      const response = await api.post(
        endpoint,
        {
          dataObject: encryptedPayload,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.outcome) {
        toast.success(
          editMalady
            ? "Draft updated successfully!"
            : "Draft created successfully!"
        );
        resetForm();
        if (refetchData && typeof refetchData === "function") {
          refetchData();
        }
        onClose();
      } else {
        toast.error(response.data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft");
    }
  };

  const officeOptions = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    return [
      { label: "None", value: "" },
      ...data.map((item) => ({
        label: item.tempType,
        value: item.templateId,
        tempContent: item.tempContent,
      })),
    ];
  }, [data]);

  useEffect(() => {
    console.log("Letter Content Options:", officeOptions);
    console.log("Selected Template:", formData.office);
  }, [officeOptions, formData.office]);

  const handleOfficeChange = (selectedOption) => {
    if (selectedOption) {
      const contentss = selectedOption.tempContent || "";

      setFormData((prev) => ({
        ...prev,
        office: selectedOption.value,
        tempType: selectedOption.label,
        contentss: contentss,
      }));

      updatedContentRef.current = contentss;
    } else {
      setFormData((prev) => ({
        ...prev,
        office: "",
        tempType: "",
        contentss: "",
      }));

      updatedContentRef.current = "";
    }
  };

  const handleClickClose = () => {
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
    setFormData({
      subject: "",
      referenceNo: "",
      addedBy: "",
      contentss: "",
      office: "",
      tempType: "",
    });
    updatedContentRef.current = "";
    setContents("");
    if (refetchData && typeof refetchData === "function") {
      refetchData();
    }
    onClose();
  };

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
          <Typography variant="h6" style={{ color: "#052C65", fontWeight: "bold" }}>
            {editMalady ? "Edit Draft" : "Create Draft"}
          </Typography>
          <IconButton onClick={() => setShowForm(!showForm)} sx={{ color: "#207785" }}>
            {showForm ? <FaMinus /> : <FaPlus />}
          </IconButton>
        </Box>

        {showForm && (
          <Box sx={{ mt: 2, display: "grid", gap: 2 }}>
            
            <Grid container spacing={2}>
            <Grid item xs={6}>
              <label>Letter Content</label>
              <ReactSelect
                options={officeOptions}
                value={officeOptions.find(
                  (option) => option.value === formData.office
                )}
                onChange={handleOfficeChange}
                isSearchable
                isClearable={true}
                styles={{
                  control: (base) => ({
                    ...base,
                    fontSize: "14px",
                  }),
                  option: (base) => ({
                    ...base,
                    fontSize: "14px",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    fontSize: "14px",
                  }),
                }}
              />
            </Grid>
              <Grid item xs={6}>
                <label htmlFor="subject">Subject <span style={{ color: "red", marginLeft: "5px" }}>*</span></label>
                <textarea
                  id="subject"
                  value={contents}
                  onChange={(e) => setContents(e.target.value)}
                  rows={1}
                  placeholder="Enter content..."
                 
                />
              </Grid>
              <Grid item xs={6}>
                <label>Organization <span style={{ color: "red", marginLeft: "5px" }}>*</span></label>
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
                  isClearable={true}
                  styles={{
                    control: (base) => ({
                      ...base,
                      fontSize: "14px",
                    }),
                    option: (base) => ({
                      ...base,
                      fontSize: "14px",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      fontSize: "14px",
                    }),
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <label>Company {selectedValues.company?<span style={{ color: "red", marginLeft: "5px" }}>*</span>:""}</label>
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
                  isClearable={true}
                  isDisabled={!selectedValues.organization}
                  styles={{
                    control: (base) => ({
                      ...base,
                      fontSize: "14px",
                    }),
                    option: (base) => ({
                      ...base,
                      fontSize: "14px",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      fontSize: "14px",
                    }),
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <label>Office {selectedValues.organization && selectedValues.company?<span style={{ color: "red", marginLeft: "5px" }}>*</span>:""}</label>
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
                  isClearable={true}
                  isDisabled={!selectedValues.company}
                  styles={{
                    control: (base) => ({
                      ...base,
                      fontSize: "14px",
                    }),
                    option: (base) => ({
                      ...base,
                      fontSize: "14px",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      fontSize: "14px",
                    }),
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <label>Department {selectedValues.organization && selectedValues.company?<span style={{ color: "red", marginLeft: "5px" }}>*</span>:""}</label>
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
                  isClearable={true}
                  isDisabled={!selectedValues.office}
                  styles={{
                    control: (base) => ({
                      ...base,
                      fontSize: "14px",
                    }),
                    option: (base) => ({
                      ...base,
                      fontSize: "14px",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      fontSize: "14px",
                    }),
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <label>Designation {selectedValues.organization && selectedValues.company ?<span style={{ color: "red", marginLeft: "5px" }}>*</span>:""}</label>
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
                  isClearable={true}
                  isDisabled={!selectedValues.department}
                  styles={{
                    control: (base) => ({
                      ...base,
                      fontSize: "14px",
                    }),
                    option: (base) => ({
                      ...base,
                      fontSize: "14px",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      fontSize: "14px",
                    }),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <label>Approving Authority {selectedValues.organization?<span style={{ color: "red", marginLeft: "5px" }}>*</span>:""}</label>
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
                  isClearable={true}
                  isDisabled={
                    (!selectedValues.designation &&
                      !selectedValues.organization &&
                      !selectedValues.company &&
                      !selectedValues.office &&
                      !selectedValues.department) ||
                    (selectedValues.company &&
                      selectedValues.organization &&
                      !selectedValues.designation)
                  }
                  styles={{
                    control: (base) => ({
                      ...base,
                      fontSize: "14px",
                    }),
                    option: (base) => ({
                      ...base,
                      fontSize: "14px",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      fontSize: "14px",
                    }),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        <Box sx={{ mt: 2 }} className="editor-containers">
          <ModalEditor
            defaultText={formData.contentss}
            onTextUpdate={handleTextUpdate}
          />
        </Box>

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
        >
          <Button
            variant="contained"
            color="success"
            onClick={() => handleSave("SAVE")}
          >
            Save
          </Button>

          {editMalady?.correspondenceId &&
            editMalady.approverEmpRoleMapId === editMalady.currEmpDeptMapId && (
              <Button
                variant="contained"
                color="success"
                onClick={() => handleSave("APPROVE")}
                title="Approve Draft"
              >
                Approve
              </Button>
            )}

          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              setFormData({
                subject: "",
                referenceNo: "",
                addedBy: "",
                contentss: "",
                office: "",
                tempType: "",
              });
              updatedContentRef.current = "";
              resetForm();
            }}
          >
            Reset
          </Button>
          <Button variant="contained" color="error" onClick={handleClickClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateDraftModal;
