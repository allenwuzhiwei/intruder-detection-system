import React, { useState, useEffect } from 'react';
import { getValidAccessTokenOrRedirect } from "./auth";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Alert } from 'react-bootstrap';
import config from './config';

const VideoFeed = ({ serialNumber }) => {
  const navigate = useNavigate();
  const [streamURL, setStreamURL] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchVideoFeed = async () => {
      try {
        const token = getValidAccessTokenOrRedirect(navigate);
        if (!token) return;
        const response = await axios.get(`${config.API_BASE_URL}/api/devices/video`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;

        if (data.success) {
          setStreamURL(data.data.streamURL); // Set the stream URL from the response
        } else {
          setErrorMessage(data.message); // Handle failure response
        }
      } catch (err) {
        if (err.response) {
        setErrorMessage(`Error ${err.response.status}: ${err.response.data}`);
      } else {
        setErrorMessage('Search failed: ' + err.message);
      }
      } finally {
        setLoading(false); // Stop loading once the API request is finished
      }
    };

    fetchVideoFeed(); // Fetch video feed when serialNumber changes

  }, [serialNumber]); // Dependency array to refetch when serialNumber changes

  return (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      <h2>Live Video</h2>
      {loading && <p>Loading video feed...</p>}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {streamURL ? (
        <img
          src={streamURL}
          alt="Live MJPEG Stream"
          style={{
            width: '100%',
            maxWidth: '400px',
            border: '2px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        />
      ) : (
        !loading && <p>No video feed available.</p>
      )}
    </div>
  );
};

export default VideoFeed;
