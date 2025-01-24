import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import AdminMain from "../AdminMain/AdminMain";
import Hierarchy from "../Hierarchy/Hierarchy";
import DiarySection from "../DiarySection/DiarySection";
import Letter from "../Letter/Letter";
import "./Admin.css";

const Admin = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [menuItems, setMenuItems] = useState([]); // Store API menu items

  const handleMenuData = (data) => {
    setMenuItems(data);
  };

  // Flatten children menus for routing
  const getFlatMenuItems = (items) => {
    const flatMenu = [];
    items.forEach((menu) => {
      if (menu.children && menu.children.length > 0) {
        flatMenu.push(...getFlatMenuItems(menu.children));
      }
      flatMenu.push(menu);
    });
    return flatMenu;
  };

  const flatMenuItems = getFlatMenuItems(menuItems);

  const lazyLoadComponent = (componentName) => {
    try {
      return React.lazy(() => import(`../${componentName}`));
    } catch (error) {
      console.error(`Error loading component: ${componentName}`, error);
      return null;
    }
  };

  return (
    <div className="admin-layout">
      <Header collapsed={collapsed} />
      <div className={`parent-container ${collapsed ? "collapsed" : ""}`}>
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setMenuData={handleMenuData}
        />
        <AdminMain collapsed={collapsed}>
          <Routes>
            {/* Welcome route */}
            <Route 
              index 
              element={
                <div className="welcome-page">
                  <h1>Welcome to File Management System</h1>
                </div>
              } 
            />

            {/* Static Routes */}
            <Route 
              path="hierarchy" 
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Hierarchy />
                </React.Suspense>
              } 
            />
            <Route 
              path="file" 
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <DiarySection />
                </React.Suspense>
              } 
            />
            <Route 
              path="system/setup/menu/init" 
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Letter />
                </React.Suspense>
              } 
            />

            {/* Dynamic Routes from API */}
            {menuItems.map((menu) => {
              // Skip menu items that are handled statically or are just containers (#)
              if (menu.menuURL === '#') {
                // If it's a container with children, render routes for children
                if (menu.children?.length > 0) {
                  return menu.children.map(child => {
                    const Component = child.menuComponent ? lazyLoadComponent(child.menuComponent) : null;
                    const path = child.menuURL; // Keep the leading slash
                    return (
                      <Route
                        key={child.menuId}
                        path={path}
                        element={
                          Component ? (
                            <React.Suspense fallback={<div>Loading...</div>}>
                              <Component />
                            </React.Suspense>
                          ) : (
                            <h1>{child.menuText}</h1>
                          )
                        }
                      />
                    );
                  });
                }
                return null;
              }

              // Skip routes that we've defined statically
              if (menu.menuURL === '/hierarchy' || 
                  menu.menuURL === '/file' || 
                  menu.menuURL === '/system/setup/menu/init') {
                return null;
              }

              // Handle regular routes
              const Component = menu.menuComponent ? lazyLoadComponent(menu.menuComponent) : null;
              const path = menu.menuURL; // Keep the leading slash
              return (
                <Route
                  key={menu.menuId}
                  path={path}
                  element={
                    Component ? (
                      <React.Suspense fallback={<div>Loading...</div>}>
                        <Component />
                      </React.Suspense>
                    ) : (
                      <h1>{menu.menuText}</h1>
                    )
                  }
                />
              );
            })}

            {/* 404 route */}
            <Route 
              path="*" 
              element={
                <div className="not-found">
                  <h1>Page Not Found</h1>
                </div>
              } 
            />
          </Routes>
        </AdminMain>
      </div>
    </div>
  );
};

export default Admin;
