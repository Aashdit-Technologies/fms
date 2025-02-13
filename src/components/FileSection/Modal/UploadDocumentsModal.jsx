import { Box, Grid, Typography } from "@mui/material";
import React, { useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import ReactSelect from "react-select";

const UploadDocumentsModal = ({ open, onClose }) => {
    const [isSendEnabled, setIsSendEnabled] = useState(false);
      const [searchFilters, setSearchFilters] = useState({
        department: "",
        role: "",
        name: "",
        id: "",
      });
        const handleSearch = () => {
          const filteredData = searchFilters.filter((data) => {
            return (
              (searchFilters.department === "" ||
                data.department === searchFilters.department) &&
              (searchFilters.role === "" || data.role === searchFilters.role) &&
              (searchFilters.name === "" ||
                data.empNameWithDesgAndDept.includes(searchFilters.name)) &&
              (searchFilters.id === "" || data.id.includes(searchFilters.id))
            );
          });
          setSearchFilters(filteredData);
        };
    const officeOptions = [
        { value: "HO", label: "Head Office || HO" },
        { value: "ANGUL", label: "Angul || ANGUL" },
        { value: "BCoD-1", label: "Bhubaneswar Const.- I || BCoD-1" },
        { value: "BCoD-2", label: "Bhubaneswar Const.- II || BCoD-2" },
        { value: "BCoD-3", label: "Bhubaneswar Const.- III || BCoD-3" },
        { value: "BHM", label: "Berhampur || BHM" },
      ];
  return (
    <div>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="send-to-modal"
        aria-describedby="modal-to-send-file"
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            padding: 0,
            borderRadius: 2,
            maxWidth: "800px",
            margin: "auto",
            marginTop: "50px",
            overflow: "auto",
          }}
        >
          {/* Modal Heading with Background Color */}
          <Box
            sx={{
              bgcolor: "#1976d2", // Blue background color
              color: "white", // White text color
              padding: 1,
              borderRadius: "4px 4px 0 0", // Rounded corners at the top
              width: "100%",
              textAlign: "center",
            }}
          >
            <Typography variant="h6">Send To</Typography>
          </Box>
          <div className="w-100 px-4 pb-3">
            {/* Filter and Search Section */}
            <Grid container spacing={2} sx={{ mb: 3, mt: 2 }}>
              {/* Department Select Field */}
              <Grid item xs={3}>
                <label>Organization Name</label>
                <ReactSelect
                  options={officeOptions}
                  value={officeOptions.find(
                    (option) => option.value === searchFilters.office
                  )}
                  onChange={(selectedOption) =>
                    setSearchFilters({
                      ...searchFilters,
                      office: selectedOption.value,
                    })
                  }
                  isSearchable
                />
              </Grid>

              <Grid item xs={3}>
                <label>Company Name</label>
                <ReactSelect
                  options={officeOptions}
                  value={officeOptions.find(
                    (option) => option.value === searchFilters.office
                  )}
                  onChange={(selectedOption) =>
                    setSearchFilters({
                      ...searchFilters,
                      office: selectedOption.value,
                    })
                  }
                  isSearchable
                />
              </Grid>
              <Grid item xs={3}>
                <label>Office Name</label>
                <ReactSelect
                  options={officeOptions}
                  value={officeOptions.find(
                    (option) => option.value === searchFilters.office
                  )}
                  onChange={(selectedOption) =>
                    setSearchFilters({
                      ...searchFilters,
                      office: selectedOption.value,
                    })
                  }
                  isSearchable
                />
              </Grid>
              <Grid item xs={3}>
                <label>Department Name</label>
                <ReactSelect
                  options={officeOptions}
                  value={officeOptions.find(
                    (option) => option.value === searchFilters.office
                  )}
                  onChange={(selectedOption) =>
                    setSearchFilters({
                      ...searchFilters,
                      office: selectedOption.value,
                    })
                  }
                  isSearchable
                />
              </Grid>
              <Grid item xs={3}>
                <label>Designation Name</label>
                <ReactSelect
                  options={officeOptions}
                  value={officeOptions.find(
                    (option) => option.value === searchFilters.office
                  )}
                  onChange={(selectedOption) =>
                    setSearchFilters({
                      ...searchFilters,
                      office: selectedOption.value,
                    })
                  }
                  isSearchable
                />
              </Grid>
            </Grid>

            {/* Search Button */}
            <div className="sendtomodl_btn w-100 text-center">
              <Button
                variant="contained"
                color="primary"
                sx={{ mb: 3 }}
                // onClick={handleSearch}
              >
                Search
              </Button>
            </div>

            {/* Table Section */}
            <Table bordered>
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(searchFilters) && searchFilters.length > 0 ? (
                  searchFilters.map((data, index) => (
                    <tr key={index}>
                      <td>{data.empNameWithDesgAndDept || data.name}</td>
                      <td>{data.department || "N/A"}</td>
                      <td>{data.role || "N/A"}</td>
                      <td>
                        <Radio
                          checked={selectedRow === index}
                          onChange={() => handleRadioButtonChange(index)}
                          value={data.empDeptRoleId || null}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No data available</td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* Action Buttons */}
            <div className="sendtomodl_btn w-100 text-center">
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!isSendEnabled}
                  // onClick={handleSendToModal}
                >
                  Send
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setIsSendToModalOpen(false)}
                  sx={{ ml: 2 }}
                >
                  Cancel
                </Button>
              </Box>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default UploadDocumentsModal;
