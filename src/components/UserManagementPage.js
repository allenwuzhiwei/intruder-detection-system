import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getValidAccessTokenOrRedirect } from "./auth";
import { useNavigate } from "react-router-dom";
import { Container, Button, Card, Pagination, Spinner, Alert } from "react-bootstrap";
import config from './config';

const UserManagementPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(""); // Error state for displaying error messages
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    email: '',
    phoneNumber: '',
    roleId: '',
    status: 'active'
  });

  const [editUserId, setEditUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setError(""); // Reset error before trying to fetch data
    try {	
      const token = getValidAccessTokenOrRedirect(navigate);
      if (!token) return;
      const res = await axios.get(`${config.API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          username: searchTerm,
          page: 0,
          size: 10,
          sortBy: 'createDatetime',
          direction: 'desc'
        }
      });
      if (Array.isArray(res.data.data.content)) {
        setUsers(res.data.data.content);
      } else {
        console.error("Fetched data is not an array:", res.data.data);
        setUsers([]);
      }
    } catch (err) {
      if (err.response) {
        // Backend returned an error response (like 403)
        setError(`Error ${err.response.status}: ${err.response.data}`);
      } else {
        // Network or unexpected errors
        setError('Error fetching users: ' + err.message);
      }
      console.error('Error fetching users:', err);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = getValidAccessTokenOrRedirect(navigate);
      if (!token) return;
      const res = await axios.get(`${config.API_BASE_URL}/api/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data.data)) {
        setRoles(res.data.data);
      }
    } catch (err) {
      if (err.response) {
        setError(`Error ${err.response.status}: ${err.response.data}`);
      } else {
        setError('Error fetching roles: ' + err.message);
      }
      console.error('Error fetching roles:', err);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const token = getValidAccessTokenOrRedirect(navigate);
      if (!token) return;
      await axios.delete(`${config.API_BASE_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleSearch();
    } catch (err) {
      if (err.response) {
        setError(`Error ${err.response.status}: ${err.response.data}`);
      } else {
        setError('Error deleting user: ' + err.message);
      }
      console.error('Error deleting user:', err);
    }
  };

  const handleAddUser = async () => {
    try {
      const token = getValidAccessTokenOrRedirect(navigate);
      if (!token) return;
      const res = await axios.post(`${config.API_BASE_URL}/api/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleSearch();
      setNewUser({
        username: '',
        password: '',
        email: '',
        phoneNumber: '',
        roleId: '',
        status: '',
        createUser: '',
        updateUser: '',
      });
    } catch (err) {
      if (err.response) {
        setError(`Error ${err.response.status}: ${err.response.data}`);
      } else {
        setError('Error adding user: ' + err.message);
      }
      console.error('Error adding user:', err);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const token = getValidAccessTokenOrRedirect(navigate);
      if (!token) return;
      await axios.put(`${config.API_BASE_URL}/api/users/${editUserId}`, editUserData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedList = users.map((user) =>
        user.userId === editUserId ? editUserData : user
      );
      await handleSearch();
      setEditUserId(null);
    } catch (err) {
      if (err.response) {
        setError(`Error ${err.response.status}: ${err.response.data}`);
      } else {
        setError('Error updating user: ' + err.message);
      }
      console.error('Error updating user:', err);
    }
  };

  const handleSearch = async () => {
    try {
      const token = getValidAccessTokenOrRedirect(navigate);
      if (!token) return;
      const response = await axios.get(`${config.API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          username: searchTerm,
          page: 0,
          size: 10,
          sortBy: 'createDatetime',
          direction: 'desc'
        }
      });
      setUsers(response.data.data.content || []);
      setCurrentPage(1);
    } catch (err) {
      if (err.response) {
        setError(`Error ${err.response.status}: ${err.response.data}`);
      } else {
        setError('Search failed: ' + err.message);
      }
      console.error('Search failed:', err);
    }
  };
const handleCancelEdit = () => {
    setEditUserId(null);
    setEditUserData({});
  };
 const handleEditClick = (user) => {
    setEditUserId(user.userId);
    setEditUserData({ ...user });
  };

  const handleEditChange = (field, value) => {
    setEditUserData({ ...editUserData, [field]: value });
  };


  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div className="user-management-container" style={{ padding: '30px', fontFamily: 'Arial' }}>
      <h1>User Management</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Add User Form */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
          <h2>Add New User</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
            <input
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            />
            <input
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <input
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <input
              placeholder="Phone Number"
              value={newUser.phoneNumber}
              onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
            />
            <select
              value={newUser.status}
              onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={newUser.roleId}
              onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddUser}
              style={{ padding: '8px', background: '#4CAF50', color: 'white', border: 'none' }}
            >
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Search input and button */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', width: '250px', marginRight: '10px' }}
        />
        <button onClick={handleSearch} style={{ padding: '8px' }}>
          Search
        </button>
      </div>

      {/* User Table */}
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '20px' }}>
        <thead style={{ backgroundColor: '#f0f0f0' }}>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Create User</th>
            <th>Create Datetime</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr key={user.userId}>
              <td>{user.userId}</td>
              {editUserId === user.userId ? (
                <>
                  <td><input value={editUserData.username} onChange={(e) => handleEditChange('username', e.target.value)} /></td>
                  <td><input value={editUserData.email} onChange={(e) => handleEditChange('email', e.target.value)} /></td>
                  <td><input value={editUserData.phoneNumber} onChange={(e) => handleEditChange('phoneNumber', e.target.value)} /></td>
                  <td>
                    <select value={editUserData.roleId} onChange={(e) => handleEditChange('roleId', e.target.value)}>
                      {roles.map((role) => (
                        <option key={role.roleId} value={role.roleId}>
                          {role.roleName}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select value={editUserData.status} onChange={(e) => handleEditChange('status', e.target.value)}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td>{user.createUser}</td>
                  <td>{user.createDatetime}</td>
                  <td>
                    <button onClick={handleUpdateUser}>Save</button>
                    <button onClick={handleCancelEdit}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>
                  <td>{user.roleName}</td>
                  <td>{user.status}</td>
                  <td>{user.createUser}</td>
                  <td>{user.createDatetime}</td>
                  <td>
                    <button onClick={() => handleEditClick(user)}>Edit</button>
                    <button onClick={() => handleDelete(user.userId)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <Pagination>
        <Pagination.Prev
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        />
        {[...Array(totalPages)].map((_, idx) => (
          <Pagination.Item
            key={idx + 1}
            active={currentPage === idx + 1}
            onClick={() => setCurrentPage(idx + 1)}
          >
            {idx + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        />
      </Pagination>
    </div>
  );
};

export default UserManagementPage;
