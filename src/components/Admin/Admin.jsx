import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import AdminMain from "../AdminMain/AdminMain";
import Hierarchy from "../Hierarchy/Hierarchy";
import Despatch from "../DespatchSection/Despatch";
import DiarySection from "../DiarySection/DiarySection";
import LetterList from "../Inbox/LetterList";
import "./Admin.css";
import MainFile from "../FileSection/MainFile";
import Scheduling from "../FileSection/Scheduling";
import ManageRoom from "../ManageRoom/ManageRoom";
import ManageRack from "../ManageRack/ManageRack";
import ManageActivity from "../ManageActivity/ManageActivity";
import ManageFile from "../ManageFile/ManageFile";
import Welcome from "../Welcome/Welcome";
import AddToFile from "../Inbox/AddToFile";
import EmployeeMaster from "../EmployeeMaster/EmployeeMaster";
import ManageCustodian from "../ManageCustodian/ManageCustodian";
import EmployeeList from "../EmployeeList/EmployeeList";
import LogViewer from "../LogViewer/LogViewer";
import NoteSheetPreview from "../FileSection/notesheetpreview/NoteSheetPreview";
import RoleMenu from "../RoleMenu/RoleMenu";
import PrintLetter from "../DespatchSection/components/PrintLetter";
import ChangePassword from "../Header/ChangePassword";
import EditBasicDetails from "../Header/EditBasicDetails";

const Admin = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [menuItems, setMenuItems] = useState([]);

  const handleMenuData = (data) => {
    setMenuItems(data);
  };

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
            <Route index element={<Welcome />} />

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
                  <ManageFile />
                </React.Suspense>
              }
            />
            <Route
              path="scheduling"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Scheduling />
                </React.Suspense>
              }
            />
            <Route
              path="manage-room"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <ManageRoom />
                </React.Suspense>
              }
            />
            <Route
              path="manage-rack"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <ManageRack />
                </React.Suspense>
              }
            />
            <Route
              path="manage-activity"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <ManageActivity />
                </React.Suspense>
              }
            />
            <Route
              path="manage-custodian"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <ManageCustodian />
                </React.Suspense>
              }
            />
            <Route
              path="main-file"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <MainFile />
                </React.Suspense>
              }
            />
            <Route
              path="note-sheet-preview"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <NoteSheetPreview />
                </React.Suspense>
              }
            />
            <Route
              path="diary-section"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <DiarySection />
                </React.Suspense>
              }
            />
            <Route
              path="despatch-section"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Despatch />
                </React.Suspense>
              }
            />
            <Route
              path="letter"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <LetterList />
                </React.Suspense>
              }
            />
            <Route
              path="add-to-file"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <AddToFile />
                </React.Suspense>
              }
            />

            <Route
              path="employee-master"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <EmployeeMaster />
                </React.Suspense>
              }
            />
            <Route
              path="employee-list"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <EmployeeList />
                </React.Suspense>
              }
            />
            <Route
              path="log-view"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <LogViewer />
                </React.Suspense>
              }
            />
            <Route
              path="role-menu"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <RoleMenu />
                </React.Suspense>
              }
            />
            <Route
              path="print-letter"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <PrintLetter />
                </React.Suspense>
              }
            />
            <Route
              path="/edit-basic-details"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <EditBasicDetails />
                </React.Suspense>
              }
            />
            <Route
              path="/change-password"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <ChangePassword />
                </React.Suspense>
              }
            />

            {menuItems.map((menu) => {
              if (menu.menuURL === "#") {
                if (menu.children?.length > 0) {
                  return menu.children.map((child) => {
                    const Component = child.menuComponent
                      ? lazyLoadComponent(child.menuComponent)
                      : null;
                    const path = child.menuURL;
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

              if (
                menu.menuURL === "/hierarchy" ||
                menu.menuURL === "/file" ||
                menu.menuURL === "/letter" ||
                menu.menuURL === "/scheduling" ||
                menu.menuURL === "/manage-room" ||
                menu.menuURL === "/manage-rack" ||
                menu.menuURL === "/manage-activity" ||
                menu.menuURL === "/diary-section" ||
                menu.menuURL === "/despatch-section" ||
                menu.menuURL === "/employee-master" ||
                menu.menuURL === "/employee-list"
              ) {
                return null;
              }

              const Component = menu.menuComponent
                ? lazyLoadComponent(menu.menuComponent)
                : null;
              const path = menu.menuURL;
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
