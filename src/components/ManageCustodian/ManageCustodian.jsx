import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Accordion } from "react-bootstrap";
import { FaPlus, FaMinus } from "react-icons/fa";
import FileCustodian from "./FileCustodian";

const ManageCustodian = () => {
  const [activeKey, setActiveKey] = useState("0");
  const [isFormOpen, setIsFormOpen] = useState(true);

  return (
    <div className="container mt-4">
      <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
        <Accordion.Item eventKey="0">
          <Accordion.Header
            onClick={() => {
              setIsFormOpen((prev) => !prev);
              setActiveKey(activeKey === "0" ? null : "0");
            }}
            className="d-flex w-100"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span className="me-2 ">Manage Custodian</span>
            <span className="ms-auto">{isFormOpen ? <FaMinus /> : <FaPlus />}</span>
          </Accordion.Header>
          <Accordion.Body>
            <div>
              <FileCustodian />
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default ManageCustodian;
