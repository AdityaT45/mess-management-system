// API Configuration
export const API_CONFIG = {
  // For React Native/Expo, use your computer's IP address instead of localhost
  // Find your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)
  BASE_URL: 'http://192.168.1.34:8080', // Your computer's IP address   room wifi
  // BASE_URL: 'http://10.221.51.134:8080', // Your computer's IP address  ritesh mobile
  // BASE_URL: 'http://10.218.79.134:8081', // Your computer's IP address  adi mobile
  // Alternative: If testing on web, you can use:
  // BASE_URL: 'http://localhost:8080',

  ENDPOINTS: {
    ADMIN: {
      GET_OWN_MESS: '/admin/getOwnMess',
      UPDATE_OWN_MESS: '/admin/updateOwnMess',
      GET_SUBSCRIPTION_PLANS: '/admin/getAllPlanList',
      GET_PLAN_BY_ID: '/admin/getPlanById',
      CREATE_PLAN: '/admin/CreatePlan',
      UPDATE_PLAN: '/admin/updatePlan',
      DELETE_PLAN: '/admin/deletePlan',
      ASSIGN_SUBSCRIPTION: '/admin/assignSubscriptionsToCustomer',
      GET_DETAILED_CUSTOMERS_FOR_SUBSCRIPTION: '/admin/getDetailedCustomerListForSubscription',
      CUSTOMERS_ELIGIBLE_FOR_SUBSCRIPTION: '/admin/customersEligibleForSubscription',
      // Meal Timing Management
      CREATE_MEAL_TIMING: '/admin/createMealTiming',
      GET_ALL_MEAL_TIMINGS: '/admin/getAllMealTimings',
    },
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    USER: {
      PROFILE: '/user/profile',
      UPDATE_PROFILE: '/user/update',
    },
    MESS: {
      LIST: '/mess/list',
      GET_ALL: '/super/getAllMessList',
      GET_BY_ID: '/super/getMessById',
      CREATE: '/super/createMess',
      UPDATE: '/super/updateMess',
      DELETE: '/mess/delete',
    },
    CUSTOMER: {
      LIST: '/admin/getAllCustomerList',
      GET_BY_ID: '/admin/getCustomerByID',
      GET_PROFILE: '/customer/getProfile',
      UPDATE_PROFILE: '/customer/updateProfile',
      CREATE: '/admin/createCustomer',
      UPDATE: '/admin/updateCustomer',
      DELETE: '/admin/deleteCustomer',
    },
    MENU: {
      LIST: '/menu/list',
      CREATE: '/menu/create',
      UPDATE: '/menu/update',
      DELETE: '/menu/delete',
    },
    PAYMENT: {
      LIST: '/payment/list',
      CREATE: '/payment/create',
      UPDATE: '/payment/update',
    },
    ATTENDANCE: {
      LIST: '/attendance/list',
      MARK: '/attendance/mark',
      UPDATE: '/attendance/update',
    },
    REPORTS: {
      DASHBOARD: '/reports/dashboard',
      SALES: '/reports/sales',
      ATTENDANCE: '/reports/attendance',
    }
  },
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// API Response Types
export const API_RESPONSE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  VALIDATION_ERROR: 'validation_error',
  NETWORK_ERROR: 'network_error',
};