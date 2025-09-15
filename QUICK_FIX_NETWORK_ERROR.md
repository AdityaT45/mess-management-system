# 🚨 Quick Fix for "Network request failed" Error

## ⚡ **Immediate Solution**

### Step 1: Find Your Computer's IP Address

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (usually starts with 192.168.x.x)

**Mac/Linux:**
```bash
ifconfig
```
Look for "inet" address under your WiFi interface

### Step 2: Update Your API Configuration

Open `config/api.js` and replace the BASE_URL:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_IP_HERE:8080', // Replace YOUR_IP_HERE with your actual IP
  // Example: BASE_URL: 'http://192.168.1.100:8080',
  // ... rest of config stays the same
};
```

### Step 3: Make Sure Your API Server is Running

1. Start your backend server on port 8080
2. You should see something like: "Server running on port 8080"

### Step 4: Test the Connection

Open your browser and go to:
```
http://YOUR_IP:8080/auth/login
```

If you see an API response or error page, the connection works!

## 🔧 **Common Issues & Solutions**

### Issue 1: Still getting "Network request failed"
**Solution**: Make sure you're using your computer's IP, NOT localhost

### Issue 2: "Connection refused"
**Solution**: Your API server isn't running. Start it!

### Issue 3: "Timeout"
**Solution**: Check if port 8080 is correct and server is accessible

### Issue 4: Works on web but not mobile
**Solution**: Use your computer's IP address, not localhost

## 📱 **Platform-Specific Notes**

- **React Native/Expo**: Always use your computer's IP address
- **Web Browser**: Can use localhost or IP address
- **Physical Device**: Must use your computer's IP address
- **Emulator**: May need special IP (10.0.2.2 for Android)

## 🆘 **Still Not Working?**

1. **Check console logs** - Look for detailed error messages
2. **Test with browser** - Try accessing your API directly
3. **Check firewall** - Temporarily disable to test
4. **Verify network** - Make sure both devices are on same WiFi

## 📞 **Need Help?**

The error messages in your app will now be more helpful. Check the console for detailed debugging information!

---

**Quick Test:**
1. Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update `config/api.js` with your IP
3. Start your API server
4. Test login in your app

That's it! 🎉
