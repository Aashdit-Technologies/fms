import { Box } from '@mui/material';
import React from 'react';
import { HashLoader } from 'react-spinners';

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="space-y-6 w-full max-w-md p-6">
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "fixed", 
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.8)", 
        zIndex: 9999,
      }}
    >
      <HashLoader size={50} color={"#7B1FA2"} />
      </Box>
    </div>
  </div>
);