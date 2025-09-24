// Mess Management Redux Slice
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messList: [],
  currentMess: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  },
  searchTerm: '',
  sortBy: 'createdAt,desc',
};

const messSlice = createSlice({
  name: "mess",
  initialState,
  reducers: {
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
    
    // Set mess list
    setMessList: (state, action) => {
      const { content, totalPages, totalElements, number, size } = action.payload;
      state.messList = content || action.payload;
      state.pagination = {
        page: number || 0,
        size: size || 10,
        totalPages: totalPages || 0,
        totalElements: totalElements || 0,
      };
      state.isLoading = false;
      state.error = null;
    },
    
    // Add mess to list
    addMess: (state, action) => {
      state.messList.unshift(action.payload);
      state.pagination.totalElements += 1;
    },
    
    // Update mess in list
    // updateMess: (state, action) => {
    //   const index = state.messList.findIndex(mess => mess.id === action.payload.id);
    //   if (index !== -1) {
    //     state.messList[index] = action.payload;
    //   }
    // },
    
    // Remove mess from list
    removeMess: (state, action) => {
      state.messList = state.messList.filter(mess => mess.id !== action.payload);
      state.pagination.totalElements -= 1;
    },
    
    // Set current mess
    setCurrentMess: (state, action) => {
      state.currentMess = action.payload;
    },
    
    // Clear current mess
    clearCurrentMess: (state) => {
      state.currentMess = null;
    },
    
    // Set search term
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    
    // Set sort by
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    
    // Set pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Reset mess state
    resetMessState: (state) => {
      state.messList = [];
      state.currentMess = null;
      state.isLoading = false;
      state.error = null;
      state.pagination = {
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0,
      };
      state.searchTerm = '';
      state.sortBy = 'createdAt,desc';
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setMessList,
  addMess,
  // updateMess,
  removeMess,
  setCurrentMess,
  clearCurrentMess,
  setSearchTerm,
  setSortBy,
  setPagination,
  resetMessState,
} = messSlice.actions;

export default messSlice.reducer;
