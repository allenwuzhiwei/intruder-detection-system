import React, { useState, useEffect } from 'react';

const IntruderAlert = () => {
  const [alertMessage, setAlertMessage] = useState(null);

  // Simulate detecting an intruder
  useEffect(() => {
    setTimeout(() => {
      setAlertMessage("Intruder detected! Alert!");
    }, 3000); // Trigger alert after 3 seconds (simulated)
  }, []);

  // If no alert, return nothing
  if (!alertMessage) {
    return null;
  }

  return (
    <div className="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>{alertMessage}</strong>
      <button type="button" className="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  );
};

export default IntruderAlert;