import React, { useState, useEffect } from "react";
import { PageLoader } from "../pageload/PageLoader";
import { toast } from "react-toastify";
import "./RoleMenu.css";

const RoleMenu = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenuItems, setSelectedMenuItems] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Using dummy data for roles
  const dummyRoles = {
    "data": [
      {"RoleName": "Administrator User", "RoleId": 1},
      {"RoleName": "System", "RoleId": 5},
      {"RoleName": "CHAIRMAN", "RoleId": 2},
      {"RoleName": "MD", "RoleId": 3},
      {"RoleName": "CAO", "RoleId": 4},
      {"RoleName": "Dy CAO", "RoleId": 6},
      {"RoleName": "Accountant", "RoleId": 7},
      {"RoleName": "Asst. Accountant", "RoleId": 8},
      {"RoleName": "Sr. Assistant", "RoleId": 9},
      {"RoleName": "Diarist", "RoleId": 10},
      {"RoleName": "Despatch", "RoleId": 11},
      {"RoleName": "Jr. Engg", "RoleId": 12},
      {"RoleName": "Section Officer", "RoleId": 13},
      {"RoleName": "Asst. Engg", "RoleId": 14},
      {"RoleName": "Law Officer", "RoleId": 15},
      {"RoleName": "Labour Officer", "RoleId": 16}
    ],
    "outcome": true,
    "message": "Success"
  };

  // Use the dummy roles data directly
  const roles = dummyRoles.data;
  const rolesLoading = false;
  const rolesError = null;

  // Dummy menu items data
  const dummyMenuItems = [
    {
      "expanded": false,
      "folder": true,
      "isParent": true,
      "parentCode": 0,
      "children": [
        {
          "expanded": false,
          "folder": false,
          "isParent": false,
          "parentCode": 276,
          "children": [],
          "display": true,
          "id": 164,
          "title": "Add District",
          "url": "/core/district/add",
          "selected": false
        },
        {
          "expanded": false,
          "folder": false,
          "isParent": false,
          "parentCode": 276,
          "children": [],
          "display": true,
          "id": 158,
          "title": "District List",
          "url": "/core/district/list",
          "selected": false
        }
      ],
      "display": true,
      "id": 276,
      "title": "Masters",
      "selected": false
    },
    {
      "expanded": false,
      "folder": true,
      "isParent": true,
      "parentCode": 0,
      "children": [
        {
          "expanded": false,
          "folder": false,
          "isParent": false,
          "parentCode": 237,
          "children": [],
          "display": true,
          "id": 47,
          "title": "Budget Allocation",
          "url": "/financial-budget-allocation",
          "selected": false
        },
        {
          "expanded": false,
          "folder": false,
          "isParent": false,
          "parentCode": 237,
          "children": [],
          "display": true,
          "id": 53,
          "title": "Offices Fund Allocation",
          "url": "/offices-fund-allocation",
          "selected": false
        }
      ],
      "display": true,
      "id": 237,
      "title": "Allotments",
      "selected": false
    },
    {
      "expanded": false,
      "folder": false,
      "isParent": false,
      "parentCode": 0,
      "children": [],
      "display": true,
      "id": 183,
      "title": "Role List",
      "url": "/admin/role/list",
      "selected": false
    },
    {
      "expanded": false,
      "folder": false,
      "isParent": false,
      "parentCode": 0,
      "children": [],
      "display": true,
      "id": 197,
      "title": "Role Menu Mapping",
      "url": "/admin/menu/map",
      "selected": false
    }
  ];

  // Initialize selected menu items when menu items change
  useEffect(() => {
    if (menuItems.length > 0) {
      const initialSelected = {};
      
      // Helper function to process items recursively
      const processItems = (items) => {
        items.forEach(item => {
          // Set initial state based on item's selected property
          initialSelected[item.id] = item.selected;
          
          // Process children if any
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

  // Set menu items when role is selected
  useEffect(() => {
    if (selectedRole) {
      setMenuItems(dummyMenuItems);
    } else {
      setMenuItems([]);
    }
  }, [selectedRole]);

  // Loading state for menu items
  const menuLoading = false;

  const handleRoleChange = (e) => {
    const roleId = parseInt(e.target.value);
    setSelectedRole(roleId);
  };

  const handleCheckboxChange = (item) => {
    const newSelectedItems = { ...selectedMenuItems };
    const newValue = !selectedMenuItems[item.id];
    
    // Update the clicked item
    newSelectedItems[item.id] = newValue;
    
    // If the item has children, update all children recursively
    if (item.children && item.children.length > 0) {
      const updateChildren = (children) => {
        children.forEach(child => {
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
    
    // Simulate API call
    setTimeout(() => {
      console.log("Submitting selected menu items:", selectedMenuItems);
      toast.success(`Menu items updated for role: ${roles.find(r => r.RoleId === selectedRole)?.RoleName}`);
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
              {item.folder ? <i className="bx bx-folder"></i> : <i className="bx bx-file"></i>}
              <span>{item.title}</span>
            </label>
          </div>
          <div className="menu-item-url">{item.url}</div>
          <div className="menu-item-actions">
            <span className={`badge ${item.display ? 'bg-success' : 'bg-danger'}`}>
              {item.display ? 'Visible' : 'Hidden'}
            </span>
            {item.selected && <span className="badge bg-primary ms-1">Current</span>}
          </div>
        </div>
        
        {hasChildren && (
          <div className="menu-item-children">
            {item.children.map(child => renderMenuItem(child))}
          </div>
        )}
      </div>
    );
  };

  if (rolesLoading) {
    return <PageLoader />;
  }

  if (rolesError && !roles) {
    return <div className="error-message">Error loading roles. Please try again.</div>;
  }

  return (
    <div className="role-menu-container">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Role Menu Management</h4>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-6">
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
                {roles &&
                  roles.map((role) => (
                    <option key={role.RoleId} value={role.RoleId}>
                      {role.RoleName}
                    </option>
                  ))}
              </select>
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
              ) : menuItems && menuItems.length > 0 ? (
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
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        'Save Menu Permissions'
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
