// Network Connectivity Test Utility
import { API_CONFIG } from '../config/api';

class NetworkTest {
  // Test basic connectivity to the server
  static async testServerConnectivity() {
    console.log('🔍 Testing server connectivity...');
    console.log('🌐 Server URL:', API_CONFIG.BASE_URL);
    
    try {
      const response = await fetch(API_CONFIG.BASE_URL, {
        method: 'GET',
        timeout: 5000,
      });
      
      console.log('✅ Server is reachable');
      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
      
      return {
        success: true,
        status: response.status,
        message: 'Server is reachable'
      };
    } catch (error) {
      console.log('❌ Server is not reachable');
      console.log('💥 Error:', error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'Cannot connect to server'
      };
    }
  }

  // Test authentication endpoint
  static async testAuthEndpoint() {
    console.log('🔍 Testing authentication endpoint...');
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'test123'
        }),
        timeout: 5000,
      });
      
      console.log('📊 Auth endpoint response status:', response.status);
      
      if (response.status === 403) {
        return {
          success: true,
          status: response.status,
          message: 'Auth endpoint is accessible but requires valid credentials'
        };
      } else if (response.status === 404) {
        return {
          success: false,
          status: response.status,
          message: 'Auth endpoint not found'
        };
      } else {
        return {
          success: true,
          status: response.status,
          message: 'Auth endpoint is accessible'
        };
      }
    } catch (error) {
      console.log('❌ Auth endpoint test failed');
      console.log('💥 Error:', error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'Cannot connect to auth endpoint'
      };
    }
  }

  // Test customer endpoint (requires authentication)
  static async testCustomerEndpoint() {
    console.log('🔍 Testing customer endpoint...');
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CUSTOMER.LIST}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
      
      console.log('📊 Customer endpoint response status:', response.status);
      
      if (response.status === 401 || response.status === 403) {
        return {
          success: true,
          status: response.status,
          message: 'Customer endpoint is accessible but requires authentication'
        };
      } else if (response.status === 404) {
        return {
          success: false,
          status: response.status,
          message: 'Customer endpoint not found'
        };
      } else {
        return {
          success: true,
          status: response.status,
          message: 'Customer endpoint is accessible'
        };
      }
    } catch (error) {
      console.log('❌ Customer endpoint test failed');
      console.log('💥 Error:', error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'Cannot connect to customer endpoint'
      };
    }
  }

  // Run comprehensive network test
  static async runFullTest() {
    console.log('🚀 Starting comprehensive network test...');
    console.log('=' .repeat(50));
    
    const results = {
      server: await this.testServerConnectivity(),
      auth: await this.testAuthEndpoint(),
      customer: await this.testCustomerEndpoint(),
    };
    
    console.log('=' .repeat(50));
    console.log('📋 Test Results Summary:');
    console.log('  Server Connectivity:', results.server.success ? '✅' : '❌');
    console.log('  Auth Endpoint:', results.auth.success ? '✅' : '❌');
    console.log('  Customer Endpoint:', results.customer.success ? '✅' : '❌');
    
    // Provide recommendations
    if (!results.server.success) {
      console.log('💡 Recommendation: Check if your API server is running on port 8080');
    } else if (!results.auth.success) {
      console.log('💡 Recommendation: Check if the auth endpoint path is correct');
    } else if (!results.customer.success) {
      console.log('💡 Recommendation: Customer endpoint requires authentication - make sure user is logged in');
    } else {
      console.log('🎉 All tests passed! Your network configuration looks good.');
    }
    
    return results;
  }
}

export default NetworkTest;

