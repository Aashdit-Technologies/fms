import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import {
  Box,
  Button,
  TextField,
} from "@mui/material";
import {
  FaEye,
  FaDownload,
  FaHistory,
  FaArrowLeft,
  FaArrowRight,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import styled from "@emotion/styled";
// import { encryptPayload } from "../../utils/encrypt";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import CreateDraftModal from "./CreateDraftModal";
import { useQuery } from "@tanstack/react-query";

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
  console.log("officedata",response.data);
  
  return response.data;
};

const Correspondence = ({
  correspondence,
  onView,
  onHistory,
  open,
  onClose,
}) => {
  const token =
    useAuthStore((state) => state.token) || sessionStorage.getItem("token");
  const [modalOpen, setModalOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [officeNames, setOfficeNames] = useState([]); 
  const { data: offices, isLoading } = useQuery({
    queryKey: ["offices"],
    queryFn: fetchOffices, 
    staleTime: 60000, 
    cacheTime: 300000,
  });
  
 

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

  useEffect(() => {
    setFilteredData(correspondence?.data || []);
  }, [correspondence]);

  const handleCreateDraft = () => {
    if (offices) {
      setOfficeNames(offices); 
    }
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
                row.corrType === "DOCUMENT" ? "#6f42c1" : "#28a745",
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
      selector: (row) => row.subject,
      sortable: true,
      grow: 2,
    },
    {
      name: "Added By",
      selector: (row) => row.addedBy,
      sortable: true,
      width: "180px",
    },
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
          <StyledButton
            variant="contained"
            color="primary"
            onClick={() => onView(row)}
          >
            <FaEye size={16} />
          </StyledButton>
          <StyledButton
            variant="contained"
            color="secondary"
            onClick={() => onHistory(row)}
          >
            <FaHistory size={16} />
          </StyledButton>
          <StyledButton
            variant="contained"
            style={{ backgroundColor: "#28a745" }}
            onClick={() => download(row)}
          >
            <FaDownload size={16} />
          </StyledButton>
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
          <ActionButton variant="contained" onClick={handleCreateDraft} title="Click to create a new draft">
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
      <CreateDraftModal open={modalOpen} onClose={() => setModalOpen(false)} officeNames={officeNames} />
    </>
  );
};

export default Correspondence;
