
import React from "react";
import { Box } from "@mui/material";
import Welcome from "./Welcome";
import OtherInbox from "./OtherInbox";


const AllView = () => {
  return (
    <Box>
      <Welcome/>
      <Box sx={{ width: "100%", padding: 2 }}>
        <OtherInbox/>
      </Box>
    </Box>
  );
};

export default AllView;