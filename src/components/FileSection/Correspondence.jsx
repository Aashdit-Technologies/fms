import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Box, Button, TextField, Tooltip, Typography } from "@mui/material";
import {
  FaEye,
  FaDownload,
  FaHistory,
  FaArrowLeft,
  FaArrowRight,
  FaPlus,
  FaTimes,
  FaCloudUploadAlt,
  FaEdit,
} from "react-icons/fa";
import styled from "@emotion/styled";
import { encryptPayload } from "../../utils/encrypt";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import CreateDraftModal from "./CreateDraftModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { HistoryModal, UploadModal } from "./Modal/AllIconModal";
import { toast } from "react-toastify";

const StyledButton = styled(Button)`
  margin: 0 4px;
  min-width: 32px;
  padding: 4px;
`;

const TableContainer = styled.div`
  background: #ffffff;
  font-family: "Roboto", sans-serif;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
  height: 500px;
  overflow: auto;
`;

const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 2px solid #dee2e6;
`;

const Title = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const ActionButton = styled(Button)`
  background-color: #007bff;
  text-transform: none;
  color: white;
  padding: 6px 16px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 6px;
  &:hover {
    background-color: #0056b3;
  }
`;

const customStyles = {
  table: {
    style: {
      backgroundColor: "white",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#007bff",
      color: "white",
      fontWeight: "bold",
      minHeight: "50px",
      fontSize: "14px",
    },
  },
  rows: {
    style: {
      fontSize: "14px",
      color: "#333",
      minHeight: "50px",
      "&:nth-of-type(odd)": {
        backgroundColor: "#f0f5ff",
      },
    },
  },
};
const fetchOffices = async () => {
  const response = await api.get("file/letter-content");

  return response.data;
};

const Correspondence = ({
  fileDetails,
  correspondence,
  onView,
  onHistory,
  open,
  onClose,
}) => {
  const token =
    useAuthStore((state) => state.token) || sessionStorage.getItem("token");

  const [modalOpen, setModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [enclosuresData, setEnclosuresData] = useState([]);
  const [uploadData, setUploadData] = useState(null);
  const [selectedCorrId, setSelectedCorrId] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [officeNames, setOfficeNames] = useState([]);
  const allDetails = fileDetails?.data || {};
  const [organizationsData, setOrganizationsData] = useState([]);
  const [editMalady, setEditMalady] = useState({});
  console.log("editMalady", editMalady);
  
  const {
    data: offices,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["offices"],
    queryFn: fetchOffices,
    staleTime: 60000,
    cacheTime: 300000,
  });

  const fetchHistoryData = async (draftNo, token) => {
    const encryptedData = encryptPayload({ draftNo: draftNo });
    const response = await api.post(
      "file/file-corr-history",
      { dataObject: encryptedData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("History Data:", response.data);

    return response.data;
  };
  const fetchEnclosuresData = async (corrId) => {
    const encryptedData = encryptPayload({ corrId: corrId });
    const response = await api.post(
      "file/get-file-correspondence-enclosures",
      { dataObject: encryptedData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Enclosures Data:", response.data);
    return response.data;
  };
  const { mutate: fetchEnclosures, isLoading: isLoadingEnclosures } =
    useMutation({
      mutationFn: fetchEnclosuresData,
      onSuccess: (data) => {
        setUploadModalOpen(true);
        setEnclosuresData(data);
      },
      onError: (error) => {
        console.error("Error fetching enclosures", error);
      },
    });
  const fetchUploadData = async () => {
    const response = await api.get("common/enclousuretype-list", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Upload Data:", response.data);
    return response.data;
  };
  const { mutate: fetchUpload, isLoading: isLoadingUpload } = useMutation({
    mutationFn: fetchUploadData,
    onSuccess: (data) => {
      setUploadData(data);
    },
    onError: (error) => {
      console.error("Error fetching upload data", error);
    },
  });

  const { mutate: fetchHistory, isLoading: isLoadingHistory } = useMutation({
    mutationFn: fetchHistoryData,
    onSuccess: (data) => {
      setHistoryData(data);
      setHistoryModalOpen(true);
    },
    onError: (error) => {
      console.error("Error fetching history", error);
    },
  });

  const handleUploadClick = (row) => {
    setSelectedCorrId(row.corrId);
    fetchEnclosures(row.corrId, {
      onSuccess: () => {
        fetchUpload(row.corrId, {
          onSuccess: () => {
            setUploadModalOpen(true);
            // setRowss(row)
          },
        });
      },
    });
  };
  const handleHistoryClick = (row) => {
    fetchHistory(row.draftNo);
  };
  const download = async (row) => {
    if (!row || !row.correspondenceName || !row.correspondencePath) {
      console.error("Invalid row data for download");
      return;
    }

    try {
      const encryptedDload = {
        documentName: row.correspondenceName,
        documentPath: row.correspondencePath,
      };

      const response = await api.post(
        "/download/download-document",
        encryptedDload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = row.correspondenceName;
      link.click();
      window.URL.revokeObjectURL(url);

      if (response.data && response.data.success) {
        console.log("Download successful!");
      } else {
        console.error("Failed to download the document");
      }
    } catch (error) {
      // Enhanced error handling
      console.error("Error downloading the document", error);
      alert(
        "An error occurred while downloading the document. Please try again."
      );
    }
  };
console.log("Filtered Data:", filteredData);

  useEffect(() => {
    setFilteredData(correspondence?.data || []);
  }, [correspondence]);

  const EditDraftMutation = useMutation({
    mutationFn: async (data) => {
      try {
      
        const encryptedDataObject = encryptPayload({
          fileId: fileDetails.data.fileId,
          correspondenceId: data.corrId,
          fileReceiptId: fileDetails.data.fileReceiptId,
        });
  
       
        const formData = new FormData();
        formData.append("dataObject", encryptedDataObject);
  
       
        const response = await api.post("/file/edit-draft-in-file", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEditMalady(response.data.data);
        return response.data;
      } catch (error) {
        if (error.response?.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        throw error;
      }
    },
  });

  

  const handleEditDraft = async (data) => {
    try {
      await EditDraftMutation.mutateAsync(data);
      setModalOpen(true);
      toast.success("Draft edited successfully!");
    } catch (error) {
      console.error("Error editing draft:", error);
      toast.error("Failed to edit draft. Please try again.");
    }
  };
  
  const fetchOrganizations = useMutation({
    mutationFn: async () => {
      const response = await api.get("/level/get-organizations");
      if (response.status === 200 && response.data?.outcome) {
        setOrganizationsData(response.data.data);
      }
      return response.data;
    },
  });

  const handleCreateDraft = async () => {
    await refetch();
    if (offices) {
      setOfficeNames(offices);
    }

    fetchOrganizations.mutate();
    setModalOpen(true);
  };
  const columns = [
    {
      name: "SI.#",
      selector: (row) => row.refNo,
      sortable: true,
      width: "140px",
      cell: (row) => (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: "bold", color: "#007bff" }}>
            Ref. No - {row.refNo}
          </div>
          <div
            style={{
              backgroundColor:
                row.corrType === "DOCUMENT"
                  ? "#6f42c1"
                  : row.corrType === "DRAFT"
                  ? "#F3B431"
                  : "#28a745",
              color: "white",
              padding: "4px 10px",
              borderRadius: "10px",
              fontSize: "12px",
              marginTop: "4px",
              textAlign: "center",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {row.corrType}
            {row.letterType === "INWARD" && <FaArrowLeft size={16} />}
            {row.letterType === "OUTWARD" && <FaArrowRight size={16} />}
          </div>
        </div>
      ),
    },
    {
      name: "Subject",
      // selector: (row) => row.subject,
      selector: (row) => (
        <Tooltip title={row.subject} arrow >
          <Typography variant="body2" style={{ width: '80px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {row.subject}
          </Typography>
        </Tooltip>
      ),
      sortable: true,
      grow: 2,
      
    },
    // {
    //   name: "Added By",
    //   selector: (row) => row.addedBy,
    //   sortable: true,
    //   width: "180px",
    // },
    {
      name: "Added Date",
      selector: (row) => row.addedDate,
      
      sortable: true,
      width: "140px",
    },
    {
      name: "Action",
      cell: (row) => (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {row.corrType === "LETTER" && (
            <>
              <StyledButton
                variant="contained"
                color="primary"
                onClick={() => handleUploadClick(row)}
                title="View Enclosure"
              >
                <FaCloudUploadAlt size={16} />
              </StyledButton>
              <StyledButton
                variant="contained"
                color="secondary"
                onClick={() => handleHistoryClick(row)}
                title="View History"
              >
                <FaHistory size={16} />
              </StyledButton>
              <StyledButton
                variant="contained"
                style={{ backgroundColor: "#28a745" }}
                onClick={() => download(row)}
                title="Download"
              >
                <FaDownload size={16} />
              </StyledButton>
            </>
          )}
          {row.corrType === "DOCUMENT" && (
            <StyledButton
              variant="contained"
              style={{ backgroundColor: "#28a745" }}
              onClick={() => download(row)}
              title="Download"
            >
              <FaDownload size={16} />
            </StyledButton>
          )}
          {row.corrType === "DRAFT" && (
            <>
              <StyledButton
                variant="contained"
                color="primary"
                onClick={() => handleEditDraft(row)}
                title="Edit"
              >
                <FaEdit size={16} />
              </StyledButton>
              <StyledButton
                variant="contained"
                style={{ backgroundColor: "#28a745" }}
                onClick={() => download(row)}
                title="Download"
              >
                <FaDownload size={16} />
              </StyledButton>
            </>
          )}
        </Box>
      ),
      width: "160px",
      center: true,
    },
  ];

  return (
    <>
      <TableContainer>
        <TopSection>
          <Title>Correspondence</Title>
          <ActionButton
            variant="contained"
            onClick={handleCreateDraft}
            title="Click to create a new draft"
          >
            Create Draft
          </ActionButton>
        </TopSection>

        <TextField
          size="small"
          placeholder="Search Correspondence"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{ margin: "12px 16px", width: "300px" }}
        />

        <DataTable
          columns={columns}
          data={filteredData.filter((item) =>
            item.subject?.toLowerCase().includes(filterText.toLowerCase())
          )}
          pagination
          customStyles={customStyles}
          highlightOnHover
          striped
        />
      </TableContainer>
      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        enclosuresData={enclosuresData}
        isLoading={isLoadingEnclosures}
        allDetails={allDetails}
        historyData={historyData}
        uploadData={uploadData}
        corrId={selectedCorrId}
      />
      <HistoryModal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        historyData={historyData}
        isLoading={isLoadingHistory}
      />
      <CreateDraftModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        officeNames={officeNames}
        organizations={organizationsData}
        correspondence={correspondence}
        allDetails={allDetails}
        editMalady={editMalady}
      />
    </>
  );
};

export default Correspondence;
