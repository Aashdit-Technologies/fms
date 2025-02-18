import React, { useEffect, useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import "../DiarySection/diarysection.css";
import DataTable from "react-data-table-component";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import {toast } from "react-toastify";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import { Tabs, Tab, Modal} from "react-bootstrap";
import { FaPencilAlt } from "react-icons/fa";
import { MdFileUpload} from "react-icons/md";
import { BsSend } from "react-icons/bs";
import "react-datepicker/dist/react-datepicker.css";
import GetAppIcon from '@mui/icons-material/GetApp';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { 
  TextField, 
  Button, 
  Grid, 
  Box, 
  Typography, 
  IconButton, 
  Autocomplete, 
  MenuItem, 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell,
  Paper,
  FormControl,
  Select,
  Chip,
  InputAdornment,
 
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import SearchIcon from '@mui/icons-material/Search';
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline';
import Visibility from '@mui/icons-material/Visibility';

const customStyles = {
  table: {
    style: {
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#ffffff",
      marginBottom: "1rem",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#207785",
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      minHeight: "52px",
      borderBottom: "2px solid #1a5f6a",
    },
  },
  headCells: {
    style: {
      padding: "16px",
      justifyContent: "center",
      "&:not(:last-of-type)": {
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
      },
    },
  },
  rows: {
    style: {
      fontSize: "13px",
      fontWeight: "400",
      color: "#333333",
      backgroundColor: "#ffffff",
      minHeight: "48px",
      "&:not(:last-of-type)": {
        borderBottom: "1px solid #e0e0e0",
      },
      "&:hover": {
        backgroundColor: "#f5f9fa",
        cursor: "pointer",
        transition: "all 0.2s ease",
      },
    },
    stripedStyle: {
      backgroundColor: "#f8f9fa",
    },
  },
  cells: {
    style: {
      padding: "12px 16px",
      justifyContent: "center",
      "&:not(:last-of-type)": {
        borderRight: "1px solid #e0e0e0",
      },
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid #e0e0e0",
      backgroundColor: "#f8f9fa",
      color: "#333333",
      fontSize: "13px",
      fontWeight: "500",
      padding: "8px 16px",
      "& .MuiButtonBase-root": {
        backgroundColor: "#207785",
        color: "#ffffff",
        "&:hover": {
          backgroundColor: "#1a5f6a",
        },
      },
    },
    pageButtonsStyle: {
      borderRadius: "4px",
      height: "32px",
      minWidth: "32px",
      padding: "0 6px",
      margin: "0 4px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      backgroundColor: "#207785",
      color: "#ffffff",
      "&:hover:not(:disabled)": {
        backgroundColor: "#1a5f6a",
        color: "#ffffff",
      },
      "&:disabled": {
        opacity: 0.5,
        cursor: "not-allowed",
      },
    },
  },
  noData: {
    style: {
      padding: "24px",
      textAlign: "center",
      color: "#666666",
    },
  },
};

const DiarySection = () => {
  const [errorsdep, setErrorsdep] = useState([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [openSection, setOpenSection] = useState("LettersList");
  const [showTable, setShowTable] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSearchDisabled, setIsSearchDisabled] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showModalShare, setShowModalShare] = useState(false);
  const [selectedRowShare, setSelectedRowShare] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [senderDetails, setSenderDetails] = useState({
    groupName: "",
    name: "",
    address: "",
    mobile: "",
    email: "",
    fax: "",
    district: "",
  });

  const [errors, setErrors] = useState({
    groupName: "",
    name: "",
    address: "",
    mobile: "",
    email: "",
    fax: "",
    district: "",
  });
  const validateRows = () => {
    const newErrors = rows.map((row) => {
      const error = {};
      if (!row.departmentName) error.departmentName = "Department Name is required";
      if (!row.addresseeDesignation) error.addresseeDesignation = "Addressee Designation is required";
      if (!row.addressee) error.addressee = "Addressee is required";
      return error;
    });
    setErrorsdep(newErrors);
    return newErrors.every((error) => Object.keys(error).length === 0);
  };
  const [formData, setFormData] = useState({
    senderAddbookIdHidden: "",
    letterNumber: "",
    senderDate: "",
    subject: "",
    remarks: "",
    isConfidential: false,
    isUrgent: false,
    letterType: "",
    uploadedLetter:null,
    documentMetaId: null, 
    fileName:"",
    filePath:"",
  });

  const [rows, setRows] = useState([
    {
      departmentName: "",
      addresseeDesignation: "",
      addressee: "",
      memoNumber: "",
      recipientId:null,
      addressList: [],
    },
  ]);

  const [enclosureRows, setEnclosureRows] = useState([
    {
      enclosureId:null,
      enclosureType: "",
      enclosureName: "",
      file: null,
      fileName:"",
      filePath:"",
    },
  ]);

  const [enclosureRowstable, setEnclosureRowstable] = useState([
    { enclosureType: "", enclosureName: "", file: null },
  ]);



  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [enclosureTypeList, setEnclosureTypeList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSenders, setFilteredSenders] = useState([]);
  const [allSenders, setAllSenders] = useState([]);
  const [activeTab, setActiveTab] = useState("newLetter");
  const [newLetterData, setNewLetterData] = useState([]);
  const [newLetterDataEncloser, setNewLetterDataEncloser] = useState([]);
  const [filteredNewLetter, setFilteredNewLetter] = useState([]);
  const [IsAddresssModalOpen, setIsAddresssModalOpen] = useState(false);
  const [showModalEncloser, setShowModalEncloser] = useState(false);
  const [SentLetterData, setSentLetterData] = useState([]);
  const [filteredSentLetter, setfilteredSentLetter] = useState([]);
  const token = useAuthStore.getState().token;
  const [searchQueryNewLetter, setSearchQueryNewLetter] = useState("");
  const [searchQuerySentLetter, setSearchQuerySentLetter] = useState("");
  const [searchQuerySender, setSearchQuerySender] = useState("");
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [selectedLetterDetails, setSelectedLetterDetails] = useState(null);

  const columns = [
    {
      name: "SI No.",
      selector: (_, index) => index + 1,
      sortable: true,
      width: "80px",
    },
    {
      name: "Group Name",
      selector: (row) => row.groupName || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Name",
      selector: (row) => row.name || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Address",
      selector: (row) => row.address || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Mobile",
      selector: (row) => row.mobile || "N/A",
      sortable: true,
      width: "120px",
    },
    {
      name: "Email",
      selector: (row) => row.email || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Fax",
      selector: (row) => row.fax || "N/A",
      sortable: true,
      width: "100px",
    },
    {
      name: "District",
      selector: (row) => row.district || "N/A",
      sortable: true,
      wrap: true,
    },
  ];

  const columnsNewLetter = [
    {
      name: "SI NO",
      selector: (row, index) => index + 1,
      width: "100px",
      sortable: true,
    },
    {
      name: "Sender Details",
      selector: (row) => row?.sender || "N/A",
      sortable: true,
      width: "250px",
    },
    {
      name: "Letter Number/Date",
      cell: (row) => (
        <div>
          {`${row?.lnumber || "N/A"} / ${row?.senderDate || "N/A"}`} <br/>
          {row?.isUrget && (
           <Box sx={{ display: "flex", justifyContent: "center", marginTop: 1 }}>
           <Chip
             label="Urgent"
             size="small"
             color="error"
             sx={{
               bgcolor: "#d32f2f",
               color: "white",
               padding: "5px 10px", 
               fontSize: "10px", 
               height: "23px", 
               "& .MuiChip-label": {
                 fontWeight: 500,
                 padding: "0  8px", 
               },
             }}
           />
         </Box>
         
          
          )}
        </div>
      ),
      sortable: true,
      width: "200px",
    },
    {
      name: "Addressee",
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <IconButton
            onClick={() => handleAddressIconClick(row)}
            sx={{ 
              color: '#207785',
              bgcolor: 'rgba(32, 119, 133, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(32, 119, 133, 0.2)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease-in-out',
              padding: '8px',
              borderRadius: '8px',
            }}
          >
            <Visibility sx={{ fontSize: '1.2rem' }} />
          </IconButton>
        </div>
      ),
     
    },
    {
      name: "Confidential",
      cell: (row) => (
        <Chip
          label={row?.isConfidential ? "Confidential" : "N/A"}
          size="small"
          color={row?.isConfidential ? "primary" : "default"}
          sx={{
            bgcolor: row?.isConfidential ? '#1976d2' : '#f5f5f5',
            color: row?.isConfidential ? 'white' : 'text.secondary',
            '& .MuiChip-label': {
              fontWeight: 500,
            },
          }}
        />
      ),
      sortable: true,
      
    },
    {
      name: "Remarks",
      selector: (row) => row?.remarks || "N/A",
      wrap: true,
      width: "150px",
      sortable: true,
    },
   
    {
      name: "Attach Enclosure",
      cell: (row) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between", 
            gap: 2,
            width: "120px", 
          }}
        >
          {/* Upload Icon */}
          <IconButton
            onClick={() => handleEncloserIconClick(row)}
            sx={{
              color: "#ffc107",
              bgcolor: "rgba(32, 119, 133, 0.1)",
              "&:hover": {
                bgcolor: "rgba(32, 119, 133, 0.2)",
                transform: "scale(1.1)",
              },
              transition: "all 0.2s ease-in-out",
              padding: "6px",
              borderRadius: "6px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "36px", 
              height: "36px",
            }}
          >
            <MdFileUpload size={20} />
          </IconButton>
    
          {row.enclosureUploaded && (
            <AttachFileIcon sx={{ color: "#4caf50", fontSize: 20, width: "36px", textAlign: "center" }} />
          )}
        </Box>
      ),
    },
    
    
    
    {
      name: "Action",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button
            variant="contained"
            size="small"
            startIcon={<FaPencilAlt />}
            onClick={(e) => { 
              e.stopPropagation(); 
              handleEditButtonClick(row); 
            }}
            sx={{ 
              bgcolor: '#207785',
              '&:hover': {
                bgcolor: '#1a5f6a',
              },
              minWidth: 'auto',
              px: 2
            }}
          >
           
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<BsSend />}
            onClick={(e) => handleOpenModal(row, e)}
            sx={{ 
              bgcolor: '#6c757d',
              '&:hover': {
                bgcolor: '#5a6268',
              },
              minWidth: 'auto',
              px: 2
            }}
          >
        
      </Button>

        </div>
      ),
     
    }
  ];

  const columnsSentLetter = [
    {
      name: "SI NO",
      selector: (row, index) => index + 1,
     
    },
    {
      name: "Sender",
      selector: (row) => row.sender,
      wrap: true,
    },

    {
      name: "Letter Number/Date",
      cell: (row) => (
        <div>
          {`${row?.lnumber || "N/A"} / ${row?.senderDate || "N/A"}`}  <br/>
          {row?.isUrget && (
             <Box sx={{ display: "flex", justifyContent: "center", marginTop: 1 }}>
            <Chip
              label="Urgent"
              size="small"
              color="error"
              sx={{
                bgcolor: "#d32f2f",
                color: "white",
                padding: "5px 10px", 
                fontSize: "10px", 
                height: "23px", 
                "& .MuiChip-label": {
                  fontWeight: 500,
                  padding: "0  8px", 
                },
              }}
            />
            </Box>
          )}
        </div>
      ),
    },
    {
      name: "Memo Number",
      selector: (row) => row.memoNo,
    },
    {
      name: "Addressee",
      selector: (row) => row.addressee,
      wrap: true,
    },
    {
      name: "Confidential",
      selector: (row) => (
        <Chip
          label={row.isConfidential ? "Confidential" : "NA"}
          size="small"
          color={row.isConfidential ? "primary" : "default"}
          sx={{
            bgcolor: row.isConfidential ? '#1976d2' : '#f5f5f5',
            color: row.isConfidential ? 'white' : 'text.secondary',
            '& .MuiChip-label': {
              fontWeight: 500,
            },
          }}
        />
      ),
      // width: "150px",
    },
    {
      name: "Remarks",
      selector: (row) => row.remarks,
      wrap: true,
    },
    
    {
      name: "Action",
      cell: (row) => (
        <IconButton
        onClick={(e) => { 
          e.stopPropagation(); 
          handleViewLetterDetails(row); 
        }}
        sx={{ 
            color: '#207785',
            bgcolor: 'rgba(32, 119, 133, 0.1)',
          '&:hover': {
              bgcolor: 'rgba(32, 119, 133, 0.2)',
              transform: 'scale(1.1)',
          },
            transition: 'all 0.2s ease-in-out',
            padding: '8px',
            borderRadius: '8px',
        }}
      >
          <Visibility sx={{ fontSize: '1.2rem' }} />
        </IconButton>
      ),
    },
  ];

  const toggleUploadAccordion = () => {
    setIsUploadOpen(!isUploadOpen);
  };
  const toggleSection = (section) => {
    setOpenSection(section === openSection ? null : section);
  };
  const toggleSenderAccordion = () => toggleSection("addSender");
  const toggleSenderListAccordion = () => toggleSection("senderList");
  const toggleLettersList = () => toggleSection("LettersList");

  const handleModalOpen = () => {
    setShowModal(true);
    setOpenSection("senderList"); 
  };

  const handleModalClose = () => {
    setShowModal(false);
    setOpenSection(null); 
  };

 
  const fileName = newLetterDataEncloser?.[0]?.fileName;
   const filePath = newLetterDataEncloser?.[0]?.filePath;
//  console.log("file name checking pdf",fileName );
//  console.log("file path checking pdf",filePath);

   const fileNames = selectedLetterDetails?.fileName;
   const filePaths= selectedLetterDetails?.filePath;
   const letterViews= selectedLetterDetails?.base64Path;
  //  console.log("file names checking pdf",fileNames);
  //  console.log("file paths checking pdf",filePaths);
  //  console.log("file base64 checking pdf",letterViews);
  

   

  const validateField = (name, value) => {
    switch (name) {
      case "groupName":
        return value.trim() ? "" : "Group Name is required";
      case "name":
        return value.trim() ? "" : "Name is required";
      case "address":
        return value.trim() ? "" : "Address is required";
      case "mobile":
        const mobileRegex = /^\d{10}$/;
        return mobileRegex.test(value) ? "" : "Enter valid 10-digit mobile number";
        case "email":
          const emailRegex = /^[a-zA-Z0-9._-]+@(gmail\.com|cag\.gov\.in|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
          return value ? (emailRegex.test(value) ? "" : "Enter a valid email address") : "Email is required";        
      case "fax":
        return ""; 
      case "district":
        return value.trim() ? "" : "District is required";
      default:
        return "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSenderDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(senderDetails).forEach(key => {
      const error = validateField(key, senderDetails[key]);
      if (error) {
        isValid = false;
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSaveSender = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    try {
      const payload = { ...senderDetails };
      const response = await api.post(
        "diary-section/save-address-book",
        { dataObject: encryptPayload(payload) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message);
      setSenderDetails({
        groupName: "",
        name: "",
        address: "",
        mobile: "",
        email: "",
        fax: "",
        district: "",
      });
      setErrors({
        groupName: "",
        name: "",
        address: "",
        mobile: "",
        email: "",
        fax: "",
        district: "",
      });
      
      await fetchRecords();
      setOpenSection("senderList");
      
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

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const day = String(today.getDate()).padStart(2, '0'); 
  
    return `${year}-${month}-${day}`; 
  };
  
  
  const handleSenderDateChange = (e) => {
    const { name, value } = e.target;
    const today = getTodayDate(); 
  
    if (value > today) {
      toast.error("Future dates are not allowed!");
      return;
    }
  
  setFormData((prevState) => ({
    ...prevState,
    senderDate: value,
  }));
}


const handleLetterNumberChange = (e) => {
  const { value } = e.target;
  setFormData((prevState) => ({
    ...prevState,
    letterNumber: value,
  }));
};
const handleSubjectChange = (e) => {
  const { value } = e.target;
  setFormData((prevState) => ({
    ...prevState,
    subject: value,
  }));
};

const handleremarksChange = (e) => {
  const { value } = e.target;
  setFormData((prevState) => ({
    ...prevState,
    remarks: value,
  }));
};
 

  //Fetch sender data from the API
  const fetchSenderData = async () => {
    try {
      const response = await api.get(
        "diary-section/get-sender-address-auto-fill",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response?.data?.data?.searchkey;
      if (Array.isArray(data)) {
        setAllSenders(data);
        setFilteredSenders(data);
      } else {
        console.error("Invalid data structure received from API");
      }
    } catch (error) {
      console.error("Error fetching sender data:", error);
    }
  };
  useEffect(() => {
    if (token) {
      fetchSenderData();
    }
  }, [token]);

  const handleSenderChange = (event, newValue) => {
    if (newValue === null) {
      setSearchTerm('');
      setFormData(prev => ({
        ...prev,
        senderAddbookIdHidden: ''
      }));
      setIsSearchDisabled(false);
      return;
    }

    if (newValue === 'add_new') {
      setShowModal(true);
      setOpenSection("addSender");
      setSearchTerm('');
      return;
    }

    const senderId = newValue.split(" - ")[0];
    setFormData(prev => ({
      ...prev,
      senderAddbookIdHidden: senderId
    }));
    setSearchTerm(newValue);
    setIsSearchDisabled(true);
  };

  const getFilteredOptions = () => {
    const options = [...filteredSenders];
    options.push('add_new');
    return options;
  };

  // const renderOption = (props, option) => {
  //   if (option === 'add_new') {
  //     return (
  //       <li {...props} style={{ fontWeight: 'bold', color: '#207785' }}>
  //         <FaPlus style={{ marginRight: '8px' }} /> Add New Sender
  //       </li>
  //     );
  //   }
  //   return <li {...props}>{option}</li>;
  // };
  const renderOption = (props, option) => {
    const { key, ...restProps } = props; 

    if (option === 'add_new') {
      return (
        <li key={key} {...restProps} style={{ fontWeight: 'bold', color: '#207785' }}>
          <FaPlus style={{ marginRight: '8px' }} /> Add New Sender
        </li>
      );
    }
    
    return <li key={key} {...restProps}>{option}</li>;
};


  useEffect(() => {
    if (!isSearchDisabled && searchTerm) {
      const filtered = allSenders.filter((sender) =>
        sender.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSenders(filtered);
    } else {
      setFilteredSenders([]);
    }
  }, [searchTerm, allSenders, isSearchDisabled]);

 
  // All Sender List get api
  const fetchRecords = async () => {
    try {
      if (!token) {
        throw new Error("Authorization token is missing");
      }

      const response = await api.get("/common/address-list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allAddressList = response?.data?.data?.allAddressList;

      if (response.status === 200 && Array.isArray(allAddressList)) {
        setRecords(allAddressList);
        setFilteredRecords(allAddressList);
      } else {
        toast.error("Failed to fetch data. Unexpected response format.", {
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      if (error.response) {
        toast.error(
          `Error fetching records: ${
            error.response.data.message || "Unknown error"
          }`,
          { autoClose: 3000 }
        );
      } else {
        toast.error(
          "Network or unexpected error occurred while fetching records.",
          {
            autoClose: 3000,
          }
        );
      }
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // departmentList get api
  const fetchDepartmentAndDesignationData = async () => {
    try {
      if (!token) {
        throw new Error("Authorization token is missing");
      }

      const response = await api.get(
        "common/department-designation-list",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const allData = response?.data?.data;

      if (response.status === 200 && allData) {
        setDepartmentList(allData.departmentList || []);
        setDesignationList(allData.DesignationList || []);
      } else {
        toast.error("Failed to fetch data. Unexpected response format.", {
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      toast.error(
        `Error fetching records: ${
          error.response?.data?.message ||
          "Network or unexpected error occurred"
        }`,
        { autoClose: 3000 }
      );
    }
  };
  useEffect(() => {
    fetchDepartmentAndDesignationData();
  }, []);

  // EnclosureTypes get api
  useEffect(() => {
    const fetchEnclosureTypes = async () => {
      try {
        if (!token) {
          throw new Error("Authorization token is missing");
        }

        const response = await api.get("common/enclousuretype-list", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // console.log("API response:", response);

        const data = response?.data?.data?.enclosureTypeList || [];
        if (response.status === 200 && Array.isArray(data)) {
          setEnclosureTypeList(data);
        } else {
          toast.error("Failed to fetch Enclosure Types.", { autoClose: 3000 });
        }
      } catch (error) {
        console.error("Error fetching enclosure types:", error);
        toast.error(
          `Failed to fetch Enclosure Types: ${
            error.response?.data?.message ||
            "Network or unexpected error occurred"
          }`,
          { autoClose: 3000 }
        );
      }
    };

    fetchEnclosureTypes();
  }, [token]);

  // Add Sender Details post Api
  

  const saveFormData = async (savensendValue) => {
    try {
      const formDataToSend = new FormData();

      const empDeptDetailsVoList = rows.map((row) => ({
        departmentId: row.departmentName || null,
        designationId: row.addresseeDesignation || null,
        empId: row.addressee || null,
        memoNumber: row.memoNumber || null,
        documentReceipentId: null,
        recipientId:row.recipientId || null,
      }));

      const enclosureDetailsVoList = enclosureRows.map((row) => ({
        encTypeId: row.enclosureType || null,
        encName: row.enclosureName || null,
        enclosureId: row.enclosureId || null,
       
      }));

      const payload = {
        senderAddbookIdHidden: formData.senderAddbookIdHidden || null,
        letterNumber: formData.letterNumber || null,
        senderDate: formData.senderDate || null,
        subject: formData.subject || null,
        remarks: formData.remarks || null,
        isConfi: formData.isConfidential ? "true" : "false",
        isUrgent: formData.isUrgent ? "true" : "false",
        cpyletter_edit: "NA",
        copyLetter: "NO",
        savensend: savensendValue,
        letterType: "E",
        documentMetaId: formData.documentMetaId || null, 
        empDeptDetailsVoList,
        enclosureDetailsVoList,
      };

      formDataToSend.append("dataObject", encryptPayload(payload));

      if (formData.uploadedLetter) {
        formDataToSend.append("uploadedLetter", formData.uploadedLetter);
      }

      enclosureRows.forEach((row, index) => {
        if (row.file) {
          formDataToSend.append("enclosureDocuments", row.file);
        }
      });

      const response = await api.post(
        "diary-section/upload-letter",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Form have been saved successfully", { autoClose: 3000 });
        await Promise.all([NewLetter(), sentLetter()]);
         
        setOpenSection("LettersList");
        setFormData({
          senderAddbookIdHidden: "",
          letterNumber: "",
          senderDate: "",
          subject: "",
          remarks: "",
          isConfidential: false,
          isUrgent: false,
          letterType: "",
          uploadedLetter: null,
        });

        setRows([
          {
            departmentName: "",
            addresseeDesignation: "",
            addressee: "",
            memoNumber: "",
          },
        ]);
        setEnclosureRows([
          {
            enclosureType: "",
            enclosureName: "",
            file: null,
          },
        ]);
        setSenderDetails({
          groupName: "",
          name: "",
          address: "",
          mobile: "",
          email: "",
          fax: "",
          district: "",
        });
        setShowTable(false);
        setSearchTerm(""); 
        setIsSearchDisabled(false);
        setSelectedRow(null);
        setSelectedRowShare(null);
    
        if (typeof setSelectedSender === "function") {
          setSelectedSender(null);
        }
        if (typeof setSenderName === "function") {
          setSenderName("");
        }
        if (typeof setSenderAddress === "function") {
          setSenderAddress("");
        }
         
      } else {
        toast.error("Failed to save the form. Please try again.", {
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error(`Failed to save form: ${error.message || "Unknown error"}`, {
        autoClose: 3000,
      });
    }
  };

  const handleSave = (savensendValue) => {
    if (!formData.letterNumber || !formData.subject || !formData.senderDate) {
      toast.warn("Please fill all required fields.", { autoClose: 3000 });
      return;
    }
    
  const incompleteRows = rows.some(row => !row.departmentName || !row.addresseeDesignation || !row.addressee);
  if (incompleteRows) {
    toast.warn("Please fill all required fields in each row before saving.");
    return;
  }
  if (!formData.uploadedLetter) {
    toast.warn("Please upload a letter before saving.");
    return;
  }

  if (showTable) {
    for (const row of enclosureRows) {
      if (!row.enclosureType || !row.enclosureName || !row.file) {
        toast.warn("Please fill all required fields before saving.");
        return;
      }
    }
  }

  

    saveFormData(savensendValue);
  };


  // NewLetter
  const NewLetter = async () => {
    try {
      if (!token) {
        throw new Error("Authorization token is missing");
      }

      const response = await api.get("diary-section/new-letter", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allnewletter = response?.data?.data || [];
      console.log("Fetched new letters:", allnewletter);

      if (response.status === 200 && Array.isArray(allnewletter)) {
        setNewLetterData(allnewletter);
        setFilteredNewLetter(allnewletter);
      } else {
        console.error("Failed to fetch data. Unexpected response format.");
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      toast.error(
        error.response?.data?.message || "An unexpected error occurred."
      );
    }
  };
  useEffect(() => {
    NewLetter();
  }, []);

 // SentLetter
  const sentLetter = async () => {
    try {
      console.log("Token:", token);
      if (!token) {
        toast.error("Authorization token is missing");
        return;
      }
  
      const response = await api.get("diary-section/sent-letter", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("Full API Response:", response);
  
      const allSentLetter = response?.data?.data || [];
  
      if (response.status === 200 && Array.isArray(allSentLetter)) {
        console.log("Fetched sent letters:", allSentLetter);
        setSentLetterData(allSentLetter);
        setfilteredSentLetter(allSentLetter);
      } else {
        console.error("Failed to fetch data. Unexpected response format.");
        toast.error("Failed to fetch data. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      toast.error(error.response?.data?.message || "An unexpected error occurred.");
    }
  };
  
  useEffect(() => {
    if (token) {
      sentLetter();
    }
  }, [token]);
  

  const handleAddressIconClick = async (row) => {
    if (!row || !row.documentMetaDataId) {
      console.error("Invalid row data: ", row);
      return;
    }
  
    const payload = {
      value: (row.documentMetaDataId || "").toString(),
    };
  
    try {
      const response = await api.post(
        "diary-section/view-all-metadata-recipient",
        { dataObject: encryptPayload(payload) }
      );
  
      if (response.status === 200 && response.data.outcome) {
        setNewLetterData(response.data.data.LetterRecipientList);
        setIsAddresssModalOpen(true);  
      } else {
        console.error("API Error: ", response.data.message || "Unexpected error");
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const handleSaveEnclosures = async () => {
    for (const row of enclosureRowstable) {
      if (!row.enclosureType || !row.enclosureName || !row.file) {
        toast.warn("Please fill all required fields before saving.");
        return;
      }
    }
    try {

      const enclosureData = enclosureRowstable.map((row, index) => ({
        encTypeId: row.enclosureType || null,
        encName: row.enclosureName || null,
        enclosureId: null,
      }));
      const payload = {
        docId: selectedRow?.documentMetaDataId ? Number(selectedRow.documentMetaDataId) : null,
      };
      const formDataToSend = new FormData();
      formDataToSend.append("dataObject", encryptPayload(payload));
      formDataToSend.append("enclosureData", encryptPayload(enclosureData));

      enclosureRowstable.forEach((row, index) => {
        if (row.file) {
          formDataToSend.append("enclosureDocuments", row.file);
        
        } else {
          console.warn(`File missing at index ${index}`);
        }
      });
      
      const response = await api.post(
        "diary-section/upload-letter-enclosure",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.status === 200) {
        toast.success(response.data.data);
        const resetRows = enclosureRowstable.map((row) => ({
        enclosureType: "",
        enclosureName: "",
        file: null, 
        hasEnclosure: !!row.file
      }));

      setEnclosureRowstable(resetRows);
      setFormData({}); 
      
        
        if (selectedRow) {
          await handleEncloserIconClick(selectedRow);
        }
      
      
      } else {
        toast.error("Error uploading enclosures.");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Something went wrong!");
    }
  };

const handleEncloserIconClick = async (row) => {
  if (!row || !row.documentMetaDataId) {
    console.error("Invalid row data: ", row);
    return;
  }

  setSelectedRow(row); 
  setShowModalEncloser(true); 

  const payload = {
    metadataid: (row.documentMetaDataId || "").toString(),
    encTypeId: row.encTypeId || null,
    encName: row.encName || "",
    enclosureId: row.enclosureId || null,
    uletterNo: row.uletterNo || "",
    docid: row.docid || null,
    umemoNo: row.umemoNo || "",
    enclosureType: row.enclosureType || [],
    enclosureName: row.enclosureName || []
  };

  try {
    const response = await api.post(
      "diary-section/getallEnclosureByMetadataId",
      { dataObject: encryptPayload(payload) }
    );

    if (response.status === 200) {
      console.log("Raw Response Data:", response.data);

      let parsedArray = [];
      try {
        parsedArray = response.data;
      } catch (error) {
        console.error("Error parsing response data:", error);
        parsedArray = []; 
      }

      console.log("Parsed Array:", parsedArray);
      setNewLetterDataEncloser(parsedArray); 
      
    } else {
      setNewLetterDataEncloser([]); 
      console.error("API Error:", response.data.message || "Unexpected error");
    }
  } catch (error) {
    setNewLetterDataEncloser([]); 
    console.error("Error fetching data:", error);
  }
};

const handleSendButtonClick = async (event) => {
  event.preventDefault(); 
  event.stopPropagation();

  if (!selectedRowShare || !selectedRowShare.documentMetaDataId) {
    console.error("Invalid row data:", selectedRowShare);
    return;
  }

  setIsSending(true); 

  const payload = {
    value: selectedRowShare.documentMetaDataId.toString(),
  };

  try {
    const response = await api.post("diary-section/send-letter", {
      dataObject: encryptPayload(payload),
    });

    if (response.status === 200) {
      toast.success("Letter sent successfully!"); 
      setShowModalShare(false); 
      setActiveTab("sentLetter"); 
      await NewLetter();
      await sentLetter(); 
    } else {
      toast.error("Failed to send letter.");
    }
  } catch (error) {
    console.error("Error sending letter:", error);
    toast.error("Something went wrong!");
  } finally {
    setIsSending(false);
  }
};
 

const handleEditButtonClick = async (row) => {
  if (!row || !row.documentMetaDataId) {
    console.error("Invalid row data: ", row);
    return;
  }

  const payload = { value: row.documentMetaDataId.toString() };
  console.log("Edit payload:", payload);

  try {
    const response = await api.post(
      "diary-section/get-data-for-edit-letter",
      { dataObject: encryptPayload(payload) }
    );

    if (response.status === 200 && response.data.outcome) {
      const letterData = response.data.data;
      const editedList = letterData.EditedList[0];

      console.log("Edit Letter Data:", letterData);
      console.log("Edit Letter:", editedList);

      // Extract sender details
      const senderAddressBook = editedList.sender_addressbook 
        ? editedList.sender_addressbook.trim().replace(/^"|"$/g, '')  
        : "";

      const senderParts = senderAddressBook.split("||");
      const senderId = senderParts[0] || "";
      const senderGroupName = senderParts[1] || "";
      const senderName = senderParts[2] || "";
      const senderDistrict = senderParts[3] || "";

      setFormData({
        // ...formData,
        senderAddbookIdHidden: senderId,
        letterNumber: editedList.lnumber || "",
        senderDate: editedList.senderdate 
          ? editedList.senderdate.split('/').reverse().join('-') 
          : null,
        subject: editedList.subject || "",
        remarks: editedList.remarks || "",
        isConfidential: editedList.confi || false,
        isUrgent: editedList.urgent || false,
        letterType: editedList.docname || "",
        uploadedLetter: editedList.fileName || "",
        addEnclosureChecked: editedList.enclosurelst?.length > 0,
        documentMetaId: row.documentMetaDataId,
        fileName:editedList.fileName,
        filePath:editedList.filePath,
      });

      // setSenderDetails({
      //   groupName: senderGroupName,
      //   name: senderName,
      //   address: editedList.addresee?.address || "",
      //   mobile: editedList.addresee?.mobile || "",
      //   email: editedList.addresee?.email || "",
      //   fax: editedList.addresee?.fax || "",
      //   district: senderDistrict
      // });

      setSearchTerm(senderName);
      setIsSearchDisabled(true);

      // **Populate Department Data from DocumentRecipient**
      if (editedList.DocumentRecipient && editedList.DocumentRecipient.length > 0) {
        const formattedDepartmentList = editedList.DocumentRecipient.map(recipient => {
          const departmentId = recipient.Department?.departmentId?.toString() || "";
          const designationId = recipient.Designation?.id?.toString() || "";
          const recipientId = recipient.recipientId?.toString() || null; 
          let addressee = "";
          let addressList = [];
      
          if (recipient.Employee?.employeeId) {
            addressee = recipient.Employee.employeeId;
            addressList.push({
              id: recipient.Employee.employeeId,
              name: `${recipient.Employee.firstName} ${recipient.Employee.lastName}`.trim()
            });
          }
      
          return {
            departmentName: departmentId,
            addresseeDesignation: designationId,
            addressee,
            memoNumber: recipient.MemoNo || "",
            addressList,
            recipientId,
          };
        });
      
        console.log("Formatted Department List:", formattedDepartmentList); // Debugging
      
        setRows(formattedDepartmentList);
      
        setRows(prevRows => prevRows.map(row => ({
          ...row,
          addressee: row.addressList.some(a => a.id === row.addressee) ? row.addressee : ""
        })));
      
        console.log("Final Rows After Processing: ", formattedDepartmentList);
      } else {
        setRows([{ departmentName: "", addresseeDesignation: "", addressee: "", memoNumber: "", addressList: [] }]);
      }
      

      // **Handle Enclosures**
      const hasEnclosures = editedList.enclosurelst && editedList.enclosurelst.length > 0;
      setShowTable(hasEnclosures);
      
      if (hasEnclosures) {
        const formattedEnclosureList = editedList.enclosurelst.map(enc => ({
          enclosureType: enc.enclosuretypeid?.toString() || "",
          enclosureName: enc.enclosureName || "",
          file: enc.fileName || null, 
          enclosureId: enc.enclosureId?.toString() || null,
          fileName:enc.fileName || null,
          filePath:enc.filePath || null
        }));
        setEnclosureRows(formattedEnclosureList);
        setIsUploadOpen(true);
      } else {
        setEnclosureRows([{ enclosureType: "", enclosureName: "", file: null }]);
      }

      setErrors({
        groupName: "",
        name: "",
        address: "",
        mobile: "",
        email: "",
        fax: "",
        district: ""
      });

      if (!isUploadOpen) {
        toggleUploadAccordion();
      }

     
      const formElement = document.getElementById("letterForm");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth" });
      }

      toast.success("Letter data loaded successfully");
    } else {
      toast.error(response.data.message || "Failed to fetch letter data");
    }
  } catch (error) {
    console.error("Error fetching data: ", error);
    toast.error("Failed to fetch letter data. Please try again.");
  }
};


  const handleViewLetterDetails = async (row) => {
    if (!row || !row.documentMetaDataId) {
      console.error("Invalid row data: ", row);
      return;
    }

    const payload = {
      metadataId: row.documentMetaDataId,
      recipientId: row.recipientId,
    };

    try {
      const response = await api.post(
        "diary-section/view-letter",
        { dataObject: encryptPayload(payload) }
      );
        console.log("letter view", response.data.data)
      if (response.status === 200 && response.data.outcome) {
        setSelectedLetterDetails(response.data.data);
        setShowLetterModal(true);
      } else {
        toast.error(response.data.message || "Failed to fetch letter details");
      }
    } catch (error) {
      console.error("Error fetching letter details: ", error);
      toast.error("Failed to fetch letter details. Please try again.");
    }
  };

  const handleFilterNewLetter = (e) => {
    const value = e.target.value;
    setSearchQueryNewLetter(value);

    if (value) {
      const filteredData = newLetterData.filter(item => {
        return Object.values(item).some(field => 
          field && field.toString().toLowerCase().includes(value.toLowerCase())
        );
      });
      setFilteredNewLetter(filteredData);
    } else {
      setFilteredNewLetter(newLetterData);
    }
  };

  const handleFilterSentLetter = (e) => {
    const value = e.target.value;
    setSearchQuerySentLetter(value);

    if (value) {
      const filteredData = SentLetterData.filter(item => {
        return (
          (item.letterNumber && item.letterNumber.toString().toLowerCase().includes(value.toLowerCase())) ||
          (item.subject && item.subject.toString().toLowerCase().includes(value.toLowerCase())) ||
          (item.sender && item.sender.toString().toLowerCase().includes(value.toLowerCase())) ||
          (item.date && item.date.toString().toLowerCase().includes(value.toLowerCase())) ||
          (item.memoNumber && item.memoNumber.toString().toLowerCase().includes(value.toLowerCase()))
        );
      });
      setfilteredSentLetter(filteredData);
    } else {
      setfilteredSentLetter(SentLetterData);
    }
  };

  const handleFilterSender = (e) => {
    const value = e.target.value;
    setSearchQuerySender(value);

    if (value) {
      const filteredData = records.filter(item => {
        return (
          (item.groupName && item.groupName.toLowerCase().includes(value.toLowerCase())) ||
          (item.name && item.name.toLowerCase().includes(value.toLowerCase())) ||
          (item.address && item.address.toLowerCase().includes(value.toLowerCase())) ||
          (item.mobile && item.mobile.toLowerCase().includes(value.toLowerCase())) ||
          (item.email && item.email.toLowerCase().includes(value.toLowerCase())) ||
          (item.district && item.district.toLowerCase().includes(value.toLowerCase()))
        );
      });
      setFilteredRecords(filteredData);
    } else {
      setFilteredRecords(records);
    }
  };

  const isDuplicateAddressee = (addressee, currentIndex) => {
    return rows.some((row, index) => index !== currentIndex && row.addressee === addressee);
  };


// departement row table
  

  // const handleRowChange = async (index, field, value) => {
  //   const updatedRows = [...rows];
  //   updatedRows[index][field] = value;
  
    
  //   if (field === "addressee" && index !== 0 && isDuplicateAddressee(value, index)) {
  //     toast.error("Duplicate addressee is not allowed.");
  //     return;
  //   }
  
  //   const { departmentName, addresseeDesignation } = updatedRows[index];
  
  //   if (field === "departmentName" || field === "addresseeDesignation") {
  //     if (departmentName && addresseeDesignation) {
  //       try {
  //         const response = await api.get(
  //           `/diary-section/get-employee-details-by-deptId-and-desigId?deptId=${departmentName}&degId=${addresseeDesignation}`,
  //           {
  //             headers: { Authorization: `Bearer ${token}` },
  //           }
  //         );
  
  //         const employees = response?.data?.data?.Employee;
  
  //         console.log("Employees:", employees);
  
  //         if (
  //           response.status === 200 &&
  //           Array.isArray(employees) &&
  //           employees.length > 0
  //         ) {
  //           updatedRows[index].addressList = employees.map((employee) => ({
  //             id: employee.employeeId,
  //             name: `${employee.firstName} ${employee.lastName || ""}`.trim(),
  //           }));
  //         } else {
  //           updatedRows[index].addressList = [];
  //           toast.warn(
  //             "No Addressees found for the selected Department and Designation."
  //           );
  //         }
  //       } catch (error) {
  //         console.error("Error fetching Addressee data:", error);
  //         updatedRows[index].addressList = [];
  //         toast.error(
  //           error.response?.data?.message ||
  //             "Failed to fetch Addressee data. Please try again."
  //         );
  //       }
  //     } else {
  //       updatedRows[index].addressList = [];
  //     }
  //   }
  
  //   setRows(updatedRows);
  //   validateRows(); 
  // };

  const handleRowChange = async (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
  
    if (field === "addressee" && index !== 0 && isDuplicateAddressee(value, index)) {
      toast.error("Duplicate addressee is not allowed.");
      return;
    }
  
    const { departmentName, addresseeDesignation } = updatedRows[index];
  
    if (field === "departmentName" || field === "addresseeDesignation") {
      if (departmentName && addresseeDesignation) {
        try {
          const response = await api.get(
            `/diary-section/get-employee-details-by-deptId-and-desigId?deptId=${departmentName}&degId=${addresseeDesignation}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
  
          const employees = response?.data?.data?.Employee;
  
          if (response.status === 200 && Array.isArray(employees) && employees.length > 0) {
            updatedRows[index].addressList = employees.map(emp => ({
              id: emp.employeeId,
              name: `${emp.firstName} ${emp.lastName || ""}`.trim(),
            }));
          } else {
            updatedRows[index].addressList = [];
            toast.warn("No Addressees found for the selected Department and Designation.");
          }
        } catch (error) {
          console.error("Error fetching Addressee data:", error);
          updatedRows[index].addressList = [];
          toast.error("Failed to fetch Addressee data. Please try again.");
        }
      } else {
        updatedRows[index].addressList = [];
      }
    }
  
    setRows(updatedRows);
  };
  



  // const handleAddRow = () => {
  //   if (rows.length === 0) {
     
  //     setRows([...rows, { departmentName: "", addresseeDesignation: "", addressee: "", memoNumber: "", addressList: [] }]);
  //   } else {
      
  //     const firstRow = rows[0];
  //     if (!firstRow.departmentName || !firstRow.addresseeDesignation || !firstRow.addressee) {
  //       alert("Please fill the first record before adding another.");
  //       return;
  //     }
  
      
  //     const newAddressee = rows[rows.length - 1].addressee; 
  //     if (rows.length > 1 && isDuplicateAddressee(newAddressee, rows.length - 1)) {
  //       alert("Duplicate addressee is not allowed.");
  //       return;
  //     }
  
     
  //     setRows([...rows, { departmentName: "", addresseeDesignation: "", addressee: "", memoNumber: "", addressList: [] }]);
  //   }
  // };


  const handleAddRow = () => {
    if (rows.length === 0) {
      setRows([...rows, { departmentName: "", addresseeDesignation: "", addressee: "", memoNumber: "", addressList: [] }]);
    } else {
      // Validate the last row before adding a new one
      const lastRow = rows[rows.length - 1];
      if (!lastRow.departmentName || !lastRow.addresseeDesignation || !lastRow.addressee) {
        toast.warn("Please complete the current row before adding a new one.");
        return;
      }
  
      // Check for duplicate addressee
      if (isDuplicateAddressee(lastRow.addressee, rows.length - 1)) {
        toast.warn("Duplicate addressee is not allowed.");
        return;
      }
  
      setRows([...rows, { departmentName: "", addresseeDesignation: "", addressee: "", memoNumber: "", addressList: [] }]);
    }
  };
  

  const handleRemoveRow = (index) => {
    if (rows.length > 1) {
      const updatedRows = rows.filter((_, i) => i !== index);
      setRows(updatedRows);
    } else {
      toast.warn("At least one row is required.");
    }
  };


  // EnclosureTypes table Details

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     uploadedLetter: file,
  //   }));
  // };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
  
    if (!file) {
      toast.warn("Please select a file before proceeding.");
      return;
    }
  
    if (file.type !== "application/pdf") {
      toast.error("Sorry! only PDF format is  Allowed.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      uploadedLetter: file,
    }));
  };
  

  

  // const handleFileUploadChange = (index, event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     setEnclosureRows((prevRows) =>
  //       prevRows.map((row, rowIndex) =>
  //         rowIndex === index
  //           ? {
  //               ...row,
  //               file,
  //               fileName: file.name, 
  //             }
  //           : row
  //       )
  //     );
  //   }
  // };


  const handleFileUploadChange = (index, event) => {
    const file = event.target.files[0];
  
    if (!file) {
      toast.warn("Please select a file before proceeding.");
      return;
    }
  
    // Validate file type (PDF only)
    if (file.type !== "application/pdf") {
      toast.error("Sorry! only PDF format is  Allowed.");
      return;
    }
  
    // Update the specific row with file details
    const updatedRows = [...enclosureRows];
    updatedRows[index] = { ...updatedRows[index], file, fileName: file.name };
    setEnclosureRows(updatedRows);
  };

  const handleCheckboxChange = (e) => {
    setShowTable(e.target.checked);
  };

  // const handleAddEnclosureRow = (e) => {
  //   e.preventDefault();
  //   setEnclosureRows((prevRows) => [
  //     ...prevRows,
  //     { enclosureType: "", enclosureName: "", file: null },
  //   ]);
  // };

  const handleAddEnclosureRow = () => {
    // Validate the last row before adding a new one
    if (enclosureRows.length > 0) {
      const lastRow = enclosureRows[enclosureRows.length - 1];
      if (!lastRow.enclosureType || !lastRow.enclosureName || !lastRow.file) {
        toast.warn("Please complete the current row before adding a new one.");
        return;
      }
    }
  
    // Add a new empty row
    setEnclosureRows([
      ...enclosureRows,
      { enclosureType: "", enclosureName: "", file: null, fileName: "" },
    ]);
  };

  const handleRemoveEnclosureRow = (index, e) => {
    e.preventDefault();
    setEnclosureRows((prevRows) => prevRows.filter((_, i) => i !== index));
  };

  const handleEnclosureRowChange = (index, field, value) => {
    setEnclosureRows((prevRows) =>
      prevRows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

// const handleFileUploadChangeencloser = (index, event) => {
//   const file = event.target.files[0];

//   if (file) {
//       setEnclosureRowstable((prevRows) =>
//           prevRows.map((row, rowIndex) =>
//               rowIndex === index ? { ...row, file } : row
//           )
//       );
//   } else {
//       console.warn(`No file selected at index ${index}`);
//   }
// };

const handleFileUploadChangeencloser = (index, event) => {
  const file = event.target.files[0];

  if (!file) {
    toast.warn("Please select a file before proceeding.");
    return;
  }

  
  if (file.type !== "application/pdf") {
    toast.error("Sorry! only PDF format is  Allowed.");
    return;
  }

  
  const updatedRows = [...enclosureRowstable];
  updatedRows[index] = { ...updatedRows[index], file, fileName: file.name };
  setEnclosureRowstable(updatedRows);
};


  // const handleAddTableEnclosureRow = (e) => {
  //   e.preventDefault();
  //   setEnclosureRowstable((prevRows) => [
  //     ...prevRows,
  //     { enclosureType: "", enclosureName: "", file: null },
  //   ]);
  // };

  const handleAddTableEnclosureRow = () => {
    // Prevent adding a new row if the last row is incomplete
    if (enclosureRowstable.length > 0) {
      const lastRow = enclosureRowstable[enclosureRowstable.length - 1];
      if (!lastRow.enclosureType || !lastRow.enclosureName || !lastRow.file) {
        toast.warn("Please complete the current row before adding a new one.");
        return;
      }
    }
  
    // Add a new empty row
    setEnclosureRowstable([
      ...enclosureRowstable,
      { enclosureType: "", enclosureName: "", file: null, fileName: "" },
    ]);
  };

  const handleRemoveTableEnclosureRow = (index) => {
    setEnclosureRowstable((prevRows) => {
      
      return prevRows.filter((_, i) => i !== index);
    });
  };
  

  const handleTableEnclosureRowChange = (index, field, value) => {
    setEnclosureRowstable((prevRows) =>
      prevRows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const toggleHandler = (field) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: !prevData[field],
    }));
  };

  const handleTabSelect = (key) => {
    setActiveTab(key);
  };

  
   const handleCloseModalEncloser = () => {
    setShowModalEncloser(false); 
    setSelectedRow(null); 
  };

  const handleOpenModal = (rowData, event) => {
    event.stopPropagation(); 
    event.preventDefault(); 
    if (!rowData || !rowData.documentMetaDataId) {
      console.error("Invalid row data:", rowData);
      return;
    }

    setSelectedRowShare({
      documentMetaDataId: rowData.documentMetaDataId,
      lnumber: rowData.lnumber || "N/A",
    });

    setShowModalShare(true);
  };


  const handleDownload = async () => {
    try {
    const payload = {
    documentName: fileName,
    documentPath: filePath,
    };
    
    const encryptedPayload = encryptPayload(payload);
    
    const response = await api.post(
    'download/download-document',
    { dataObject: encryptedPayload },
    {
    headers: {
    Authorization: `Bearer ${token}`,
    },
    responseType: 'blob', 
    }
    );
    
    if (response.status === 200) {
    console.log('Full PDF Response:', response.data);
    
    // Create a download link and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${fileName}`); 
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    
    }
    } catch (error) {
    console.error("Error downloading PDF:", error);
    alert("Failed to download PDF. Please try again.");
    }
    };
    
    const handleDownloadletter = async () => {
      try {
      const payload = {
      documentName: fileNames,
      documentPath:filePaths,
      };
      
      const encryptedPayload = encryptPayload(payload);
      
      const response = await api.post(
      'download/download-document',
      { dataObject: encryptedPayload },
      {
      headers: {
      Authorization: `Bearer ${token}`,
      },
      responseType: 'blob', 
      }
      );
      
      if (response.status === 200) {
      console.log('Full PDF Response:', response.data);
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileNames}`); 
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      
      }
      } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again.");
      }
      };


      const handleDocumentView = async () => {
        try {
          if (!formData.fileName || !formData.filePath) {
            alert("No document available to view.");
            return;
          }
      
          const payload = {
            documentName: formData.fileName,
            documentPath: formData.filePath,
          };
      
          const encryptedPayload = encryptPayload(payload);
          console.log("Checking payloads", encryptedPayload);
      
          const response = await api.post(
            'download/view-document',
            { dataObject: encryptedPayload },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log(response);
          if (response.data && response.data.data) {
            const base64String = response.data.data.split(",")[1]; // Remove MIME type prefix
            const byteCharacters = atob(base64String);
            const byteNumbers = new Uint8Array([...byteCharacters].map(char => char.charCodeAt(0)));
            const blob = new Blob([byteNumbers], { type: "application/pdf" });
          
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
          } else {
            alert("Failed to load PDF.");
          }
        } catch (error) {
          console.error("Error fetching PDF:", error);
          alert("Failed to fetch PDF. Please try again.");
        }
      };
     


      const handleDocumentViewenclosuer = async (fileName, filePath) => {
        try {
          if (!fileName || !filePath) {
            alert("No document available to view.");
            return;
          }
      
          const payload = {
            documentName: fileName,
            documentPath: filePath,
          };
      
          const encryptedPayload = encryptPayload(payload);
          console.log("Checking payloads", encryptedPayload);
      
          const response = await api.post(
            'download/view-document',
            { dataObject: encryptedPayload },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
      
          if (response.data && response.data.data) {
            const base64String = response.data.data.split(",")[1]; // Remove MIME type prefix
            const byteCharacters = atob(base64String);
            const byteNumbers = new Uint8Array([...byteCharacters].map(char => char.charCodeAt(0)));
            const blob = new Blob([byteNumbers], { type: "application/pdf" });
      
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank"); // Open PDF in a new tab
          } else {
            alert("Failed to load PDF.");
          }
        } catch (error) {
          console.error("Error fetching PDF:", error);
          alert("Failed to fetch PDF. Please try again.");
        }
      };
  
      return (
    <>
      

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
            <form encType="multipart/form-data">
            {/* sender add data first row */}
              <div className="row align-items-center mb-3">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      Sender :<span style={{ color: "red" }}>*</span>
                    </label>
                    <Autocomplete
                      disablePortal
                      options={getFilteredOptions()}
                      value={searchTerm}
                      onChange={handleSenderChange}
                      getOptionLabel={(option) => {
                        if (option === 'add_new') return '';
                        return option;
                      }}
                      renderOption={renderOption}
                      freeSolo
                      clearOnBlur={false}
                      handleHomeEndKeys
                      selectOnFocus
                      blurOnSelect
                      clearOnEscape
                      onOpen={() => { 
                        setFilteredSenders(allSenders);
                        setSearchTerm('');
                      }}
                      onInputChange={(event, newInputValue) => {
                        if (!isSearchDisabled) {
                          setSearchTerm(newInputValue);
                          const filtered = allSenders.filter((sender) =>
                            sender.toLowerCase().includes(newInputValue.toLowerCase())
                          );
                          setFilteredSenders(filtered);
                        }
                      }}
                      filterOptions={(options) => {
                    const filtered = options.filter(option => option !== 'add_new');
                     if (filtered.length === 0 || searchTerm) {
                          filtered.push('add_new');
                        }
                        return filtered;
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Search Sender.."
                          size="small"
                          required
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <React.Fragment>
                                {searchTerm && isSearchDisabled && (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSearchTerm('');
                                      setFormData(prev => ({
                                        ...prev,
                                        senderAddbookIdHidden: ''
                                      }));
                                      setIsSearchDisabled(false);
                                    }}
                                    sx={{ mr: 1 }}
                                  >
                                    <DeleteIcon fontSize="small"  color="red"/>
                                  </IconButton>
                                )}
                                {params.InputProps.endAdornment}
                              </React.Fragment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#ced4da',
                              },
                              '&:hover fieldset': {
                                borderColor: '#207785',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#207785',
                              },
                            },
                          }}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <label>Letter Number:<span style={{ color: "red" }}>*</span></label>
                  <TextField
                    fullWidth
                    size="small"
                    name="letterNumber"
                    value={formData.letterNumber}
                    onChange={handleLetterNumberChange}
                    placeholder="Enter Letter Number"
                    required
                     autoComplete="off"
                    inputProps={{
                      maxLength: 20,
                      pattern: "[^ ]*", 
                      onKeyDown: (e) => {
                        if (e.key === " ") {
                          e.preventDefault(); 
                        }
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#ced4da',
                        },
                        '&:hover fieldset': {
                          borderColor: '#207785',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#207785',
                        },
                      },
                    }}
                  />
                </div>
 
             <div className="col-md-4">
                  <label style={{ display: "block", width: "100%" }}>
                    Sender Date: <span style={{ color: "red" }}>*</span>
                  </label>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    name="senderDate"
                    inputProps={{
                      max:  getTodayDate(),
                    }}
                    value={formData.senderDate }
                    onChange={handleSenderDateChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#ced4da',
                        },
                        '&:hover fieldset': {
                          borderColor: '#207785',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#207785',
                        },
                      },
                    }}
                  />
                </div>
              </div>
              {/* Subject */}
              <div className="row mb-3">
                <div className="col-md-12">
                  <label>Subject: <span style={{ color: "red" }}>*</span></label>
                  <textarea
                    className="form-control"
                    name="subject"
                    value={formData.subject || ""}
                    onChange={handleSubjectChange}
                    placeholder="Enter subject"
                    required
                    maxLength={250}
                  />
                </div>
              </div>

              {/* Department Table */}
              <div className="row mb-3">
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    backgroundColor: '#fff',
                    border: '1px solid rgba(224, 224, 224, 1)'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ padding: '12px', borderBottom: '2px solid rgba(224, 224, 224, 1)' }}>Department Name <span style={{ color: "red" }}>*</span></th>
                        <th style={{ padding: '12px', borderBottom: '2px solid rgba(224, 224, 224, 1)' }}>Addressee Designation <span style={{ color: "red" }}>*</span></th>
                        <th style={{ padding: '12px', borderBottom: '2px solid rgba(224, 224, 224, 1)' }}>Addressee <span style={{ color: "red" }}>*</span></th>
                        <th style={{ padding: '12px', borderBottom: '2px solid rgba(224, 224, 224, 1)' }}>Memo Number</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid rgba(224, 224, 224, 1)', width: '55px' }}>
                         
                          {/* <IconButton
                            onClick={handleAddRow}
                            size="small"
                            sx={{ 
                              bgcolor: '#4caf50',
                              color: 'white',
                              '&:hover': {
                                bgcolor: '#388e3c',
                              },
                            }}
                            disabled={rows.length > 0 && (!rows[0].departmentName || !rows[0].addresseeDesignation || !rows[0].addressee)}
                          >
                            <FaPlus size={12} />
                          </IconButton> */}

                            <IconButton
                              onClick={handleAddRow}
                              size="small"
                              sx={{ 
                                bgcolor: '#4caf50',
                                color: 'white',
                                '&:hover': { bgcolor: '#388e3c' },
                              }}
                              disabled={rows.some(row => !row.departmentName || !row.addresseeDesignation || !row.addressee)}
                            >
                              <FaPlus size={12} />
                            </IconButton>

                        </th>
                      </tr>
                    </thead>
        
                    <tbody>
  {rows.map((row, index) => (
    <tr key={index} style={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
      <td style={{ padding: '8px' }}>
        <TextField
          select
          fullWidth
          size="small"
          value={row.departmentName}
          onChange={(e) => handleRowChange(index, "departmentName", e.target.value)}
          error={!!errorsdep[index]?.departmentName}
          helperText={errorsdep[index]?.departmentName}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#ced4da',
              },
              '&:hover fieldset': {
                borderColor: '#207785',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#207785',
              },
            },
          }}
        >
          <MenuItem value="">-- Select Department --</MenuItem>
          {departmentList.map((department) => (
            <MenuItem key={department.departmentId} value={department.departmentId}>
              {department.departmentName}
            </MenuItem>
          ))}
        </TextField>
      </td>
      <td style={{ padding: '8px' }}>
        <TextField
          select
          fullWidth
          size="small"
          value={row.addresseeDesignation}
          onChange={(e) => handleRowChange(index, "addresseeDesignation", e.target.value)}
          error={!!errorsdep[index]?.addresseeDesignation}
          helperText={errorsdep[index]?.addresseeDesignation}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#ced4da',
              },
              '&:hover fieldset': {
                borderColor: '#207785',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#207785',
              },
            },
          }}
        >
          <MenuItem value="">-- Select Designation --</MenuItem>
          {designationList.map((designation) => (
            <MenuItem key={designation.id} value={designation.id}>
              {designation.name}
            </MenuItem>
          ))}
        </TextField>
      </td>
      <td style={{ padding: '8px' }}>
        <TextField
          select
          fullWidth
          size="small"
          value={row.addressee || ""}
          onChange={(e) => handleRowChange(index, "addressee", e.target.value)}
          error={!!errorsdep[index]?.addressee}
          helperText={errorsdep[index]?.addressee}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#ced4da',
              },
              '&:hover fieldset': {
                borderColor: '#207785',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#207785',
              },
            },
          }}
        >
          <MenuItem value="">-- Select Addressee --</MenuItem>
          {Array.isArray(row.addressList) && row.addressList.length > 0 ? (
            row.addressList.map((addressee) => (
              <MenuItem key={addressee.id} value={addressee.id}>
                {addressee.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem value="" disabled>No addressees available</MenuItem>
          )}
        </TextField>
      </td>
      <td style={{ padding: '8px' }}>
        <TextField
          fullWidth
          size="small"
          value={row.memoNumber}
          onChange={(e) => handleRowChange(index, "memoNumber", e.target.value)}
          placeholder="Enter memo number"
          inputProps={{ maxLength: 20 }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#ced4da',
              },
              '&:hover fieldset': {
                borderColor: '#207785',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#207785',
              },
            },
          }}
        />
      </td>
      <td style={{ padding: '8px', textAlign: 'center' }}>
        <IconButton
          onClick={() => handleRemoveRow(index)}
          size="small"
          sx={{
            bgcolor: '#f44336',
            color: 'white',
            '&:hover': {
              bgcolor: '#d32f2f',
            },
          }}
        >
          <FaMinus size={12} />
        </IconButton>
      </td>
    </tr>
  ))}
</tbody>

                  </table>
                </Box>
              </div>

              {/* Remarks */}
              <div className="row mb-3">
                <div className="col-md-12">
                  <label>Remarks:</label>
                  <textarea
                    className="form-control"
                    name="remarks"
                    value={formData.remarks || ""}
                    onChange={handleremarksChange}
                    placeholder="Enter remarks"
                    maxLength={250}
                  />
                </div>
              </div>
              {/* Add Enclosure */}

              <div className="row mb-3">
                <div className="col-md-3">
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Upload Letter:<span style={{ color: "red" }}>*</span>
                  </Typography>
                  <Box sx={{ 
                    border: '1px dashed #ccc',
                    borderRadius: 1,
                    p: 2,
                    bgcolor: '#f8f9fa',
                    minHeight: '100px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}>
                    <input
                      type="file"
                      accept=".pdf"
                      id="uploadedLetter"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="uploadedLetter">
                      <Button
                        variant="contained"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        sx={{ 
                          bgcolor: '#207785',
                          '&:hover': {
                            bgcolor: '#1a5f6a',
                          }
                        }}
                      >
                        Choose File
                      </Button>
                    </label>
                
                    {formData.uploadedLetter && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 1,
                          bgcolor: "white",
                          p: 1,
                          borderRadius: 1,
                        }}
                      >
                        <InsertDriveFileIcon color="primary" />
                        <Typography variant="body2"
                        sx={{
                          flex: 1,
                          whiteSpace: "nowrap",    
                          overflow: "hidden",      
                          textOverflow: "ellipsis", 
                          maxWidth: "100%",        
                          display: "inline-block",  
                        }}
                        >
                      {typeof formData.uploadedLetter === "string" ? formData.uploadedLetter : formData.uploadedLetter?.name || "No file selected"}
                    </Typography>
                        <IconButton
                          onClick={handleDocumentView} 
                          size="small"
                          color="primary"
                        >
                          <VisibilityIcon/>
                        </IconButton>
                      </Box>
                    )}

                    {!formData.uploadedLetter && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        No file chosen (Max size: 2MB)
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Supported formats: PDF
                  </Typography>
                </div>

                <div className="col-md-3 mt-4 d-flex gap-3 align-items-center">
                  <input
                    type="checkbox"
                    className="form-check-input me-3"
                    name="addEnclosure"
                    checked={showTable} 
                    onChange={handleCheckboxChange}
                  />
                  <label className="form-check-label">Add Enclosure</label>
                </div>


                {/* Non-Urgent Letter Toggle */}
                <div className="col-md-3 mt-4 d-flex gap-3 align-items-center">
                  <div
                    onClick={() => toggleHandler("isUrgent")}
                    style={{ cursor: "pointer" }}
                    title={
                      formData.isUrgent
                        ? "Deactivate Urgent"
                        : "Activate Urgent"
                    }
                  >
                    {formData.isUrgent ? (
                      <FaToggleOn size={20} color="green" />
                    ) : (
                      <FaToggleOff size={20} color="gray" />
                    )}
                  </div>
                  <label className="form-check-label">
                    {formData.isUrgent ? "Urgent Letter" : "Non-Urgent Letter"}
                  </label>
                </div>

                {/* Non-Confidential Letter Toggle */}
                <div className="col-md-3 mt-4 d-flex gap-3 align-items-center">
                  <div
                    onClick={() => toggleHandler("isConfidential")}
                    style={{ cursor: "pointer" }}
                    title={
                      formData.isConfidential
                        ? "Deactivate Confidential"
                        : "Activate Confidential"
                    }
                  >
                    {formData.isConfidential ? (
                      <FaToggleOn size={20} color="green" />
                    ) : (
                      <FaToggleOff size={20} color="gray" />
                    )}
                  </div>
                  <label className="form-check-label">
                    {formData.isConfidential
                      ? "Confidential Letter"
                      : "Non-Confidential Letter"}
                  </label>
                </div>
              </div>

              {/* Enclosure Table */}
              <div className="row mb-3">
                {showTable && (
                  <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Enclosure Type<span style={{ color: "red" }}>*</span></TableCell>
                          <TableCell>Enclosure Name<span style={{ color: "red" }}>*</span></TableCell>
                          <TableCell>Upload File<span style={{ color: "red" }}>*</span></TableCell>
                          <TableCell align="right">
                            <IconButton
                              onClick={handleAddEnclosureRow}
                              size="small"
                              sx={{ 
                                bgcolor: '#4caf50',
                                color: 'white',
                                '&:hover': {
                                  bgcolor: '#388e3c',
                                },
                                padding: '8px',
                              }}
                            >
                              <FaPlus size={12} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {enclosureRows.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <FormControl fullWidth size="small">
                                <Select
                                value={row.enclosureType}
                                  onChange={(e) => handleEnclosureRowChange(index, "enclosureType", e.target.value)}
                                  displayEmpty
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      '& fieldset': {
                                        borderColor: '#ccc',
                                      },
                                      '&:hover fieldset': {
                                        borderColor: '#207785',
                                      },
                                    },
                                  }}
                              >
                                  <MenuItem value="">- Select -</MenuItem>
                                {enclosureTypeList.map((type) => (
                                    <MenuItem
                                      key={type.id}
                                      value={type.id}
                                    >
                                    {type.name}
                                    </MenuItem>
                                ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                size="small"
                                value={row.enclosureName}
                                onChange={(e) => handleEnclosureRowChange(index, "enclosureName", e.target.value)}
                                inputProps={{ maxLength: 30 }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                      borderColor: '#ccc',
                                    },
                                    '&:hover fieldset': {
                                      borderColor: '#207785',
                                    },
                                  },
                                }}
                              />
                            </TableCell>
                          
                        
                            <TableCell>
                              <TextField
                                type="file"
                                fullWidth
                                size="small"
                                onChange={(e) => handleFileUploadChange(index, e)}
                                InputProps={{
                                  sx: {
                                    '& .MuiOutlinedInput-root': {
                                      '& fieldset': {
                                        borderColor: '#ccc',
                                      },
                                      '&:hover fieldset': {
                                        borderColor: '#207785',
                                      },
                                    },
                                  },
                                  endAdornment: row.fileName && ( // Show eye icon only if file exists
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={() => handleDocumentView(row.fileName, row.filePath)}
                                        size="small"
                                        color="primary"
                                        edge="end"
                                      >
                                        <VisibilityIcon />
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                              {row.fileName && ( // Display the file name below the input field
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  Uploaded File: {row.fileName}
                                </Typography>
                              )}
                            </TableCell>

                            <TableCell>
                              <IconButton
                                onClick={(e) => handleRemoveEnclosureRow(index,e)}
                                sx={{
                                  color: '#d32f2f',
                                  '&:hover': {
                                    backgroundColor: 'rgba(211, 47, 47, 0.04)',
                                  },
                                }}
                              >
                                <RemoveCircleOutline />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </div>

              {/* buttons */}
              <div className="row">
                <div className="col-md-12 text-center">
                  <Button
                    variant="contained"
                    className="btn btn-success me-2"
                    value={"0"}
                    onClick={() => handleSave("0")}
                    sx={{ 
                      bgcolor: '#207785',
                      '&:hover': {
                        bgcolor: '#1a5f6a',
                      }
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleSave("1")}
                    sx={{ 
                      bgcolor: '#207785',
                      '&:hover': {
                        bgcolor: '#1a5f6a',
                      }
                    }}
                  >
                    Save & Send
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    sx={{ 
                      mx: 1,
                      bgcolor: '#dc3545',
                      '&:hover': {
                        bgcolor: '#bb2d3b',
                      }
                    }}
                    onClick={() => {
                      setFormData({
                        senderAddbookIdHidden: "",
                        letterNumber: "",
                        senderDate: "",
                        subject: "",
                        remarks: "",
                        isConfidential: false,
                        isUrgent: false,
                        letterType: "",
                        uploadedLetter: null,
                      });

                      setRows([{
                        departmentName: "",
                        addresseeDesignation: "",
                        addressee: "",
                        memoNumber: "",
                      }]);

                      setEnclosureRows([{
                        enclosureType: "",
                        enclosureName: "",
                        file: null,
                      }]);
                      const fileInputs = document.querySelectorAll('input[type="file"]');
                      fileInputs.forEach(input => {
                        input.value = '';
                      });
                     setShowTable(false);
                      // Reset sender selection and search
                      setSearchTerm("");
                      setIsSearchDisabled(false);
                      setSelectedRow(null);
                      setSelectedRowShare(null);
                      setSenderDetails({
                        groupName: "",
                        name: "",
                        address: "",
                        mobile: "",
                        email: "",
                        fax: "",
                        district: "",
                      });
                      setErrors({
                        groupName: "",
                        name: "",
                        address: "",
                        mobile: "",
                        email: "",
                        fax: "",
                        district: "",
                      });
                      if (typeof setSelectedSender === 'function') {
                        setSelectedSender(null);
                      }
                      if (typeof setSenderName === 'function') {
                        setSenderName("");
                      }
                      if (typeof setSenderAddress === 'function') {
                        setSenderAddress("");
                      }
                      setOpenSection(null);

                      toast.success("All fields have been reset successfully!");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      
      {showModal && (
        <div
          className={`modal fade ${showModal ? "show" : ""}`}
          style={{ display: showModal ? "block" : "none" }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-xl">
            <div className="diary-section-model-content
             modal-content">
              <div className="diary-section-model-header modal-header">
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
                  <div className="accordion-header">
                    <span className="accordion-title">Add Sender Details</span>
                    <span 
                      className="accordion-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection("addSender");
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {openSection === "addSender" ? <FaMinus /> : <FaPlus />}
                    </span>
                  </div>
                  {openSection === "addSender" && (
                    <div className="accordion-body">
                <form>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Group Name"
                    variant="outlined"
                    fullWidth
                    name="groupName"
                    placeholder="Enter Group Name"
                    value={senderDetails.groupName}
                    onChange={handleInputChange}
                    error={!!errors.groupName}
                    helperText={errors.groupName}
                    autoComplete="off"
                    inputProps={{
                      autoComplete: 'off',
                      form: {
                        autoComplete: 'off',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Name"
                    variant="outlined"
                    fullWidth
                    name="name"
                    placeholder="Enter Name"
                    value={senderDetails.name}
                    onChange={handleInputChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    autoComplete="off"
                    inputProps={{
                      autoComplete: 'off',
                      form: {
                        autoComplete: 'off',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Address"
                    variant="outlined"
                    fullWidth
                    name="address"
                    placeholder="Enter Address"
                    value={senderDetails.address}
                    onChange={handleInputChange}
                    error={!!errors.address}
                    helperText={errors.address}
                    autoComplete="off"
                    inputProps={{
                      autoComplete: 'off',
                      form: {
                        autoComplete: 'off',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Mobile"
                    variant="outlined"
                    fullWidth
                    name="mobile"
                    placeholder="EX: 8318204626"
                    value={senderDetails.mobile}
                    onChange={handleInputChange}
                    error={!!errors.mobile}
                    helperText={errors.mobile}
                    autoComplete="off"
                    inputProps={{
                      autoComplete: 'off',
                      form: {
                        autoComplete: 'off',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    name="email"
                    placeholder="Ex: bonu@gmail.com"
                    value={senderDetails.email}
                    onChange={handleInputChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    autoComplete="off"
                    inputProps={{
                      autoComplete: 'off',
                      form: {
                        autoComplete: 'off',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Fax"
                    variant="outlined"
                    fullWidth
                    name="fax"
                    placeholder="Enter Fax"
                    value={senderDetails.fax}
                    onChange={handleInputChange}
                    error={!!errors.fax}
                    helperText={errors.fax}
                    autoComplete="off"
                    inputProps={{
                      autoComplete: 'off',
                      form: {
                        autoComplete: 'off',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="District"
                    variant="outlined"
                    fullWidth
                    name="district"
                    placeholder="Enter District"
                    value={senderDetails.district}
                    onChange={handleInputChange}
                    error={!!errors.district}
                    helperText={errors.district}
                    autoComplete="off"
                    inputProps={{
                      autoComplete: 'off',
                      form: {
                        autoComplete: 'off',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSaveSender}
                      style={{ flex: 1 }}
                    >
                      Submit
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        setShowModal(false);
                        setSenderDetails({
                          groupName: "",
                          name: "",
                          address: "",
                          mobile: "",
                          email: "",
                          fax: "",
                          district: "",
                        });
                      }}
                      style={{ flex: 1 }}
                    >
                      Close
                    </Button>
                  </div>
                </Grid>
              </Grid>
            </form>
                    </div>
                  )}
                </div>
                {/* All Sender List */}
                <div className="diary-section-container">
                  <div className="accordion-header">
                    <span className="accordion-title">All Sender List</span>
                    <span 
                      className="accordion-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection("senderList");
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {openSection === "senderList" ? <FaMinus /> : <FaPlus />}
                    </span>
                  </div>
                  {openSection === "senderList" && (
                    <div className="accordion-body">
                      <div className="row mb-3">
                        <div className="col-md-4 ms-auto">
                          <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Search by name, group, address..."
                            value={searchQuerySender}
                            onChange={handleFilterSender}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon style={{ color: '#207785' }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </div>
                      </div>
                      <div className="table-responsive">
                        <DataTable
                          columns={columns}
                          data={filteredRecords}
                          fixedHeader
                          pagination
                          paginationPerPage={10}
                          paginationRowsPerPageOptions={[10, 20, 30, 50]}
                          customStyles={customStyles}
                          noDataComponent={<div className="p-4">No sender records found</div>}
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


      {/* Letters List tab section */}
      <div className="diary-section-container mt-4">
        <div className="accordion-header" onClick={toggleLettersList}>
          <span className="accordion-title">Letters List</span>
          <span className="accordion-icon">
            {openSection === "LettersList" ? <FaMinus /> : <FaPlus />}
          </span>
        </div>
        {openSection === "LettersList" && (
          <div className="accordion-body">
            <form>
              <div className="row align-items-center mb-3">
                <div className="container mt-3">
                  <Tabs
                    activeKey={activeTab}
                    onSelect={handleTabSelect}
                    className="mb-3"
                  >
                    <Tab eventKey="newLetter" title="New Letter">
                      <div className="d-flex justify-content-end mb-3">
                        <div className="col-md-3">
                          <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Search letters..."
                            value={searchQueryNewLetter}
                            onChange={handleFilterNewLetter}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon style={{ color: '#207785' }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </div>
                      </div>
                      <div className="table-responsive mt-3">
                        <DataTable
                          columns={columnsNewLetter}
                          data={filteredNewLetter || []}
                          pagination
                          highlightOnHover
                          striped
                          responsive
                          customStyles={customStyles}
                        />
                      </div>
                    </Tab>
                    <Tab eventKey="sentLetter" title="Sent Letter">
                  <div className="d-flex justify-content-end mb-3">
                    <div className="col-md-3">
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Search sent letters..."
                        value={searchQuerySentLetter}
                        onChange={handleFilterSentLetter}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon style={{ color: '#207785' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </div>
                  </div>

                  <DataTable
                    columns={columnsSentLetter}
                    data={filteredSentLetter}
                    pagination
                    highlightOnHover
                      striped
                      responsive
                    customStyles={customStyles}
                  />
                </Tab>
                  </Tabs>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      
      {IsAddresssModalOpen && (
              <div
                className="modal fade show"
                style={{ display: "block", background: "rgba(0, 0, 0, 0.5)" }}
                tabIndex="-1"
                role="dialog"
              >
                <div className="modal-dialog modal-lg" role="document">
                  <div className="diary-section-model-content modal-content">
                    <div className="diary-section-model-header modal-header">
                      <h5 className="modal-title">All Letter Recipients</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setIsAddresssModalOpen(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>SI No</th>
                            <th>Office Name</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Name</th>
                            <th>Memo Number</th>
                            <th>Diary Number</th>
                          </tr>
                        </thead>
                        <tbody>
                          {newLetterData.length > 0 ? (
                            newLetterData.map((item, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.officeName || "N/A"}</td>
                                <td>{item.deptName || "N/A"}</td>
                                <td>{item.designation || "N/A"}</td>
                                <td>{item.addressee || "N/A"}</td>
                                <td>{item.memoNo || "N/A"}</td>
                                <td>{item.diaryNo || "N/A"}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="text-center">
                                No data available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}


 {/* new letter table encloser  data */}
<Modal
  show={showModalEncloser}
  onHide={handleCloseModalEncloser}
  size="lg"
  backdrop="static"
  centered
  style={{ maxWidth: '100%', margin: 'auto' }}
>
  <Modal.Header closeButton>
    <Modal.Title>Attach Enclosure</Modal.Title>
  </Modal.Header>
  
  <Modal.Body>
    {selectedRow ? (
      <>
        {/* Dynamic Table for Uploading Enclosures */}
      <div className="table-responsive mb-3">
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Enclosure Type</TableCell>
                      <TableCell>Enclosure Name</TableCell>
                      <TableCell>Upload</TableCell>
                      <TableCell align="center" width="100">
                        <IconButton
                          onClick={handleAddTableEnclosureRow}
                          size="small"
                          sx={{
                            bgcolor: '#4caf50',
                            color: 'white',
                            '&:hover': {
                              bgcolor: '#388e3c',
                            },
                          }}
                        >
                          <FaPlus size={12} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {enclosureRowstable.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <FormControl sx={{ width: '100%' }}>
                            <Select
                              value={row.enclosureType}
                              onChange={(e) => handleTableEnclosureRowChange(index, "enclosureType", e.target.value)}
                            >
                              <MenuItem value="">- Select -</MenuItem>
                              {enclosureTypeList.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                  {type.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                          value={row.enclosureName}
                          onChange={(e) => handleTableEnclosureRowChange(index, "enclosureName", e.target.value)}
                        />
                        </TableCell>
                        <TableCell>
                      <input
                          type="file"
                          value={row.file ? undefined : ""}
                          className="form-control"
                          onChange={(e) => handleFileUploadChangeencloser(index, e)}
                        />
                       
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleRemoveTableEnclosureRow(index)}
                          size="small"
                          sx={{
                            bgcolor: '#f44336',
                            color: 'white',
                            '&:hover': {
                              bgcolor: '#d32f2f',
                            },
                          }}
                        >
                          <FaMinus size={12} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            </div>

            {/* Save & Cancel Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, mb: 3 }}>
              <Button
                variant="contained"
                onClick={handleSaveEnclosures}
                sx={{
            backgroundColor: '#207785',
                  '&:hover': {
              backgroundColor: '#1a6470',
                  },
                }}
              >
                Save
              </Button>
              <Button
                variant="contained"
                onClick={handleCloseModalEncloser}
                sx={{
            backgroundColor: '#d32f2f',
                  '&:hover': {
              backgroundColor: '#c62828',
                  },
                }}
              >
                Cancel
              </Button>
            </Box>

        {/* Static Table Below (Fetched Data) */}
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>SI NO</TableCell>
                    <TableCell>Enclosure Type</TableCell>
                    <TableCell>Enclosure Name</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
              {newLetterDataEncloser.length > 0 ? (
                newLetterDataEncloser.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{row.enclosureType}</TableCell>
                        <TableCell>{row.enclosureName}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleDownload (row)}
                            sx={{
                            color: '#207785',
                              '&:hover': {
                          backgroundColor: 'rgba(32, 119, 133, 0.04)'
                              },
                            }}
                          >
                       <GetAppIcon/>
                          </IconButton>
                        </TableCell>
                      </TableRow>
                ))
              ) : (
                    <TableRow>
                <TableCell colSpan="4" align="center">No data available</TableCell>
                    </TableRow>
              )}
                </TableBody>
              </Table>
            </TableContainer>
      </>
    ) : (
      <p className="text-center text-muted">No data available.</p>
    )}
  </Modal.Body>

  <Modal.Footer>
    <button className="btn btn-secondary" onClick={handleCloseModalEncloser}>
      Close
    </button>
  </Modal.Footer>
</Modal>

 {/* new letter table share data data */}
    <Modal
        show={showModalShare}
        onHide={() => (!isSending ? setShowModalShare(false) : null)} 
        backdrop="static"
        keyboard={false}
        centered
        size="sm"
      >
        <Modal.Header closeButton={!isSending}>
          <Modal.Title>Confirm Sending Letter</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Do you want to send letter no: <strong>{selectedRowShare?.lnumber || "N/A"}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalShare(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSendButtonClick} disabled={isSending}>
            {isSending ? "Sending..." : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>


      <Modal
        show={showModalShare}
        onHide={() => (!isSending ? setShowModalShare(false) : null)}
        backdrop="static"
        keyboard={false}
        centered
        size="lg"
      >
        <Modal.Header 
          closeButton={!isSending}
          style={{
            backgroundColor: '#207785',
            color: '#fff',
            borderBottom: '1px solid #1a5f6a',
            padding: '1rem 1.5rem'
          }}
        >
          <Modal.Title style={{ 
            fontSize: '1.1rem', 
            fontWeight: '500',
            margin: 0
          }}>
            Confirm Sending Letter
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ 
          padding: '1.5rem',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <p style={{ 
              fontSize: '1rem', 
              color: '#333', 
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              Do you want to send letter no:{" "}
              <strong style={{ color: '#207785' }}>
                {selectedRowShare?.lnumber || "N/A"}
              </strong>?
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Button
                variant="contained"
                color="error"
                onClick={() => setShowModalShare(false)}
                disabled={isSending}
                sx={{ 
                  bgcolor: '#dc3545',
                  '&:hover': {
                    bgcolor: '#bb2d3b',
                  },
                  textTransform: 'none',
                  px: 3,
                  minWidth: '100px'
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSendButtonClick}
                disabled={isSending}
                sx={{ 
                  bgcolor: '#207785',
                  '&:hover': {
                    bgcolor: '#1a5f6a',
                  },
                  textTransform: 'none',
                  px: 3,
                  minWidth: '100px'
                }}
              >
                {isSending ? "Sending..." : "Confirm"}
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={showLetterModal}
        onHide={() => setShowLetterModal(false)}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header className="bg-light">
          <div className="w-100 d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Letter Detail</h6>
            <div>
              <Button 
                variant="link" 
                className="text-dark p-0 me-2"
                onClick={() => setShowLetterModal(false)}
              >
                Back
              </Button>
            
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="p-0">
          {selectedLetterDetails && (
            <div className="container-fluid">
              <div className="row">
                {/* Left Side - Letter Details */}
                <div className="col-md-6 p-4 border-end">
                  <div className="letter-details">
                    <div className="row mb-3">
                      <div className="col-4">
                        <label className="text-muted">Letter Number:</label>
                      </div>
                      <div className="col-8">
                      <div className="col-8">
                       
                        <span>{selectedLetterDetails.letterNo || 'NA'}</span>
                    </div>

                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-4">
                        <label className="text-muted">Sender Date:</label>
                      </div>
                      <div className="col-8">
                        <span>
                          {selectedLetterDetails.senderDate || 'NA'}
                        </span>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-4">
                        <label className="text-muted">Sender:</label>
                      </div>
                      <div className="col-8">
                        <span>{selectedLetterDetails.senderName || 'NA'}</span>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-4">
                        <label className="text-muted">Addressee:</label>
                      </div>
                      <div className="col-8">
                        <span>{selectedLetterDetails.addressee|| 'NA'}</span>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-4">
                        <label className="text-muted">Subject:</label>
                      </div>
                      <div className="col-8">
                        <span>{selectedLetterDetails.subject || 'NA'}</span>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-4">
                        <label className="text-muted">Dairy Number:</label>
                      </div>
                      <div className="col-8">
                        <span>{selectedLetterDetails.diaryNumber || 'NA'}</span>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-4">
                        <label className="text-muted">Memo Number:</label>
                      </div>
                      <div className="col-8">
                        <span>{selectedLetterDetails.memoNo || ''}</span>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-4">
                        <label className="text-muted">Remarks:</label>
                      </div>
                      <div className="col-8">
                        <span>{selectedLetterDetails.remarks || 'NA'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - PDF Preview */}
                <div className="col-md-6 p-0 " >
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, p: 3 }}>
    

     
    {/* <Card sx={{ width: "100%", boxShadow: 3, borderRadius: 2 }}>
      <CardContent sx={{ p: 2 }}> */}
        <iframe
          src={letterViews}
          style={{
            width: "100%",
            height: "500px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
          title="PDF Viewer"
        />
      {/* </CardContent>
    </Card> */}

    
    <Button
      variant="contained"
      startIcon={<DownloadIcon />}
      onClick={handleDownloadletter}
      sx={{
        mt: 2,
        px: 3,
        py: 1,
        borderRadius: "8px",
        backgroundColor: "#1976d2",
        "&:hover": { backgroundColor: "#1565c0" },
      }}
    >
      Download PDF
    </Button>
  </Box>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="row mt-3">
                {/* Bottom Left - Note */}
                <div className="col-md-6 p-4">
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Note
          </Typography>

          {
        Array.isArray(selectedLetterDetails?.letterNotesArrays) &&
        selectedLetterDetails.letterNotesArrays.length > 0 ? (
          selectedLetterDetails.letterNotesArrays.map((note, index) => (
            <Paper key={index} elevation={2} sx={{ p: 2, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 1 }}>
              {/* Left Side Content */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Action taken by: {note?.actionTakenBy || "N/A"}
                </Typography>
                <Typography>
                  <strong>Action:</strong> {note?.action || "N/A"}
                </Typography>
                <Typography variant="caption" display="block">
                  <strong>Date:</strong> {note?.modifyDate || "N/A"}
                </Typography>
                <Typography>
                  <strong>Note:</strong> {note?.note || "N/A"}
                </Typography>
              </Box>

              {/* Right Side Numbering */}
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  bgcolor: "#e0e0e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                {index + 1}
              </Box>
            </Paper>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No notes available.
          </Typography>
        )
      }
                
        </Box>
               </div>

                {/* Bottom Right - Enclosures Table */}
                <div className="col-md-6 p-4">
                  <h6 className="mb-3">All Enclosures</h6>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>SI NO</th>
                          <th>Enclosure Name</th>
                          <th>Enclosure Type</th>
                          <th>Added By</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedLetterDetails.letterEnclosureArrays?.map((enclosure, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                           <td>
                            <button
                              style={{
                                background: "none",
                                border: "none",
                                color: "#007bff",
                                textDecoration: "underline",
                                cursor: "pointer",
                              }}
                              onClick={() => handleDownloadletter(enclosure.enclosureName, enclosure.enclosurePath)}
                            >
                              {enclosure.enclosureName}
                            </button>
                          </td>

                            <td>{enclosure.enclosureType}</td>
                            <td>{enclosure.enclosureUploadBy}</td>
                            <td>
                            {enclosure.enclosureUploadDate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Add CSS for letter details */}
      <style jsx>{`
        .letter-details label {
          font-size: 0.9rem;
          margin-bottom: 0;
        }
        .letter-details span {
          font-size: 0.9rem;
        }
        .pdf-preview {
          min-height: 500px;
        }
        .table {
          font-size: 0.9rem;
        }
        .table th {
          background-color: #f8f9fa;
          font-weight: 500;
        }
        .modal-xl {
          max-width: 1200px;
        }
      `}</style>
    </>
  );
};

export default DiarySection;
