import React from "react";
import { Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../style.css";

const Navbar = ({ onLogout, role, userName }) => {
  const handleLogout = () => {
    // Clear session and role from both sessionStorage and localStorage
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("userName");
    localStorage.removeItem("role");
    localStorage.removeItem("session");
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <div className="sidebar">
      <Container>
        <h3 className="text-white">Admin Dashboard</h3>
        <p className="text-white">Welcome, {userName}</p> {/* Display current user name */}
        <Nav className="flex-column">
          <Nav.Link as={Link} to="/alerts">Alerts</Nav.Link>
          <Nav.Link as={Link} to="/user-management">User Management</Nav.Link>
		  <Nav.Link as={Link} to="/role-management">Role Permission Manager</Nav.Link>
		  <Nav.Link as={Link} to="/device-management">Device Management</Nav.Link>
		  <Nav.Link as={Link} to="/video-feed">Video Feed</Nav.Link>
		  <Nav.Link as={Link} to="/webcam">Webcam</Nav.Link>
		  <Nav.Link as={Link} to="/sensorsStatus">Intruder Detection Dashboard(Digital Twin)</Nav.Link>			  
          <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
        </Nav>
      </Container>
    </div>
  );
};

export default Navbar;
