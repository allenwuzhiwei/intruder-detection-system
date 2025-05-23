import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getValidAccessTokenOrRedirect } from './auth';
import { Alert } from 'react-bootstrap'; // Importing Alert component
import config from './config';

const RolePermissionManager = () => {
  const [roleList, setRoleList] = useState([]);
  const [permissionList, setPermissionList] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [assignedPermissionIds, setAssignedPermissionIds] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const fetchRoles = async () => {
    try {
      const token = getValidAccessTokenOrRedirect(navigate);
      if (!token) return;
      const res = await axios.get(`${config.API_BASE_URL}/api/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (Array.isArray(res.data.data)) {
        setRoleList(res.data.data);
        setErrorMessage(''); // Reset error message on success
      } else {
        setErrorMessage('Invalid response format for roles');
        setRoleList([]);
      }
    } catch (err) {
      if (err.response) {
        setErrorMessage(`Error ${err.response.status}: ${err.response.data}`);
      } else {
        setErrorMessage('Search failed: ' + err.message);
      }
      console.error('Error fetching roles:', err);
    }
  };

  const fetchPermissions = async () => {
    try {
      const token = getValidAccessTokenOrRedirect(navigate);
      if (!token) return;
      const res = await axios.get(`${config.API_BASE_URL}/api/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (Array.isArray(res.data.data)) {
        setPermissionList(res.data.data);
        setErrorMessage(''); // Reset error message on success
      } else {
        setErrorMessage('Invalid response format for permissions');
        setPermissionList([]);
      }
    } catch (err) {
      if (err.response) {
        setErrorMessage(`Error ${err.response.status}: ${err.response.data}`);
      } else {
        setErrorMessage('Search failed: ' + err.message);
      }
      console.error('Error fetching permissions:', err);
    }
  };

  const fetchRolePermissions = async (roleId) => {
    try {
      const token = getValidAccessTokenOrRedirect(navigate);
      if (!token) return;
      const res = await axios.get(`${config.API_BASE_URL}/api/permissions/role/${roleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const permissionIds = Array.isArray(res.data.data)
        ? res.data.data.map(p => p.permissionId)
        : [];
      setAssignedPermissionIds(permissionIds);
      setErrorMessage(''); // Reset error message on success
    } catch (err) {
      if (err.response) {
        setErrorMessage(`Error ${err.response.status}: ${err.response.data}`);
      } else {
        setErrorMessage('Search failed: ' + err.message);
      }
      console.error(`Error fetching permissions for role ${roleId}:`, err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      fetchRolePermissions(selectedRoleId);
    }
  }, [selectedRoleId]);

  const togglePermission = (permissionId) => {
    setAssignedPermissionIds(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const savePermissions = async () => {
    try {
      const token = getValidAccessTokenOrRedirect(navigate);
      if (!token) return;
      await axios.post(
        'http://localhost:8080/api/role-permissions',
        {
          roleId: selectedRoleId,
          permissionIds: assignedPermissionIds,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setErrorMessage(''); // Reset error message on success
      alert('Permissions updated!');
    } catch (err) {
      if (err.response) {
        setErrorMessage(`Error ${err.response.status}: ${err.response.data}`);
      } else {
        setErrorMessage('Search failed: ' + err.message);
      }
      console.error('Error saving permissions:', err);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Assign Permissions to Roles</h2>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <label className="block mb-2">Select Role:</label>
      <select
        className="border p-2 mb-4 w-full"
        value={selectedRoleId}
        onChange={e => setSelectedRoleId(e.target.value)}
      >
        <option value="">-- Select Role --</option>
        {roleList.map(role => (
          <option key={role.roleId} value={role.roleId}>
            {role.roleName}
          </option>
        ))}
      </select>

      {selectedRoleId && (
        <>
          <h3 className="text-xl mb-2">Permissions</h3>
          <div className="border p-4 rounded bg-gray-50 max-h-60 overflow-y-auto">
            {permissionList.map(permission => (
              <div key={permission.permissionId} className="mb-2">
                <label>
                  <input
                    type="checkbox"
                    checked={assignedPermissionIds.includes(permission.permissionId)}
                    onChange={() => togglePermission(permission.permissionId)}
                  />
                  <span className="ml-2">{permission.description}</span>
                </label>
              </div>
            ))}
          </div>
          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={savePermissions}
          >
            Save Permissions
          </button>
        </>
      )}
    </div>
  );
};

export default RolePermissionManager;
