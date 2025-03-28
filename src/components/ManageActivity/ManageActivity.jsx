import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus, FaLock, FaLockOpen, FaEdit } from "react-icons/fa";
import { Accordion } from "react-bootstrap";
import { TextField, Button } from "@mui/material";
import api from "../../Api/Api";
import { encryptPayload } from "../../utils/encrypt";
import useAuthStore from "../../store/Store";
import "./ManageActivity.css";
import DataTable from "react-data-table-component"; // Import DataTable
import { toast } from "react-toastify";
import "./ManageActivity.css";

// import { Button } from "@mui/material";

const customStyles = {
  table: {
    style: {
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#ffffff",
      marginBottom: "1rem",
    },
  },
  
  headRow: {
    style: {
      backgroundColor: "#207785",
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: "600",

      letterSpacing: "0.5px",
      minHeight: "52px",
      borderBottom: "2px solid #1a5f6a",
    },
  },
  headCells: {
    style: {
      padding: "16px",
      "&:not(:last-of-type)": {
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
      },
    },
  },
  rows: {
    style: {
      fontSize: "13px",
      fontWeight: "400",
      color: "#333333",
      backgroundColor: "#ffffff",
      minHeight: "48px",
      "&:not(:last-of-type)": {
        borderBottom: "1px solid #e0e0e0",
      },
      "&:hover": {
        backgroundColor: "#f5f9fa",
        cursor: "pointer",
        transition: "all 0.2s ease",
      },
    },
    stripedStyle: {
      backgroundColor: "#f8f9fa",
    },
  },
  cells: {
    style: {
      padding: "12px 16px",
      "&:not(:last-of-type)": {
        borderRight: "1px solid #e0e0e0",
      },
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid #e0e0e0",
      backgroundColor: "#f8f9fa",
      color: "#333333",
      fontSize: "13px",
      fontWeight: "500",
      padding: "8px 16px",
      "& .MuiButtonBase-root": {
        backgroundColor: "#207785",
        color: "#ffffff",
        "&:hover": {
          backgroundColor: "#1a5f6a",
        },
      },
    },
    pageButtonsStyle: {
      borderRadius: "4px",
      height: "32px",
      minWidth: "32px",
      padding: "0 6px",
      margin: "0 4px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      backgroundColor: "#207785",
      color: "#ffffff",
      "&:hover:not(:disabled)": {
        backgroundColor: "#1a5f6a",
        color: "#ffffff",
      },
      "&:disabled": {
        opacity: 0.5,
        cursor: "not-allowed",
      },
    },
  },
  noData: {
    style: {
      padding: "24px",
      color: "#666666",
    },
  },
};

const ManageActivity = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(true);
  const [activity, setActivity] = useState({
    activityCode: "",
    activityName: "",
    activityRemarks: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityData, setActivityData] = useState([]);
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [activeKey, setActiveKey] = useState("1");
  const [remarksRows, setRemarksRows] = useState(3);
  // const [rowSize, setRowSize] = useState(10);
  // const [pageNo, setPageNo] = useState(1);
  // const [totalRows, setTotalRows] = useState(0);

  const fetchActivityData = async () => {
    try {
      // const payload = {
      //   pageNo: pageNo,
      //   rowSize:rowSize,
      // };

      // Encrypt the payload
      // const encryptedMessage = encryptPayload(payload);
      const token = useAuthStore.getState().token;
      const response = await api.get("/manage-activity", {
        headers: { Authorization: `Bearer ${token}` },
        // params: { dataObject: encryptedMessage },
      });
      const sortedData = response.data.data.sort((a, b) => {
        return b.activityId - a.activityId;
      });

      setActivityData(sortedData);
    } catch (error) {
      console.error("Error fetching activity data:", error);
    }
  };

  useEffect(() => {
    fetchActivityData();
  }, []);

  const validateInput = (value) => {
    const regex = /^[a-zA-Z0-9.,/\-&() ]*$/;
    return regex.test(value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (validateInput(value)) {
      setActivity((prev) => ({ ...prev, [name]: value }));
    } else {
      // toast.warning("Only alphanumeric characters and .,/- & () are allowed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!activity.activityCode || !activity.activityName || !activity.activityRemarks) {
      toast.warning("Please fill out all required fields.");
      setIsSubmitting(false);
      return;
    }

    if (
      !validateInput(activity.activityCode) ||
      !validateInput(activity.activityName) ||
      (activity.activityRemarks && !validateInput(activity.activityRemarks))
    ) {
      toast.error(
        "Invalid characters detected. Only alphanumeric and .,/- & () are allowed"
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const token = useAuthStore.getState().token;
      const payload = {
        activityCode: activity.activityCode,
        activityName: activity.activityName,
        activityRemarks: activity.activityRemarks,
      };

      if (editingActivityId) {
        payload.activityId = editingActivityId;
      }

      const encryptedMessage = encryptPayload(payload);

      const response = await api.post(
        "/save-edit-activity",
        { dataObject: encryptedMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(
        editingActivityId
          ? "Activity updated successfully!"
          : "Activity added successfully!"
      );
      setActiveKey("1");
      fetchActivityData();
      setIsTableOpen(true);

      setActivityData((prevData) =>
        editingActivityId
          ? prevData.map((item) =>
              item.activityId === editingActivityId ? response.data : item
            )
          : [...prevData, response.data]
      );

      handleReset();
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setActivity({ activityCode: "", activityName: "", activityRemarks: "" });
    setEditingActivityId(null);
    setIsFormOpen(false);
  };

  const handleStatusToggle = async (activity) => {
    const updatedStatus = !activity.isActive;
    try {
      const token = useAuthStore.getState().token;
      const payload = {
        activityId: activity.activityId,
        isActive: updatedStatus,
      };

      const encryptedMessage = encryptPayload(payload);

      await api.post(
        "/update-activity-status",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { dataObject: encryptedMessage },
        }
      );

      toast.success(
        `Activity Status is ${
          updatedStatus ? "Activated" : "Inactivated"
        } successfully`
      );
      setActivityData((prevData) =>
        prevData.map((item) =>
          item.activityId === activity.activityId
            ? { ...item, isActive: updatedStatus }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating activity status:", error);
      toast.error("Failed to update activity status.");
    }
  };

  const handleEdit = (activity) => {
    setActivity({
      activityCode: activity.activityCode,
      activityName: activity.activityName,
      activityRemarks: activity.activityRemarks,
    });
    setEditingActivityId(activity.activityId);
    setIsFormOpen(true);
    setActiveKey("0");
  };

  const columns = [
    {
      name: "Sl",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "70px",
    },
    {
      name: "Activity Code",
      selector: (row) => row.activityCode,
      sortable: true,
    },
    {
      name: "Activity Name",
      selector: (row) => row.activityName,
      sortable: true,
    },
    {
      name: "Activity Remarks",
      selector: (row) => row.activityRemarks,
    },
    // {
    //   name: "Active",
    //   selector: (row) => (row.isActive ? "Yes" : "No"),
    //   sortable: true,
    // },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex" style={{ width: "max-content" }}>
          <Button
            variant="contained"
            color={row.isActive ? "error" : "success"}
            size="small"
            sx={{ minWidth: "auto" }}
            title={row.isActive ? "Inactivate" : "Activate"}
            onClick={() => handleStatusToggle(row)}
          >
            {row.isActive ? <FaLock /> : <FaLockOpen />}
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            title="Edit"
            sx={{ minWidth: "auto" }}
            onClick={() => handleEdit(row)}
            style={{ marginLeft: "8px" }}
          >
            <FaEdit />
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="activity-section-container">
      <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
        {/* Add/Edit Activity Accordion */}
        <Accordion.Item eventKey="0">
          <Accordion.Header
            onClick={() => setIsFormOpen((prev) => !prev)}
            className="custbg"
          >
            <div
              className="mstaccodion d-flex"
              style={{ justifyContent: "space-between", width: "100%" }}
            >
              <span className="accordion-title">
                {editingActivityId
                  ? "Edit Activity Details"
                  : "Add Activity Details"}
              </span>
              <span className="accordion-icon">
                {isFormOpen ? <FaMinus /> : <FaPlus />}
              </span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <div className="">
              <div className="row">
                <form onSubmit={handleSubmit} className="row">
                  <div className="form-group col-md-4">
                    <TextField
                      fullWidth
                      type="number"
                      label={
                        <span>
                          Activity Code <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      variant="outlined"
                      id="activityCode"
                      name="activityCode"
                      size="small"
                      value={activity.activityCode}
                      onChange={handleInputChange}
                      error={
                        !validateInput(activity.activityCode) &&
                        activity.activityCode !== ""
                      }
                      helperText={
                        !validateInput(activity.activityCode) &&
                        activity.activityCode !== ""
                          ? "Only alphanumeric and .,/- & () characters allowed"
                          : ""
                      }
                    />
                  </div>
                  <div className="form-group col-md-4">
                    <TextField
                      fullWidth
                      label={
                        <span>
                          Activity Name <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      variant="outlined"
                      id="activityName"
                      name="activityName"
                      size="small"
                      value={activity.activityName}
                      onChange={handleInputChange}
                      error={
                        !validateInput(activity.activityName) &&
                        activity.activityName !== ""
                      }
                      helperText={
                        validateInput(activity.activityName) &&
                        activity.activityName == ""
                          ? "Only alphanumeric and .,/- & () characters allowed"
                          : "Only alphanumeric and .,/- & () characters allowed"
                      }
                    />
                  </div>
                  <div className="form-group col-md-4">
                    <TextField
                      fullWidth
                      label={
                        <span>
                          Activity Remarks{" "}
                          <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      variant="outlined"
                      // multiline
                      minRows={3}
                      maxRows={10}
                      id="activityRemarks"
                      name="activityRemarks"
                      size="small"
                      value={activity.activityRemarks}
                      onChange={handleInputChange}
                      error={
                        !validateInput(activity.activityRemarks) &&
                        activity.activityRemarks !== ""
                      }
                      helperText={
                        validateInput(activity.activityRemarks) &&
                        activity.activityRemarks == ""
                          ? "Only alphanumeric and .,/- & () characters allowed"
                          : "Only alphanumeric and .,/- & () characters allowed"
                      }
                      InputProps={{
                        style: customStyles.textarea,
                      }}
                      inputProps={{
                        maxLength: 500,
                        style: {
                          resize: "vertical",
                        },
                      }}
                    />
                  </div>
                  <div className="col-md-12 text-center mt-3">
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Saving..."
                        : editingActivityId
                        ? "Update"
                        : "Save"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      className="ms-2"
                      onClick={handleReset}
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </Accordion.Body>
        </Accordion.Item>

        {/* View Activity Table Accordion */}
        <Accordion.Item eventKey="1" className="mt-3">
          <Accordion.Header
            onClick={() => setIsTableOpen((prev) => !prev)}
            className="custbg"
          >
            <div
              className="mstaccodion d-flex"
              style={{ justifyContent: "space-between", width: "100%" }}
            >
              <span className="accordion-title">View Activities</span>
              <span className="accordion-icon">
                {isTableOpen ? <FaMinus /> : <FaPlus />}
              </span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive">
                  <DataTable
                    columns={columns}
                    data={activityData}
                    pagination
                    highlightOnHover
                    responsive
                    noDataComponent="No data available"
                    customStyles={customStyles}
                    // paginationServer
                    // paginationTotalRows={totalRows} // Set total rows for server-side pagination
                    // paginationPerPage={rowSize}
                    // paginationDefaultPage={pageNo}
                    // onChangePage={(page) => setPageNo(page)} // Update page state
                    // onChangeRowsPerPage={(newRowSize) => {
                    //   setRowSize(newRowSize);
                    //   setPageNo(1); // Reset to first page when changing rows per page
                    // }}
                  />
                </div>
              </div>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default ManageActivity;
