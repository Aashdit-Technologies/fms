import React, { useState } from "react";
import { toast } from "react-toastify";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import { MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./LoginPage.css";
import Odisha from "../../assets/odishalogo.png";
import LeftImg from "../../assets/left-img.png";
import { IoKeySharp } from "react-icons/io5";

const LoginPage = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn } = useAuth();

 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName || !password) {
      toast.error("Both username and password are required.", {
        autoClose: 1000,
      });
      return;
    }

    try {
      await login({ userName, password });
    } catch (error) {
      toast.error("Login failed. Please try again.", {
        autoClose: 1000,
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="login_main">
      <div className="container">
        <div className="log-logo-sec">
          <Link to="/" style={{textDecoration: "none"}}>
              <div className="logo_sec_main" style={{display: "flex", alignItems: "center", justifyContent: "start", textDecoration: "none", gap:"10px"}}>
                <img src={Odisha} alt="" />
                <div className="logo_head mt-3">
                  <h2>FILE MANAGEMENT SYSTEM</h2>
                  <h6>Higher Education Information & Management System</h6>
                </div>
              </div>
          </Link>
        </div>
        <div className="left_fig">
          <img src={LeftImg} alt="" />
        </div>
      </div>
      <div className="container-fluid">
        <div className="container cntr_cls">
          <div className="box">
            <div className="shadow"></div>
            <div className="content">
              <div className="form">
                <h3 className="logos">
                  <IoKeySharp />
                </h3>
                <h2>Log in</h2>
                <form onSubmit={handleSubmit}>
                  <div className="inputBox">
                    <TextField
                      label="User Id"
                      variant="outlined"
                      fullWidth
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      autoComplete="off"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FaUser />
                          </InputAdornment>
                        ),
                      }}
                      margin="normal"
                    />
                  </div>
                  <div className="inputBox">
                    <TextField
                      label="Password"
                      variant="outlined"
                      fullWidth
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="off"
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MdLock />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={togglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? (
                                <MdVisibilityOff />
                              ) : (
                                <MdVisibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>
                  <div className="inputBox d-flex justify-content-center">
                    <button
                      type="submit"
                      className="btn btn-primary btn-block mt-3 text-center"
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? "Login" : "Login"}
                    </button>
                    {/* <button
                      type="submit"
                      className="btn btn-primary btn-block mt-3"
                    >
                      <Link
                        to="/"
                        style={{ color: "#fff", textDecoration: "none" }}
                      >
                        Home
                      </Link>
                    </button> */}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
