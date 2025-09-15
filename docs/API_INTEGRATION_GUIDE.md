# API Integration Guide

This guide explains how to integrate and handle APIs in your Mess Management System project.

## Overview

The project now includes a comprehensive API integration system with:
- Centralized API configuration
- Reusable API client with error handling and retry logic
- Service layer for different API endpoints
- Redux integration for state management

## Project Structure

```
api/
├── apiClient.js          # Main API client with HTTP methods
├── authService.js        # Authentication service
├── customerService.js    # Customer management service
└── messService.js        # Mess management service

config/
└── api.js               # API configuration and endpoints

store/slices/
└── authSlice.js         # Redux slice for authentication state
```

## How to Add New APIs

### 1. Add Endpoint to Configuration

First, add your new endpoint to `config/api.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  ENDPOINTS: {
    // ... existing endpoints
    NEW_FEATURE: {
      LIST: '/new-feature/list',
      CREATE: '/new-feature/create',
      UPDATE: '/new-feature/update',
      DELETE: '/new-feature/delete',
    }
  }
};
```

### 2. Create a Service

Create a new service file in the `api/` directory:

```javascript
// api/newFeatureService.js
import apiClient from './apiClient';
import { API_CONFIG, API_RESPONSE_TYPES } from '../config/api';

class NewFeatureService {
  // Get all items
  async getAll() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.NEW_FEATURE.LIST);
      return response;
    } catch (error) {
      console.error('NewFeatureService - Get all error:', error);
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to fetch items',
        data: null,
      };
    }
  }

  // Create new item
  async create(itemData) {
    try {
      // Validate input
      if (!itemData.name) {
        return {
          type: API_RESPONSE_TYPES.ERROR,
          message: 'Name is required',
          data: null,
        };
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.NEW_FEATURE.CREATE, 
        itemData
      );
      return response;
    } catch (error) {
      console.error('NewFeatureService - Create error:', error);
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to create item',
        data: null,
      };
    }
  }

  // Update item
  async update(id, itemData) {
    try {
      const response = await apiClient.put(
        `${API_CONFIG.ENDPOINTS.NEW_FEATURE.UPDATE}/${id}`, 
        itemData
      );
      return response;
    } catch (error) {
      console.error('NewFeatureService - Update error:', error);
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to update item',
        data: null,
      };
    }
  }

  // Delete item
  async delete(id) {
    try {
      const response = await apiClient.delete(
        `${API_CONFIG.ENDPOINTS.NEW_FEATURE.DELETE}/${id}`
      );
      return response;
    } catch (error) {
      console.error('NewFeatureService - Delete error:', error);
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to delete item',
        data: null,
      };
    }
  }
}

const newFeatureService = new NewFeatureService();
export default newFeatureService;
```

### 3. Create Redux Slice (if needed)

If you need to manage state for your new feature, create a Redux slice:

```javascript
// store/slices/newFeatureSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  isLoading: false,
  error: null,
  selectedItem: null,
};

const newFeatureSlice = createSlice({
  name: "newFeature",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setItems: (state, action) => {
      state.items = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    updateItem: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setItems,
  addItem,
  updateItem,
  removeItem,
  setSelectedItem,
} = newFeatureSlice.actions;

export default newFeatureSlice.reducer;
```

### 4. Use in Components

Here's how to use your new service in a React component:

```javascript
// screens/NewFeatureScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import newFeatureService from '../api/newFeatureService';
import { setItems, setLoading, setError } from '../store/slices/newFeatureSlice';

export default function NewFeatureScreen() {
  const dispatch = useDispatch();
  const { items, isLoading, error } = useSelector(state => state.newFeature);
  const [refreshing, setRefreshing] = useState(false);

  // Load items on component mount
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    dispatch(setLoading(true));
    
    try {
      const response = await newFeatureService.getAll();
      
      if (response.type === 'success') {
        dispatch(setItems(response.data));
      } else {
        dispatch(setError(response.message));
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      dispatch(setError('Failed to load items'));
      Alert.alert('Error', 'Failed to load items');
    }
  };

  const handleCreate = async (itemData) => {
    dispatch(setLoading(true));
    
    try {
      const response = await newFeatureService.create(itemData);
      
      if (response.type === 'success') {
        // Refresh the list
        loadItems();
        Alert.alert('Success', 'Item created successfully');
      } else {
        dispatch(setError(response.message));
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      dispatch(setError('Failed to create item'));
      Alert.alert('Error', 'Failed to create item');
    }
  };

  const handleUpdate = async (id, itemData) => {
    dispatch(setLoading(true));
    
    try {
      const response = await newFeatureService.update(id, itemData);
      
      if (response.type === 'success') {
        // Refresh the list
        loadItems();
        Alert.alert('Success', 'Item updated successfully');
      } else {
        dispatch(setError(response.message));
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      dispatch(setError('Failed to update item'));
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            dispatch(setLoading(true));
            
            try {
              const response = await newFeatureService.delete(id);
              
              if (response.type === 'success') {
                // Refresh the list
                loadItems();
                Alert.alert('Success', 'Item deleted successfully');
              } else {
                dispatch(setError(response.message));
                Alert.alert('Error', response.message);
              }
            } catch (error) {
              dispatch(setError('Failed to delete item'));
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Your component UI here */}
      <Text>New Feature Screen</Text>
      {/* Render items, forms, etc. */}
    </View>
  );
}
```

## API Response Handling

All API responses follow a consistent format:

```javascript
// Success Response
{
  type: 'success',
  status: 200,
  data: { /* your data */ },
  message: 'Operation successful'
}

// Error Response
{
  type: 'error',
  status: 400,
  data: null,
  message: 'Error message'
}

// Network Error
{
  type: 'network_error',
  status: 0,
  data: null,
  message: 'Network error occurred',
  error: 'Error details'
}
```

## Best Practices

### 1. Error Handling
- Always handle both API errors and network errors
- Provide meaningful error messages to users
- Log errors for debugging
- Use try-catch blocks in service methods

### 2. Loading States
- Show loading indicators during API calls
- Use Redux to manage loading states globally
- Disable buttons during API calls to prevent double submissions

### 3. Data Validation
- Validate input data before sending to API
- Handle validation errors from the server
- Provide client-side validation for better UX

### 4. Authentication
- Include authentication tokens in API headers
- Handle token expiration and refresh
- Clear tokens on logout

### 5. Caching
- Consider caching frequently accessed data
- Implement refresh mechanisms
- Handle offline scenarios

### 6. Testing
- Test API integration with mock data
- Test error scenarios
- Test network failure scenarios

## Example: Complete CRUD Implementation

Here's a complete example of implementing CRUD operations for a new feature:

### 1. Service Implementation
```javascript
// api/exampleService.js
import apiClient from './apiClient';
import { API_CONFIG, API_RESPONSE_TYPES } from '../config/api';

class ExampleService {
  async getAll() {
    return await apiClient.get(API_CONFIG.ENDPOINTS.EXAMPLE.LIST);
  }

  async getById(id) {
    return await apiClient.get(`${API_CONFIG.ENDPOINTS.EXAMPLE.LIST}/${id}`);
  }

  async create(data) {
    return await apiClient.post(API_CONFIG.ENDPOINTS.EXAMPLE.CREATE, data);
  }

  async update(id, data) {
    return await apiClient.put(`${API_CONFIG.ENDPOINTS.EXAMPLE.UPDATE}/${id}`, data);
  }

  async delete(id) {
    return await apiClient.delete(`${API_CONFIG.ENDPOINTS.EXAMPLE.DELETE}/${id}`);
  }
}

export default new ExampleService();
```

### 2. Redux Thunk Actions (Optional)
```javascript
// store/thunks/exampleThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import exampleService from '../../api/exampleService';

export const fetchExamples = createAsyncThunk(
  'example/fetchExamples',
  async (_, { rejectWithValue }) => {
    try {
      const response = await exampleService.getAll();
      if (response.type === 'success') {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createExample = createAsyncThunk(
  'example/createExample',
  async (data, { rejectWithValue }) => {
    try {
      const response = await exampleService.create(data);
      if (response.type === 'success') {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

## Environment Configuration

For different environments (development, staging, production), update the API configuration:

```javascript
// config/env.js
const ENV = {
  development: {
    API_BASE_URL: 'http://localhost:8080',
  },
  staging: {
    API_BASE_URL: 'https://staging-api.yourapp.com',
  },
  production: {
    API_BASE_URL: 'https://api.yourapp.com',
  },
};

export default ENV[process.env.NODE_ENV || 'development'];
```

## Security Considerations

1. **Token Storage**: Use secure storage for authentication tokens
2. **HTTPS**: Always use HTTPS in production
3. **Input Validation**: Validate all inputs on both client and server
4. **Error Messages**: Don't expose sensitive information in error messages
5. **Rate Limiting**: Implement rate limiting for API calls

## Debugging Tips

1. **Console Logging**: Use console.log to track API calls and responses
2. **Network Tab**: Use browser dev tools to inspect network requests
3. **Redux DevTools**: Use Redux DevTools to track state changes
4. **Error Boundaries**: Implement error boundaries to catch and handle errors gracefully

This guide provides a solid foundation for integrating APIs in your project. Follow these patterns and best practices for consistent and maintainable code.
