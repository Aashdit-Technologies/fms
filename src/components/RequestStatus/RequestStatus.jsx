import React, { useState, useEffect } from "react";
import useApiListStore from "../ManageFile/ApiListStore";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";

const RequestStatus = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rqstStsData, setRqstStsData] = useState({ prioritylst: [], receiptList: [] });
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    fetchFilteredData(fromDate, toDate);
  }, [fromDate, toDate]);

  const fetchFilteredData = async (fromDate, toDate) => {
    setLoading(true); // Show loading spinner
    try {
      const token = useAuthStore.getState().token;
      const params = {};

      // Add filters to params if they are set
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await api.get("/file/view-status", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setRqstStsData(response.data); // Update table data
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  const handleDateChange = (setter, event) => {
    setter(event.target.value);
  };

  return (
    <div>
      <div className="row">
        {/* From Date Filter */}
        <div className="form-group col-md-3">
          <label htmlFor="fromDate">From Date</label>
          <input
            type="date"
            id="fromDate"
            className="form-control"
            value={fromDate}
            onChange={(e) => handleDateChange(setFromDate, e)}
          />
        </div>

        {/* To Date Filter */}
        <div className="form-group col-md-3">
          <label htmlFor="toDate">To Date</label>
          <input
            type="date"
            id="toDate"
            className="form-control"
            value={toDate}
            onChange={(e) => handleDateChange(setToDate, e)}
          />
        </div>

        <div className="col-md-12 mt-5">
          <div className="table-responsive">
            {loading ? (
              <p>Loading data...</p>
            ) : (
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>SL</th>
                    <th>File Number</th>
                    <th>File Name</th>
                    <th>From</th>
                    <th>Send On</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rqstStsData.receiptList && rqstStsData.receiptList.length > 0 ? (
                    rqstStsData.receiptList.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <a href="#">{item.fileNo}</a>
                        </td>
                        <td>{item.fileName}</td>
                        <td>{item.fromEmployee}</td>
                        <td>{item.sentOn}</td>
                        <td>{item.status}</td>
                        <td>
                          <button>Edit</button>
                          <button>Delete</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestStatus;
