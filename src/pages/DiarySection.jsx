import React, { useEffect, useState } from "react";
import "../pages/diarysection.css";
import { FaPlus, FaMinus } from "react-icons/fa6";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const customStyles = {
  table: {
    style: {
      border: "1px solid #dee2e6",
    },
  },
  headRow: {
    style: {
      fontWeight: "bold",
      fontSize: "16px",
    },
  },
  rows: {
    style: {
      borderBottom: "1px solid #dee2e6",
    },
  },
};

const DiarySection = () => {

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [senderDetails, setSenderDetails] = useState({
    groupName: "",
    name: "",
    address: "",
    mobile: "",
    email: "",
    fax: "",
    district: "",
  });
  const [formData, setFormData] = useState({
    sender: "",
    letterNumber: "",
    senderDate: "",
    subject: "",
    remarks: "",
    isConfidential: false,
    isUrgent: false,
    addEnclosure: false,
  });
  const [rows, setRows] = useState([
    {
      departmentName: "",
      addresseeDesignation: "",
      addressee: "",
      memoNumber: "",
      addressList: [], // For storing the dynamic Addressee data
    },
  ]);
  
  const [enclosureRows, setEnclosureRows] = useState([
    {
      enclosureType: "",
      enclosureName: "",
      file: null,
    },
  ]);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [designationList, setDesignationList] = useState([]);

  const token = useAuthStore.getState().token;

  const columns = [
    {
      name: "SI No.",
      selector: (_, index) => index + 1,
      sortable: true,
      width: "100px",
    },
    {
      name: "Group Name",
      selector: (row) => row.groupName,
      sortable: true,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Address",
      selector: (row) => row.address,
      sortable: true,
    },
    {
      name: "Mobile",
      selector: (row) => row.mobile,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Fax",
      selector: (row) => row.fax,
      sortable: true,
    },
    {
      name: "District",
      selector: (row) => row.district,
      sortable: true,
    },
  ];

  const toggleUploadAccordion = () => {
    setIsUploadOpen(!isUploadOpen);
  };


  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const toggleSenderAccordion = () => toggleSection("addSender");
  const toggleSenderListAccordion = () => toggleSection("senderList");


  const handleModalOpen = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSenderDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // All Sender List get api
  const fetchRecords = async () => {
    try {
      if (!token) {
        throw new Error("Authorization token is missing");
      }

      const response = await api.get("/diary-section/address-list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allAddressList = response?.data?.data?.allAddressList;

      if (response.status === 200 && Array.isArray(allAddressList)) {
        setRecords(allAddressList);
        setFilteredRecords(allAddressList);
      } else {
        alert("Failed to fetch data. Unexpected response format.");
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      if (error.response) {
        alert(
          `Error fetching records: ${
            error.response.data.message || "Unknown error"
          }`
        );
      } else {
        alert("Network or unexpected error occurred while fetching records.");
      }
    }
  };

  // departmentList api
  useEffect(() => {
    departmentListfetchdata();
  }, []);
  
  const departmentListfetchdata = async () => {
    try {
      if (!token) {
        throw new Error("Authorization token is missing");
      }
  
      const response = await api.get(
        "diary-section/department-designation-list",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      const allData = response?.data?.data; 
      console.log(allData);
  
      if (response.status === 200 && allData) {
      
        setDepartmentList(allData.departmentList || []);
        setDesignationList(allData.DesignationList || []);
       
      } else {
        alert("Failed to fetch data. Unexpected response format.");
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      if (error.response) {
        alert(
          `Error fetching records: ${
            error.response.data.message || "Unknown error"
          }`
        );
      } else {
        alert("Network or unexpected error occurred while fetching records.");
      }
    }
  };
  
  

  // Add Sender Details
  const handleSaveSender = async (e) => {
    e.preventDefault();

    const { groupName, name, address, mobile, email, fax, district } =
      senderDetails;
    if (!groupName || !name || !address || !mobile || !email || !district) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = { groupName, name, address, mobile, email, fax, district };

    try {
      const response = await api.post(
        "diary-section/save-address-book",
        { dataObject: encryptPayload(payload) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Data saved successfully!");
      setSenderDetails({
        groupName: "",
        name: "",
        address: "",
        mobile: "",
        email: "",
        fax: "",
        district: "",
      });

      fetchRecords();
    } catch (error) {
      if (error.response) {
        toast.error(
          `Error: ${error.response.data.message || "Failed to save data"}`
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleFilter = (event) => {
    const query = event.target.value.toLowerCase();
    const filtered = records.filter(
      (row) =>
        row.groupName.toLowerCase().includes(query) ||
        row.name.toLowerCase().includes(query)
    );
    setFilteredRecords(filtered);
  };


  // const handleRowChange = (index, field, value) => {
  //   const updatedRows = [...rows];
  //   updatedRows[index][field] = value;
  //   setRows(updatedRows);
  // };


  const handleRowChange = async (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
  
    const { departmentName, addresseeDesignation } = updatedRows[index];
  
    // Trigger API call when both departmentName and addresseeDesignation are selected
    if (field === "departmentName" || field === "addresseeDesignation") {
      if (departmentName && addresseeDesignation) {
        try {
          const response = await api.get(
            `diary-section/get-employee-details-by-deptId-and-desigId?deptId=${departmentName}&degId=${addresseeDesignation}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
  
          const allData = response?.data?.Employee;
  
          if (response.status === 200 && Array.isArray(allData)) {
            updatedRows[index].addressList = allData.map((employee) => ({
              id: employee.employeeId,
              name: `${employee.firstName} ${employee.lastName || ""}`.trim(),
            }));
          } else {
            updatedRows[index].addressList = [];
            alert("Failed to fetch Addressee data.");
          }
        } catch (error) {
          console.error("Error fetching Addressee data:", error);
          updatedRows[index].addressList = [];
          alert("Failed to fetch Addressee data. Please try again.");
        }
      } else {
        updatedRows[index].addressList = []; // Reset if one of the fields is empty
      }
    }
  
    setRows(updatedRows);
  };
  
  
  
  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        departmentName: "",
        addresseeDesignation: "",
        addressee: "",
        memoNumber: "",
        addressList: [], // Initialize empty array for addressee options
      },
    ]);
  };
  
  
  
  
  
  // Remove a row
  const handleRemoveRow = (index) => {
    if (rows.length > 1) {
      const updatedRows = rows.filter((_, i) => i !== index);
      setRows(updatedRows);
    } else {
      alert("At least one row is required.");
    }
  };

  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`File "${file.name}" uploaded successfully!`);
    }
  };
  const handleCheckboxChange = (e) => {
    setShowTable(e.target.checked);
  };


  const handleAddEnclosureRow = (e) => {
    e.preventDefault(); 
    setEnclosureRows((prevRows) => [
      ...prevRows,
      { enclosureType: "", enclosureName: "", file: null },
    ]);
  };
  const handleRemoveEnclosureRow = (index, e) => {
    e.preventDefault();
    if (enclosureRows.length > 1) {
      setEnclosureRows((prevRows) =>
        prevRows.filter((_, i) => i !== index)
      );
    } else {
      alert("At least one row is required.");
    }
  };
  const handleEnclosureRowChange = (index, field, value) => {
    setEnclosureRows((prevRows) =>
      prevRows.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  };


  return (
    <>
      {/* ToastContainer  */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Upload Inward Letter Section */}
      <div className="diary-section-container">
        <div className="accordion-header" onClick={toggleUploadAccordion}>
          <span className="accordion-title">Upload Inward Letter</span>
          <span className="accordion-icon">
            {isUploadOpen ? <FaMinus /> : <FaPlus />}
          </span>
        </div>
        {isUploadOpen && (
          <div className="accordion-body">
            <form>
              <div className="row align-items-center mb-3">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      Sender (
                      <span
                        onClick={handleModalOpen}
                        style={{ color: "blue", cursor: "pointer" }}
                      >
                        add New
                      </span>
                      ):
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                </div>
                <div className="col-md-4">
                  <label>Letter Number: *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="letterNumber"
                    value={formData.letterNumber}
                    onChange={handleInputChange}
                    placeholder="Enter letter number"
                  />
                </div>
                <div className="col-md-4">
                  <label>Sender Date: *</label>
                  <input
                    type="date"
                    className="form-control"
                    name="senderDate"
                    value={formData.senderDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            {/* Subject */}
              <div className="row mb-3">
                <div className="col-md-12">
                  <label>Subject: *</label>
                 
                    <textarea
                    className="form-control"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Enter subject"
                  />
                </div>
              </div>
              {/* Department Table */}
              <div className="row mb-3">
              <table className="table table-bordered mb-3">
                <thead>
                  <tr>
                    <th>Department Name *</th>
                    <th>Addressee Designation *</th>
                    <th>Addressee *</th>
                    <th>Memo Number</th>
                    <th>
                      <button
                        type="button"
                        className="btn btn-success me-2"
                        onClick={handleAddRow}
                      >
                        +
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <select
                          className="form-control"
                          value={row.departmentName}
                          onChange={(e) =>
                            handleRowChange(index, "departmentName", e.target.value)
                          }
                        >
                          <option value="">--Select Department--</option>
                          {departmentList.map((department) => (
                            <option
                              key={department.departmentId}
                              value={department.departmentId} // Pass ID for API call
                            >
                              {department.departmentName}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className="form-control"
                          value={row.addresseeDesignation}
                          onChange={(e) =>
                            handleRowChange(index, "addresseeDesignation", e.target.value)
                          }
                        >
                          <option value="">--Select Designation--</option>
                          {designationList.map((designation) => (
                            <option key={designation.id} value={designation.id}>
                              {designation.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className="form-control"
                          value={row.addressee}
                          onChange={(e) =>
                            handleRowChange(index, "addressee", e.target.value)
                          }
                        >
                          <option value="">--Select Addressee--</option>
                          {row.addressList.map((addressee) => (
                            <option key={addressee.id} value={addressee.id}>
                              {addressee.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={row.memoNumber}
                          onChange={(e) =>
                            handleRowChange(index, "memoNumber", e.target.value)
                          }
                          placeholder="Enter memo number"
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleRemoveRow(index)}
                        >
                          -
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>





              {/* Remarks */}
              <div className="row mb-3">
                <div className="col-md-12">
                  <label>Remarks:</label>
                  <textarea
                    className="form-control"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    placeholder="Enter remarks"
                  />
                </div>
              </div>
              {/* Add Enclosure */}
              <div className="row mb-3">
              <div className="col-md-3">
                  <input
                  type="file"
                  id="fileUploadInput"
                  className="form-control"
                  onChange={handleFileUpload}
                />
                        </div>
                <div className="col-md-3 mt-2">
                <input
            type="checkbox"
            className="form-check-input me-3"
            name="addEnclosure"
            onChange={handleCheckboxChange}
          />
                      <label className="form-check-label">
                      Add Enclosure
                    </label>
                </div>
                <div className="col-md-3 mt-2">
                <input
                      type="checkbox"
                      className="form-check-input me-3"
                      name="isUrgent" />
                    <label className="form-check-label">
                      Non-Urgent Letter
                    </label>
                </div>
                <div className="col-md-3 mt-2">
                <input
                      type="checkbox"
                      className="form-check-input me-3"
                      name="isUrgent" />
                    <label className="form-check-label">
                    Non-Confidential Letter
                    </label>
                </div>
              </div>
              {/* Enclosure Table */}
              <div className="row mb-3">
  {showTable && (
    <div className="table-responsive">
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Enclosure Type</th>
            <th>Enclosure Name</th>
            <th>Upload</th>
            <th>
              <button
                className="btn btn-success"
                onClick={handleAddEnclosureRow}
              >
                +
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {enclosureRows.map((row, index) => (
            <tr key={index}>
              <td>
                <select
                  className="form-select"
                  value={row.enclosureType}
                  onChange={(e) =>
                    handleEnclosureRowChange(
                      index,
                      "enclosureType",
                      e.target.value
                    )
                  }
                >
                  <option value="">- Select -</option>
                  <option value="type1">Type 1</option>
                  <option value="type2">Type 2</option>
                </select>
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={row.enclosureName}
                  onChange={(e) =>
                    handleEnclosureRowChange(
                      index,
                      "enclosureName",
                      e.target.value
                    )
                  }
                />
              </td>
              <td>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) =>
                    handleEnclosureRowChange(
                      index,
                      "file",
                      e.target.files[0]
                    )
                  }
                />
              </td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={(e) => handleRemoveEnclosureRow(index, e)}
                >
                  -
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
            </div>

                   {/* buttons */}
              <div className="row">
                <div className="col-md-12 text-center">
                  <button type="button" className="btn btn-success me-2">
                    Save
                  </button>
                  <button type="button" className="btn btn-primary me-2">
                    Save & Send
                  </button>
                  <button type="button" className="btn btn-danger">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className={`modal fade ${showModal ? "show" : ""}`}
          tabIndex="-1"
          style={{ display: showModal ? "block" : "none" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Sender</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleModalClose}
                ></button>
              </div>
              <div className="modal-body">
                {/* Add Sender Details */}
                <div className="diary-section-container">
                  <div
                    className="accordion-header"
                    onClick={toggleSenderAccordion}
                  >
                    <span className="accordion-title">Add Sender Details</span>
                    <span className="accordion-icon">
                      {openSection === "addSender" ? <FaMinus /> : <FaPlus />}
                    </span>
                  </div>
                  {openSection === "addSender" && (
                    <div className="accordion-body">
                      <form className="row align-items-center">
                        <div className="col-md-3 mb-3">
                          <div className="form-group">
                            <label>Group Name:</label>
                            <input
                              type="text"
                              className="form-control"
                              name="groupName"
                              placeholder="Enter Group Name"
                              value={senderDetails.groupName}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-3 mb-3">
                          <div className="form-group">
                            <label>Name:</label>
                            <input
                              type="text"
                              className="form-control"
                              name="name"
                              placeholder="Enter Name"
                              value={senderDetails.name}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-3 mb-3">
                          <div className="form-group">
                            <label>Address:</label>
                            <input
                              type="text"
                              className="form-control"
                              name="address"
                              placeholder="Enter Address"
                              value={senderDetails.address}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-3 mb-3">
                          <div className="form-group">
                            <label>Mobile:</label>
                            <input
                              type="text"
                              className="form-control"
                              name="mobile"
                              placeholder="EX: 8618604626"
                              value={senderDetails.mobile}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label>Email:</label>
                            <input
                              type="text"
                              className="form-control"
                              name="email"
                              placeholder="Ex: bonu@gmail.com"
                              value={senderDetails.email}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label>Fax:</label>
                            <input
                              type="text"
                              className="form-control"
                              name="fax"
                              placeholder="Enter Fax"
                              value={senderDetails.fax}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label>District:</label>
                            <input
                              type="text"
                              className="form-control"
                              name="district"
                              placeholder="Enter District"
                              value={senderDetails.district}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-3 mt-4">
                          <div className="form-group">
                            <button
                              type="button"
                              className="btn btn-primary me-3"
                              onClick={handleSaveSender}
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                {/* All Sender List */}
                <div className="diary-section-container">
                  <div
                    className="accordion-header"
                    onClick={toggleSenderListAccordion}
                  >
                    <span className="accordion-title">All Sender List</span>
                    <span className="accordion-icon">
                      {openSection === "senderList" ? <FaMinus /> : <FaPlus />}
                    </span>
                  </div>
                  {openSection === "senderList" && (
                    <div className="accordion-body">
                      <div className="d-flex justify-content-end">
                        <div className="col-md-3">
                          <div className="form-group">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search..."
                              onChange={handleFilter}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="table-responsive mt-3">
                        <DataTable
                          columns={columns}
                          data={filteredRecords}
                          fixedHeader
                          pagination
                          customStyles={customStyles}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
   {/* Modal  close*/}
      {showModal && (
        <div
          className="modal-backdrop fade show"
          onClick={handleModalClose}
        ></div>
      )}
    </>
  );
};

export default DiarySection;
