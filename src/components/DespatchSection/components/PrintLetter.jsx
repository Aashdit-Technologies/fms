
import React, { useEffect, useState } from "react";
import odishalogo from "../../../assets/odishalogo.png";
import PrintIcon from "@mui/icons-material/Print";
import IconButton from "@mui/material/IconButton";

export default function Letter() {
  const [letterContent, setLetterContent] = useState("");

  useEffect(() => {
    const content = localStorage.getItem("letterContent");
    if (content) {
      setLetterContent(JSON.parse(content));
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "20px",
        backgroundColor: "#f4f4f4",
      }}
    >
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .printable-content, .printable-content * {
              visibility: visible;
            }
            .printable-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
              text-align: center;
            }
            /* Hide non-print elements */
            .no-print {
              display: none !important;
            }
            /* Fix margins */
            @page {
              margin: 20px;
            }
              .printable-content .logo-sec {
              display: flex;
              align-items: center;
              margin-bottom: 20px;
            }
            .printable-content .logo-sec img {
              width: 60px;
              margin-right: 20px;
            }
            .printable-content .logo-sec h2 {
              margin: 0;
              font-size: 18px;
              font-weight: bold;
            }
            .printable-content .logo-sec p {
              margin: 5px 0;
              font-size: 12px;
              color: #555;
            }
          }
        `}
      </style>

      <div
        style={{
          maxWidth: "1050px",
          backgroundColor: "#fff",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          fontFamily: "Century Gothic, sans-serif",
        }}
      >
      
        <div className="printable-content">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <img
            src={odishalogo}
            alt="Logo"
            style={{ width: "60px", marginRight: "20px" }}
          />

          <div style={{ flexGrow: 1 }}>
            <h2 style={{ margin: "0", fontSize: "18px", fontWeight: "bold" }}>
              FILE MANAGEMENT SYSTEM
            </h2>
            <p style={{ margin: "5px 0", fontSize: "12px", color: "#555" }}>
              Higher Education Information & Management System
            </p>
          </div>

          <div className="no-print">
            <IconButton
              onClick={handlePrint}
              style={{
                backgroundColor: "#207785",
                color: "#fff",
                borderRadius: "4px",
                
              }}
            >
              <PrintIcon />
            </IconButton>
          </div>
        </div>


          <hr style={{ border: "1.5px solid #207785", marginBottom: "20px" }} />

          <div
            style={{
              textAlign: "justify",
              fontSize: "14px",
              color: "#333",
              padding: "10px",
            }}
            dangerouslySetInnerHTML={{ __html: letterContent }}
          />


           <hr style={{ border: "1.5px solid #207785", marginBottom: "20px" }} />
          <table
            width="100%"
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#555",
            }}
          >
            <tbody>
              <tr>
                <td>
                  <div>
                    <h4
                      style={{
                        margin: "0",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      File Management System
                    </h4>
                    <p style={{ margin: "5px 0" }}>
                      Higher Education Information & Management System
                    </p>
                    <p style={{ margin: "5px 0" }}>
                      FMS, FMS Towers, Chhattisgarh, Chhattisgarh-751022,
                      Chhattisgarh, INDIA
                    </p>
                    <p style={{ margin: "5px 0" }}>
                      +91-0674-2541525, 2540820 | Fax: 2542956 / 2541982
                    </p>
                    <p style={{ margin: "5px 0" }}>cmd@fms.in / md@dco.in</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>
    
  );
}

