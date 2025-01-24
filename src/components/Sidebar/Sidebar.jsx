import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FaHandPointLeft,
  FaHandPointRight,
  FaChevronRight,
  FaAngleDown,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "boxicons/css/boxicons.min.css";
import "./Sidebar.css";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";

const Sidebar = ({ collapsed, setCollapsed, setMenuData }) => {
  const [openMenus, setOpenMenus] = useState({
    menu: null,
    submenu: null,
  });

  const token =
    useAuthStore((state) => state.token) || sessionStorage.getItem("token");

  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      try {
        const response = await api.get("admin/menu/list", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        });

        if (!response.data?.data) {
          throw new Error("Invalid menu data received");
        }
        return response.data.data;
      } catch (error) {
        console.error("Menu fetch error:", error);
        throw error;
      }
    },
    enabled: !!token,
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    onError: () => {
      toast.error("Failed to load menu. Please try again.");
    },
  });

  const menuItems = apiResponse || [];

  useEffect(() => {
    if (setMenuData) setMenuData(menuItems);
  }, [menuItems, setMenuData]);

  const handleMenuClick = (id) => {
    setOpenMenus((prev) => ({
      ...prev,
      menu: prev.menu === id ? null : id,
      submenu: null,
    }));
  };

  const handleSubmenuClick = (id) => {
    setOpenMenus((prev) => ({
      ...prev,
      submenu: prev.submenu === id ? null : id,
    }));
  };

  const handleToggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  if (isLoading)
    return (
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <button className="toggle-btn" onClick={handleToggleSidebar}>
            {collapsed ? <FaHandPointRight /> : <FaHandPointLeft />}
          </button>
        </div>
        <div className="sidebar-loading">Loading menu...</div>
      </div>
    );

  if (error)
    return (
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <button className="toggle-btn" onClick={handleToggleSidebar}>
            {collapsed ? <FaHandPointRight /> : <FaHandPointLeft />}
          </button>
        </div>
        <div className="sidebar-error">Error loading menu</div>
      </div>
    );

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <ToastContainer />
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={handleToggleSidebar}>
          {collapsed ? <FaHandPointRight /> : <FaHandPointLeft />}
        </button>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((menu) => (
          <div key={menu.menuId} className="menu-item">
            {menu.menuURL === '#' ? (
              <div
                className={`menu-title ${
                  openMenus.menu === menu.menuId ? "active" : ""
                }`}
                onClick={() => handleMenuClick(menu.menuId)}
              >
                <div className="menu-content">
                  <i className={menu.menuIcon}></i>
                  {!collapsed && <span>{menu.menuText}</span>}
                </div>
                {menu.children?.length > 0 && !collapsed && (
                  <span className="arrow-icon">
                    {openMenus.menu === menu.menuId ? (
                      <FaAngleDown />
                    ) : (
                      <FaChevronRight />
                    )}
                  </span>
                )}
              </div>
            ) : (
              <Link
                to={menu.menuURL}
                className={`menu-title ${
                  openMenus.menu === menu.menuId ? "active" : ""
                }`}
              >
                <div className="menu-content">
                  <i className={menu.menuIcon}></i>
                  {!collapsed && <span>{menu.menuText}</span>}
                </div>
              </Link>
            )}
            {menu.children?.length > 0 &&
              openMenus.menu === menu.menuId &&
              !collapsed && (
                <div className="submenu">
                  {menu.children.map((submenu) => (
                    <Link
                      key={submenu.menuId}
                      to={submenu.menuURL.startsWith('/') ? submenu.menuURL : `/${submenu.menuURL}`}
                      className={`submenu-item ${
                        openMenus.submenu === submenu.menuId ? "active" : ""
                      }`}
                      onClick={() => handleSubmenuClick(submenu.menuId)}
                    >
                      <i className={submenu.menuIcon}></i>
                      <span>{submenu.menuText}</span>
                    </Link>
                  ))}
                </div>
              )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
