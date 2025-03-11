import React, { useState, useEffect } from "react";
import { PageLoader } from "../pageload/PageLoader";
import { toast } from "react-toastify";
import "./RoleMenu.css";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
const RoleMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedMenuItems, setSelectedMenuItems] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false); 
  const token = useAuthStore.getState().token;

  
  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("common/role-list");
      if (response.data && Array.isArray(response.data.data)) {
        setRoles(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Error fetching roles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

 
  const handleRoleChange = async (event) => {
    const roleCode = event.target.value;
    setSelectedRole(roleCode);
  
    if (!roleCode) {
      setMenuItems([]);
      return;
    }
  
    setMenuLoading(true); 
    try {
      const payload = {
        roleCode: roleCode,
        appCode: "FMS",
      };
  
      const response = await api.post(
        "admin/menu/get-all-menu-by-rolecode",
        { dataObject: encryptPayload(payload) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("API Response:", response); 
  
      
      if (Array.isArray(response.data)) {
        setMenuItems(response.data);
      } else {
        console.error("Error: Unexpected API response structure.", response.data);
        setMenuItems([]);
      }
    } catch (error) {
      console.error("Error fetching menu data:", error);
      setMenuItems([]); 
    } finally {
      setMenuLoading(false); 
    }
  };

  
  useEffect(() => {
    if (menuItems.length > 0) {
      const initialSelected = {};
  
      const processItems = (items) => {
        items.forEach((item) => {
          initialSelected[item.id] = item.selected || false;
  
          if (item.children && item.children.length > 0) {
            processItems(item.children);
          }
        });
      };
  
      processItems(menuItems);
      setSelectedMenuItems(initialSelected);
    } else {
      setSelectedMenuItems({});
    }
  }, [menuItems]);

  
  const handleCheckboxChange = (item) => {
    const newSelectedItems = { ...selectedMenuItems };
    const newValue = !selectedMenuItems[item.id];

    newSelectedItems[item.id] = newValue;

    if (item.children && item.children.length > 0) {
      const updateChildren = (children) => {
        children.forEach((child) => {
          newSelectedItems[child.id] = newValue;
          if (child.children && child.children.length > 0) {
            updateChildren(child.children);
          }
        });
      };

      updateChildren(item.children);
    }

    setSelectedMenuItems(newSelectedItems);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      console.log("Submitting selected menu items:", selectedMenuItems);
      toast.success(
        `Menu items updated for role: ${
          roles.find((r) => r.RoleId === selectedRole)?.RoleName
        }`
      );
      setIsSubmitting(false);
    }, 1000);
  };

  const renderMenuItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isChecked = selectedMenuItems[item.id] || false;
  
    return (
      <div key={item.id} className="menu-item">
        <div className="menu-item-header">
          <div className="menu-item-checkbox">
            <input
              type="checkbox"
              id={`menu-item-${item.id}`}
              checked={isChecked}
              onChange={() => handleCheckboxChange(item)}
              className="form-check-input"
            />
          </div>
  
          <div className="menu-item-title">
            <label htmlFor={`menu-item-${item.id}`} className="form-check-label">
              {item.folder ? (
                <i className="bx bx-folder"></i>
              ) : (
                <i className="bx bx-file"></i>
              )}
              <span>{item.title}</span>
            </label>
          </div>
          <div className="menu-item-url">{item.url}</div>
        </div>
  
        {hasChildren && (
          <div className="menu-item-children">
            {item.children.map((child) => renderMenuItem(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="role-menu-container">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Role Menu Management</h4>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-4">
              <label htmlFor="roleSelect" className="form-label fw-bold">
                Select Role
              </label>
              <select
                id="roleSelect"
                className="form-select"
                onChange={handleRoleChange}
                value={selectedRole || ""}
                disabled={isLoading}
              >
                <option value="" disabled>
                  -- Select a role --
                </option>
                {roles.map((role) => (
                  <option key={role.RoleId} value={role.RoleId}>
                    {role.RoleName}
                  </option>
                ))}
              </select>
              {isLoading && <p>Loading roles...</p>}
            </div>
          </div>

          {selectedRole && (
            <div className="menu-items-container">
              <div className="menu-items-header">
                <h5 className="mb-0">Menu Items for Selected Role</h5>
              </div>

              {menuLoading ? (
                <div className="text-center p-4">
                  <PageLoader />
                </div>
              ) : menuItems.length > 0 ? (
                <>
                  <div className="menu-items-list">
                    {menuItems.map((item) => renderMenuItem(item))}
                  </div>
                  <div className="d-flex justify-content-end mt-4">
                    <button
                      className="btn btn-primary"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Saving...
                        </>
                      ) : (
                        "Save Menu Permissions"
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-items-message">
                  No menu items found for this role.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleMenu;