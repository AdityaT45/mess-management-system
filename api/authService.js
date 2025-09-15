// Authentication Service - Real API Integration
import { API_CONFIG, API_RESPONSE_TYPES } from '../config/api';
import store from '../store/store';
import apiClient from './apiClient';
import tokenManager from './tokenManager';

class AuthService {
  constructor() {
    // Listen for token changes and sync with Redux
    tokenManager.addListener((token) => {
      if (token) {
        store.dispatch({
          type: 'auth/refreshToken',
          payload: { token, refreshToken: null }
        });
      } else {
        store.dispatch({
          type: 'auth/logout'
        });
      }
    });
  }

  // Login user with email and password
  async login(credentials) {
    try {
      const { email, password } = credentials;
      
      // Validate input
      if (!email || !password) {
        return {
          type: API_RESPONSE_TYPES.ERROR,
          message: 'Email and password are required',
          data: null,
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          type: API_RESPONSE_TYPES.ERROR,
          message: 'Please enter a valid email address',
          data: null,
        };
      }

      // Make API request
      
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      // Handle successful login
      if (response.type === API_RESPONSE_TYPES.SUCCESS) {
        const { data } = response;
        
        // Extract token from your API response format
        const token = data['bearer token'] || data.token;
        const username = data.username;
        const roleData = data.role;
        
        // Store token if provided
        if (token) {
          tokenManager.setToken(token);
        }

        // Extract role from your API response format
        let userRole = null;
        if (roleData && Array.isArray(roleData) && roleData.length > 0) {
          userRole = roleData[0].authority; // Extract from "ROLE_SUPER_ADMIN" format
        }

        // Return user data with normalized role
        return {
          type: API_RESPONSE_TYPES.SUCCESS,
          message: 'Login successful',
          data: {
            user: {
              id: username, // Using username as ID
              email: username,
              name: username.split('@')[0], // Extract name from email
              role: this.normalizeRole(userRole),
            },
            token: token,
            refreshToken: null, // Your API doesn't seem to provide refresh token
          },
        };
      }

      // Handle login failure
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: response.message || 'Login failed',
        data: null,
      };

    } catch (error) {
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'An unexpected error occurred during login',
        data: null,
      };
    }
  }

  // Logout user
  async logout() {
    try {
      // Call logout endpoint if available
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
      
      // Clear stored token regardless of API response
      tokenManager.clearToken();
      
      return {
        type: API_RESPONSE_TYPES.SUCCESS,
        message: 'Logout successful',
        data: null,
      };
    } catch (error) {
      // Clear token even if API call fails
      tokenManager.clearToken();
      
      return {
        type: API_RESPONSE_TYPES.SUCCESS,
        message: 'Logout successful',
        data: null,
      };
    }
  }

  // Refresh authentication token
  async refreshToken() {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH);
      
      if (response.type === API_RESPONSE_TYPES.SUCCESS) {
        const { data } = response;
        
        if (data.token) {
          tokenManager.setToken(data.token);
        }
        
        return {
          type: API_RESPONSE_TYPES.SUCCESS,
          message: 'Token refreshed successfully',
          data: {
            token: data.token,
            refreshToken: data.refreshToken,
          },
        };
      }
      
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: response.message || 'Token refresh failed',
        data: null,
      };
    } catch (error) {
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Token refresh failed',
        data: null,
      };
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      if (!email) {
        return {
          type: API_RESPONSE_TYPES.ERROR,
          message: 'Email is required',
          data: null,
        };
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email,
      });

      return {
        type: response.type,
        message: response.message,
        data: response.data,
      };
    } catch (error) {
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to send reset email',
        data: null,
      };
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      if (!token || !newPassword) {
        return {
          type: API_RESPONSE_TYPES.ERROR,
          message: 'Token and new password are required',
          data: null,
        };
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password: newPassword,
      });

      return {
        type: response.type,
        message: response.message,
        data: response.data,
      };
    } catch (error) {
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to reset password',
        data: null,
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = tokenManager.getToken();
    return !!token;
  }

  // Get current user token
  getToken() {
    return tokenManager.getToken();
  }

  // Normalize role from API response to app format
  normalizeRole(apiRole) {
    if (!apiRole) return null;
    
    // Map API roles to app roles
    const roleMapping = {
      'ROLE_SUPER_ADMIN': 'superadmin',
      'ROLE_ADMIN': 'admin',
      'ROLE_USER': 'user',
      'SUPER_ADMIN': 'superadmin',
      'ADMIN': 'admin',
      'USER': 'user',
    };
    
    return roleMapping[apiRole] || apiRole.toLowerCase();
  }

  // Validate user credentials locally (for testing)
  validateCredentials(email, password) {
    const testUsers = [
      {
        email: "super@gmail.com",
        password: "1234",
        role: "ROLE_SUPER_ADMIN"
      },
      {
        email: "admin@gmail.com",
        password: "1234",
        role: "ROLE_ADMIN"
      },
      {
        email: "user@gmail.com",
        password: "1234",
        role: "ROLE_USER"
      }
    ];

    return testUsers.find(user => 
      user.email === email && 
      user.password === password
    );
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;