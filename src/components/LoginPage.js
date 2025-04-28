import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style.css";
import config from './config';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

	
  // Helper to encode Basic Auth header
  const getBasicAuthHeader = (clientId, clientSecret) => {
    const credentials = btoa(`${clientId}:${clientSecret}`);
    return `Basic ${credentials}`;
  };
  /*const fetchAccessToken = async () => {
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("scope", "read");

    try {
      const response = await axios.post("http://54.198.170.28:9000/oauth2/token", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
		  Authorization: getBasicAuthHeader("client", "secret")
        },
      });

      const { data  } = response.data;
	  localStorage.setItem("accessToken", data);
      localStorage.setItem("tokenExpiry", Date.now() + 60 * 60 * 1000);
	  
      return data;
    } catch (error) {
      console.error("Failed to fetch access token", error);
      return null;
    }
  };*/

  const handleLogin = async () => {
    try {
	  
      /*const accessToken = await fetchAccessToken();
      if (!accessToken) {
        setErrorMessage("Failed to get access token.");
        return;
      } */

      const response = await axios.post(
        `${config.API_BASE_URL}/api/users/login`,
        {
          username,
          password,
        }
      );

      if (response.data.success) {
        const role = response.data.data;
		localStorage.setItem("accessToken", response.data.data);
		localStorage.setItem("tokenExpiry", Date.now() + 60 * 60 * 1000);

        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("role", role);
        sessionStorage.setItem("userName", username);
        onLogin(role, username);

        navigate("/alerts");
      } else {
        setErrorMessage("Invalid credentials");
      }
    } catch (error) {
      setErrorMessage("Login failed");
      console.error("Login error", error);
    }
  };

  return (
    <div className="login-container">
      <h2>Intruder Detection Smart System Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default LoginPage;
