/**
 * API utility functions for making authenticated requests
 */

/**
 * Get the correct API URL for the given path
 * Handles development (localhost:3000 -> localhost:3002) and production URLs
 */
export const getApiUrl = (path) => {
  // In production, use environment variable for backend URL
  if (process.env.REACT_APP_API_URL) {
    return `${process.env.REACT_APP_API_URL}${path}`;
  }
  
  // In dev, the React dev server runs on port 3000, but our API is on port 3002.
  // Detect that case and route API calls to the backend on localhost:3002.
  if (typeof window !== 'undefined' && path.startsWith('/api')) {
    const host = window.location.hostname;
    const port = window.location.port;
    if ((host === 'localhost' || host === '127.0.0.1') && port === '3000') {
      return `http://localhost:3002${path}`;
    }
  }
  
  // Otherwise use the path as-is (proxy will handle it)
  return path;
};

/**
 * Make an authenticated API request
 * @param {string} path - API path (e.g., '/api/logs/templates')
 * @param {string} token - JWT token for authentication
 * @param {object} options - Fetch options (method, body, etc.)
 */
export const apiRequest = async (path, token, options = {}) => {
  const url = getApiUrl(path);
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || data.msg || `HTTP ${response.status}`);
  }
  
  return data;
};
