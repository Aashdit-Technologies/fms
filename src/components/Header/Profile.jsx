import React, { useState, useRef, useEffect } from "react";
import {
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { AccountCircle, Lock } from "@mui/icons-material";
import thumbnail from "../../assets/thumbnail.png";
import EditProfile from "./EditProfile";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { useNavigate } from 'react-router-dom';

const UserDropdown = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const avatarRef = useRef(null);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [user, setUser] = useState({});
  const [basicDetails, setBasicDetails] = useState(null);
  const [changepassworddata, setChangepassworddata] = useState(null);

  const navigate = useNavigate();
  const token = useAuthStore.getState().token;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get("user/profile-details");
        setUser(response.data.data);
        console.log("User details:", response.data.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [token]); 

  const handleEditProfileClick = async () => {
    try {
      const response = await api.get("user/basic-details");
      console.log("Fetched Data:", response.data.data);
      setBasicDetails(response.data.data);

      if (user.isEmployee) {
        navigate('/edit-basic-details', { state: { basicDetails: response.data.data } });
      } else {
        setOpenEditProfile(true); 
      }

      handleClose(); 
    } catch (error) {
      console.error("Error fetching basic details:", error);
    }
  };


  const handleChangePasswordClick = async () => {
    try {
      const response = await api.get("user/get-user-name");
      console.log(response.data.data)
      setChangepassworddata(response.data.data)
      handleClose(); 
      navigate('/change-password',{state:{changepassworddata:response.data.data}});
    } catch (error) {
      console.error("Error fetching password details:", error);
    }
  };

  const handleClick = () => {
    setAnchorEl(avatarRef.current);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }}>
      {/* User Name */}
      <Typography
        variant="body1"
        sx={{ fontWeight: "bold", color: "#333" }}
        onClick={handleClick}
      >
        {user.name}
      </Typography>

      {/* Avatar */}
      <IconButton ref={avatarRef} onClick={handleClick} sx={{ padding: 0 }}>
        <Avatar
          alt={user.name || "User"}
          src={thumbnail}
          sx={{ width: 40, height: 40, border: "2px solid #fff" }}
        />
      </IconButton>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            marginTop: 1.5,
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            minWidth: "200px",
          },
        }}
      >
        <MenuItem
          onClick={handleEditProfileClick}
          sx={{ padding: "8px 16px" }}
        >
          <AccountCircle sx={{ marginRight: 2, color: "#666" }} />
          <Typography variant="body1" sx={{ color: "#333" }}>
            Edit Profile
          </Typography>
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem
           onClick={handleChangePasswordClick}
          // onClick={handleClose}
          sx={{ padding: "8px 16px", color: "#ff4444" }}
        >
          <Lock sx={{ marginRight: 2, color: "#ff4444" }} />
          <Typography variant="body1" sx={{ color: "#ff4444" }}>
            Change Password
          </Typography>
        </MenuItem>
      </Menu>

      {/* Edit Profile Modal */}
      <EditProfile
        open={openEditProfile}
        handleClose={() => setOpenEditProfile(false)}
        data={basicDetails}
      />
    </Box>
  );
};

export default UserDropdown;