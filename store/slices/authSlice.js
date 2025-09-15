// src/store/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  role: null,
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Login action
    login: (state, action) => {
      console.log('AuthSlice - Login action received:', action.payload);
      const { role, user, token, refreshToken } = action.payload;
      
      state.isAuthenticated = true;
      state.role = role;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isLoading = false;
      state.error = null;
      
      console.log('AuthSlice - State updated:', { 
        isAuthenticated: state.isAuthenticated, 
        role: state.role, 
        user: state.user,
        hasToken: !!state.token
      });
    },
    
    // Logout action
    logout: (state) => {
      state.isAuthenticated = false;
      state.role = null;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isLoading = false;
      state.error = null;
    },
    
    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Update user profile
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    // Refresh token
    refreshToken: (state, action) => {
      const { token, refreshToken } = action.payload;
      state.token = token;
      state.refreshToken = refreshToken;
    },
    
    // Initialize auth state (for app startup)
    initializeAuth: (state, action) => {
      const { user, role, token, refreshToken } = action.payload;
      if (token && user && role) {
        state.isAuthenticated = true;
        state.user = user;
        state.role = role;
        state.token = token;
        state.refreshToken = refreshToken;
      }
    },
  },
});

export const { 
  login, 
  logout, 
  setLoading, 
  setError, 
  clearError, 
  updateUser, 
  refreshToken, 
  initializeAuth 
} = authSlice.actions;

export default authSlice.reducer;
