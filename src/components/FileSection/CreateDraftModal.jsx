import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  IconButton,
  Button,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import { FaPlus, FaMinus } from "react-icons/fa";
import CorrespondenceEditor from "./CorrespondenceEditor";
import ReactSelect from "react-select";
const CreateDraftModal = ({ open, onClose }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    referenceNo: "",
    addedBy: "",
    content: "",
  });
  useEffect(() => {
    if (open) {
      setShowForm(false);
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
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
          maxHeight: "100vh",
          overflowY: "auto",
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
                // options={officeOptions}
                // value={officeOptions.find(
                //   (option) => option.value === formData.office
                // )}
                // onChange={(selectedOption) =>
                //   setFormData((prev) => ({
                //     ...prev,
                //     office: selectedOption.value,
                //   }))
                // }
                isSearchable
              />
            </Grid>
            <Grid item xs={12}>
              <label>Letter Template</label>
              <ReactSelect
                // options={letterTemplateOptions}
                // value={letterTemplateOptions.find(
                //   (option) => option.value === formData.letterTemplate
                // )}
                // onChange={(selectedOption) =>
                //   setFormData((prev) => ({
                //     ...prev,
                //     letterTemplate: selectedOption.value,
                //   }))
                // } options={letterTemplateOptions}
                // value={letterTemplateOptions.find(
                //   (option) => option.value === formData.letterTemplate
                // )}
                // onChange={(selectedOption) =>
                //   setFormData((prev) => ({
                //     ...prev,
                //     letterTemplate: selectedOption.value,
                //   }))
                // }
                isSearchable
              />
            </Grid>
            <Grid item xs={12}>
              <label>Letter Template</label>
              <ReactSelect
                // options={letterTemplateOptions}
                // value={letterTemplateOptions.find(
                //   (option) => option.value === formData.letterTemplate
                // )}
                // onChange={(selectedOption) =>
                //   setFormData((prev) => ({
                //     ...prev,
                //     letterTemplate: selectedOption.value,
                //   }))
                // }
                isSearchable
              />
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
