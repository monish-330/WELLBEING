const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "https://wellbeing-backend-764z.onrender.com";
  }
  return "";
};

export const API_BASE_URL = getApiBaseUrl();

const buildHeaders = (headers = {}) => {
  const token = localStorage.getItem("authToken");
  const nextHeaders = { ...headers };

  if (token) {
    nextHeaders.Authorization = `Bearer ${token}`;
  }

  return nextHeaders;
};

export const apiFetch = (path, options = {}) => {
  const { headers, ...rest } = options;

  return fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: buildHeaders(headers)
  });
};

export const apiJson = async (path, options = {}) => {
  const response = await apiFetch(path, options);
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};
