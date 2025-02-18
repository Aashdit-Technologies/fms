import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import useApiListStore from "../ManageFile/ApiListStore";
import useAuthStore from "../../store/Store";
import api from "../../Api/Api";
import { encryptPayload } from "../../utils/encrypt.js";
import { Button, TextField, Autocomplete } from "@mui/material"; // Material UI components
import { toast } from "react-toastify"; // Toast notifications

const FileCustodian = () => {
  const { fetchAllData, office } = useApiListStore();
  const [selectedOffice, setSelectedOffice] = useState("");
  const [selectedOfficeTo, setSelectedOfficeTo] = useState("");
  const [selectedCustodian, setSelectedCustodian] = useState("");
  const [selectedCustodianTo, setSelectedCustodianTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [custodianData, setCustodianData] = useState([]);
  const [custodianDataTo, setCustodianDataTo] = useState([]);
  const [custodianTableData, setCustodianTableData] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const fetchCustodianTableData = async () => {
      if (!selectedCustodian) {
        setCustodianTableData([]);
        return;
      }

      setLoading(true);
      const payload = { fromCustodianId: selectedCustodian };

      try {
        const token = useAuthStore.getState().token;
        const encryptedMessage = encryptPayload(payload);
        const response = await api.get("file/file-custodian", {
          headers: { Authorization: `Bearer ${token}` },
          params: { dataObject: encryptedMessage },
        });

        setCustodianTableData(response.data.data || []);
        console.log(setCustodianTableData);
        
      } catch (error) {
        console.error("Error fetching custodian table data:", error);
        setCustodianTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustodianTableData();
  }, [selectedCustodian]);

  useEffect(() => {
    const fetchCustodianData = async () => {
      if (!selectedOffice) {
        setCustodianData([]);
        return;
      }

      const payload = { officeId: selectedOffice };

      try {
        const token = useAuthStore.getState().token;
        const encryptedMessage = encryptPayload(payload);
        const response = await api.get("file/custodian-list-by-office-id", {
          headers: { Authorization: `Bearer ${token}` },
          params: { dataObject: encryptedMessage },
        });

        setCustodianData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching custodian data:", error);
        setCustodianData([]);
      }
    };

    fetchCustodianData();
  }, [selectedOffice]);

  useEffect(() => {
    const fetchCustodianDataTo = async () => {
      if (!selectedOfficeTo) {
        setCustodianDataTo([]);
        return;
      }

      const payload = { officeId: selectedOfficeTo };

      try {
        const token = useAuthStore.getState().token;
        const encryptedMessage = encryptPayload(payload);
        const response = await api.get("file/custodian-list-by-office-id", {
          headers: { Authorization: `Bearer ${token}` },
          params: { dataObject: encryptedMessage },
        });

        setCustodianDataTo(response.data.data || []);
      } catch (error) {
        console.error("Error fetching custodian data:", error);
        setCustodianDataTo([]);
      }
    };

    fetchCustodianDataTo();
  }, [selectedOfficeTo]);

  const handleCheckboxChange = (docFileId) => {
    setSelectedFiles((prevSelected) =>
      prevSelected.includes(docFileId)
        ? prevSelected.filter((id) => id !== docFileId)
        : [...prevSelected, docFileId]
    );
  };

  const handleAssignFiles = async () => {
    if (!selectedCustodian || !selectedCustodianTo || selectedFiles.length === 0) {
      toast.warning("Please select both custodians and at least one file.");
      return;
    }

    const payload = {
      toCustodianId: selectedCustodianTo,
      fileIds: selectedFiles,
    };

    try {
      const token = useAuthStore.getState().token;
      const encryptedMessage = encryptPayload(payload);
      const response = await api.post("file/assign-file", {}, {
        headers: { Authorization: `Bearer ${token}` },
        params: { dataObject: encryptedMessage },
      });

      if (response.status === 200) {
        toast.success("Files assigned successfully!");

        setCustodianTableData((prevData) =>
          prevData.filter((file) => !selectedFiles.includes(file.docFileId))
        );

        setSelectedFiles([]);
      }
    } catch (error) {
      console.error("Error assigning files:", error);
      toast.error("Failed to assign files.");
    }
  };

  const filteredData = custodianTableData.filter((item) =>
    item.docFileName.toLowerCase().includes(searchText.toLowerCase()) ||
    item.subjectName.toLowerCase().includes(searchText.toLowerCase()) ||
    item.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
    item.status.toLowerCase().includes(searchText.toLowerCase())
  );


  // Function to handle "Select All" checkbox change
const handleSelectAll = (event) => {
  if (event.target.checked) {
    setSelectedFiles(data.map((row) => row.docFileId)); // Select all rows
  } else {
    setSelectedFiles([]); // Deselect all rows
  }
};


  const columns = [
    {
      name: "Select",
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedFiles.includes(row.docFileId)}
          onChange={() => handleCheckboxChange(row.docFileId)}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    { name: "File Number", selector: (row) => row.docFileName, sortable: true },
    { name: "Subject", selector: (row) => row.subjectName, sortable: true },
    { name: "Custodian", selector: (row) => row.fullName, sortable: true },
    { name: "Status", selector: (row) => row.status, sortable: true },
  ];

  return (
    <div>
      <form className="row">
      <div className="form-group col-md-3">
      {/* <label htmlFor="officeFromSelect">Office (From)</label> */}
      <Autocomplete
        id="officeFromSelect"
        options={office}
        getOptionLabel={(option) => option.officeOrgName}
        value={office.find((o) => o.officeOrgId === selectedOffice) || null}
        onChange={(event, newValue) => setSelectedOffice(newValue ? newValue.officeOrgId : "")}
        renderInput={(params) => (
          <TextField {...params} label="Select Office" variant="outlined" fullWidth />
        )}
      />
    </div>

        {/* Custodian (From) */}
        <div className="form-group col-md-3">
          {/* <label htmlFor="custodianFromSelect">Custodian (From)</label> */}
          <Autocomplete
            id="custodianFromSelect"
            options={custodianData}
            getOptionLabel={(option) => option.custodianName}
            value={custodianData.find((c) => c.custodianId === selectedCustodian) || null}
            onChange={(event, newValue) => setSelectedCustodian(newValue ? newValue.custodianId : "")}
            renderInput={(params) => (
              <TextField {...params} label="Select Custodian" variant="outlined" fullWidth />
            )}
          />
        </div>

        {/* Data Table Search */}
        {/* <div className="form-group col-md-12 mt-3">
          <TextField
            label="Search Files"
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by File Number, Subject, Custodian, or Status"
          />
        </div> */}

        {/* Data Table */}
        <div className="col-md-12 mt-4">
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            subHeader
            subHeaderComponent={
              <TextField
                label="Search..."
                fullWidth
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            }
            highlightOnHover
            pointerOnHover
            className="custom-data-table"
          />
        </div>

        {/* Office (To) */}
        <div className="form-group col-md-3">
      {/* <label htmlFor="officeToSelect">Office (To)</label> */}
      <Autocomplete
        id="officeToSelect"
        options={office}
        getOptionLabel={(option) => option.officeOrgName}
        value={office.find((o) => o.officeOrgId === selectedOfficeTo) || null}
        onChange={(event, newValue) => setSelectedOfficeTo(newValue ? newValue.officeOrgId : "")}
        renderInput={(params) => (
          <TextField {...params} label="Select Office" variant="outlined" fullWidth />
        )}
      />
    </div>

        {/* Custodian (To) */}
        <div className="form-group col-md-3">
      {/* <label htmlFor="custodianToSelect">Custodian (To)</label> */}
      <Autocomplete
        id="custodianToSelect"
        options={custodianDataTo}
        getOptionLabel={(option) => option.custodianName}
        value={custodianDataTo.find((c) => c.custodianId === selectedCustodianTo) || null}
        onChange={(event, newValue) => setSelectedCustodianTo(newValue ? newValue.custodianId : "")}
        renderInput={(params) => (
          <TextField {...params} label="Select Custodian To" variant="outlined" fullWidth />
        )}
      />
    </div>

        {/* Assign Button */}
        <div className="col-md-12 text-center mt-4">
          <Button
            variant="contained"
            color="primary"
            onClick={handleAssignFiles}
            disabled={loading}
          >
            Assign Files
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FileCustodian;
