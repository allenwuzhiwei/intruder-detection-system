export const getValidAccessTokenOrRedirect = (navigate) => {
  const token = localStorage.getItem("accessToken");
  const tokenExpiry = parseInt(localStorage.getItem("tokenExpiry") || "0", 10);

  if (!token || Date.now() >= tokenExpiry) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("tokenExpiry");
    
    return null;
  }

  return token;
};