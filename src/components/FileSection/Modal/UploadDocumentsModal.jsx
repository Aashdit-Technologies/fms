import {
  Box,
  Grid,
  Typography,
  Button,
  Modal,
  TableContainer,
  Table,
  TableHead,
  Paper,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import ReactSelect from "react-select";
import { useMutation } from "@tanstack/react-query";
import { encryptPayload } from "../../../utils/encrypt";
import api from "../../../Api/Api";
import { toast } from "react-toastify";
import useAuthStore from "../../../store/Store";
import { useNavigate } from "react-router-dom";
import { PageLoader } from "../../pageload/PageLoader";

const UploadDocumentsModal = ({
  open,
  onClose,
  organizations,
  fileDetails,
  additionalDetails,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [selectedValues, setSelectedValues] = useState({
    organization: null,
    company: null,
    office: null,
    department: null,
    designation: null,
  });
  const [tableData, setTableData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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
      setLoading(true);
      const encryptedData = encryptPayload(payload);
      const response = await api.post(endpoint, { dataObject: encryptedData });
      setLoading(false);
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
    setTableData([]);
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
      setLoading(true);
      const payload = {
        organizationId: selectedValues.organization?.value || 0,
        companyId: selectedValues.company?.value || 0,
        officeId: selectedValues.office?.value || 0,
        departmentId: selectedValues.department?.value || 0,
        designationId: selectedValues.designation?.value || 0,
        action: "SENDTO",
      };
      console.log("Payload before encryption:", payload);

      const encryptedPayload = encryptPayload(payload);

      const response = await api.post("file/get-send-to-list", {
        dataObject: encryptedPayload,
      });
      setLoading(false);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.outcome) {
        setTableData(data.data);
      }
    },
  });

  const handleSearch = () => {
    if (
      !selectedValues.organization &&
      !selectedValues.company &&
      !selectedValues.office &&
      !selectedValues.department &&
      !selectedValues.designation
    ) {
      toast.error("Please select at least one field before searching!");
      return;
    }
    searchMutation.mutate();
  };

  const token =
    useAuthStore((state) => state.token) || sessionStorage.getItem("token");

  const sendFileMutation = useMutation({
    mutationFn: async (action) => {
      setLoading(true);
      try {
        const payload = encryptPayload({
          actionTaken: action,
          fileId: fileDetails.data.fileId,
          note: additionalDetails.data.note,
          filerecptId: fileDetails.data.fileReceiptId,
          notesheetId: additionalDetails?.data?.prevNoteId,
          receiverEmpRoleMap: selectedRow,
        });

        const formData = new FormData();
        formData.append("dataObject", payload);

        const response = await api.post("/file/send-file", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLoading(false);
        if (response.data.outcome) {
          toast.success(response.data.message || "File sent successfully!");
          navigate("/file");
        } else {
          toast.error(response.data.message || "Failed to send file!");
        }
      } catch (error) {
        toast.error(error.message || "Something went wrong!");
      }
    },
  });

  const handleSendFile = (action, selectedRow) => {
    sendFileMutation.mutate(action, selectedRow);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectRow = (empDeptRoleId) => {
    setSelectedRow(empDeptRoleId);
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
          bgcolor: "background.paper",
          borderRadius: 2,
          maxWidth: "800px",
          margin: "auto",
          marginTop: "50px",
          paddingBottom: "20px",
        }}
      >
        {loading && <PageLoader />}
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            bgcolor: "#207785",
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
              options={[
                { value: 0, label: "Select Organization" },
                ...(organizations?.map((org) => ({
                  value: org.organizationId,
                  label: org.organizationName,
                })) || []),
              ]}
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
            <label>Company</label>
            <ReactSelect
              options={[
                { value: 0, label: "Select Company" },
                ...(options.companies?.map((comp) => ({
                  value: comp.companyId,
                  label: comp.name,
                })) || []),
              ]}
              value={selectedValues.company}
              onChange={(option) => handleSelectionChange("company", option)}
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
            <label>Office</label>
            <ReactSelect
              options={[
                { value: 0, label: "Select Office" },
                ...(options.offices?.map((office) => ({
                  value: office.officeId,
                  label: office.officeName,
                })) || []),
              ]}
              value={selectedValues.office}
              onChange={(option) => handleSelectionChange("office", option)}
              isSearchable
              isClearable={true}
              isDisabled={!selectedValues.company}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 1300 }),
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
            <label>Department</label>
            <ReactSelect
              options={[
                { value: 0, label: "Select Department" },
                ...(options.departments?.map((dept) => ({
                  value: dept.departmentId,
                  label: dept.departmentName,
                })) || []),
              ]}
              isClearable={true}
              value={selectedValues.department}
              onChange={(option) => handleSelectionChange("department", option)}
              isSearchable
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
            <label>Designation</label>
            <ReactSelect
              options={[
                { value: 0, label: "Select Designation" },
                ...(options.designations?.map((desig) => ({
                  value: desig.id,
                  label: desig.name,
                })) || []),
              ]}
              value={selectedValues.designation}
              onChange={(option) =>
                handleSelectionChange("designation", option)
              }
              isClearable={true}
              isSearchable
              isDisabled={!selectedValues.department}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 1300 }),
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
          <Grid item xs={6} style={{ paddingTop: "40px" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              disabled={loading}
            >
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

        <TableContainer
          component={Paper}
          sx={{
            maxHeight: 300,
            overflow: "auto",
            mt: 2,
            border: "1px solid #ccc",
            bgcolor: "#f5f5f5",
          }}
        >
          <Table sx={{ width: "100%" }}>
            <TableHead
              sx={{ position: "sticky", top: 0, bgcolor: "#207785", zIndex: 1 }}
            >
              <TableRow>
                <TableCell
                  style={{
                    fontWeight: "bold",
                    color: "#fff",
                    borderRight: "1px solid #ddd",
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, idx) => (
                  <TableRow
                    key={idx}
                    sx={{
                      "&:hover": { backgroundColor: "#f5f5f5" },
                      backgroundColor:
                        idx % 2 === 0 ? "#f9f9f9" : "transparent",
                    }}
                  >
                    <TableCell>
                      {row.empNameWithDesgAndDept
                        ? row.empNameWithDesgAndDept
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <FormControl>
                        <RadioGroup
                          aria-labelledby="demo-radio-buttons-group-label"
                          value={
                            selectedRow === row.empDeptRoleId
                              ? row.empDeptRoleId
                              : "N/A"
                          }
                          onChange={() => handleSelectRow(row.empDeptRoleId)}
                          name="radio-buttons-group"
                        >
                          <FormControlLabel
                            value={row.empDeptRoleId}
                            control={<Radio />}
                          />
                        </RadioGroup>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={tableData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            variant="contained"
            color="primary"
            // startIcon={<IoIosSend />}
            onClick={() => handleSendFile("SENDTO")}
            disabled={loading}
          >
            {loading ? <PageLoader /> : "send"}
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
