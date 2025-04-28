import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getValidAccessTokenOrRedirect } from "./auth";
import { useNavigate } from "react-router-dom";
import { Alert } from 'react-bootstrap';
import config from './config';

const DeviceManagementPage = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const devicesPerPage = 10;

  const [newDevice, setNewDevice] = useState({
    deviceName: '',
    deviceType: '',
    serialNumber: '',
    status: 'active'
  });

  const [editDeviceId, setEditDeviceId] = useState(null);
  const [editDeviceData, setEditDeviceData] = useState({});

  // New state for error messages
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const token = getValidAccessTokenOrRedirect(navigate);
      if (!token) return;
      const res = await axios.get(`${config.API_BASE_URL}/api/devices`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          deviceName: searchTerm,
          page: 0,
          size: 10,
          sortBy: 'createDatetime',
          direction: 'desc'
        }
      });
      if (Array.isArray(res.data.data.content)) {
        setDevices(res.data.data.content);
      } else {
        console.error("Fetched data is not an array:", res.data.data);
        setDevices([]);
      }
    } catch (err) {
      if (err.response) {
        setErrorMessage(`Error ${err.response.status}: ${err.response.data}`);
      } else {
        setErrorMessage('Search failed: ' + err.message);
      }
      console.error('Error fetching devices:', err);
    }
  };

  const handleDelete = async (deviceId) => {
    try {
      const token = getValidAccessTokenOrRedirect(navigate);
      if (!token) return;
      await axios.delete(`${config.API_BASE_URL}/api/devices/${deviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleSearch();
    } catch (err) {
      if (err.response) {
        setErrorMessage(`Error ${err.response.status}: ${err.response.data}`);
      } else {
        setErrorMessage('Search failed: ' + err.message);
      }
      console.error('Error deleting device:', err);
    }
  };

  const handleAddDevice = async () => {
    try {
      const token = getValidAccessTokenOrRedirect(navigate);
      if (!token) return;
      await axios.post(`${config.API_BASE_URL}/api/devices`, newDevice, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleSearch();
      setNewDevice({
        deviceName: '',
        deviceType: '',
        serialNumber: '',
        status: 'active'
      });
    } catch (err) {
      if (err.response) {
        setErrorMessage(`Error ${err.response.status}: ${err.response.data}`);
      } else {
        setErrorMessage('Search failed: ' + err.message);
      }
      console.error('Error adding device:', err);
    }
  };

  const handleEditClick = (device) => {
    setEditDeviceId(device.deviceId);
    setEditDeviceData({ ...device });
  };

  const handleEditChange = (field, value) => {
    setEditDeviceData({ ...editDeviceData, [field]: value });
  };

  const handleUpdateDevice = async () => {
    try {
      const token = getValidAccessTokenOrRedirect(navigate);
      if (!token) return;
      await axios.put(`${config.API_BASE_URL}/api/devices/${editDeviceId}`, editDeviceData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleSearch();
      setEditDeviceId(null);
    } catch (err) {
      if (err.response) {
        setErrorMessage(`Error ${err.response.status}: ${err.response.data}`);
      } else {
        setErrorMessage('Search failed: ' + err.message);
      }
      console.error('Error updating device:', err);
    }
  };

  const handleSearch = async () => {
    try {
      const token = getValidAccessTokenOrRedirect(navigate);
      if (!token) return;
      const response = await axios.get(`${config.API_BASE_URL}/api/devices`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          deviceName: searchTerm,
          page: 0,
          size: 10,
          sortBy: 'createDatetime',
          direction: 'desc'
        }
      });
      setDevices(response.data.data.content || []);
      setCurrentPage(1);
    } catch (err) {
      if (err.response) {
        setErrorMessage(`Error ${err.response.status}: ${err.response.data}`);
      } else {
        setErrorMessage('Search failed: ' + err.message);
      }
      console.error('Search failed:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditDeviceId(null);
    setEditDeviceData({});
  };

  const indexOfLastDevice = currentPage * devicesPerPage;
  const indexOfFirstDevice = indexOfLastDevice - devicesPerPage;
  const currentDevices = devices.slice(indexOfFirstDevice, indexOfLastDevice);

  const totalPages = Math.ceil(devices.length / devicesPerPage);

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial' }}>
      <h1>Device Management</h1>
	  {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}


      {/* Add Device Form */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
          <h2>Add New Device</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
            <input placeholder="Device Name" value={newDevice.deviceName} onChange={(e) => setNewDevice({ ...newDevice, deviceName: e.target.value })} />
            <input placeholder="Device Type" value={newDevice.deviceType} onChange={(e) => setNewDevice({ ...newDevice, deviceType: e.target.value })} />
            <input placeholder="Serial Number" value={newDevice.serialNumber} onChange={(e) => setNewDevice({ ...newDevice, serialNumber: e.target.value })} />
            <select value={newDevice.status} onChange={(e) => setNewDevice({ ...newDevice, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button onClick={handleAddDevice} style={{ padding: '8px', background: '#4CAF50', color: 'white', border: 'none' }}>Add Device</button>
          </div>
        </div>
      </div>

      {/* Search input and button */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by device name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', width: '250px', marginRight: '10px' }}
        />
        <button onClick={handleSearch} style={{ padding: '8px' }}>Search</button>
      </div>

      {/* Device Table */}
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '20px' }}>
        <thead style={{ backgroundColor: '#f0f0f0' }}>
          <tr>
            <th>ID</th>
            <th>Device Name</th>
            <th>Device Type</th>
            <th>Serial Number</th>
            <th>Status</th>
            <th>Create User</th>
            <th>Create Datetime</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentDevices.map((device) => (
            <tr key={device.deviceId}>
              <td>{device.deviceId}</td>
              {editDeviceId === device.deviceId ? (
                <>
                  <td><input value={editDeviceData.deviceName} onChange={(e) => handleEditChange('deviceName', e.target.value)} /></td>
                  <td><input value={editDeviceData.deviceType} onChange={(e) => handleEditChange('deviceType', e.target.value)} /></td>
                  <td><input value={editDeviceData.serialNumber} onChange={(e) => handleEditChange('serialNumber', e.target.value)} /></td>
                  <td>
                    <select value={editDeviceData.status} onChange={(e) => handleEditChange('status', e.target.value)}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td>{device.createUser}</td>
                  <td>{device.createDatetime}</td>
                  <td>
                    <button onClick={handleUpdateDevice}>Update</button>
                    <button onClick={handleCancelEdit}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{device.deviceName}</td>
                  <td>{device.deviceType}</td>
                  <td>{device.serialNumber}</td>
                  <td>{device.status}</td>
                  <td>{device.createUser}</td>
                  <td>{device.createDatetime}</td>
                  <td>
                    <button onClick={() => handleEditClick(device)}>Edit</button>
                    <button onClick={() => handleDelete(device.deviceId)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
      </div>
    </div>
  );
};

export default DeviceManagementPage;
