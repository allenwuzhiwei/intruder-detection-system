import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./components/LoginPage";
import AlertsPage from "./components/AlertsPage";
import AlertDetailPage from "./components/AlertDetailPage";
import UserManagementPage from "./components/UserManagementPage";
import DeviceManagementPage from "./components/DeviceManagementPage";
import VideoFeed from "./components/VideoFeed";
import Webcam from "./components/Webcam";
import SensorsStatus from "./components/SensorsStatus";
import RolePermissionManager from "./components/RolePermissionManager";
import "./style.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState(sessionStorage.getItem("userName") || "");
  const [role, setRole] = useState("");
  //const [userName, setUserName] = useState(""); // Store the current user's name

  const handleLogin = (role, username) => {
    setRole(role);
    setUserName(username); // Set the username after login
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("userName");
    localStorage.removeItem("role");
    localStorage.removeItem("session");
    setIsAuthenticated(false);
    setRole("");
    setUserName(""); // Clear the userName state
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
        </Routes>
      ) : (
        <div className="app-container">
          <Navbar onLogout={handleLogout} role={role} userName={userName} />
          <div className="main-content">
            <Routes>
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/user-management" element={<UserManagementPage />} />
			  <Route path="/role-management" element={<RolePermissionManager />} />
			  <Route path="/device-management" element={<DeviceManagementPage />} />
			  <Route path="/alert-detail/:alertId" element={<AlertDetailPage />} /> {}
			  <Route path="/video-feed" element={<VideoFeed />} /> {/* <-- New line */}
			  <Route path="/webcam" element={<Webcam />} /> {}
			  <Route path="/sensorsStatus" element={<SensorsStatus />} /> {}
              <Route path="*" element={<Navigate to="/alerts" />} />
            </Routes>
          </div>
        </div>
      )}
    </Router>
  );
};

export default App;
