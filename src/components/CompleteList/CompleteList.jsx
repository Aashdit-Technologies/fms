import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button } from "@mui/material";
import useAuthStore from "../../store/Store";
import api from "../../Api/Api";
import { encryptPayload } from "../../utils/encrypt.js";

const CompleteList = () => {
  const [completeListData, setCompleteListData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = useAuthStore.getState().token;

      const response = await api.get("/file/complete-list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCompleteListData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching complete list data:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      name: "SL",
      selector: (row, index) => index + 1,
      sortable: true,
    },
    {
      name: "File Number",
      selector: (row) => row.fileNo,
      sortable: true,
    },
    {
      name: "File Name",
      selector: (row) => row.fileName,
      sortable: true,
    },
    {
      name: "From",
      selector: (row) => row.fromEmployee,
      sortable: true,
    },
    {
      name: "Completed On",
      selector: (row) => row.completedOn,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <>
          <Button variant="contained" color="primary" size="small" sx={{ marginRight: 1 }}>
            View
          </Button>
          <Button variant="contained" color="error" size="small">
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={completeListData}
        progressPending={loading}
        pagination
        highlightOnHover
      />
    </div>
  );
};

export default CompleteList;