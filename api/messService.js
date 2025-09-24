// Mess Management Service
import { API_CONFIG, API_RESPONSE_TYPES } from '../config/api';
import apiClient from './apiClient';

class MessService {
  // Get all mess list with pagination (for Super Admin)
  async getAllMessList(page = 0, size = 1000, sort = 'createdAt,desc') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort: sort,
      });

      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.MESS.GET_ALL}?${params}`
      );

      if (response.type === API_RESPONSE_TYPES.SUCCESS) {
        return {
          type: API_RESPONSE_TYPES.SUCCESS,
          message: 'Mess list fetched successfully',
          data: response.data,
        };
      }

      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: response.message || 'Failed to fetch mess list',
        data: null,
      };
    } catch (error) {
      console.error('MessService - getAllMessList error:', error);
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to fetch mess list',
        data: null,
      };
    }
  }

  // Get mess list (regular endpoint)
  async getMessList() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.MESS.LIST);
      return response;
    } catch (error) {
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to fetch mess list',
        data: null,
      };
    }
  }

  // // Get mess by ID
  // async getMessById(id) {
  //   try {
  //     // Use Super Admin endpoint for fetching detailed mess info
  //     const response = await apiClient.get(`/super/getMessById/${id}`);
  //     return response;
  //   } catch (error) {
  //     return {
  //       type: API_RESPONSE_TYPES.ERROR,
  //       message: 'Failed to fetch mess details',
  //       data: null,
  //     };
  //   }
  // }

  // Create new mess (Super Admin)
  async createMess(messData) {
    try {
      // Map UI model to API contract
      const payload = {
        email: messData.emailAddress || messData.email,
        password: messData.password,
        messNumber: messData.messNumber,
        ownerName: messData.ownerName,
        messName: messData.messName,
        phoneNumber: messData.phoneNumber,
        address: messData.address,
        city: messData.city,
        state: messData.state,
        country: messData.country,
        zip: messData.zip,
        messType: messData.messType,
        description: messData.messDescription || messData.description,
        notes: messData.notes,
      };

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.MESS.CREATE,
        payload
      );
      return response;
    } catch (error) {
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to create mess',
        data: null,
      };
    }
  }

  // Update mess
  async updateMess(id, messData) {
    try {
      const response = await apiClient.put(
        `${API_CONFIG.ENDPOINTS.MESS.UPDATE}/${id}`,
        messData
      );
      return response;
    } catch (error) {
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to update mess',
        data: null,
      };
    }
  }

  // Update mess (Super Admin endpoint)
  async updateMessSuper(id, messData) {
    try {
      console.log("💛💛❤️❤️❤️", id);
      console.log("💛💛❤️❤️❤️", id);

      // Some backends expect only changed fields; send what we have
      const response = await apiClient.put(
        `${API_CONFIG.ENDPOINTS.MESS.UPDATE}/${id}`,
        messData
      );
      console.log("response", response);

      return response;
    } catch (error) {
      console.log("update error is ", error);

      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to update mess',
        data: null,
      };
    }
  }

  // Delete mess
  async deleteMess(id) {
    try {
      const response = await apiClient.delete(
        `${API_CONFIG.ENDPOINTS.MESS.DELETE}/${id}`
      );
      return response;
    } catch (error) {
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to delete mess',
        data: null,
      };
    }
  }

  // Delete mess (Super Admin endpoint)
  async deleteMessSuper(id) {
    try {
      const response = await apiClient.delete(`/super/deleteMess/${id}`, { responseType: 'text' });

      if (response.type === API_RESPONSE_TYPES.SUCCESS) {
        return {
          type: API_RESPONSE_TYPES.SUCCESS,
          message: typeof response.data === 'string' ? response.data : (response.message || 'Mess deleted successfully'),
          data: null,
        };
      }

      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: response.message || 'Failed to delete mess',
        data: null,
      };
    } catch (error) {
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to delete mess',
        data: null,
      };
    }
  }

  // Search mess
  async searchMess(searchTerm, page = 0, size = 10) {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        page: page.toString(),
        size: size.toString(),
      });

      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.MESS.GET_ALL}?${params}`
      );
      return response;
    } catch (error) {
      return {
        type: API_RESPONSE_TYPES.ERROR,
        message: 'Failed to search mess',
        data: null,
      };
    }
  }
}

// Create and export a singleton instance
const messService = new MessService();
export default messService;
