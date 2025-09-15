// Script to help find your computer's IP address
// Run with: node scripts/find-ip.js

const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  console.log('🔍 Finding your IP address for API configuration...\n');
  
  for (const interfaceName in interfaces) {
    const networkInterface = interfaces[interfaceName];
    
    for (const connection of networkInterface) {
      // Skip internal and non-IPv4 addresses
      if (connection.family === 'IPv4' && !connection.internal) {
        console.log(`📱 Use this IP for your API config:`);
        console.log(`   http://${connection.address}:8080\n`);
        
        console.log(`📝 Update your config/api.js file:`);
        console.log(`   BASE_URL: 'http://${connection.address}:8080',\n`);
        
        console.log(`🧪 Test your API in browser:`);
        console.log(`   http://${connection.address}:8080/auth/login\n`);
        
        return connection.address;
      }
    }
  }
  
  console.log('❌ No network interface found. Make sure you are connected to WiFi.');
  return null;
}

// Run the script
const ip = getLocalIPAddress();

if (ip) {
  console.log('✅ Configuration complete!');
  console.log('📋 Next steps:');
  console.log('   1. Update config/api.js with the IP above');
  console.log('   2. Make sure your API server is running on port 8080');
  console.log('   3. Test the login in your app');
} else {
  console.log('❌ Could not find IP address. Please check your network connection.');
}
