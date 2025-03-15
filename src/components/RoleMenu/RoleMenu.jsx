import React, { useState, useEffect } from "react";
import { PageLoader } from "../pageload/PageLoader";
import { toast } from "react-toastify";
import "./RoleMenu.css";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import { useNavigate } from "react-router-dom";

const RoleMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedMenuItems, setSelectedMenuItems] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthStore.getState().token;
  const [menuIds, setMenuIds] = useState([]);
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState({});

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
    setExpandedItems({});
    if (!roleCode) {
      setMenuItems([]);
      return;
    }

    setIsLoading(true);
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
      setIsLoading(false);
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
    setSelectedMenuItems((prevSelected) => {
      const newSelectedItems = { ...prevSelected };
      const newValue = !prevSelected[item.id];

      newSelectedItems[item.id] = newValue;

      const updateChildren = (children, checked) => {
        children.forEach((child) => {
          newSelectedItems[child.id] = checked;
          if (child.children) {
            updateChildren(child.children, checked);
          }
        });
      };

      if (item.children) {
        updateChildren(item.children, newValue);
      }

      const findParent = (id, menuList) => {
        for (let parent of menuList) {
          if (parent.children?.some((child) => child.id === id)) {
            return parent;
          }
          if (parent.children) {
            const found = findParent(id, parent.children);
            if (found) return found;
          }
        }
        return null;
      };

      const updateParents = (child) => {
        const parent = findParent(child.id, menuItems);
        if (!parent) return;

        const allChildrenChecked = parent.children.every(
          (child) => newSelectedItems[child.id]
        );

        newSelectedItems[parent.id] = allChildrenChecked;
        updateParents(parent);
      };

      updateParents(item);

      setMenuIds(() =>
        Object.keys(newSelectedItems)
          .filter((id) => newSelectedItems[id])
          .map(Number)
      );

      return newSelectedItems;
    });
  };

  const handleSubmit = async (roleCode) => {
    if (!roleCode) {
      console.warn("No role selected. Please select a role.");
      return;
    }

    const selectedMenuIds = Object.keys(selectedMenuItems)
      .filter((id) => selectedMenuItems[id])
      .map(Number);

    if (selectedMenuIds.length === 0) {
      console.warn("No menu selected. Please assign at least one menu.");
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        roleCode,
        menuIds: selectedMenuIds,
      };

      const encryptedData = encryptPayload(payload);

      const response = await api.post(
        "admin/menu/assign",
        { dataObject: encryptedData },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMenuIds([]);
      toast.success(response.data.message)
    } catch (error) {
      console.error("Error submitting menu permissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const renderMenuItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isChecked = selectedMenuItems[item.id] || false;
    const isExpanded = expandedItems[item.id] || false;

    return (
      <div key={item.id} className={`menus-item ${isChecked ? "checked" : ""}`}>
        <div className="menus-item-header">
          <div className="menus-item-checkbox">
            <input
              type="checkbox"
              id={`menus-item-${item.id}`}
              checked={isChecked}
              onChange={() => handleCheckboxChange(item)}
              className="form-check-input"
            />
          </div>

          <div className="menus-item-title">
            <label
              htmlFor={`menus-item-${item.id}`}
              className="form-check-label d-flex align-items-center"
              style={{ cursor: hasChildren ? "pointer" : "default" }}
              onClick={(e) => {
                e.preventDefault();
                if (hasChildren) toggleExpand(item.id);
              }}
            >
              {hasChildren && (
                <span className="toggle-icon">
                  {isExpanded ? "−" : "+"}
                </span>
              )}
              <span>{item.title}</span>
            </label>
          </div>
          <div className="menus-item-url">{item.url}</div>
        </div>

        {hasChildren && isExpanded && (
          <div className="menus-item-children">
            {item.children.map((child) => renderMenuItem(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isLoading && <PageLoader />}
      <div className="role-menu-container">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Role Menu Map</h5>
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
                >
                  <option value="" disabled>
                    -- Select a role --
                  </option>
                  {roles.map((role) => (
                    <option key={role.RoleCode} value={role.RoleCode}>
                      {role.RoleName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedRole && (
              <div className="menus-items-container">
                <div className="menus-items-header">
                  <h6 className="mb-0">Menu Items List</h6>
                  <div className="menus-item-urls">Menu URL</div>
                </div>
                <div className="menus-items-list">
                  {menuItems.map((item) => renderMenuItem(item))}
                </div>

                <div className="d-flex justify-content-center mt-3 mb-3 gap-3">
                  <button
                    className="btn btn-success px-4 py-2 fw-bold shadow-sm"
                    onClick={() => handleSubmit(selectedRole)}
                  >
                    Assign
                  </button>

                  <button
                    className="btn btn-outline-danger px-4 py-2 fw-bold shadow-sm"
                    onClick={() => navigate("/")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RoleMenu;