import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { TextField, IconButton, InputAdornment, Button } from "@mui/material";
import { MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FaSignInAlt, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./LoginPage.css";
import Odisha from "../../assets/odishalogo.png";
import LeftImg from "../../assets/animation-gif.gif";

import { IoKeySharp } from "react-icons/io5";
import { MdRefresh } from "react-icons/md";
import useAuthStore from "../../store/Store";
import SVGComponent from "./SVGComponent";

const LoginPage = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userCaptcha, setUserCaptcha] = useState("");
  const { login, isLoggingIn, captcha, generateCaptcha } = useAuth();
  const token = useAuthStore.getState().token;

  const setShowCaptchaField = useAuthStore(
    (state) => state.setShowCaptchaField
  );
  const showCaptchaField = useAuthStore((state) => state.showCaptchaField);

  useEffect(() => {
    setShowCaptchaField(false);
  }, [setShowCaptchaField]);

  const handleUserNameChange = (e) => {
    const value = e.target.value.trim();
    setUserName(value);

    if (!value.trim()) {
      setShowCaptchaField(false);
    }
  };
  const handleGenerateCaptcha = async () => {
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
      toast.error("Failed to generate captcha. Please try again.", {
        autoClose: 1000,
      });
      return false;
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

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
      toast.error("Failed to refresh captcha. Please try again.", {
        autoClose: 1000,
      });
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
          <SVGComponent/>
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
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FaUser color="rgb(200 98 255)" />
                          </InputAdornment>
                        ),
                      }}
                      margin="normal"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#c264f4", // Custom border color based on save state
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#c264f4", // Change border color when focused
                          },
                          "&:hover fieldset": {
                            borderColor: "#c264f4", // Border color when hovered
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: "#ccc", // Text color change after save
                        },
                        "& .MuiInputLabel-root": {
                          color: "#ccc", // Label color when saved
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#ccc", // Change to the desired label color when focused
                        },
                        "& .MuiInputBase-input::placeholder": {
                          color: "#c264f4", // Placeholder color change on save
                        },
                      }}
                    />
                  </div>
                  <div className="inputBox">
                    <TextField
                      label="Password"
                      variant="outlined"
                      size="small"
                      fullWidth
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="off"
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MdLock color="rgb(200 98 255)" size={20} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={togglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? (
                                <MdVisibilityOff color="rgb(200 98 255)" />
                              ) : (
                                <MdVisibility color="rgb(200 98 255)" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#c264f4", // Custom border color based on save state
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#c264f4", // Change border color when focused
                          },
                          "&:hover fieldset": {
                            borderColor: "#c264f4", // Border color when hovered
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: "#ccc", // Text color change after save
                        },
                        "& .MuiInputLabel-root": {
                          color: "#ccc", // Label color when saved
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#ccc", // Change to the desired label color when focused
                        },
                        "& .MuiInputBase-input::placeholder": {
                          color: "#c264f4", // Placeholder color change on save
                        },
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
                          // sx={{
                          //   "& .MuiOutlinedInput-root": {
                          //     height: "45px",
                          //   },

                          //   flex: 4,
                          // }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                borderColor: "#c264f4", // Custom border color based on save state
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#c264f4", // Change border color when focused
                              },
                              "&:hover fieldset": {
                                borderColor: "#c264f4", // Border color when hovered
                              },
                            },
                            "& .MuiInputBase-input": {
                              color: "#ccc", // Text color change after save
                            },
                            "& .MuiInputLabel-root": {
                              color: "#ccc", // Label color when saved
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                              color: "#ccc", // Change to the desired label color when focused
                            },
                            "& .MuiInputBase-input::placeholder": {
                              color: "#c264f4", // Placeholder color change on save
                              
                            },

                            flex: 4,
                          }}
                          size="small"
                        />

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#c264f4 ",
                            border: "1px solid #c264f4",
                            borderRadius: "6px",
                            padding: "6px",
                            width: "80px",
                            marginTop: "6px",
                            height: "41px",
                          }}
                        >
                          <img
                            src={captcha}
                            alt="Captcha"
                            style={{
                              height: "25px",
                              width: "auto",
                            }}
                          />
                        </div>

                        <IconButton
                          onClick={handleRefreshCaptcha}
                          style={{
                            backgroundColor: "#c264f4",
                            borderRadius: "6px",
                            padding: "6px",
                            height: "40px",
                            marginTop: "6px",
                            width: "45px",
                            transition: "background-color 0.3s ease",
                            
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.backgroundColor = "#c264f4")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor = "#c264f4")
                          }
                        >
                          <MdRefresh style={{ color: "#fff" }} />
                        </IconButton>
                      </div>
                    </div>
                  )}

                  <div className="inputBox d-flex justify-content-center">
                    {showCaptchaField ? (
                      <Button
                        type="submit"
                        style={{
                          backgroundColor: "#440571",
                          color: "rgb(255, 255, 255)",
                          border: "1px solid #440571",
                        }}
                        startIcon={<FaSignInAlt  style={{paddingRight:"5px"}}/>} 
                        className=""
                      >
                          Login
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="contained"
                        style={{
                          backgroundColor: "rgb(144 71 180)",
                          color: "rgb(255, 255, 255)",
                          border: "1px solid #aaaaaa",
                        }}
                        className="btn btn-secondary btn-block text-center ms-3"
                        onClick={(e) => {
                          e.preventDefault();
                          handleGenerateCaptcha();
                        }}
                      >
                        Generate Captcha
                      </Button>
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
