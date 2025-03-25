import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FaHandPointLeft,
  FaHandPointRight,
  FaChevronRight,
  FaAngleDown,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "boxicons/css/boxicons.min.css";
import "./Sidebar.css";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { PageLoader } from "../pageload/PageLoader";

import useMenuStore from "./menuStore";

const Sidebar = ({ collapsed, setCollapsed}) => {
  const [openMenus, setOpenMenus] = useState({}); 
  const location = useLocation();
  const token = useAuthStore((state) => state.token) || sessionStorage.getItem("token");
  
  const menuData = useMenuStore((state) => state.menuData);
  const handleLinkClick = () => {
    setCollapsed(true); // Close sidebar
    setOpenMenus({}); // Reset open menus
  };
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
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

  // const menuItems = apiResponse || [];

  // useEffect(() => {
  //   if (setMenuData) setMenuData(menuItems);
  // }, [menuItems, setMenuData]);
  useEffect(() => {
    if (apiResponse) {
      useMenuStore.getState().setMenuData(apiResponse); // Update Zustand state with menu data
    }
  }, [apiResponse]);

  const handleMenuClick = (id) => {
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the open state for the clicked menu
    }));
  };

  const isActiveLink = (url) => {
    return location.pathname === url;
  };

  const renderMenu = (menu) => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isMenuOpen = openMenus[menu.menuId];

    return (
      <div key={menu.menuId} className="menu-item">
        {menu.menuURL === "#" ? (
          <div
            className={`menu-title ${isMenuOpen ? "active" : ""}`}
            onClick={() => handleMenuClick(menu.menuId)}
          >
            <div className="menu-content">
              <i className={menu.menuIcon}></i>
              {!collapsed && <span>{menu.menuText}</span>}
            </div>
            {hasChildren && !collapsed && (
              <span className="arrow-icon">
                {isMenuOpen ? <FaAngleDown /> : <FaChevronRight />}
              </span>
            )}
          </div>
        ) : (
          <Link
            to={menu.menuURL}
            className={`menu-title ${isActiveLink(menu.menuURL) ? "active" : ""}`}
            onClick={handleLinkClick}
          >
            <div className="menu-content">
              <i className={menu.menuIcon}></i>
              {!collapsed && <span>{menu.menuText}</span>}
            </div>
            {hasChildren && !collapsed && (
              <span className="arrow-icon">
                {isMenuOpen ? <FaAngleDown /> : <FaChevronRight />}
              </span>
            )}
          </Link>
        )}

        {hasChildren && isMenuOpen && !collapsed && (
          <div className="submenu">
            {menu.children.map((submenu) => (
              <React.Fragment key={submenu.menuId}>
                {submenu.menuURL === "#" ? (
                  <div
                    className={`submenu-item ${
                      openMenus[submenu.menuId] ? "active" : ""
                    }`}
                    onClick={() => handleMenuClick(submenu.menuId)}
                  >
                    <i className={submenu.menuIcon}></i>
                    <span>{submenu.menuText}</span>
                    {submenu.children?.length > 0 && (
                      <span className="arrow-icon">
                        {openMenus[submenu.menuId] ? (
                          <FaAngleDown />
                        ) : (
                          <FaChevronRight />
                        )}
                      </span>
                    )}
                  </div>
                ) : (
                  <Link
                    to={submenu.menuURL}
                    className={`submenu-item ${
                      isActiveLink(submenu.menuURL) ? "active" : ""
                    }`}
                    onClick={handleLinkClick}
                  >
                    <i className={submenu.menuIcon}></i>
                    <span>{submenu.menuText}</span>
                  </Link>
                )}

                {submenu.children?.length > 0 && openMenus[submenu.menuId] && (
                  <div className="nested-submenu">
                    {submenu.children.map((nestedSubmenu) => renderMenu(nestedSubmenu))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading)
    return (
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ?  <FaHandPointRight /> : <FaHandPointLeft />}
          </button>
        </div>
        <div className="sidebar-loading">
          <PageLoader />
        </div>
      </div>
    );

  if (error)
    return (
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <FaHandPointRight /> : <FaHandPointLeft />}
          </button>
        </div>
        <div className="sidebar-error">Error loading menu</div>
      </div>
    );

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <FaHandPointRight /> : <FaHandPointLeft />}
        </button>
      </div>
      <nav className="sidebar-nav">
        {menuData.map((menu) => renderMenu(menu))}
      </nav>
      
    </div>
  );
};

export default Sidebar;