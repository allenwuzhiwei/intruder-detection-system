import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getValidAccessTokenOrRedirect } from './auth';
import config from './config';

const WebcamCapture = () => {
  const webcamRef = useRef(null);
  const [status, setStatus] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const navigate = useNavigate();

  const captureAndSend = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const blob = await (await fetch(imageSrc)).blob();

    const formData = new FormData();
    formData.append('file', blob, 'face.jpg');

    try {
      setStatus(' Uploading...');
      const token = getValidAccessTokenOrRedirect(navigate);
      if (!token) return;

      const response = await axios.post(`${config.API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setStatus(' Uploaded successfully!');
      setImageUrl(response.data.url);
    } catch (error) {
      console.error(error);
      setStatus(' Upload failed');
    }
  };

  return (
    <div style={{
      fontFamily: 'Segoe UI, sans-serif',
      backgroundColor: '#f5f7fa',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '520px',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '16px', color: '#333', fontSize: '20px' }}>
           Face Capture & Upload
        </h2>

        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          style={{
            width: '100%',
            maxWidth: '100%',
            borderRadius: '8px',
            border: '1px solid #ccc'
          }}
        />

        <button
          onClick={captureAndSend}
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
           Capture & Upload
        </button>

        <p style={{ marginTop: '12px', color: '#555', minHeight: '24px' }}>{status}</p>

        {imageUrl && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ color: '#333' }}> Uploaded Image:</p>
            <img
              src={imageUrl}
              alt="Uploaded face"
              style={{
                width: '100%',
                maxWidth: '100%',
                borderRadius: '8px',
                border: '1px solid #ccc',
                marginTop: '10px'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
