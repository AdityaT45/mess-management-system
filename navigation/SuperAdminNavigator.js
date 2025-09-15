import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import MessManagement from '../screens/superadmin/MessManagement';
import Notifications from '../screens/superadmin/Notifications';
import Profile from '../screens/superadmin/Profile';
import SuperAdminDashboard from '../screens/superadmin/SuperAdminDashboard';
import UserManagement from '../screens/superadmin/UserManagement';

const Tab = createBottomTabNavigator();

export default function SuperAdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: '#A3A3A3',
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          // bottom: ,
          height: 54,
          // borderRadius: 20,
          backgroundColor: '#50348e',
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
          } else if (route.name === 'Messes') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Users') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Activity') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={23} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={SuperAdminDashboard} />
      <Tab.Screen name="Messes" component={MessManagement} />
      <Tab.Screen name="Users" component={UserManagement} />
      <Tab.Screen name="Activity" component={Notifications} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
