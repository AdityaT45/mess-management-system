// Customer Management Service
import { API_CONFIG, API_RESPONSE_TYPES } from '../config/api';
import store from '../store/store';
import apiClient from './apiClient';
import NetworkTest from './networkTest';

class CustomerService {
  // Get all customers
  async getAllCustomers() {
    try {
      console.log('🔍 CustomerService - Getting all customers...');
      console.log('🌐 CustomerService - Using endpoint:', API_CONFIG.ENDPOINTS.CUSTOMER.LIST);
      console.log('🌐 CustomerService - Full URL:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CUSTOMER.LIST);
      
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.CUSTOMER.LIST);
      
      console.log('📡 CustomerService - Get customers response:', response);
      console.log('📡 CustomerService - Response type:', response.type);
      console.log('📡 CustomerService - Response status:', response.status);
      console.log('📡 CustomerService - Response data:', response.data);
      
      if (response.type === API_RESPONSE_TYPES.SUCCESS) {
        console.log('✅ CustomerService - Customers fetched successfully');
        return {
          type: API_RESPONSE_TYPES.SUCCESS,
          message: 'Customers fetched successfully',
          data: response.data?.content || response.data || [],
        };
      }

      console.log('❌ CustomerService - Failed to fetch customers:', response.message);
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: response.message || 'Failed to fetch customers',
        data: [],
      };
    } catch (error) {
      console.error('💥 CustomerService - Error fetching customers:', error);
      console.error('💥 CustomerService - Error message:', error.message);
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to fetch customers: ' + error.message,
        data: [],
      };
    }
  }

  // Create new customer
  async createCustomer(customerData) {
    try {
      console.log('🔨 CustomerService - Creating customer with data:', customerData);
      console.log('🌐 CustomerService - Using endpoint:', API_CONFIG.ENDPOINTS.CUSTOMER.CREATE);
      console.log('🌐 CustomerService - Full URL:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CUSTOMER.CREATE);
      
      // Check if user is authenticated before making the request
      const token = apiClient.getStoredToken();
      console.log('🔐 CustomerService - Authentication token available:', !!token);
      console.log('🔐 CustomerService - Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      
      // Also check Redux store for user role
      try {
        const state = store.getState();
        const userRole = state.auth?.user?.role;
        const userEmail = state.auth?.user?.email;
        console.log('👤 CustomerService - User role from Redux:', userRole);
        console.log('👤 CustomerService - User email from Redux:', userEmail);
      } catch (reduxError) {
        console.warn('⚠️ CustomerService - Could not access Redux store:', reduxError);
      }
      
      if (!token) {
        console.log('⚠️ CustomerService - No authentication token found. User may need to login first.');
        return {
          type: API_RESPONSE_TYPES.ERROR,
          message: 'Authentication required. Please login first.',
          data: null
        };
      }

      // Run network connectivity test if this is the first request
      if (!this._networkTested) {
        console.log('🔍 CustomerService - Running network connectivity test...');
        await NetworkTest.runFullTest();
        this._networkTested = true;
      }
      
      // Convert to FormData to match API expectations
      const formData = new FormData();
      
      // Add all fields to FormData
      Object.keys(customerData).forEach(key => {
        if (customerData[key] !== null && customerData[key] !== undefined && customerData[key] !== '') {
          // Format dates properly for API
          let value = customerData[key];
          if (key === 'startDate' || key === 'endDate') {
            value = this.formatDateForAPI(customerData[key]);
          }
          formData.append(key, value);
          console.log(`📝 CustomerService - Added to FormData: ${key} = ${value}`);
        }
      });
      
      // Debug FormData
      console.log('📦 CustomerService - FormData size:', formData._parts ? formData._parts.length : 'unknown');
      console.log('📦 CustomerService - FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
      }
      
      console.log('📦 CustomerService - FormData prepared, making API call...');
      console.log('🔍 CustomerService - Request details:');
      console.log('  - URL:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CUSTOMER.CREATE);
      console.log('  - Method: POST');
      console.log('  - Content-Type: multipart/form-data (FormData)');
      console.log('  - Auth Token:', token ? 'Present' : 'Missing');
      
      const response = await apiClient.upload(API_CONFIG.ENDPOINTS.CUSTOMER.CREATE, formData);
      
      console.log('📡 CustomerService - API Response:', response);
      console.log('📡 CustomerService - Response type:', response.type);
      console.log('📡 CustomerService - Response status:', response.status);
      console.log('📡 CustomerService - Response data:', response.data);
      
      if (response.type === API_RESPONSE_TYPES.SUCCESS) {
        console.log('✅ CustomerService - Customer created successfully');
        return {
          type: API_RESPONSE_TYPES.SUCCESS,
          data: response.data,
          message: response.message || 'Customer created successfully'
        };
      } else {
        console.log('❌ CustomerService - Customer creation failed:', response.message);
        return {
          type: API_RESPONSE_TYPES.ERROR,
          message: response.message || 'Failed to create customer',
          data: null
        };
      }
    } catch (error) {
      console.error('💥 CustomerService - Error creating customer:', error);
      console.error('💥 CustomerService - Error message:', error.message);
      console.error('💥 CustomerService - Error stack:', error.stack);
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to create customer: ' + error.message,
        data: null
      };
    }
  }

  // Helper method to format date for API
  formatDateForAPI(dateString) {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', dateString);
        return null;
      }
      
      // Format as LocalDateTime format: YYYY-MM-DDTHH:mm:ss
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.warn('Error formatting date:', error);
      return null;
    }
  }

  // Update customer
  async updateCustomer(customerId, customerData) {
    try {
      const response = await apiClient.put(`${API_CONFIG.ENDPOINTS.CUSTOMER.UPDATE}/${customerId}`, customerData);
      return response;
    } catch (error) {
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to update customer',
        data: null
      };
    }
  }

  // Delete customer
  async deleteCustomer(customerId) {
    try {
      const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.CUSTOMER.DELETE}/${customerId}`);
      return response;
    } catch (error) {
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to delete customer',
        data: null
      };
    }
  }
}

// Create and export singleton instance
const customerService = new CustomerService();
export default customerService;
