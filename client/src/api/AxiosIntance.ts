import axios from "axios";

/**
 * Pre-configured Axios instance for API requests.
 */
const AxiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Request Interceptor: Attach the token to every request
AxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const clientToken = localStorage.getItem("client_token");
    
    // Logic to prevent Admin/Client token collision
    const isClientPortal = window.location.pathname.includes("/portal") || window.location.pathname.includes("/user/login");
    
    // If in client portal, prioritize clientToken. Otherwise, prioritize admin token.
    const activeToken = isClientPortal ? (clientToken || token) : (token || clientToken);

    if (activeToken) {
      config.headers.Authorization = `Bearer ${activeToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally (e.g., 401 Unauthorized)
AxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto-logout if the token is expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("client_token");
      localStorage.removeItem("client_user");
      
      // Determine where to redirect
      const isClientPath = window.location.pathname.includes("/portal");
      
      if (isClientPath && !window.location.pathname.includes("/user/login")) {
        window.location.href = "/user/login";
      } else if (!isClientPath && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default AxiosInstance;
