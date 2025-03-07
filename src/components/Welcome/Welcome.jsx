import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';
import { FolderOpen } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          <FolderOpen sx={{ fontSize: 60, color: 'primary.main' }} />
        </Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to File Management System
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          A comprehensive solution for managing your documents and files efficiently.
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              flex: 1, 
              maxWidth: 200,
              '&:hover': {
                backgroundColor: 'action.hover',
                cursor: 'pointer'
              }
            }}
            onClick={() => navigate('/file')}
          >
            <Typography variant="h6" gutterBottom>
              Files
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and organize your files
            </Typography>
          </Paper>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              flex: 1, 
              maxWidth: 200,
              '&:hover': {
                backgroundColor: 'action.hover',
                cursor: 'pointer'
              }
            }}
            onClick={() => navigate('/letter')}
          >
            <Typography variant="h6" gutterBottom>
              Letter
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Access and edit your Letter
            </Typography>
          </Paper>
        </Box>
      </Paper>
    </Container>
  );
};

export default Welcome;
