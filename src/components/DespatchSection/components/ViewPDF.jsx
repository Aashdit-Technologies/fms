import React, { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';

const ViewPDF = () => {
  useEffect(() => {
    // Get the PDF URL from the URL parameters
    const params = new URLSearchParams(window.location.search);
    const pdfUrl = params.get('url');
    
    if (pdfUrl) {
      // You would typically get this URL from your backend
      // For now, we'll use a sample PDF URL
      const url = `/api/view-pdf/${pdfUrl}`;
      
      // Set the PDF viewer to take up the full window
      document.body.style.margin = '0';
      document.body.style.height = '100vh';
      
      // Create the embed element
      const embed = document.createElement('embed');
      embed.setAttribute('src', url);
      embed.setAttribute('type', 'application/pdf');
      embed.style.width = '100%';
      embed.style.height = '100%';
      embed.style.border = 'none';
      
      // Clear any existing content and append the embed
      document.body.innerHTML = '';
      document.body.appendChild(embed);
    }
  }, []);

  return (
    <Box 
      sx={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default ViewPDF;
