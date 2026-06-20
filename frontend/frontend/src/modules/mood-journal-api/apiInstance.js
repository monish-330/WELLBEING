import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;