// API Client for making HTTP requests
import { API_CONFIG, API_RESPONSE_TYPES, HTTP_STATUS } from '../config/api';
import store from '../store/store';
import tokenManager from './tokenManager';

class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
  }

  // Get headers for API requests
  getHeaders(includeAuth = true, includeContentType = true) {
    const headers = {
      'Accept': 'application/json',
    };

    // Add Content-Type only if requested (not for FormData)
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    // Add authorization header if token exists
    if (includeAuth) {
      const token = this.getStoredToken();
      console.log('🔐 ApiClient - Getting headers, token available:', !!token);
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 ApiClient - Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
      } else {
        console.log('⚠️ ApiClient - No token available for authorization');
      }
    }
    return headers;
  }

  // Get stored authentication token
  getStoredToken() {
    try {
      let token = tokenManager.getToken();
      
      // Fallback: if token manager doesn't have token, try to get from Redux store
      if (!token) {
        try {
          const state = store.getState();
          token = state.auth?.token || null;
          if (token) {
            tokenManager.setToken(token); // Sync with token manager
          }
        } catch (reduxError) {
          console.warn('Could not access Redux store:', reduxError);
        }
      }
      return token;
    } catch (error) {
      console.warn('Could not access stored token:', error);
      return null;
    }
  }

  // Store authentication token
  setStoredToken(token) {
    try {
      tokenManager.setToken(token);
    } catch (error) {
      console.warn('Could not store token:', error);
    }
  }

  // Make HTTP request with retry logic
  async makeRequest(url, options = {}, retryCount = 0) {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    // Check if this is a FormData request
    const isFormData = options.body && options.body instanceof FormData;
    
    const defaultOptions = {
      method: 'GET',
      headers: this.getHeaders(true, !isFormData), // includeAuth=true, includeContentType=!isFormData
      timeout: this.timeout,
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    console.log('🌐 ApiClient - Making request to:', fullUrl);
    console.log('🌐 ApiClient - Request method:', requestOptions.method);
    console.log('🌐 ApiClient - Is FormData request:', isFormData);
    console.log('🌐 ApiClient - Request headers:', requestOptions.headers);
    console.log('🌐 ApiClient - Request body type:', typeof requestOptions.body);

    try {

      // Add timeout handling for React Native
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(fullUrl, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle successful responses
      if (response.ok) {
        return {
          type: API_RESPONSE_TYPES.SUCCESS,
          status: response.status,
          data,
          message: data.message || 'Request successful',
        };
      }

      // Handle error responses
      return this.handleErrorResponse(response, data, fullUrl, requestOptions, retryCount);

    } catch (error) {
      return this.handleNetworkError(error, fullUrl, requestOptions, retryCount);
    }
  }

  // Handle error responses from server
  async handleErrorResponse(response, data, url, options, retryCount) {
    const errorResponse = {
      type: API_RESPONSE_TYPES.ERROR,
      status: response.status,
      data,
      message: data?.message || 'Request failed',
      url,
    };

    // Handle specific error cases
    switch (response.status) {
      case HTTP_STATUS.UNAUTHORIZED:
        // Clear stored token on unauthorized
        this.setStoredToken(null);
        errorResponse.message = 'Authentication required';
        break;
      case HTTP_STATUS.FORBIDDEN:
        errorResponse.message = 'Access denied';
        break;
      case HTTP_STATUS.NOT_FOUND:
        errorResponse.message = 'Resource not found';
        break;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        errorResponse.message = 'Server error occurred';
        break;
      default:
        errorResponse.message = data?.message || `Request failed with status ${response.status}`;
    }

    // Retry logic for server errors
    if (this.shouldRetry(response.status, retryCount)) {
      return this.retryRequest(url, options, retryCount);
    }

    return errorResponse;
  }

  // Handle network errors
  async handleNetworkError(error, url, options, retryCount) {
    let errorMessage = 'Network error occurred';
    let errorType = API_RESPONSE_TYPES.NETWORK_ERROR;
    
    // Provide more specific error messages
    if (error.message === 'Network request failed') {
      errorMessage = 'Cannot connect to server. Please check your internet connection and server status.';
      console.log('🔍 Network Debug Info:');
      console.log('  - URL:', url);
      console.log('  - Method:', options.method || 'GET');
      console.log('  - Headers:', options.headers);
      console.log('  - Error:', error.message);
      console.log('  - Check if server is running on:', url);
    } else if (error.name === 'AbortError') {
      errorMessage = 'Request timed out. Please try again.';
      errorType = API_RESPONSE_TYPES.ERROR;
    } else if (error.message.includes('fetch')) {
      errorMessage = 'Network connection failed. Please check your internet connection.';
    } else if (error.message.includes('CORS')) {
      errorMessage = 'CORS error. Please check server CORS configuration.';
      errorType = API_RESPONSE_TYPES.ERROR;
    }

    const errorResponse = {
      type: errorType,
      status: 0,
      data: null,
      message: errorMessage,
      url,
      error: error.message,
    };

    // Retry logic for network errors
    if (this.shouldRetry(0, retryCount)) {
      return this.retryRequest(url, options, retryCount);
    }

    return errorResponse;
  }

  // Determine if request should be retried
  shouldRetry(status, retryCount) {
    if (retryCount >= this.retryAttempts) {
      return false;
    }

    // Retry on network errors or server errors
    return status === 0 || status >= 500;
  }

  // Retry request with exponential backoff
  async retryRequest(url, options, retryCount) {
    const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return this.makeRequest(url, options, retryCount + 1);
  }

  // HTTP Methods
  async get(url, options = {}) {
    return this.makeRequest(url, { ...options, method: 'GET' });
  }

  async post(url, data, options = {}) {
    return this.makeRequest(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(url, data, options = {}) {
    return this.makeRequest(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(url, data, options = {}) {
    return this.makeRequest(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(url, options = {}) {
    return this.makeRequest(url, { ...options, method: 'DELETE' });
  }

  // Upload file
  async upload(url, formData, options = {}) {
    console.log('📤 ApiClient - Upload request with FormData');
    console.log('📤 ApiClient - FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    return this.makeRequest(url, {
      ...options,
      method: 'POST',
      body: formData,
    });
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;
