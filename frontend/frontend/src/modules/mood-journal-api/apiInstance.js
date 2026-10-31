import axios from "axios";

const baseURL = `${import.meta.env.VITE_API_BASE_URL || ""}/api`;

const API = axios.create({
  baseURL,
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;