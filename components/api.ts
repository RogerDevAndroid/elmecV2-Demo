import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  config => {
    // Add any default headers or auth tokens here
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error');
    }

    return Promise.reject(error);
  }
);

export default api;
