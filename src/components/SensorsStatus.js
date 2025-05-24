import React, { useEffect, useState, useRef } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

const Dashboard = () => {	

  const [data, setData] = useState({
    pir: false,
    camera: false,
    buzzer: false,
    led: false,
    ultrasonic: 0,
    timestamps: {
      pir: '',
      camera: '',
      buzzer: '',
      led: '',
      ultrasonic: ''
    }
  });

  const socketRef = useRef(null);
  const timeoutRef = useRef({
    buzzer: null,
    led: null,
    pir: null,
    camera: null,
    ultrasonic: null
  });

  useEffect(() => {
    const socket = new ReconnectingWebSocket('wss://54.198.170.28:6789');
    socketRef.current = socket;

    socket.onmessage = (message) => {
      let rawData = message.data;

      // Fix single-quote JSON
      if (rawData.includes("'")) {
        rawData = rawData.replace(/'/g, '"');
      }

      let sensorData;
      try {
        sensorData = JSON.parse(rawData);
      } catch (err) {
        console.error("Failed to parse message:", message.data, err);
        return;
      }

      const newTimestamps = {};

      ['pir', 'camera', 'buzzer', 'led', 'ultrasonic'].forEach((key) => {
        if (sensorData[key] !== undefined) {
          newTimestamps[key] = sensorData.timestamp || new Date().toISOString();

          clearTimeout(timeoutRef.current[key]);
          timeoutRef.current[key] = setTimeout(() => {
            setData(prev => ({
              ...prev,
              [key]: key === 'ultrasonic' ? 0 : false
            }));
          }, 10000);
        }
      });

      setData(prev => ({
        ...prev,
        ...sensorData,
        timestamps: {
          ...prev.timestamps,
          ...newTimestamps
        }
      }));
    };

    return () => socket.close();
  }, []);

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const sendTestEvent = () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not open.');
      return;
    }

    const sensorEvents = [
      { pir: true },
      { camera: true, ultrasonic: Math.floor(Math.random() * 100) },
      { buzzer: true, led: true }
    ];

    sensorEvents.forEach((eventObj, index) => {
      setTimeout(() => {
        const timestamp = new Date().toISOString();
        const payload = { ...eventObj, timestamp };
        socketRef.current.send(JSON.stringify(payload));

        const updatedTimestamps = {};
        for (const key in eventObj) {
          updatedTimestamps[key] = timestamp;

          clearTimeout(timeoutRef.current[key]);
          timeoutRef.current[key] = setTimeout(() => {
            setData(prev => ({
              ...prev,
              [key]: key === 'ultrasonic' ? 0 : false
            }));
          }, 5000);
        }

        setData(prev => ({
          ...prev,
          ...eventObj,
          timestamps: {
            ...prev.timestamps,
            ...updatedTimestamps
          }
        }));
      }, index * 1000);
    });
  };

  return (
    <div style={{
      fontFamily: 'Segoe UI, sans-serif',
      backgroundColor: '#e8edf1',
      minHeight: '100vh',
      padding: '40px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '700px'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '30px',
          color: '#222',
          fontSize: '26px'
        }}>
          Intruder Detection Dashboard (Real-Time)
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',  // First row is 1 column, second and third rows are two columns
          gap: '20px',
          marginBottom: '30px'
        }}>
          <SensorCard label="PIR Sensor" value={data.pir ? 'Motion Detected' : 'No Motion'} timestamp={formatTimestamp(data.timestamps.pir)} active={data.pir} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <SensorCard label="Camera" value={data.camera ? 'Recording' : 'Idle'} timestamp={formatTimestamp(data.timestamps.camera)} active={data.camera} />
            <SensorCard label="Ultrasonic Sensor" value={`${data.ultrasonic} cm`} timestamp={formatTimestamp(data.timestamps.ultrasonic)} active={data.ultrasonic > 0} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <SensorCard label="Buzzer" value={data.buzzer ? 'On' : 'Off'} timestamp={formatTimestamp(data.timestamps.buzzer)} active={data.buzzer} />
            <SensorCard label="LED" value={data.led ? 'On' : 'Off'} timestamp={formatTimestamp(data.timestamps.led)} active={data.led} />
          </div>
        </div>

      </div>
    </div>
  );
};

const SensorCard = ({ label, value, timestamp, active }) => (
  <div style={{
    backgroundColor: active ? '#d9f8d9' : '#f7f9fb',
    padding: '18px',
    borderRadius: '10px',
    border: '1px solid #dce3ea',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    minHeight: '90px',
    transition: 'background-color 0.4s ease'
  }}>
    <strong style={{ display: 'block', marginBottom: '6px', color: '#555' }}>{label}</strong>
    <span style={{ fontSize: '16px', color: '#222' }}>{value}</span>
    {timestamp && (
      <div style={{ fontSize: '12px', color: '#777', marginTop: '6px' }}>
        Last updated: {timestamp}
      </div>
    )}
  </div>
);

export default Dashboard;
