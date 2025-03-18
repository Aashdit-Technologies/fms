import React, { useState, useEffect } from "react";
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
import { MdRefresh } from "react-icons/md";
import useAuthStore from "../../store/Store";

const LoginPage = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userCaptcha, setUserCaptcha] = useState("");
  const { login, isLoggingIn, captcha, generateCaptcha } = useAuth();
  const token = useAuthStore.getState().token;
console.log("captcha", captcha);
  const setShowCaptchaField = useAuthStore(
    (state) => state.setShowCaptchaField
  );
  const showCaptchaField = useAuthStore((state) => state.showCaptchaField);

  useEffect(() => {
    setShowCaptchaField(false);
  }, [setShowCaptchaField]);

  const handleUserNameChange = (e) => {
    const value = e.target.value;
    setUserName(value);

    if (!value.trim()) {
      setShowCaptchaField(false);
    }
  };
  const handleGenerateCaptcha = async () => {
    console.log("Generate Captcha button clicked");
    if (!userName.trim()) {
      toast.error("Please enter username.", { autoClose: 1000 });
      return false; 
    }
    if (!password.trim()) {
      toast.error("Please enter password.", { autoClose: 1000 });
      return false;
    }
  
    try {
      await generateCaptcha({ userName, password });
      setShowCaptchaField(true);
      return true; 
    } catch (error) {
      toast.error("Failed to generate captcha. Please try again.", { autoClose: 1000 });
      return false;
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    if (!userName.trim()) {
      toast.error("Please enter username.", { autoClose: 1000 });
      return;
    }
    if (!password.trim()) {
      toast.error("Please enter password.", { autoClose: 1000 });
      return;
    }

    if (showCaptchaField && !userCaptcha.trim()) {
      toast.error("Please enter the captcha.", { autoClose: 1000 });
      return;
    }

    try {
      await login({ userName, password, userCaptcha });
    } catch (error) {
      toast.error("Login failed. Please try again.", {
        autoClose: 1000,
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleRefreshCaptcha = async () => {
    try {
      await generateCaptcha({ userName, password }); 
      setUserCaptcha(""); 
    } catch (error) {
      toast.error("Failed to refresh captcha. Please try again.", { autoClose: 1000 });
    }
  };

  return (
    <div className="login_main">
      <div className="container">
        <div className="log-logo-sec">
          <Link to="/" style={{ textDecoration: "none" }}>
            <div
              className="logo_sec_main"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "start",
                textDecoration: "none",
                gap: "10px",
              }}
            >
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
                      onChange={handleUserNameChange}
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

                  {/* Conditionally render the captcha input field */}
                  {showCaptchaField && (
                  <div className="inputBox">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center", 
                        gap: "5px", 
                      }}
                    >
                      
                      <TextField
                        label="Enter Captcha"
                        variant="outlined"
                        fullWidth
                        value={userCaptcha}
                        onChange={(e) => setUserCaptcha(e.target.value)}
                        autoComplete="off"
                        margin="normal"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "45px", 
                          },
                          flex: 4, 
                        }}
                      />

                 
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#f5f5f5", 
                          border: "1px solid #e0e0e0", 
                          borderRadius: "6px", 
                          padding: "6px", 
                          height: "45px", 
                          width: "80px", 
                          marginTop: "5px",
                        }}
                      >
                        <img
                          src={captcha}
                          alt="Captcha"
                          style={{
                            height: "30px",
                            width: "auto",
                          }}
                        />
                      </div>

                      <IconButton
                        onClick={handleRefreshCaptcha}
                        style={{
                          backgroundColor: "#f5f5f5", 
                          borderRadius: "6px", 
                          padding: "6px", 
                          height: "45px", 
                          width: "45px",
                          transition: "background-color 0.3s ease", 
                          marginTop: "5px",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")} 
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")} 
                      >
                        <MdRefresh style={{ color: "#207785" }} /> 
                      </IconButton>
                    </div>
                  </div>
                )}

                  <div className="inputBox d-flex justify-content-center">
                    {showCaptchaField ? (
                      <button
                        type="submit"
                        className="btn btn-primary btn-block text-center"
                      >
                        Login
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-secondary btn-block text-center ms-3"
                        onClick={(e) => {
                          e.preventDefault(); 
                          handleGenerateCaptcha();
                        }}
                      
                      >
                        Generate Captcha
                      </button>
                    )}
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
