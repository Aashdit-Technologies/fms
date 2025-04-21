import React, { useEffect, useState } from "react";
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
import { PageLoader } from "../pageload/PageLoader";

const OtherInbox = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await api.post("dashboard/other-role-dashboard-data");
        
        if (response.data.outcome) {
          setData(response.data.data);
          setMessage(response.data.message);
        } else {
          setError(response.data.message || "Failed to fetch data");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch data");
        console.error("Error fetching data:", err);
      } finally {
       
          setIsLoading(false);
      }
    };

    fetchData();
  }, []);

 

  return (
    <>
      {isLoading && <PageLoader />}
   
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

      
        <Table sx={{ border: "1px solid #ddd" }}>
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow><TableCell sx={{ fontWeight: "bold", color: "#fff", border: "1px solid #ddd" }}>Sl No.</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff", border: "1px solid #ddd" }}>Role/Designation</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff", border: "1px solid #ddd" }}>Letters</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff", border: "1px solid #ddd" }}>Urgent Letters</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff", border: "1px solid #ddd" }}>Normal Files</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff", border: "1px solid #ddd" }}>Date set Files</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff", border: "1px solid #ddd" }}>Urgent Files</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff", border: "1px solid #ddd" }}>Same day top priority Files</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff", border: "1px solid #ddd" }}>Immediate most Files</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff", border: "1px solid #ddd" }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {data.length > 0 ? (
            data.map((row, index) => {
              const totalCount = 
                row.letters + 
                row.urgentLetters + 
                row.normalFiles + 
                row.dateSetFiles + 
                row.urgentFiles + 
                row.sameDayTopPriorityFiles + 
                row.immediateMostFiles;
                
              return (
                <TableRow
                  key={index}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                    "&:hover": { backgroundColor: "#f1f1f1" },
                  }}
                >
                  <TableCell sx={{ border: "1px solid #ddd" }}>{index +1}</TableCell>
                  <TableCell sx={{ border: "1px solid #ddd" }}>{row.roleName}</TableCell>
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
                      {totalCount}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={10} sx={{ textAlign: "center", py: 4 }}>
            No Data is available
              </TableCell>
            </TableRow>
          )}
          </TableBody>
        </Table>
     
    </TableContainer>
    </>
  );
};

export default OtherInbox;