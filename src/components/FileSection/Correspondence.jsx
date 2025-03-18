import React, { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import {
  Box,
  Button,
  TextField,
  Tooltip,
  Tooltip as MuiTooltip,
  Typography,
} from "@mui/material";
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
  FaCheckCircle,
  FaClipboard,
} from "react-icons/fa";
import styled from "@emotion/styled";
import { encryptPayload } from "../../utils/encrypt";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import CreateDraftModal from "./CreateDraftModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { HistoryModal, UploadModal } from "./Modal/AllIconModal";
import { toast } from "react-toastify";
import { PageLoader } from "../pageload/PageLoader";
import { BASE_URL } from "../../Api/Api";

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
      backgroundColor: "#207785",
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

// Fetch letter content with better error handling
const fetchOffices = async () => {
  try {
    const token = sessionStorage.getItem("token");
    const response = await api.get("file/letter-content", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Letter Content API Response:", response.data);

    if (!response.data?.data) {
      console.error("Invalid letter content response:", response.data);
      throw new Error("Invalid letter content response");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching letter content:", error);
    throw error;
  }
};

const Correspondence = ({
  fileDetails,
  correspondence,
  refetchData,
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
  const [editMalady, setEditMalady] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [copiedRows, setCopiedRows] = useState({});

  // Configure letter content query
  const {
    data: offices,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["offices"],
    queryFn: fetchOffices,
    staleTime: 60000,
    cacheTime: 300000,
    enabled: true,
    refetchOnWindowFocus: false,
    retry: 2,
    onSuccess: (data) => {
      if (data?.data) {
        console.log("Setting office names:", data);
        setOfficeNames(data);
      }
    },
    onError: (error) => {
      console.error("Error loading letter content:", error);
      toast.error("Failed to load letter templates");
    },
  });

  // Fetch letter content on mount
  useEffect(() => {
    refetch()
      .then((response) => {
        console.log("Initial letter content fetch:", response);
      })
      .catch((error) => {
        console.error("Error in initial fetch:", error);
      });
  }, []);

  useEffect(() => {
    if (offices?.data) {
      console.log("Updating office names from query data:", offices);
      setOfficeNames(offices);
    }
  }, [offices]);

  const fetchEnclosuresData = async (corrId) => {
    setLoading(true);
    try {
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
      return response.data;
    } catch (error) {
      console.error("Error fetching enclosures:", error);
    } finally {
      setLoading(false);
    }
  };

  const refetchGet = useCallback(async () => {
    try {
      setShouldRefresh(true);
      const data = await fetchEnclosuresData(selectedCorrId);
      setEnclosuresData(data);
    } catch (error) {
      console.error("Error in refetchGet:", error);
    } finally {
      setShouldRefresh(false);
    }
  }, [selectedCorrId]);
  useEffect(() => {
    if (shouldRefresh) {
      fetchEnclosuresData(selectedCorrId);
    }
  }, [shouldRefresh, selectedCorrId]);

  const { mutate: fetchEnclosures, isLoading: isLoadingEnclosures } =
    useMutation({
      mutationFn: fetchEnclosuresData,
      onSuccess: (data) => {
        setEnclosuresData(data);
      },
      onError: (error) => {
        console.error("Error fetching enclosures", error);
        toast.error("Failed to fetch enclosures");
      },
    });

  const fetchUploadData = async () => {
    try {
      const response = await api.get("common/enclousuretype-list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Upload Data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching room data:", error);
    } finally {
      setLoading(false);
    }
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

  const handleUploadClick = (row) => {
    setSelectedCorrId(row.corrId);

    fetchEnclosures(row.corrId, {
      onSuccess: () => {
        fetchUpload(row.corrId, {
          onSuccess: () => {
            setUploadModalOpen(true);
          },
        });
      },
      onError: (error) => {
        console.error("Error fetching enclosures on button click", error);
        toast.error("Failed to fetch enclosures");
      },
    });
  };

  const { mutate: fetchHistory, isLoading: isLoadingHistory } = useMutation({
    mutationFn: async (draftNo) => {
      setLoading(true);
      try {
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
        return response.data;
      } catch (error) {
        console.error("Error fetching history:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (data) => {
      console.log("History data received:", data); // Debug log
      setHistoryData(data);
      setHistoryModalOpen(true); // Open modal after data is set
    },
    onError: (error) => {
      console.error("Error fetching history:", error);
      toast.error("Failed to fetch history data");
    },
  });

  // Update the handleHistoryClick function
  const handleHistoryClick = (row) => {
    console.log("History clicked for draft:", row.draftNo); // Debug log
    if (!row.draftNo) {
      toast.error("No draft number available");
      return;
    }
    fetchHistory(row.draftNo);
  };
  const printDraft = async (row) => {
    console.log("Print draft clicked for row:", row);

    setLoading(true);
    if (!row || !row.corrId) {
      console.error("Invalid row data for download");
      return;
    }

    try {
      const encryptedDload = encryptPayload({
        corrId: row.corrId,
      });

      const response = await api.post(
        "/file/generate-corres-pdf",
        { dataObject: encryptedDload },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      if (response.data && response.data.success) {
        console.log("Download successful!");
      } else {
        console.error("Failed to download the document");
      }
    } catch (error) {
      console.error("Error downloading the document", error);
      alert(
        "An error occurred while downloading the document. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  const download = async (row) => {
    setLoading(true);
    if (!row || !row.correspondenceName || !row.correspondencePath) {
      console.error("Invalid row data for download");
      return;
    }

    try {
      const encryptedDload = encryptPayload({
        documentName: row.correspondenceName,
        documentPath: row.correspondencePath,
      });

      const response = await api.post(
        "/download/download-document",
        { dataObject: encryptedDload },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
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
      console.error("Error downloading the document", error);
      alert(
        "An error occurred while downloading the document. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDraft = async () => {
    setLoading(true);
    try {
      // Ensure we have the latest data
      const [officesResponse, orgResponse] = await Promise.all([
        refetch(),
        fetchOrganizations.mutateAsync(),
      ]);

      if (officesResponse.data?.data) {
        console.log("Setting office names from create:", officesResponse.data);
        setOfficeNames(officesResponse.data);
      }

      if (orgResponse?.data) {
        setOrganizationsData(orgResponse.data);
      }

      // Add debug logs
      console.log("Offices Data:", officesResponse.data);
      console.log("Organizations Data:", orgResponse?.data);

      setModalOpen(true);
    } catch (error) {
      console.error("Error preparing draft creation:", error);
      toast.error("Failed to load required data");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (row) => {
    setLoading(true);
    try {
      const draftResponse = await EditDraftMutation.mutateAsync({
        corrId: row.corrId,
        fileId: fileDetails.data.fileId,
        fileReceiptId: fileDetails.data.fileReceiptId,
      });

      const [officesResponse, orgResponse] = await Promise.all([
        refetch(),
        fetchOrganizations.mutateAsync(),
      ]);

      if (officesResponse.data) {
        console.log("Setting office names from edit:", officesResponse.data);
        setOfficeNames(officesResponse.data);
      }

      if (orgResponse?.data) {
        setOrganizationsData(orgResponse.data);
      }

      if (draftResponse.data && officesResponse.data && orgResponse?.data) {
        setModalOpen(true);
      } else {
        throw new Error("Failed to load all required data");
      }
    } catch (error) {
      console.error("Error preparing edit mode:", error);
      toast.error(error.message || "Failed to load draft data for editing");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditMalady(null);
  };

  const fetchOrganizations = useMutation({
    mutationFn: async () => {
      setLoading(true);
      try {
        const response = await api.get("/level/get-organizations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data?.data) {
          setOrganizationsData(response.data.data);
        }
        return response.data;
      } catch (error) {
        console.error("Error fetching organizations", error);
      } finally {
        setLoading(false);
      }
    },
  });

  const EditDraftMutation = useMutation({
    mutationFn: async (data) => {
      setLoading(true);
      const encryptedDataObject = encryptPayload({
        fileId: data.fileId,
        correspondenceId: data.corrId,
        fileReceiptId: data.fileReceiptId,
      });
      try {
        const response = await api.post(
          "/file/edit-draft-in-file",
          { dataObject: encryptedDataObject },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.outcome) {
          setEditMalady(response.data.data);
        } else {
          throw new Error(
            response.data.message || "Failed to fetch draft data"
          );
        }
        return response.data;
      } catch (error) {
        console.error("Error fetching room data:", error);
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(error.message || "Failed to fetch draft data");
      }
      throw error;
    },
  });

  const handleEditDraft = async (data) => {
    setLoading(true);
    try {
      await EditDraftMutation.mutateAsync(data);
      setModalOpen(true);
      toast.success("Draft edited successfully!");
    } catch (error) {
      console.error("Error editing draft:", error);
      toast.error("Failed to edit draft. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // Mutation for fetching the link
  // Mutation for fetching the link
  const fetchLinkMutation = useMutation({
    mutationFn: async ({ corrId }) => {
      debugger;

      try {
        const encryptedData = encryptPayload({ corrId });

        const response = await api.post(
          "/file/generate-cores-reflink",
          { dataObject: encryptedData },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return response.data.data;
      } catch (error) {
        console.error("Error fetching link:", error.message);
        throw error;
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to fetch link");
    },
  });

  const handleCopyRowLink = async (row) => {
    if (!row.corrId) {
      toast.error("No ID available for this row");
      return;
    }
  
    setCopiedRows((prev) => ({
      ...prev,
      [row.corrId]: "loading",
    }));
  
    try {
      const linkData = await fetchLinkMutation.mutateAsync({
        corrId: row.corrId,
      });
  
      if (!linkData) {
        throw new Error("No link data returned from API.");
      }
  
      const [label, rawUrl] = linkData.split("|");
  
      if (!rawUrl) {
        throw new Error("Invalid link format.");
      }
  
      const url = rawUrl.startsWith("http") ? rawUrl.trim() : `${rawUrl.trim()}`;
      const fullUrl = `${BASE_URL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
  
      
  
      const anchorTag = `<a href="${fullUrl}" target="_blank">${label.trim()}</a>`;
  
      const textarea = document.createElement("textarea");
      textarea.value = anchorTag;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
  
      // toast.success("Link copied!");
  

      setCopiedRows((prev) => ({
        ...prev,
        [row.corrId]: "copied",
      }));
  
      setTimeout(() => {
        setCopiedRows((prev) => ({
          ...prev,
          [row.corrId]: null,
        }));
      }, 2000);
    } catch (error) {
      toast.error(error.message || "Failed to copy link");
  
     
      setCopiedRows((prev) => ({
        ...prev,
        [row.corrId]: null,
      }));
    }
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
      selector: (row) => (
        <Tooltip title={row.subject} arrow>
          <Typography
            variant="body2"
            style={{
              width: "80px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {row.subject}
          </Typography>
        </Tooltip>
      ),
      sortable: true,
      grow: 2,
    },
    {
      name: "Added Date",
      selector: (row) => row.addedDate,
      sortable: true,
      width: "140px",
    },
    {
      name: "Link",
      width: "80px",
      cell: (row) => {
        const rowState = copiedRows[row.corrId];
        const isLoading = rowState === "loading";
        const isCopied = rowState === "copied";

        return (
          <MuiTooltip title={isCopied ? "Copied!" : "Copy Link"}>
            <Button
              variant="contained"
              size="small"
              onClick={() => handleCopyRowLink(row)}
              style={{
                minWidth: "32px",
                padding: "4px 8px",
                backgroundColor: isCopied ? "#28a745" : "#1a5f6a",
                color: "white",
              }}
              disabled={isLoading || !row.corrId}
              aria-label={isCopied ? "Link copied" : "Copy link"}
            >
              {isLoading ? (
                <div
                  className="spinner-border spinner-border-sm"
                  role="status"
                  style={{ width: "14px", height: "14px" }}
                />
              ) : isCopied ? (
                <FaCheckCircle size={14} />
              ) : (
                <FaClipboard size={14} />
              )}
            </Button>
          </MuiTooltip>
        );
      },
    },
    {
      name: "Action",
      cell: (row) => (
        <Box className="corr_button" sx={{ width: "70%" }}>
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
              {row.correspondencePath ? (
                <StyledButton
                  variant="contained"
                  style={{ backgroundColor: "#28a745" }}
                  onClick={() => download(row)}
                  title="Download"
                >
                  <FaEye size={16} />
                </StyledButton>
              ) : (
                <StyledButton
                  variant="contained"
                  style={{ backgroundColor: "#28a745" }}
                  onClick={() => printDraft(row)}
                  title="View"
                >
                  <FaEye size={16} />
                </StyledButton>
              )}
              <StyledButton
                variant="contained"
                color="secondary"
                onClick={() => handleHistoryClick(row)}
                title="View History"
              >
                <FaHistory size={16} />
              </StyledButton>
            </>
          )}
          {row.corrType === "DOCUMENT" && (
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
                style={{ backgroundColor: "#28a745" }}
                onClick={() => download(row)}
                title="Download"
              >
                <FaEye size={16} />
              </StyledButton>
            </>
          )}
          {row.corrType === "DRAFT" && (
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
                style={{ backgroundColor: "#28a745" }}
                onClick={() => printDraft(row)}
                title="Download"
              >
                <FaEye size={16} />
              </StyledButton>
              <StyledButton
                variant="contained"
                color="primary"
                onClick={() => handleEdit(row)}
                title="Edit"
              >
                <FaEdit size={16} />
              </StyledButton>
              <StyledButton
                variant="contained"
                color="secondary"
                onClick={() => handleHistoryClick(row)}
                title="View History"
              >
                <FaHistory size={16} />
              </StyledButton>
            </>
          )}
        </Box>
      ),
      width: "160px",
      center: true,
    },
  ];

  useEffect(() => {
    setFilteredData(correspondence?.data || []);
  }, [correspondence]);

  return (
    <>
      {loading && <PageLoader />}
      <TableContainer>
        <TopSection>
          <Title>Correspondence</Title>
          {fileDetails && fileDetails?.data.tabPanelId === 1 && (
            <ActionButton startIcon={<FaPlus />} onClick={handleCreateDraft}>
              Create Draft
            </ActionButton>
          )}
        </TopSection>

        <TextField
          size="small"
          placeholder="Search Correspondence"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{ margin: "12px 16px", width: "300px", float: "right" }}
        />

        <DataTable
          columns={columns}
          data={filteredData.filter(
            (item) =>
              item.subject?.toLowerCase().includes(filterText.toLowerCase()) ||
              item.links?.some((link) =>
                link.linkText.toLowerCase().includes(filterText.toLowerCase())
              )
          )}
          pagination
          customStyles={customStyles}
          highlightOnHover
          striped
        />
      </TableContainer>
      {loading && <PageLoader />}
      <UploadModal
        open={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setShouldRefresh(false);
        }}
        enclosuresData={enclosuresData}
        isLoading={isLoadingEnclosures}
        allDetails={allDetails}
        historyData={historyData}
        uploadData={uploadData}
        corrId={selectedCorrId}
        refetchGet={refetchGet}
      />
      <HistoryModal
        open={historyModalOpen}
        onClose={() => {
          setHistoryModalOpen(false);
          setHistoryData(null);
        }}
        historyData={historyData}
        isLoading={isLoadingHistory}
        correspondence={correspondence}
      />
      <CreateDraftModal
        open={modalOpen}
        onClose={handleCloseModal}
        officeNames={officeNames}
        organizations={organizationsData}
        correspondence={correspondence}
        allDetails={allDetails}
        editMalady={editMalady}
        refetchData={refetchData}
      />
    </>
  );
};

export default Correspondence;
