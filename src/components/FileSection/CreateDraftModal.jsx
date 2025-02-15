import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  IconButton,
  Button,
  Typography,
  Grid,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
} from "@mui/material";
import { FaPlus, FaMinus } from "react-icons/fa";
import CorrespondenceEditor from "./CorrespondenceEditor";
import ReactSelect from "react-select";
import { Textarea } from "@mui/joy";

const CreateDraftModal = ({ open, onClose, officeNames }) => {
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    referenceNo: "",
    addedBy: "",
    content: "",
    office: "",
    tempType: "",
  });

  useEffect(() => {
    if (officeNames && officeNames.data) {
      setData(officeNames.data);
    }
  }, [officeNames]);
  useEffect(() => {
    if (open) {
      setShowForm(false);
    }
  }, [open]);
  useEffect(() => {
    setFormData({
      subject: "",
      referenceNo: "",
      addedBy: "",
      content: "",
      office: "",
      tempType: "",
    });
  }, []);

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
    }
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
          <Typography variant="h6">Create Draft</Typography>
          <IconButton onClick={() => setShowForm(!showForm)} color="primary">
            {showForm ? <FaMinus /> : <FaPlus />}
          </IconButton>
        </Box>

        {showForm && (
          <Box sx={{ mt: 2, display: "grid", gap: 2 }}>
            <Grid item xs={12}>
              <label>Office Name</label>
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
                <Textarea size="lg" name="Size" placeholder="Large" />
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    Company
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select-company"
                    label="Company"
                  >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    Office
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select-office"
                    label="Office"
                  >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    Department
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select-department"
                    label="Department"
                  >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    Designation
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select-designation"
                    label="Designation"
                  >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                  Approving Authority:                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select-authority"
                    label="Approving Authority"
                  >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}

        <Box sx={{ mt: 2 }} className="editor-containers">
          <CorrespondenceEditor
            content={formData.content}
            onContentChange={(value) =>
              setFormData((prev) => ({ ...prev, content: value }))
            }
          />
        </Box>

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
        >
          <Button variant="contained" color="success">
            Save
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() =>
              setFormData({
                subject: "",
                referenceNo: "",
                addedBy: "",
                content: "",
                office: "",
                tempType: "",
              })
            }
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
