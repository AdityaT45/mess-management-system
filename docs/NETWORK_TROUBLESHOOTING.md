# Network Troubleshooting Guide

## "Network request failed" Error Solutions

### 🔍 **Common Causes & Solutions**

#### 1. **Wrong IP Address (Most Common)**
**Problem**: Using `localhost` or `127.0.0.1` in React Native/Expo
**Solution**: Use your computer's actual IP address

**How to find your IP:**
- **Windows**: Open Command Prompt → `ipconfig`
- **Mac/Linux**: Open Terminal → `ifconfig` or `ip addr`
- Look for your local network IP (usually starts with 192.168.x.x or 10.x.x.x)

**Update config/api.js:**
```javascript
export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.100:8080', // Replace with YOUR IP
  // ... rest of config
};
```

#### 2. **API Server Not Running**
**Problem**: Your backend server isn't started
**Solution**: Start your API server
```bash
# Navigate to your backend project
cd your-backend-project
# Start the server (command depends on your backend)
npm start
# or
java -jar your-app.jar
# or
python app.py
```

#### 3. **Wrong Port**
**Problem**: API server running on different port
**Solution**: Check what port your server is using
- Check your backend console output
- Look for "Server running on port XXXX"
- Update BASE_URL accordingly

#### 4. **Firewall/Network Issues**
**Problem**: Firewall blocking connections
**Solution**: 
- Temporarily disable firewall to test
- Add port 8080 to firewall exceptions
- Ensure both devices are on same network

#### 5. **CORS Issues (Web Only)**
**Problem**: Cross-Origin Resource Sharing errors
**Solution**: Add CORS headers to your backend
```javascript
// Express.js example
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.1.100:3000'],
  credentials: true
}));
```

### 🛠️ **Step-by-Step Debugging**

#### Step 1: Test API Server
```bash
# Test if your API is accessible
curl http://localhost:8080/auth/login
# or
curl http://YOUR_IP:8080/auth/login
```

#### Step 2: Check Network Connectivity
```bash
# Ping your computer from mobile device
ping YOUR_IP_ADDRESS
```

#### Step 3: Test with Browser
Open browser and go to: `http://YOUR_IP:8080/auth/login`

#### Step 4: Check Console Logs
Look for these logs in your app:
```
API Request: POST http://192.168.1.100:8080/auth/login
Network connection failed. Check:
1. Is your API server running?
2. Is the IP address correct? http://192.168.1.100:8080
3. Are you on the same network?
4. Is the port correct? (8080)
```

### 📱 **Platform-Specific Solutions**

#### **React Native (Expo)**
```javascript
// config/api.js
export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.100:8080', // Your computer's IP
  // NOT localhost or 127.0.0.1
};
```

#### **React Native (Physical Device)**
- Ensure phone and computer are on same WiFi
- Use computer's IP address, not localhost
- Check if mobile data is disabled (use WiFi only)

#### **Web Browser**
```javascript
// config/api.js
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080', // localhost works for web
  // or
  BASE_URL: 'http://192.168.1.100:8080', // IP also works
};
```

### 🔧 **Quick Fixes**

#### **Fix 1: Update IP Address**
1. Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update `config/api.js`:
```javascript
BASE_URL: 'http://YOUR_IP:8080',
```

#### **Fix 2: Test API Endpoint**
1. Open browser
2. Go to: `http://YOUR_IP:8080/auth/login`
3. Should see API response or error page

#### **Fix 3: Check Server Status**
1. Look at your backend console
2. Should see: "Server running on port 8080"
3. If not, start your server

#### **Fix 4: Network Test**
1. From your phone, open browser
2. Go to: `http://YOUR_IP:8080`
3. Should connect to your server

### 🚨 **Emergency Fallback**

If nothing works, try this temporary solution:

```javascript
// config/api.js - Temporary fallback
export const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:8080', // Android emulator
  // or
  BASE_URL: 'http://localhost:8080', // iOS simulator
  // or
  BASE_URL: 'http://192.168.1.100:8080', // Physical device
};
```

### 📞 **Still Having Issues?**

1. **Check your backend logs** for any errors
2. **Verify the API endpoint** exists: `/auth/login`
3. **Test with Postman** or similar tool
4. **Check if your backend accepts POST requests**
5. **Verify CORS settings** if testing on web

### 🔍 **Debug Information**

Add this to your login screen for debugging:

```javascript
const handleLogin = async () => {
  console.log('Attempting login to:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.LOGIN);
  console.log('With credentials:', { email: email.trim() });
  
  const response = await authService.login({
    email: email.trim(),
    password: password.trim(),
  });
  
  console.log('Login response:', response);
  // ... rest of your code
};
```

This will help you see exactly what's happening during the login attempt.
