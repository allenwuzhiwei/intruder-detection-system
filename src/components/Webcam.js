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
      setStatus('Uploading...');
      const token = getValidAccessTokenOrRedirect(navigate);
      if (!token) return;
      const response = await axios.post(`${config.API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setStatus('Uploaded successfully!');
      setImageUrl(response.data.url);
    } catch (error) {
      console.error(error);
      setStatus('Upload failed');
    }
  };

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={350}
      />
      <button onClick={captureAndSend}>Capture & Upload</button>
      <p>{status}</p>
      {imageUrl && (
        <div>
          <p>Uploaded Image:</p>
          <img src={imageUrl} alt="Uploaded face" style={{ width: '350px', border: '1px solid #ccc' }} />
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
