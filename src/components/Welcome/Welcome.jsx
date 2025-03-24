import React from "react";
import { Box, Typography } from "@mui/material";
import {
  Description as DescriptionIcon,
  Warning as WarningIcon,
  Folder as FolderIcon,
  Event as EventIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Schedule as ScheduleIcon,
  FlashOn as FlashOnIcon,
} from "@mui/icons-material";
import CountUp from "react-countup";

import { Link, useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate=useNavigate()
  return (
    <>
      <Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
            alignItems: "center",
            width: "100%",
            padding: 2,
          }}
        >
          <Link to="/letter" style={{ textDecoration: "none" }}>
          <Box
            sx={{
              position: "relative",
              padding: 3,
              background: "linear-gradient(to right, #2dd4bf, #22c55e)",
              borderRadius: 2,
              overflow: "hidden",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
              },
            }}

          >
            <Typography
              className="text_count"
              variant="h4"
              sx={{
                color: "white",
                fontWeight: 600,
                mb: 2,
                fontSize: "2.5rem",
              }}
            >
              <CountUp end={100} duration={2} />
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: "#d1fae5", fontWeight: 600 }}
            >
              Letters
            </Typography>
            <DescriptionIcon
              sx={{
                position: "absolute",
                right: 0,
                bottom: 0,
                height: "128px",
                width: "128px",
                marginRight: "-32px",
                marginBottom: "-32px",
                color: "rgb(61 255 213 / 64%)",
                opacity: 0.5,
              }}
            />
          </Box>
          </Link>
          <Link to="/letter" style={{ textDecoration: "none" }}>
          <Box
            sx={{
              position: "relative",
              padding: 3,
              background: "linear-gradient(to right, #60a5fa, #2563eb)",
              borderRadius: 2,
              overflow: "hidden",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <Typography
              className="text_count"
              variant="h4"
              sx={{ color: "white", fontWeight: 600, mb: 2 }}
            >
              <CountUp end={110} duration={2} />
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: "#bfdbfe", fontWeight: 600 }}
            >
              Urgent Letters
            </Typography>
            <WarningIcon
              sx={{
                position: "absolute",
                right: 0,
                bottom: 0,
                height: "128px",
                width: "128px",
                marginRight: "-32px",
                marginBottom: "-32px",
                color: "rgb(77 154 253)",
                opacity: 0.5,
              }}
            />
          </Box>
          </Link>
          <Link to="/file" style={{ textDecoration: "none" }}>
          <Box
            sx={{
              position: "relative",
              padding: 3,
              background: "linear-gradient(to right, #f87171, #dc2626)",
              borderRadius: 2,
              overflow: "hidden",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <Typography
              className="text_count"
              variant="h4"
              sx={{ color: "white", fontWeight: 600, mb: 2 }}
            >
              <CountUp end={130} duration={2} />
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: "#fecaca", fontWeight: 600 }}
            >
              Normal Files
            </Typography>
            <FolderIcon
              sx={{
                position: "absolute",
                right: 0,
                bottom: 0,
                height: "128px",
                width: "128px",
                marginRight: "-32px",
                marginBottom: "-32px",
                color: "rgb(253 114 114)",
                opacity: 0.5,
              }}
            />
          </Box>
</Link>
<Link to="/file" style={{ textDecoration: "none" }}>
          <Box
            sx={{
              position: "relative",
              padding: 3,
              background: "linear-gradient(to right, #fbbf24, #d97706)",
              borderRadius: 2,
              overflow: "hidden",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <Typography
              className="text_count"
              variant="h4"
              sx={{ color: "white", fontWeight: 600, mb: 2 }}
            >
              <CountUp end={200} duration={2} />
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: "#fde68a", fontWeight: 600 }}
            >
              Date Set Files
            </Typography>
            <EventIcon
              sx={{
                position: "absolute",
                right: 0,
                bottom: 0,
                height: "128px",
                width: "128px",
                marginRight: "-32px",
                marginBottom: "-32px",
                color: "rgb(253 209 102)",
                opacity: 0.5,
              }}
            />
          </Box>
</Link>
     <Link to="/file" style={{ textDecoration: "none" }}>
          <Box
            sx={{
              position: "relative",
              padding: 3,
              background: "linear-gradient(to right, #c39bd3, #6c3483)",
              borderRadius: 2,
              overflow: "hidden",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <Typography
              className="text_count"
              variant="h4"
              sx={{ color: "white", fontWeight: 600, mb: 2 }}
            >
              <CountUp end={150} duration={2} />
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: "#f3e8ff", fontWeight: 600 }}
            >
              Urgent Files
            </Typography>
            <InsertDriveFileIcon
              sx={{
                position: "absolute",
                right: 0,
                bottom: 0,
                height: "128px",
                width: "128px",
                marginRight: "-32px",
                marginBottom: "-32px",
                color: "#c264f4",
                opacity: 0.5,
              }}
            />
          </Box>
          </Link>
          <Link to="/file" style={{ textDecoration: "none" }}>
          <Box
            sx={{
              position: "relative",
              padding: 3,
              background: "linear-gradient(to right, #bc5e5e, #800000)",
              borderRadius: 2,
              overflow: "hidden",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <Typography
              className="text_count"
              variant="h4"
              sx={{ color: "white", fontWeight: 600, mb: 2 }}
            >
              <CountUp end={126} duration={2} />
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: "#fecaca", fontWeight: 600 }}
            >
              Same Day Top Priority Files
            </Typography>
            <ScheduleIcon
              sx={{
                position: "absolute",
                right: 0,
                bottom: 0,
                height: "128px",
                width: "128px",
                marginRight: "-32px",
                marginBottom: "-32px",
                color: "rgb(221 128 128 / 50%)",
                opacity: 0.5,
              }}
            />
          </Box>
          </Link>
          <Link to="/file" style={{ textDecoration: "none" }}>
          <Box
            sx={{
              position: "relative",
              padding: 3,
              background: "linear-gradient(to right, #6b6bb8, #000080)",
              borderRadius: 2,
              overflow: "hidden",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <Typography
              className="text_count"
              variant="h4"
              sx={{ color: "white", fontWeight: 600, mb: 2 }}
            >
              <CountUp end={99} duration={2} />
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: "#d1d5db", fontWeight: 600 }}
            >
              Immediate Most Files
            </Typography>
            <FlashOnIcon
              sx={{
                position: "absolute",
                right: 0,
                bottom: 0,
                height: "128px",
                width: "128px",
                marginRight: "-32px",
                marginBottom: "-32px",
                color: "rgb(100 100 180)",
                opacity: 0.5,
              }}
            />
          </Box>
          </Link>
          <Box
            sx={{
              position: "relative",
              padding: "46px 24px",
              background:
                "linear-gradient(to right, rgb(230 230 231), rgb(227 227 231))",
              borderRadius: "8px",
              textAlign: "center",
              overflow: "hidden",
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
            onClick={() => navigate("/all-view")}
          >
            <button className="custom-btn btn-12">
              <span>Click!</span>
              <span>View all</span>
            </button>
          </Box>
        </Box>
        
      </Box>
    </>
  );
};

export default Welcome;
