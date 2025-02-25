import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  DialogActions,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import api from '../../Api/Api';
import { toast } from "react-toastify";
import { Checkbox } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import "@react-pdf-viewer/core/lib/styles/index.css";
const LetterDetail = ({ open, onClose, letterData ,letterDataView}) => {
  const navigate = useNavigate()

const fileName =  letterDataView?.fileName;
const filePath =  letterDataView?.filePath;
const viewdocument =  letterDataView?.base64Path;
const encloserFileName = letterDataView?.letterEnclosureArrays?.[0]?.fileName || "No File Available";
const encloserFilePath = letterDataView?.letterEnclosureArrays?.[0]?.filePath || "No File Available";

  
  const [isUrgent, setIsUrgent] = useState(letterDataView?.isUrgent || false);
  const [pendingUrgency, setPendingUrgency] = useState(null);
  const [openUrgentModal, setOpenUrgentModal] = useState(false);

  const [isConfidential, setIsConfidential] = useState(letterDataView?.isConfidentialfalse ||false);
  const [pendingConfidential, setPendingConfidential] = useState(null);
  const [openConfidentialModal, setOpenConfidentialModal] = useState(false);

  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openWarningModal, setOpenWarningModal] = useState(false);
  
  const [errorModalOpen, setErrorModalOpen] = useState(false); 
   const [errorMessage, setErrorMessage] = useState("");

  const [officeList, setOfficeList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);

  const [officeName, setOfficeName] = useState('');
  const [departmentName, setDepartmentName] = useState('');

   const [openModalotherbutton, setOpenModalotherbutton] = useState(false);
   const [tableData, setTableData] = useState([]);

   const metadataId = letterData?.metadataId || letterDataView?.metadataId;
   const letterRecptId = letterData?.letterRecptId|| letterDataView?.letterRecptId;
   const noteId = letterData?.noteId || letterDataView?.noteId
   
   const [marginalNote, setMarginalNote] = useState(letterDataView?.darftNote || "");
   const [officeId, setOfficeId] = useState(null);
   const [departmentId, setDepartmentId] = useState(null);
   const [selectedRows, setSelectedRows] = useState([]);
   
   const [selectedRowsfrequ, setSelectedRowsfrequ] = useState([]);
  

  const handleCloseModal = () => {
    setOpenModalotherbutton(false);
    setOfficeName('');
    setDepartmentName('');
    setOfficeId(null);
    setDepartmentId(null);
    setTableData([]); 
  };


  const handleOfficeNameChange = (event) => {
    const selectedOfficeName = event.target.value;
    const selectedOffice = officeList.find((office) => office.officeName === selectedOfficeName);
  
    if (selectedOffice) {
      setOfficeName(selectedOfficeName);
      setOfficeId(selectedOffice.officeId); 
    }
  };
  
  const handleDepartmentNameChange = (event) => {
    const selectedDepartmentName = event.target.value;
    const selectedDepartment = departmentList.find((dept) => dept.departmentName === selectedDepartmentName);
  
    if (selectedDepartment) {
      setDepartmentName(selectedDepartmentName);
      setDepartmentId(selectedDepartment.departmentId); 
    }
  };


  const handleCheckboxChange = (event, empOfcDeptMapId) => {
    setSelectedRows((prevSelected) => {
      const isChecked = event.target.checked;
  
      if (isChecked) {
        console.log("Checked ID:", empOfcDeptMapId); 
        return [...prevSelected, empOfcDeptMapId];
      } else {
        return prevSelected.filter((id) => id !== empOfcDeptMapId); 
      }
    });
  };
  
    
  const handleCheckboxfrequientlyChange = (event, empDeptMapId) => {
    setSelectedRowsfrequ((prevSelected) => {
      const isChecked = event.target.checked;
  
      if (isChecked) {
        console.log("Checked ID:", empDeptMapId); 
        return [...prevSelected, empDeptMapId]; 
      } else {
        return prevSelected.filter((id) => id !== empDeptMapId); 
      }
    });
  };
  

  const handleUrgencyToggle = () => {
    setPendingUrgency(!isUrgent); 
    setOpenUrgentModal(true); 
  };
  const handleCancelUrgent = () => {
    setPendingUrgency(null); 
    setOpenUrgentModal(false);
  };

const handleConfidentialToggle = () => {
  setPendingConfidential(!isConfidential);
  setOpenConfidentialModal(true);
};

const handleCancelConfidential = () => {
  setPendingConfidential(null);
  setOpenConfidentialModal(false);
};




useEffect(() => {
  if (!letterDataView) return;

  if (letterDataView.isUrgent !== undefined) {
    setIsUrgent(letterDataView.isUrgent);
  }
  if (letterDataView.isConfidential !== undefined) {
    setIsConfidential(letterDataView.isConfidential);
  }
  if (letterDataView.darftNote !== undefined) {
    setMarginalNote(letterDataView.darftNote);
  }
}, [letterDataView]);


  const handleSaveClick = () => {
    if (!marginalNote.trim()) {
      setOpenWarningModal(true); 
    } else {
      setOpenConfirmModal(true); 
    }
  };



const handleConfirmUrgent = async () => {
      
  try {
    const token = useAuthStore.getState().token;
      const letterRecptId = letterData?.letterRecptId || letterDataView?.letterRecptId;
      const payload = {
          letterReceipentId: letterRecptId,
          isLetterUrgents: pendingUrgency,
      };

      const response = await api.post(
          "letter/make-letter-urgent",
          { dataObject: encryptPayload(payload) },
          { headers: { Authorization: `Bearer ${token}` } }
      );
 
      if (response.status === 200) {
          if (response.data.data !== undefined) { 
              setIsUrgent(response.data.data); 
              toast.success(response.data.message);
          } else {
              toast.warning(response.data.message || "Urgency status unchanged.");
              setIsUrgent(!pendingUrgency); 
          }
      } else {
          toast.error("Failed to update urgency.");
          setIsUrgent(!pendingUrgency);
      }
  } catch (error) {
      console.error("Error updating urgency:", error);
      toast.error("Something went wrong. Try again.");
      setIsUrgent(!pendingUrgency); 
  }
  finally {
    setOpenUrgentModal(false); 
  }
};

  const handleConfirmConfidential = async () => {
    
    try {
      const token = useAuthStore.getState().token;
      const letterRecptId = letterData?.letterRecptId || letterDataView?.letterRecptId;
      const tab = letterData?.tab || letterDataView?.tab;
      const payload = {
        letterReceipentId: letterRecptId,
        isLetterConfidential: pendingConfidential,
        tabCode:tab,
      };
  
      const response = await api.post(
        "letter/make-letter-confidential",
        { dataObject: encryptPayload(payload) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.status === 200) {
        if (response.data.outcome) { 
          setIsConfidential(response.data.data); 
          toast.success(response.data.message);
      } else {
          toast.warning(response.data.message || "Urgency status unchanged.");
          setIsConfidential(!pendingConfidential);
      }
      } 
    } catch (error) {
      console.error("Error updating confidentiality:", error);
      setIsConfidential(!pendingConfidential);
    } finally {
      setOpenConfidentialModal(false);
    }
  };

  const handleConfirmSave = async () => {
    try {
      const token = useAuthStore.getState().token;
      const metadataId = letterData?.metadataId || letterDataView?.metadataId;
      const noteId = letterData?.noteId || letterDataView?.noteId || null;
  
      if (!metadataId) {
        setErrorMessage("Metadata ID is missing or invalid!");
        setErrorModalOpen(true); 
        return;
      }
  
      const payload = {
        metadataId: metadataId,
        note: marginalNote,
        button: "DRAFT",
        noteId: noteId,
      };
  
      const response = await api.post(
        "letter/marginal-note-as-draft",
        { dataObject: encryptPayload(payload) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.data.outcome) {
        
        setOpenConfirmModal(false); 
        onClose();
        toast.success(response.data.message);
      } else {
        setErrorMessage(response.data.message || "An error occurred!");
        setErrorModalOpen(true); 
      }
    } catch (error) {
      console.error("Error saving note:", error);
      setErrorMessage("Failed to save. Please try again.");
      setErrorModalOpen(true); 
    }
  };
  
  const handleOtherButtonClick = async () => {
    try {
      const token = useAuthStore.getState().token;
      const [departmentResponse, officeResponse] = await Promise.all([
        api.post('common/department-list', {}, { headers: { Authorization: `Bearer ${token}` } }),
        api.post('common/office-list', {}, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
  
      if (
        departmentResponse.status === 200 &&
        departmentResponse.data.outcome &&
        officeResponse.status === 200 &&
        officeResponse.data.outcome
      ) {
       
        const departmentData = Array.isArray(departmentResponse.data.data)
          ? departmentResponse.data.data
          : [];
        const officeData = Array.isArray(officeResponse.data.data)
          ? officeResponse.data.data
          : [];
  
        console.log('Raw Department Data:', departmentData);
        console.log('Raw Office Data:', officeData);
  
        
        const deptIdUser = letterDataView.deptIdUser; 
        const officeIdUser = letterDataView.officeIdUser;
  
        console.log('deptIdUser:', deptIdUser);
        console.log('officeIdUser:', officeIdUser);
  
        
        const filteredDepartments = departmentData.filter(
          (dept) => dept.departmentId === deptIdUser
        );
  
       
        const filteredOffices = officeData.filter(
          (office) => office.officeId === officeIdUser
        );
  
        console.log('Filtered Departments:', filteredDepartments);
        console.log('Filtered Offices:', filteredOffices);
  

     
      if (filteredOffices.length > 0) {
        setOfficeName(filteredOffices[0].officeName);
        setOfficeId(filteredOffices[0].officeId);
      }
      if (filteredDepartments.length > 0) {
        setDepartmentName(filteredDepartments[0].departmentName);
        setDepartmentId(filteredDepartments[0].departmentId);
      }

        setDepartmentList(filteredDepartments);
        setOfficeList(filteredOffices);
        setOpenModalotherbutton(true);
       

        console.log('APIs called successfully!');
      } else {
        console.error('Unexpected API Response:', {
          department: departmentResponse.data.message,
          office: officeResponse.data.message,
        });
      }
    } catch (error) {
      console.error('Error calling APIs:', error);
    }
  };
  useEffect(() => {
    if (officeId && departmentId) {
      fetchEmployeeData();
    }
  }, [officeId, departmentId]);
  
  const fetchEmployeeData = async () => {
    try {
     const token = useAuthStore.getState().token;
      const payload = {
        officeId,
        departmentId,
      };
  
      console.log('Payload before encryption:', payload);
      const encryptedPayload = encryptPayload(payload);
      console.log('Encrypted payload:', encryptedPayload);
  
     
      const response = await api.post(
        'letter/getAllEmpToSendLetter',
        { dataObject: encryptedPayload }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log('API Response:', response);
  
      if (response.status === 200 && response.data.outcome) {
        if (Array.isArray(response.data.data)) {
          setTableData(response.data.data); 
          console.log('Employee data fetched successfully:', response.data.data);
        } else {
          console.error('Unexpected data format in API response:', response.data.data);
          setTableData([]); 
        }
      } else {
        console.error('Unexpected API Response:', response.data.message);
        setTableData([]); 
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
  
     
      if (error.response) {
       
        console.error('API Error Response:', error.response.data);
      } else if (error.request) {
       
        console.error('No response received from the API');
      } else {
        
        console.error('Error setting up the API request:', error.message);
      }
  
      setTableData([]); 
    }
  };


  const handleSend = async () => {
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one record before sending.");
      return;
    }
  
    try {
      const token = useAuthStore.getState().token;
      const payload = {
        metadataId,
        letterReceiptId: letterRecptId,
        noteSendid: noteId,
        noteSendto: marginalNote,
        chkSendTo: selectedRows.map(Number),
      };
  
      console.log("Payload before encryption:", payload);
      const encryptedPayload = encryptPayload(payload);
      console.log("Encrypted Payload:", encryptedPayload);
      console.log("Selected Rows:", selectedRows);
  
      const response = await api.post(
        "letter/send-letter-sendto",
        { dataObject: encryptedPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.status === 200 && response.data.outcome) {
        console.log("Data sent successfully:", response.data);
  
        
        toast.success(response.data.message);
  
       
        setSelectedRows([]);
        setOpenModalotherbutton(false);
        onClose();
      
      } else {
        console.error("Unexpected API Response:", response.data.message);
        toast.error("Failed to send data.");
      }
    } catch (error) {
      console.error("Error sending data:", error);
      console.log("Server response:", error.response?.data);
      toast.error("An error occurred while sending data.");
    }
  };
  

  const handlefrequentlymarks = async () => {
    try {
      const token = useAuthStore.getState().token;
      if (selectedRowsfrequ.length === 0) {
        toast.warning("Please select at least one record to send."); 
        return; 
      }

      const payload = {
        letterrecptid:letterRecptId, 
        notefrequent:marginalNote,
        notSendid: noteId,
        chkSendTo:selectedRowsfrequ.map(Number),
      };

   
     const encryptedPayload = encryptPayload(payload);
      const response = await api.post("letter/sendToFrequentlyMarked",
        {
          dataObject: encryptedPayload,
          
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        
        toast.success(response.data.message);
        setSelectedRowsfrequ([]); 
        onClose();
      } else {
        toast.error("Failed to send data.");
      }
    } catch (error) {
      console.error("Error sending data:", error);
      toast.error("An error occurred while sending data.");
    }
  };


  const handleAddToFile = async () => {
    try {
      const token = useAuthStore.getState().token;
      const payload = {
        letterReceiptId: letterRecptId,
      };
      const encryptedPayload = encryptPayload(payload);
      const response = await api.post(
        'letter/letter-tag-to-file',
        { dataObject: encryptedPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.status === 200) {
        console.log('Full API Response:', response.data);
  
        const fetchedData = response.data.data; 
        console.log('Raw letterDetails:', fetchedData.letterDetails);
  
       
        if (typeof fetchedData.letterDetails === 'string') {
          try {
            const parsedLetterDetails = JSON.parse(fetchedData.letterDetails); 
            console.log('Parsed letterDetails:', parsedLetterDetails);
  
            const formattedData = {
              letterReceiptId: fetchedData.letterReceiptId,
              metadataId: fetchedData.metadataId,
              ...parsedLetterDetails, 
            };
            console.log(' after Parsed letterDetails:', formattedData);
            navigate('/add-to-file', { state: { data: formattedData } });
          } catch (parseError) {
            console.error('Error parsing letterDetails:', parseError);
          }
        } else if (typeof fetchedData.letterDetails === 'object') {
          
          const formattedData = {
            letterReceiptId: fetchedData.letterReceiptId,
            ...fetchedData.letterDetails,
          };
  
          navigate('/add-to-file', { state: { data: formattedData } });
        } else {
          console.error('Unexpected letterDetails format:', fetchedData.letterDetails);
        }
      }
    } catch (error) {
      console.error('Error adding to file:', error);
    }
  };
  

  const handleDownload = async () => {
    try {
      const token = useAuthStore.getState().token;
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
    toast.error("Failed to download PDF. Please try again.");
    }
    };

    const handleDownloadenclosure = async () => {
      try {
        const token = useAuthStore.getState().token;
      const payload = {
      documentName: encloserFileName,
      documentPath: encloserFilePath,
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
      toast.success("PDF successfully downloaded");
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${encloserFileName}`); 
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      
      }
      } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF. Please try again.");
      }
      };
  
    
  const showAllDetails = letterData?.tabCode === 'NEW_LETTER' ;
  // const isNewLetter = letterData?.tabCode === 'NEW_LETTER';
  return (
    <>
   
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6"   component="span" sx={{ fontWeight: 500, color: '#666' }}>Letter Detail</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
         {/* Top Section */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
          {/* Top Left: Letter Details */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 3 }}>
              Letter Details
            </Typography>
            <Box sx={{ display: 'grid', gap: 2, mb: 3 }}>
          <Typography variant="body1"><b>Letter Number:</b> {letterDataView?.letterNo || 'NA'}</Typography>
          <Typography variant="body1"><b>Sender Date:</b> {letterDataView?.senderDate || 'NA'}</Typography>
          <Typography variant="body1"><b>Sender:</b> {letterDataView?.senderName || 'NA'}</Typography>
          <Typography variant="body1"><b>Addressee:</b> {letterDataView?.addressee || 'NA'}</Typography>
          <Typography variant="body1"><b>Subject:</b> {letterDataView?.subject || 'NA'}</Typography>
          <Typography variant="body1"><b>Diary Number:</b> {letterDataView?.diaryNumber || 'NA'}</Typography>
          <Typography variant="body1"><b>Memo Number:</b> {letterDataView?.memoNo || 'NA'}</Typography>
          <Typography variant="body1"><b>Remarks:</b> {letterDataView?.remarks || 'NA'}</Typography>
        </Box>
            {showAllDetails && (
              <>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Marginal Instructions
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={marginalNote}
                  onChange={(e) => setMarginalNote(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 3 }}
                />
                          </>
                        )}
        
                {showAllDetails && (
                  <>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Frequently Mark
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
             <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell>Action</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Office</TableCell>
              <TableCell>Designation</TableCell>
             
            </TableRow>
          </TableHead>
          <TableBody>
            {letterDataView?.letterFrequentlyMarkObj?.map((mark, index) => (
              <TableRow key={mark.empDeptMapId}>
                <TableCell>
             <Checkbox
            checked={selectedRowsfrequ.includes(mark.empDeptMapId)} 
            onChange={(event) => handleCheckboxfrequientlyChange(event, mark.empDeptMapId)}
          />
                </TableCell>
               
                <TableCell>{mark.name}</TableCell>
                <TableCell>{mark.departmentName}</TableCell>
                <TableCell>{mark.officeName}</TableCell>
                <TableCell>{mark.designation}</TableCell>
                
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={7}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleOtherButtonClick}
                    sx={{
                      backgroundColor: '#1976d2',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#115293',
                      },
                    }}
                  >
                    Other
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

              </>
            )}
          
        
       {showAllDetails  && (
      <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
       
        <FormControlLabel
          control={
            <Switch
              checked={isUrgent}
              onChange={handleUrgencyToggle}
              sx={{ "& .MuiSwitch-thumb": { backgroundColor:isUrgent ? "green" : "gray" } }}
            />
          }
          label={isUrgent ? "Urgent" : "Non-Urgent"}
        />
      
        <FormControlLabel
          control={
            <Switch
              checked={isConfidential}
              onChange={handleConfidentialToggle}
              sx={{ "& .MuiSwitch-thumb": { backgroundColor: isConfidential ? "green" : "gray" } }}
            />
          }
          label={isConfidential ? "Confidential" : "Non-Confidential"}
        />
      </Box>
    )}

            {showAllDetails && (
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  
             
            <Button variant="contained" color="primary" onClick={handleSaveClick}>
              Save
            </Button>
          
               
               <Button
                  variant="contained"
                  color="secondary"
                  onClick={handlefrequentlymarks}
                  disabled={!letterDataView?.letterFrequentlyMarkObj || letterDataView.letterFrequentlyMarkObj.length === 0} // Check if array is undefined or empty
                >
                  Send
                </Button>

                      <Button variant="contained" color="success" onClick={handleAddToFile}>
                        Add to File
                      </Button>
                   
                <Button variant="outlined" color="error" onClick={onClose}>
                  Cancel
                </Button>
              </Box>
            )}
          </Box>

          {/* Top Right: PDF View */}

     <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, p: 3 }}>
    
      <Card sx={{ width: "100%", boxShadow: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <iframe
            src={viewdocument}
            style={{
              width: "100%",
              height: "500px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
            title="PDF Viewer"
          />
        </CardContent>
      </Card>

      
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={handleDownload}
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
          </Box>

        {/* Bottom Section */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 3 }}>
          {/* Bottom Left: Note */}  
     <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Note
      </Typography>
      <Box>
        {letterDataView?.letterNotesArrays?.map((note, index) => (
          <Paper
            key={index}
            elevation={2} 
            sx={{
              p: 2,
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: 1,
            }}
          >
            {/* Left Side Content */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Action taken by: {note.actionTakenBy}
              </Typography>
              <Typography>
                <strong>Action:</strong> {note.action}
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Date:</strong> {note.modifyDate}
              </Typography>
              <Typography>
                <strong>Note:</strong> {note.note}
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
        ))}
      </Box>
    </Box>

          {/* Bottom Right: All Enclosures */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              All Enclosures
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>SI NO</TableCell>
                    <TableCell>Enclosure Name</TableCell>
                    <TableCell>Enclosure Type</TableCell>
                    <TableCell>Added By</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {letterDataView?.letterEnclosureArrays?.map((enclosure, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                            <button
                              style={{
                                background: "none",
                                border: "none",
                                color: "#007bff",
                                textDecoration: "underline",
                                cursor: "pointer",
                              }}
                              onClick={() => handleDownloadenclosure(enclosure.enclosureName, enclosure.enclosurePath)}
                            >
                              {enclosure.enclosureName}
                            </button>
                            </TableCell>
                      <TableCell>{enclosure.enclosureType}</TableCell>
                      <TableCell>{enclosure.enclosureUploadBy}</TableCell>
                      <TableCell>{enclosure.enclosureUploadDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </DialogContent>



         <Dialog open={openUrgentModal} onClose={handleCancelUrgent}>
      <DialogTitle
        sx={{ 
          backgroundColor: "#207785", 
          color: "white", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          {pendingUrgency ? "Set As URGENT" : "Set As NON-URGENT"}</DialogTitle>
          <IconButton onClick={handleCancelUrgent} sx={{ color: "white" }}>
          <CloseIcon/>
        </IconButton>
       <DialogContent>
        Do you want to make the letter {pendingUrgency ? "Urgent" : "Non-Urgent"}?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelUrgent} variant="contained" color="error">No</Button>
        <Button onClick={handleConfirmUrgent} variant="contained"  color="primary">Yes</Button>
      </DialogActions>
          </Dialog>


        <Dialog open={openConfidentialModal} onClose={handleCancelConfidential}>
      <DialogTitle
         sx={{ 
          backgroundColor: "#207785", 
          color: "white", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}
        >{pendingConfidential ? "Set As CONFIDENTIAL" : "Set As NON-CONFIDENTIAL"}</DialogTitle>
      <DialogContent>
        Do you want to make the letter {pendingConfidential ? "Confidential" : "Non-Confidential"}?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelConfidential} variant="contained" color="error">No</Button>
        <Button onClick={handleConfirmConfidential} variant="contained" color="primary">Yes</Button>
      </DialogActions>
         </Dialog>


      <Dialog open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
        <DialogTitle
          sx={{ 
            backgroundColor: "#207785", 
            color: "white", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" 
          }}
         >
         Confirm Save
         <IconButton onClick={() => setOpenConfirmModal(false)} sx={{ color: "white" }}>
      <CloseIcon />
    </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>Do you want to proceed?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmModal(false)} variant="outlined" color="secondary">
             Cancel
          </Button>
          <Button onClick={handleConfirmSave} variant="contained" color="primary" >
             Confirm
          </Button>
        </DialogActions>
      </Dialog>

    



<Dialog open={openWarningModal} onClose={() => setOpenWarningModal(false)}>
  
  <DialogTitle 
    sx={{ 
      backgroundColor: "#207785", 
      color: "white", 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center" 
    }}
  >
    Warning
    <IconButton onClick={() => setOpenWarningModal(false)} sx={{ color: "white" }}>
      <CloseIcon />
    </IconButton>
  </DialogTitle>

 
  <DialogContent>
    <Typography>Please write marginal instructions!</Typography>
  </DialogContent>


  <DialogActions>
    <Button onClick={() => setOpenWarningModal(false)} variant="contained" color="error">
      OK
    </Button>
  </DialogActions>
</Dialog>



  
        <Modal open={openModalotherbutton} onClose={handleCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 1000,
              bgcolor: "background.paper",
              boxShadow: 24,
              borderRadius:3,
            }}
          >
          
            <Box
              sx={{
                bgcolor: "#207785",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTopLeftRadius:3,
                borderTopRightRadius:3,
                p: 2,
                mb: 2,
              }}
            >
              <Typography variant="h6" component="h2">
                Recipient
              </Typography>
              <IconButton onClick={handleCloseModal} sx={{ color: "white" }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2, p:3 }}>
              {/* Office Name Dropdown */}
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="office-name-label">Office Name *</InputLabel>
                  <Select
                    labelId="office-name-label"
                    id="office-name"
                    value={officeName}
                    label="Office Name *"
                    onChange={handleOfficeNameChange}
                  >
                    {Array.isArray(officeList) &&
                      officeList.map((office) => (
                        <MenuItem key={office.officeId} value={office.officeName}>
                          {office.officeName}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Department Name Dropdown */}
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="department-name-label">Department Name *</InputLabel>
                  <Select
                    labelId="department-name-label"
                    id="department-name"
                    value={departmentName}
                    label="Department Name *"
                    onChange={handleDepartmentNameChange}
                  >
                    {Array.isArray(departmentList) &&
                      departmentList.map((dept) => (
                        <MenuItem key={dept.departmentId} value={dept.departmentName}>
                          {dept.departmentName}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Table inside the modal */}
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 ,p:1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell>Check</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Section</TableCell>
                    <TableCell>User</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(tableData) &&
                    tableData.map((row) => (
                      <TableRow key={row.empOfcDeptMapId}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.includes(row.empOfcDeptMapId)}
                            onChange={(event) => handleCheckboxChange(event, row.empOfcDeptMapId)}
                          />
                        </TableCell>
                        <TableCell>{row.designation}</TableCell>
                        <TableCell>{row.sectionname || "NA"}</TableCell>
                        <TableCell>{row.name}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Buttons */}
            <Box sx={{ display: "flex", justifyContent: "end", mt: 3, gap: 2, p:3 }}>
              <Button variant="contained" size="small" color="error" onClick={() => setSelectedRows([])}>
                Clear All
              </Button>
              <Button variant="contained" size="small" color="primary" onClick={handleSend}>
                Send
              </Button>
            </Box>
          </Box>
        </Modal>


    </Dialog>
    </>
  );
};

export default LetterDetail;


