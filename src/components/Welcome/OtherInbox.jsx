import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
} from "@mui/material";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
 
const OtherInbox = () => {
  const data = [
    {
      role: "Diary Section",
      letters: 0,
      urgentLetters: 21,
      normalFiles: 0,
      dateSetFiles: 32,
      urgentFiles: 4,
      sameDayTopPriorityFiles: 0,
      immediateMostFiles: 0,
      totalCount: 2,
    },
    {
      role: "DEO",
      letters: 42,
      urgentLetters: 0,
      normalFiles: 0,
      dateSetFiles: 0,
      urgentFiles: 6,
      sameDayTopPriorityFiles: 0,
      immediateMostFiles: 3,
      totalCount: 45,
    },
    {
      role: "Dispatch Section",
      letters: 0,
      urgentLetters: 0,
      normalFiles: 85,
      dateSetFiles: 0,
      urgentFiles: 5,
      sameDayTopPriorityFiles: 0,
      immediateMostFiles: 5,
      totalCount: 95,
    },
  ];

  return (
    <TableContainer component={Paper} sx={{ mt: 5 }}>
      <Typography
        variant="h5"
        sx={{
          color: "#000",
          textAlign: "left",
          padding: 2,
          backgroundColor: "#f0f0f0",
          borderBottom: "1px solid #ddd",
        }}
      >
        Other Inbox
      </Typography>

      {data.length > 0 ? (
        <Table sx={{ border: "1px solid #ddd" }}>
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "#fff", border: "1px solid #ddd" }}>Role/Designation</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff", border: "1px solid #ddd" }}>Letters</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff", border: "1px solid #ddd" }}>Urgent Letters</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff", border: "1px solid #ddd" }}>Normal Files</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff", border: "1px solid #ddd" }}>Date set Files</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff", border: "1px solid #ddd" }}>Urgent Files</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff", border: "1px solid #ddd" }}>Same day top priority Files</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff", border: "1px solid #ddd" }}>Immediate most Files</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff", border: "1px solid #ddd" }}>Total Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                  "&:hover": { backgroundColor: "#f1f1f1" },
                }}
              >
                <TableCell sx={{ border: "1px solid #ddd" }}>{row.role}</TableCell>
             
                <TableCell sx={{ border: "1px solid #ddd" }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#2dd4bf",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#22c55e" },
                    }}
                  >
                    {row.letters}
                  </Button>
                </TableCell>
                <TableCell sx={{ border: "1px solid #ddd" }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#60a5fa",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#2563eb" },
                    }}
                  >
                    {row.urgentLetters}
                  </Button>
                </TableCell>
                <TableCell sx={{ border: "1px solid #ddd" }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#f87171",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#dc2626" },
                    }}
                  >
                    {row.normalFiles}
                  </Button>
                </TableCell>
                <TableCell sx={{ border: "1px solid #ddd" }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#fbbf24",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#d97706" },
                    }}
                  >
                    {row.dateSetFiles}
                  </Button>
                </TableCell>
                <TableCell sx={{ border: "1px solid #ddd" }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#c39bd3",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#6c3483" },
                    }}
                  >
                    {row.urgentFiles}
                  </Button>
                </TableCell>
                <TableCell sx={{ border: "1px solid #ddd" }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#bc5e5e",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#800000" },
                    }}
                  >
                    {row.sameDayTopPriorityFiles}
                  </Button>
                </TableCell>
                <TableCell sx={{ border: "1px solid #ddd" }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#6b6bb8",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#000080" },
                    }}
                  >
                    {row.immediateMostFiles}
                  </Button>
                </TableCell>
                <TableCell sx={{ border: "1px solid #ddd" }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#1976d2",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#115293" },
                    }}
                  >
                    {row.totalCount}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="h6" align="center" padding={2}>
          No data available
        </Typography>
      )}
    </TableContainer>
  );
};

export default OtherInbox;