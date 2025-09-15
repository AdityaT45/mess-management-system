# API Integration Examples

This document provides practical examples of how to integrate different types of APIs in your Mess Management System.

## Current Login API Integration

### API Endpoint
```
POST http://localhost:8080/auth/login
Content-Type: application/json

{
    "email": "super@gmail.com",
    "password": "1234"
}
```

### How It's Implemented

1. **API Configuration** (`config/api.js`):
```javascript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      // ... other auth endpoints
    }
  }
};
```

2. **Service Layer** (`api/authService.js`):
```javascript
async login(credentials) {
  const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
    email: credentials.email,
    password: credentials.password,
  });
  
  if (response.type === 'success') {
    // Store token and return user data
    if (data.token) {
      apiClient.setStoredToken(data.token);
    }
    return { type: 'success', data: { user, token } };
  }
  
  return { type: 'error', message: response.message };
}
```

3. **Component Usage** (`screens/auth/LoginScreen.js`):
```javascript
const handleLogin = async () => {
  const response = await authService.login({
    email: email.trim(),
    password: password.trim(),
  });

  if (response.type === 'success') {
    dispatch(login(response.data));
  } else {
    Alert.alert("Login Failed", response.message);
  }
};
```

## Common API Patterns

### 1. GET Request (Fetch Data)

```javascript
// Service
async getCustomers() {
  try {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.CUSTOMER.LIST);
    return response;
  } catch (error) {
    return { type: 'error', message: 'Failed to fetch customers' };
  }
}

// Component Usage
const [customers, setCustomers] = useState([]);
const [loading, setLoading] = useState(false);

const loadCustomers = async () => {
  setLoading(true);
  const response = await customerService.getCustomers();
  
  if (response.type === 'success') {
    setCustomers(response.data);
  } else {
    Alert.alert('Error', response.message);
  }
  setLoading(false);
};
```

### 2. POST Request (Create Data)

```javascript
// Service
async createCustomer(customerData) {
  try {
    // Validate input
    if (!customerData.name || !customerData.email) {
      return { type: 'error', message: 'Name and email are required' };
    }

    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.CUSTOMER.CREATE, 
      customerData
    );
    return response;
  } catch (error) {
    return { type: 'error', message: 'Failed to create customer' };
  }
}

// Component Usage
const handleCreateCustomer = async (formData) => {
  setLoading(true);
  const response = await customerService.createCustomer(formData);
  
  if (response.type === 'success') {
    Alert.alert('Success', 'Customer created successfully');
    loadCustomers(); // Refresh the list
  } else {
    Alert.alert('Error', response.message);
  }
  setLoading(false);
};
```

### 3. PUT Request (Update Data)

```javascript
// Service
async updateCustomer(id, customerData) {
  try {
    const response = await apiClient.put(
      `${API_CONFIG.ENDPOINTS.CUSTOMER.UPDATE}/${id}`, 
      customerData
    );
    return response;
  } catch (error) {
    return { type: 'error', message: 'Failed to update customer' };
  }
}

// Component Usage
const handleUpdateCustomer = async (id, formData) => {
  setLoading(true);
  const response = await customerService.updateCustomer(id, formData);
  
  if (response.type === 'success') {
    Alert.alert('Success', 'Customer updated successfully');
    loadCustomers(); // Refresh the list
  } else {
    Alert.alert('Error', response.message);
  }
  setLoading(false);
};
```

### 4. DELETE Request (Remove Data)

```javascript
// Service
async deleteCustomer(id) {
  try {
    const response = await apiClient.delete(
      `${API_CONFIG.ENDPOINTS.CUSTOMER.DELETE}/${id}`
    );
    return response;
  } catch (error) {
    return { type: 'error', message: 'Failed to delete customer' };
  }
}

// Component Usage
const handleDeleteCustomer = (id) => {
  Alert.alert(
    'Confirm Delete',
    'Are you sure you want to delete this customer?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const response = await customerService.deleteCustomer(id);
          
          if (response.type === 'success') {
            Alert.alert('Success', 'Customer deleted successfully');
            loadCustomers(); // Refresh the list
          } else {
            Alert.alert('Error', response.message);
          }
          setLoading(false);
        },
      },
    ]
  );
};
```

## Advanced API Patterns

### 1. File Upload

```javascript
// Service
async uploadFile(file, additionalData = {}) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const response = await apiClient.upload(
      API_CONFIG.ENDPOINTS.FILE.UPLOAD, 
      formData
    );
    return response;
  } catch (error) {
    return { type: 'error', message: 'Failed to upload file' };
  }
}

// Component Usage
const handleFileUpload = async (file) => {
  setLoading(true);
  const response = await fileService.uploadFile(file, {
    category: 'profile',
    userId: user.id
  });
  
  if (response.type === 'success') {
    Alert.alert('Success', 'File uploaded successfully');
  } else {
    Alert.alert('Error', response.message);
  }
  setLoading(false);
};
```

### 2. Pagination

```javascript
// Service
async getCustomers(page = 1, limit = 10, filters = {}) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.CUSTOMER.LIST}?${params}`
    );
    return response;
  } catch (error) {
    return { type: 'error', message: 'Failed to fetch customers' };
  }
}

// Component Usage
const [customers, setCustomers] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

const loadCustomers = async (page = 1) => {
  setLoading(true);
  const response = await customerService.getCustomers(page, 10, {
    search: searchTerm,
    status: 'active'
  });
  
  if (response.type === 'success') {
    setCustomers(response.data.items);
    setTotalPages(response.data.totalPages);
    setCurrentPage(page);
  } else {
    Alert.alert('Error', response.message);
  }
  setLoading(false);
};
```

### 3. Real-time Updates (WebSocket)

```javascript
// Service
class RealtimeService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    this.socket = new WebSocket(`ws://localhost:8080/ws?token=${token}`);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.notifyListeners(data.type, data.payload);
    };
    
    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
    };
  }

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  unsubscribe(eventType, callback) {
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(eventType, payload) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        callback(payload);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Component Usage
const [notifications, setNotifications] = useState([]);

useEffect(() => {
  const realtimeService = new RealtimeService();
  realtimeService.connect(userToken);
  
  realtimeService.subscribe('notification', (data) => {
    setNotifications(prev => [...prev, data]);
  });
  
  realtimeService.subscribe('order_update', (data) => {
    // Handle order updates
    loadOrders();
  });
  
  return () => {
    realtimeService.disconnect();
  };
}, []);
```

### 4. Batch Operations

```javascript
// Service
async batchUpdateCustomers(updates) {
  try {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.CUSTOMER.BATCH_UPDATE,
      { updates }
    );
    return response;
  } catch (error) {
    return { type: 'error', message: 'Failed to batch update customers' };
  }
}

// Component Usage
const handleBatchUpdate = async (selectedCustomers, updateData) => {
  setLoading(true);
  
  const updates = selectedCustomers.map(customer => ({
    id: customer.id,
    ...updateData
  }));
  
  const response = await customerService.batchUpdateCustomers(updates);
  
  if (response.type === 'success') {
    Alert.alert('Success', 'Customers updated successfully');
    loadCustomers();
  } else {
    Alert.alert('Error', response.message);
  }
  setLoading(false);
};
```

## Error Handling Patterns

### 1. Global Error Handler

```javascript
// utils/errorHandler.js
export const handleApiError = (error, context = '') => {
  console.error(`API Error in ${context}:`, error);
  
  if (error.type === 'network_error') {
    return 'Network connection failed. Please check your internet connection.';
  }
  
  if (error.status === 401) {
    return 'Session expired. Please login again.';
  }
  
  if (error.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.status === 404) {
    return 'Resource not found.';
  }
  
  if (error.status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  return error.message || 'An unexpected error occurred.';
};
```

### 2. Retry Logic

```javascript
// utils/retry.js
export const withRetry = async (apiCall, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

// Usage
const loadData = async () => {
  try {
    const result = await withRetry(() => apiService.getData());
    return result;
  } catch (error) {
    return { type: 'error', message: 'Failed after multiple attempts' };
  }
};
```

## Testing API Integration

### 1. Mock Service for Testing

```javascript
// __mocks__/apiService.js
export const mockApiService = {
  login: jest.fn().mockResolvedValue({
    type: 'success',
    data: {
      user: { id: 1, email: 'test@test.com', role: 'admin' },
      token: 'mock-token'
    }
  }),
  
  getCustomers: jest.fn().mockResolvedValue({
    type: 'success',
    data: [
      { id: 1, name: 'John Doe', email: 'john@test.com' }
    ]
  })
};
```

### 2. Component Testing

```javascript
// __tests__/LoginScreen.test.js
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../screens/auth/LoginScreen';
import { mockApiService } from '../__mocks__/apiService';

jest.mock('../api/authService', () => mockApiService);

test('should login successfully', async () => {
  const { getByPlaceholderText, getByText } = render(<LoginScreen />);
  
  fireEvent.changeText(getByPlaceholderText('Email Address'), 'test@test.com');
  fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
  fireEvent.press(getByText('Sign In'));
  
  await waitFor(() => {
    expect(mockApiService.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
      role: 'ROLE_SUPER_ADMIN'
    });
  });
});
```

## Performance Optimization

### 1. Request Debouncing

```javascript
// utils/debounce.js
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Usage in search
const debouncedSearch = debounce(async (searchTerm) => {
  const response = await customerService.searchCustomers(searchTerm);
  setSearchResults(response.data);
}, 300);
```

### 2. Request Caching

```javascript
// utils/cache.js
class ApiCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

const apiCache = new ApiCache();

// Usage in service
async getCustomers(useCache = true) {
  const cacheKey = 'customers';
  
  if (useCache) {
    const cached = apiCache.get(cacheKey);
    if (cached) return { type: 'success', data: cached };
  }
  
  const response = await apiClient.get(API_CONFIG.ENDPOINTS.CUSTOMER.LIST);
  
  if (response.type === 'success') {
    apiCache.set(cacheKey, response.data);
  }
  
  return response;
}
```

This comprehensive guide covers all the common patterns you'll need when integrating APIs in your project. Use these examples as templates and adapt them to your specific needs.
