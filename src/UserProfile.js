import React from 'react';

const UserProfile = ({ user }) => {
  return (
    <div className="container mt-5">
      <h2>User Profile</h2>
      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title">User Details</h5>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>

          {/* Role-based content */}
          {user.role === 'Admin' && (
            <div className="alert alert-success mt-3">
              <strong>Welcome, Admin!</strong> You have full access.
            </div>
          )}

          {user.role === 'User' && (
            <div className="alert alert-info mt-3">
              <strong>Welcome, User!</strong> Limited access.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;