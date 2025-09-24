// Admin Service
import { API_CONFIG, API_RESPONSE_TYPES } from '../config/api';
import apiClient from './apiClient';

class AdminService {
    async getOwnMess() {
        try {
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.GET_OWN_MESS);
            if (response.type === API_RESPONSE_TYPES.SUCCESS) {
                return { type: API_RESPONSE_TYPES.SUCCESS, data: response.data, message: 'Mess fetched' };
            }
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: response.message || 'Failed to fetch mess' };
        } catch (error) {
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: 'Failed to fetch mess: ' + error.message };
        }
    }

    async updateOwnMess(messData) {
        try {
            const response = await apiClient.put(API_CONFIG.ENDPOINTS.ADMIN.UPDATE_OWN_MESS, messData);
            if (response.type === API_RESPONSE_TYPES.SUCCESS) {
                return { type: API_RESPONSE_TYPES.SUCCESS, data: response.data, message: 'Mess updated successfully' };
            }
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: response.message || 'Failed to update mess' };
        } catch (error) {
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: 'Failed to update mess: ' + error.message };
        }
    }

    // Subscription Plan Management
    async getSubscriptionPlans() {
        try {
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.GET_SUBSCRIPTION_PLANS);
            if (response.type === API_RESPONSE_TYPES.SUCCESS) {
                return { type: API_RESPONSE_TYPES.SUCCESS, data: response.data, message: 'Plans fetched successfully' };
            }
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: response.message || 'Failed to fetch plans' };
        } catch (error) {
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: 'Failed to fetch plans: ' + error.message };
        }
    }

    async getPlanById(planId) {
        try {
            const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.ADMIN.GET_PLAN_BY_ID}/${planId}`);
            if (response.type === API_RESPONSE_TYPES.SUCCESS) {
                return { type: API_RESPONSE_TYPES.SUCCESS, data: response.data, message: 'Plan fetched successfully' };
            }
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: response.message || 'Failed to fetch plan' };
        } catch (error) {
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: 'Failed to fetch plan: ' + error.message };
        }
    }

    async createSubscriptionPlan(planData) {
        try {
            const response = await apiClient.post(API_CONFIG.ENDPOINTS.ADMIN.CREATE_PLAN, planData);
            if (response.type === API_RESPONSE_TYPES.SUCCESS) {
                return { type: API_RESPONSE_TYPES.SUCCESS, data: response.data, message: 'Plan created successfully' };
            }
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: response.message || 'Failed to create plan' };
        } catch (error) {
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: 'Failed to create plan: ' + error.message };
        }
    }

    async updateSubscriptionPlan(planId, planData) {
        try {
            const response = await apiClient.put(`${API_CONFIG.ENDPOINTS.ADMIN.UPDATE_PLAN}/${planId}`, planData);
            if (response.type === API_RESPONSE_TYPES.SUCCESS) {
                return { type: API_RESPONSE_TYPES.SUCCESS, data: response.data, message: 'Plan updated successfully' };
            }
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: response.message || 'Failed to update plan' };
        } catch (error) {
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: 'Failed to update plan: ' + error.message };
        }
    }

    async deleteSubscriptionPlan(planId) {
        try {
            console.log('Deleting plan with ID:', planId);
            const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.ADMIN.DELETE_PLAN}/${planId}`);
            console.log('Delete API response:', response);

            if (response.type === API_RESPONSE_TYPES.SUCCESS) {
                return { type: API_RESPONSE_TYPES.SUCCESS, data: response.data, message: 'Plan deleted successfully' };
            }
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: response.message || 'Failed to delete plan' };
        } catch (error) {
            console.error('Delete plan error:', error);
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: 'Failed to delete plan: ' + error.message };
        }
    }

    // Customers
    async getAllCustomers() {
        try {
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.CUSTOMER.LIST);
            if (response.type === API_RESPONSE_TYPES.SUCCESS) {
                return { type: API_RESPONSE_TYPES.SUCCESS, data: response.data, message: 'Customers fetched successfully' };
            }
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: response.message || 'Failed to fetch customers' };
        } catch (error) {
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: 'Failed to fetch customers: ' + error.message };
        }
    }

    async getEligibleCustomersForSubscription({ page = 0, size = 50, search = '' } = {}) {
        try {
            const params = new URLSearchParams();
            params.append('page', String(page));
            params.append('size', String(size));
            if (search) params.append('search', String(search));
            const url = `${API_CONFIG.ENDPOINTS.ADMIN.CUSTOMERS_ELIGIBLE_FOR_SUBSCRIPTION}?${params.toString()}`;
            const response = await apiClient.get(url);
            if (response.type === API_RESPONSE_TYPES.SUCCESS) {
                return { type: API_RESPONSE_TYPES.SUCCESS, data: response.data, message: 'Eligible customers fetched successfully' };
            }
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: response.message || 'Failed to fetch eligible customers' };
        } catch (error) {
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: 'Failed to fetch eligible customers: ' + error.message };
        }
    }

    async getDetailedCustomersForSubscription({ page = 0, size = 5, search = '', status = '', sort = 'name' } = {}) {
        try {
            const params = new URLSearchParams();
            params.append('page', String(page));
            params.append('size', String(size));
            if (search) params.append('search', String(search));
            if (status) params.append('status', String(status));
            if (sort) params.append('sort', String(sort));

            const url = `${API_CONFIG.ENDPOINTS.ADMIN.GET_DETAILED_CUSTOMERS_FOR_SUBSCRIPTION}?${params.toString()}`;
            const response = await apiClient.get(url);
            if (response.type === API_RESPONSE_TYPES.SUCCESS) {
                return { type: API_RESPONSE_TYPES.SUCCESS, data: response.data, message: 'Customers fetched successfully' };
            }
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: response.message || 'Failed to fetch customers' };
        } catch (error) {
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: 'Failed to fetch customers: ' + error.message };
        }
    }

    // Assign subscription to a customer
    async assignSubscriptionToCustomer(payload) {
        try {
            const response = await apiClient.post(API_CONFIG.ENDPOINTS.ADMIN.ASSIGN_SUBSCRIPTION, payload);
            if (response.type === API_RESPONSE_TYPES.SUCCESS) {
                return { type: API_RESPONSE_TYPES.SUCCESS, data: response.data, message: 'Subscription assigned successfully' };
            }
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: response.message || 'Failed to assign subscription' };
        } catch (error) {
            return { type: API_RESPONSE_TYPES.ERROR, data: null, message: 'Failed to assign subscription: ' + error.message };
        }
    }
}

export default new AdminService();



