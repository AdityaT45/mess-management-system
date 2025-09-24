// src/api/customerDashboardService.js
import apiClient, { API_RESPONSE_TYPES } from './apiClient';

const API_CONFIG = {
    ENDPOINTS: {
        CUSTOMER_DASHBOARD: '/customer/dashboard',
        CUSTOMER_ATTENDANCE: '/customer/attendance',
        CUSTOMER_FEEDBACK: '/customer/feedback',
        CUSTOMER_PAYMENT: '/customer/payment',
        CUSTOMER_MENU: '/customer/menu',
    },
};

class CustomerDashboardService {
    // Get customer dashboard data
    async getDashboardData() {
        try {
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.CUSTOMER_DASHBOARD);
            return response;
        } catch (error) {
            console.error('💥 CustomerDashboardService - Error fetching dashboard data:', error);
            return {
                type: API_RESPONSE_TYPES.ERROR,
                message: 'Failed to fetch dashboard data',
                data: null,
            };
        }
    }

    // Mark attendance
    async markAttendance(attendanceCode) {
        try {
            const response = await apiClient.post(API_CONFIG.ENDPOINTS.CUSTOMER_ATTENDANCE, {
                code: attendanceCode,
            });
            return response;
        } catch (error) {
            console.error('💥 CustomerDashboardService - Error marking attendance:', error);
            return {
                type: API_RESPONSE_TYPES.ERROR,
                message: 'Failed to mark attendance',
                data: null,
            };
        }
    }

    // Submit feedback
    async submitFeedback(feedbackData) {
        try {
            const response = await apiClient.post(API_CONFIG.ENDPOINTS.CUSTOMER_FEEDBACK, feedbackData);
            return response;
        } catch (error) {
            console.error('💥 CustomerDashboardService - Error submitting feedback:', error);
            return {
                type: API_RESPONSE_TYPES.ERROR,
                message: 'Failed to submit feedback',
                data: null,
            };
        }
    }

    // Get payment information
    async getPaymentInfo() {
        try {
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.CUSTOMER_PAYMENT);
            return response;
        } catch (error) {
            console.error('💥 CustomerDashboardService - Error fetching payment info:', error);
            return {
                type: API_RESPONSE_TYPES.ERROR,
                message: 'Failed to fetch payment information',
                data: null,
            };
        }
    }

    // Get today's menu
    async getTodaysMenu() {
        try {
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.CUSTOMER_MENU);
            return response;
        } catch (error) {
            console.error('💥 CustomerDashboardService - Error fetching menu:', error);
            return {
                type: API_RESPONSE_TYPES.ERROR,
                message: 'Failed to fetch menu',
                data: null,
            };
        }
    }

    // Get attendance history
    async getAttendanceHistory() {
        try {
            const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.CUSTOMER_ATTENDANCE}/history`);
            return response;
        } catch (error) {
            console.error('💥 CustomerDashboardService - Error fetching attendance history:', error);
            return {
                type: API_RESPONSE_TYPES.ERROR,
                message: 'Failed to fetch attendance history',
                data: null,
            };
        }
    }

    // Get payment history
    async getPaymentHistory() {
        try {
            const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.CUSTOMER_PAYMENT}/history`);
            return response;
        } catch (error) {
            console.error('💥 CustomerDashboardService - Error fetching payment history:', error);
            return {
                type: API_RESPONSE_TYPES.ERROR,
                message: 'Failed to fetch payment history',
                data: null,
            };
        }
    }

    // Get feedback history
    async getFeedbackHistory() {
        try {
            const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.CUSTOMER_FEEDBACK}/history`);
            return response;
        } catch (error) {
            console.error('💥 CustomerDashboardService - Error fetching feedback history:', error);
            return {
                type: API_RESPONSE_TYPES.ERROR,
                message: 'Failed to fetch feedback history',
                data: null,
            };
        }
    }
}

export default new CustomerDashboardService();
