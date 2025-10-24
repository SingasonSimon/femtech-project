import axios from 'axios';

// A "holder" for the logout function.
// AuthContext will "inject" its logout function here.
let globalLogoutHandler = () => {
  console.error('Logout handler has not been set up in api.js');
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Token Refresh Logic with Race Condition Handling ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // --- START OF FIX ---
    // The previous condition didn't exclude /auth/login. This one does.
    // It now ignores ALL /auth/ routes from the refresh logic.
    if (error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url.includes('/auth/')) {
    // --- END OF FIX ---
      
      if (isRefreshing) {
        // If already refreshing, wait for it to finish
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
           return api(originalRequest);
        }).catch((err) => {
           return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        
        // Refresh success: process queue and retry original request
        processQueue(null);
        isRefreshing = false;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed: process queue with error and call global logout
        processQueue(refreshError);
        isRefreshing = false;
        
        console.log('Token refresh failed. Logging out.');
        globalLogoutHandler(); // Call the injected logout function
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Request interceptor (no change)
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// This function allows AuthContext to "inject" its logout function
export const setupApiLogoutHandler = (logoutHandler) => {
  globalLogoutHandler = logoutHandler;
};
