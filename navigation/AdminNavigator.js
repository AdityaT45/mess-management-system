import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import Attendance from '../screens/admin/Attendance';
import CustomerManagement from '../screens/admin/CustomerManagement';
import AdminDashboard from '../screens/admin/Dashboard';
import Payments from '../screens/admin/Payments';
import Settings from '../screens/admin/Settings';

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: '#FFD7C6',
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          height: 54,
          backgroundColor: '#FF6B35',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName = 'home-outline';
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Customers') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Attendance') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Payments') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={23} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Customers" component={CustomerManagement} />
      <Tab.Screen name="Attendance" component={Attendance} />
      <Tab.Screen name="Payments" component={Payments} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}
