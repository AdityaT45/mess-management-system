// Customer Management Service
import { API_CONFIG, API_RESPONSE_TYPES } from '../config/api';
import store from '../store/store';
import apiClient from './apiClient';
import NetworkTest from './networkTest';

class CustomerService {
  // Get current logged-in customer's profile
  async getMyProfile() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.CUSTOMER.GET_PROFILE);

      if (response.type === API_RESPONSE_TYPES.SUCCESS) {
        return {
          type: API_RESPONSE_TYPES.SUCCESS,
          message: 'Profile fetched successfully',
          data: response.data,
        };
      }

      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: response.message || 'Failed to fetch profile',
        data: null,
      };
    } catch (error) {
      console.error('💥 CustomerService - Error fetching my profile:', error);
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to fetch profile: ' + error.message,
        data: null,
      };
    }
  }

  // Update current logged-in customer's profile (self-service)
  async updateMyProfile(updateData) {
    try {
      // Convert to FormData to satisfy backend expectations for multipart
      const formData = new FormData();
      Object.keys(updateData || {}).forEach((key) => {
        let value = updateData[key];
        if (value === undefined || value === null || value === '') return;
        if (key === 'startDate' || key === 'endDate') {
          value = this.formatDateForAPI(value);
        }
        formData.append(key, value);
      });

      const response = await apiClient.makeRequest(
        API_CONFIG.ENDPOINTS.CUSTOMER.UPDATE_PROFILE,
        {
          method: 'PUT',
          body: formData,
        }
      );

      if (response.type === API_RESPONSE_TYPES.SUCCESS) {
        return {
          type: API_RESPONSE_TYPES.SUCCESS,
          message: 'Profile updated successfully',
          data: response.data,
        };
      }

      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: response.message || 'Failed to update profile',
        data: null,
      };
    } catch (error) {
      console.error('💥 CustomerService - Error updating my profile:', error);
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to update profile: ' + error.message,
        data: null,
      };
    }
  }
  // Get customer by ID
  async getCustomerById(customerId) {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.CUSTOMER.GET_BY_ID}/${customerId}`);

      if (response.type === API_RESPONSE_TYPES.SUCCESS) {
        return {
          type: API_RESPONSE_TYPES.SUCCESS,
          message: 'Customer fetched successfully',
          data: response.data,
        };
      }

      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: response.message || 'Failed to fetch customer',
        data: null,


      };
    } catch (error) {
      console.error('💥 CustomerService - Error fetching customer by ID:', error);
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to fetch customer: ' + error.message,
        data: null,
      };
    }
  }
  // Get all customers
  async getAllCustomers() {
    try {


      const response = await apiClient.get(API_CONFIG.ENDPOINTS.CUSTOMER.LIST);



      if (response.type === API_RESPONSE_TYPES.SUCCESS) {

        return {
          type: API_RESPONSE_TYPES.SUCCESS,
          message: 'Customers fetched successfully',
          data: response.data?.content || response.data || [],
        };
      }


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


      // Check if user is authenticated before making the request
      const token = apiClient.getStoredToken();


      // Also check Redux store for user role
      try {
        const state = store.getState();
        const userRole = state.auth?.user?.role;
        const userEmail = state.auth?.user?.email;

      } catch (reduxError) {
        console.warn('⚠️ CustomerService - Could not access Redux store:', reduxError);
      }

      if (!token) {

        return {
          type: API_RESPONSE_TYPES.ERROR,
          message: 'Authentication required. Please login first.',
          data: null
        };
      }

      // Run network connectivity test if this is the first request
      if (!this._networkTested) {

        await NetworkTest.runFullTest();
        this._networkTested = true;
      }

      // Convert to FormData to match API expectations
      const formData = new FormData();

      // Capture image uri and skip direct append for special handling
      const profileImageUri = customerData?.profileImage;

      // Add all non-file fields to FormData
      Object.keys(customerData).forEach(key => {
        if (key === 'profileImage') return; // handle file separately
        if (customerData[key] !== null && customerData[key] !== undefined && customerData[key] !== '') {
          // Format dates properly for API
          let value = customerData[key];
          if (key === 'startDate' || key === 'endDate') {
            value = this.formatDateForAPI(customerData[key]);
          }
          formData.append(key, value);
        }
      });

      // Append file if provided as a URI
      if (profileImageUri && typeof profileImageUri === 'string') {
        const looksLikeLocalFile = profileImageUri.startsWith('file://') || profileImageUri.startsWith('content://');
        if (looksLikeLocalFile) {
          const file = {
            uri: profileImageUri,
            name: this.inferFileNameFromUri(profileImageUri),
            type: this.inferMimeFromUri(profileImageUri),
          };
          formData.append('profileImage', file);
        } else {
          // If a base64 string is provided instead, send as a simple field (backend may not accept this though)
          // Prefer sending a file via FormData
          formData.append('profileImage', profileImageUri);
        }
      }

      // Debug FormData

      for (let [key, value] of formData.entries()) {

      }


      const response = await apiClient.upload(API_CONFIG.ENDPOINTS.CUSTOMER.CREATE, formData);


      if (response.type === API_RESPONSE_TYPES.SUCCESS) {

        return {
          type: API_RESPONSE_TYPES.SUCCESS,
          data: response.data,
          message: response.message || 'Customer created successfully'
        };
      } else {

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

  // Infer mime type from file extension (best effort)
  inferMimeFromUri(uri) {
    try {
      const lower = String(uri).toLowerCase();
      if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
      if (lower.endsWith('.png')) return 'image/png';
      if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic';
      if (lower.endsWith('.webp')) return 'image/webp';
      return 'image/jpeg';
    } catch (_) {
      return 'image/jpeg';
    }
  }

  // Infer a reasonable filename from the URI
  inferFileNameFromUri(uri) {
    try {
      const withoutQuery = String(uri).split('?')[0];
      const parts = withoutQuery.split('/')
      const last = parts[parts.length - 1] || 'photo.jpg';
      if (last.includes('.')) return last;
      // Fallback to jpg if no extension
      return `${last || 'photo'}.jpg`;
    } catch (_) {
      return 'photo.jpg';
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
      console.log('🔄 CustomerService - Updating customer:', customerId);
      console.log('🔄 CustomerService - Customer data:', customerData);

      // Prepare data for API: only allow editable fields
      const allowedFields = [
        'name',
        'phoneNumber',
        'address',
        'city',
        'state',
        'country',
        'zip',
        'notes',
        'startDate',
        'endDate',
        'planeType',
        'status',
        'profileImage',
      ];
      const updateData = {};
      allowedFields.forEach((key) => {
        if (customerData.hasOwnProperty(key)) {
          updateData[key] = customerData[key];
        }
      });

      // Format dates if present
      if (updateData.startDate) {
        updateData.startDate = this.formatDateForAPI(updateData.startDate);
      }
      if (updateData.endDate) {
        updateData.endDate = this.formatDateForAPI(updateData.endDate);
      }

      console.log('🔄 CustomerService - Prepared update data:', updateData);

      // Convert to FormData because backend does not accept application/json
      const formData = new FormData();
      const profileImageUri = updateData?.profileImage;
      Object.keys(updateData).forEach((key) => {
        if (key === 'profileImage') return;
        const value = updateData[key];
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      });

      // Append profile image if provided
      if (profileImageUri && typeof profileImageUri === 'string') {
        const looksLikeLocalFile = profileImageUri.startsWith('file://') || profileImageUri.startsWith('content://');
        if (looksLikeLocalFile) {
          const file = {
            uri: profileImageUri,
            name: this.inferFileNameFromUri(profileImageUri),
            type: this.inferMimeFromUri(profileImageUri),
          };
          formData.append('profileImage', file);
        } else {
          formData.append('profileImage', profileImageUri);
        }
      }

      // Send multipart form-data with PUT
      const response = await apiClient.makeRequest(
        `${API_CONFIG.ENDPOINTS.CUSTOMER.UPDATE}/${customerId}`,
        {
          method: 'PUT',
          body: formData,
        }
      );

      console.log('🔄 CustomerService - Update response:', response);

      if (response.type === API_RESPONSE_TYPES.SUCCESS) {
        return {
          type: API_RESPONSE_TYPES.SUCCESS,
          message: 'Customer updated successfully',
          data: response.data,
        };
      }

      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: response.message || 'Failed to update customer',
        data: null
      };
    } catch (error) {
      console.error('💥 CustomerService - Error updating customer:', error);
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to update customer: ' + error.message,
        data: null
      };
    }
  }

  // Delete customer
  async deleteCustomer(customerId) {
    try {
      const response = await apiClient.delete(
        `${API_CONFIG.ENDPOINTS.CUSTOMER.DELETE}/${customerId}`,
        { responseType: "text" }  // <--- important
      );

      return {
        type: API_RESPONSE_TYPES.SUCCESS,
        message: response.data, // plain text
        data: null
      };


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
