import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  IconButton,
  Typography,
} from '@mui/material';
import DataTable from 'react-data-table-component';
import { Visibility, Download } from '@mui/icons-material';
import UploadLetter from './components/UploadLetter';
import Enclosures from './components/Enclosures';

const Despatch = () => {
  const [activeTab, setActiveTab] = useState('newLetter');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEnclosuresOpen, setIsEnclosuresOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Sample data for new letters
  const [newLetters] = useState([
    {
      id: 1,
      letterNumber: '',
      endingMemoNumber: '',
      subject: 'Retirement notice of Sri Subhasha Chandra Sahoo, Manager (Electrical)',
      from: 'DR.GANESWAR JENA (CGM (P&A))\nP&A, HO',
      date: '2025-02-02',
      enclosures: [
        { type: 'PDF', name: 'Retirement Notice.pdf' },
        { type: 'Image', name: 'Signature.jpg' }
      ]
    },
    {
      id: 2,
      letterNumber: '',
      endingMemoNumber: '',
      subject: 'Biometric attendance system',
      from: 'MANAS MOHANTY (Manager (MIS))\nMIS, HO',
      date: '2025-02-02',
      enclosures: []
    },
  ]);

  // Dummy data for sent letters
  const [sentLetters] = useState([
    {
      id: 101,
      letterNumber: 'SL/2025/001',
      endingMemoNumber: 'MEM/2025/001',
      subject: 'Annual Performance Review Meeting Schedule',
      from: 'MANAS MOHANTY (Manager (MIS))\nMIS, HO',
      date: '2025-01-15',
      enclosures: [
        { type: 'PDF', name: 'Meeting_Schedule.pdf' },
        { type: 'Excel', name: 'Performance_Data.xlsx' }
      ]
    },
    {
      id: 102,
      letterNumber: 'SL/2025/002',
      endingMemoNumber: 'MEM/2025/002',
      subject: 'IT Infrastructure Upgrade Proposal',
      from: 'DR.GANESWAR JENA (CGM (P&A))\nP&A, HO',
      date: '2025-01-20',
      enclosures: [
        { type: 'PDF', name: 'Proposal_Document.pdf' },
        { type: 'Image', name: 'Network_Diagram.jpg' }
      ]
    },
    {
      id: 103,
      letterNumber: 'SL/2025/003',
      endingMemoNumber: 'MEM/2025/003',
      subject: 'Employee Training Program Schedule 2025',
      from: 'MANAS MOHANTY (Manager (MIS))\nMIS, HO',
      date: '2025-01-25',
      enclosures: [
        { type: 'PDF', name: 'Training_Schedule.pdf' }
      ]
    },
    {
      id: 104,
      letterNumber: 'SL/2025/004',
      endingMemoNumber: 'MEM/2025/004',
      subject: 'Office Equipment Procurement Request',
      from: 'DR.GANESWAR JENA (CGM (P&A))\nP&A, HO',
      date: '2025-01-30',
      enclosures: [
        { type: 'PDF', name: 'Procurement_List.pdf' },
        { type: 'Excel', name: 'Cost_Estimation.xlsx' }
      ]
    },
    {
      id: 105,
      letterNumber: 'SL/2025/005',
      endingMemoNumber: 'MEM/2025/005',
      subject: 'Monthly Department Performance Report',
      from: 'MANAS MOHANTY (Manager (MIS))\nMIS, HO',
      date: '2025-02-01',
      enclosures: [
        { type: 'PDF', name: 'Performance_Report.pdf' },
        { type: 'Excel', name: 'Metrics_Data.xlsx' },
        { type: 'Image', name: 'Charts.jpg' }
      ]
    }
  ]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleView = (row) => {
    const pdfId = row.id;
    const viewerUrl = `/view-pdf?id=${pdfId}`;
    window.open(viewerUrl, '_blank');
  };

  const handleDownload = (row) => {
    setSelectedRow(row);
    setIsEnclosuresOpen(true);
  };

  const handleUpload = (row) => {
    setSelectedRow(row);
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedRow(null);
  };

  const handleCloseEnclosures = () => {
    setIsEnclosuresOpen(false);
    setSelectedRow(null);
  };

  const columns = [
    {
      name: '#',
      selector: (row, index) => index + 1,
      sortable: true,
      width: '50px',
    },
    {
      name: 'Letter Number',
      selector: row => row.letterNumber || '',
      sortable: true,
      width: '130px',
    },
    {
      name: 'Ending Memo Number',
      selector: row => row.endingMemoNumber || '',
      sortable: true,
      width: '160px',
    },
    {
      name: 'Subject',
      selector: row => row.subject,
      sortable: true,
      wrap: true,
      grow: 2,
    },
    {
      name: 'From',
      selector: row => row.from,
      sortable: true,
      wrap: true,
      grow: 1,
    },
    {
      name: 'Date',
      selector: row => row.date,
      sortable: true,
      width: '100px',
    },
    {
      name: 'View',
      cell: row => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            size="small"
            onClick={() => handleView(row)}
            sx={{ color: 'primary.main' }}
          >
            <Visibility />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDownload(row)}
            sx={{ color: 'primary.main' }}
          >
            <Download />
          </IconButton>
        </Box>
      ),
      width: '100px',
      center: true,
    },
    {
      name: 'Action',
      cell: row => (
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={() => handleUpload(row)}
          sx={{ textTransform: 'none' }}
        >
          Upload
        </Button>
      ),
      width: '100px',
      center: true,
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#e6f3ff',
        color: '#000',
        fontWeight: 'bold',
        borderTop: '1px solid #e0e0e0',
      },
    },
    rows: {
      style: {
        minHeight: '50px',
        '&:not(:last-of-type)': {
          borderBottom: '1px solid #e0e0e0',
        },
      },
    },
    cells: {
      style: {
        paddingLeft: '8px',
        paddingRight: '8px',
      },
    },
  };

  const currentData = activeTab === 'newLetter' ? newLetters : sentLetters;
  const filteredData = currentData.filter(item =>
    Object.values(item).some(
      value => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const NoDataComponent = () => (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Typography>No data available in table</Typography>
      <Typography variant="caption">
        Showing {filteredData.length} to {filteredData.length} of {filteredData.length} entries
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Button
          variant={activeTab === 'newLetter' ? 'contained' : 'outlined'}
          onClick={() => handleTabChange('newLetter')}
          sx={{ mr: 1 }}
        >
          New Letter
        </Button>
        <Button
          variant={activeTab === 'sentLetter' ? 'contained' : 'outlined'}
          onClick={() => handleTabChange('sentLetter')}
        >
          Sent Letter
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearch}
          variant="outlined"
          size="small"
        />
      </Box>

      <Paper>
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 30, 50]}
          customStyles={customStyles}
          highlightOnHover
          pointerOnHover
          responsive
          striped
          noDataComponent={<NoDataComponent />}
        />
      </Paper>

      <UploadLetter
        open={isUploadModalOpen}
        onClose={handleCloseUploadModal}
      />

      <Enclosures
        open={isEnclosuresOpen}
        onClose={handleCloseEnclosures}
        enclosures={selectedRow?.enclosures || []}
      />
    </Box>
  );
};

export default Despatch;
