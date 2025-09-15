// Token Manager - Centralized token storage
class TokenManager {
  constructor() {
    this.token = null;
    this.listeners = [];
    this.isInitialized = false;
  }

  // Initialize token from external source (like Redux store)
  initialize(token) {
    if (!this.isInitialized) {
      this.token = token;
      this.isInitialized = true;
    }
  }

  // Set token
  setToken(token) {
    this.token = token;
    
    // Notify listeners
    this.listeners.forEach(listener => listener(token));
  }

  // Get token
  getToken() {
    return this.token;
  }

  // Clear token
  clearToken() {
    this.token = null;
    
    // Notify listeners
    this.listeners.forEach(listener => listener(null));
  }

  // Add listener for token changes
  addListener(listener) {
    this.listeners.push(listener);
  }

  // Remove listener
  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

}

// Create and export singleton instance
const tokenManager = new TokenManager();
export default tokenManager;
