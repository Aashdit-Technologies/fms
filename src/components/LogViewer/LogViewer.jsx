

import React, { useState, useRef, useEffect } from "react";
import { Button, Paper, Typography } from "@mui/material";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";

const LogViewer = () => {
  const [logData, setLogData] = useState([]);
  const [catalinaLogData, setCatalinaLogData] = useState([]);
  const [activeLog, setActiveLog] = useState(null); 
  const logEndRef = useRef(null);
  const token = useAuthStore.getState().token;

  const fetchLog = async () => {
    try {
      const response = await api.get("log/fetchLog");
      setLogData(response.data);
      setActiveLog("application"); 
    } catch (error) {
      console.error("Error fetching log data:", error);
    }
  };

  const fetchCatalinaLog = async () => {
    try {
      const response = await api.get("log/fetch-cat-log");
      setCatalinaLogData(response.data);
      setActiveLog("catalina"); 
    } catch (error) {
      console.error("Error fetching Catalina log:", error);
    }
  };

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logData, catalinaLogData]);

  const clearConsole = () => {
    setLogData([]);
    setCatalinaLogData([]);
    setActiveLog(null);
  };

  const downloadLogFile = async (url) => {
    try {
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const contentDisposition = response.headers["content-disposition"];
      let filename = "log.txt";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match && match[1]) filename = match[1];
      }
      const blob = new Blob([response.data], { type: "text/plain" });
      const url2 = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url2;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url2);
    } catch (error) {
      console.error("Error downloading log file:", error);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        minHeight: "calc(100vh - 250px)",
        background: "linear-gradient(to right, #158787, #3b6b8d)",
        display: "flex",
        flexDirection: "column",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <Typography
          variant="h5"
          style={{ color: "#fff", fontWeight: "bold", marginBottom: "10px" }}
        >
          Log Viewer
        </Typography>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="contained" style={buttonStyle} onClick={fetchLog}>
            Fetch Log
          </Button>
          <Button variant="contained" style={buttonStyle} onClick={fetchCatalinaLog}>
            Fetch Catalina Log
          </Button>
          <Button variant="contained" style={buttonStyle} onClick={clearConsole}>
            Clear Console
          </Button>
          <Button
            variant="contained"
            style={buttonStyle}
            onClick={() => downloadLogFile("log/downloadLog")}
          >
            Download Log
          </Button>
          <Button
            variant="contained"
            style={buttonStyle}
            onClick={() => downloadLogFile("log/download-cat-log")}
          >
            Download Catalina Log
          </Button>
        </div>

        <Button
          variant="contained"
          style={{ backgroundColor: "#fff", color: "#007bff", fontWeight: "bold" }}
        >
          Go To Home
        </Button>
      </div>

      {/* Log Display Section */}
      <Paper
        style={{
          width: "100%",
          maxWidth: "1200px",
          padding: "20px",
          borderRadius: "8px",
          height: "550px",
          position: "relative",
          margin: "10px auto",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {activeLog === "application" && (
          <div>
            <Typography variant="h6" style={{ color: "#333", marginBottom: "10px" }}>
              Application Log
            </Typography>
            <pre style={logStyle}>
              <div>{logData}</div>
              <div ref={logEndRef}></div>
            </pre>
          </div>
        )}

        {activeLog === "catalina" && (
          <div>
            <Typography variant="h6" style={{ color: "#333", marginBottom: "10px" }}>
              Catalina Log
            </Typography>
            <pre style={logStyle}>
              <div>{catalinaLogData}</div>
              <div ref={logEndRef}></div>
            </pre>
          </div>
        )}

        {!activeLog && (
          <Typography variant="h6" style={{ color: "#666", textAlign: "center", marginTop: "20px" }}>
            Click "Fetch Log" or "Fetch Catalina Log" to view logs.
          </Typography>
        )}
      </Paper>
    </div>
  );
};

const buttonStyle = {
  backgroundColor: "#333",
  color: "#fff",
  fontSize: "12px",
};

const logStyle = {
  backgroundColor: "#fff",
  padding: "15px",
  borderRadius: "8px",
  overflowX: "auto",
  flex: 1,
};

export default LogViewer;

