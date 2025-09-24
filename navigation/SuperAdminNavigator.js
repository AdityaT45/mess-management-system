import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SUPER_ADMIN_COLORS } from '../config/colors';
import MessManagement from '../screens/superadmin/MessManagement';
import Notifications from '../screens/superadmin/Notifications';
import Profile from '../screens/superadmin/Profile';
import SuperAdminDashboard from '../screens/superadmin/SuperAdminDashboard';
import UserManagement from '../screens/superadmin/UserManagement';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function SuperAdminDrawerContent(props) {
  const { navigation, state } = props;

  const drawerItems = [
    { label: 'Dashboard', route: 'Dashboard', icon: 'home-outline', activeIcon: 'home' },
    { label: 'Messes', route: 'Messes', icon: 'business-outline', activeIcon: 'business' },
    { label: 'Users', route: 'Users', icon: 'people-outline', activeIcon: 'people' },
    { label: 'Activity', route: 'Activity', icon: 'notifications-outline', activeIcon: 'notifications' },
    { label: 'Profile', route: 'Profile', icon: 'person-outline', activeIcon: 'person' },
  ];

  // Helper to check active tab from nested state
  const currentRouteName = (() => {
    const drawerRoute = state?.routes?.[state?.index || 0];
    const nestedState = drawerRoute?.state;
    if (nestedState && nestedState.routes) {
      const tabRoute = nestedState.routes[nestedState.index || 0];
      return tabRoute?.name;
    }
    return 'Dashboard';
  })();

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="business" size={32} color={SUPER_ADMIN_COLORS.white} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Mess Management</Text>
            <Text style={styles.headerSubtitle}>Super Admin</Text>
          </View>
        </View>
      </View>

      <DrawerContentScrollView {...props} style={styles.drawerContent}>
        {drawerItems.map((item, index) => {
          const isActive = currentRouteName === item.route;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.drawerItem, isActive && styles.activeDrawerItem]}
              onPress={() => {
                navigation.navigate('SuperAdmin', { screen: item.route });
              }}
            >
              <View style={styles.drawerItemContent}>
                <Ionicons
                  name={isActive ? item.activeIcon : item.icon}
                  size={24}
                  color={isActive ? SUPER_ADMIN_COLORS.primary : '#6B7280'}
                />
                <Text style={[styles.drawerItemText, isActive && styles.activeDrawerItemText]}>
                  {item.label}
                </Text>
              </View>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </DrawerContentScrollView>

      <View style={styles.drawerFooter}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

function SuperAdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: SUPER_ADMIN_COLORS.primary },
        headerTintColor: SUPER_ADMIN_COLORS.white,
        headerTitleStyle: { color: SUPER_ADMIN_COLORS.white },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.getParent()?.openDrawer()} style={{ paddingHorizontal: 12 }}>
            <Ionicons name="menu" size={22} color={SUPER_ADMIN_COLORS.white} />
          </TouchableOpacity>
        ),
        tabBarShowLabel: false,
        tabBarActiveTintColor: SUPER_ADMIN_COLORS.white,
        tabBarInactiveTintColor: '#d9c9f2',
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          height: 54,
          backgroundColor: SUPER_ADMIN_COLORS.primary,
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

export default function SuperAdminNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <SuperAdminDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: '#fff' },
      }}
    >
      <Drawer.Screen name="SuperAdmin" component={SuperAdminTabs} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  drawerHeader: {
    backgroundColor: SUPER_ADMIN_COLORS.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  drawerContent: {
    flex: 1,
    paddingTop: 20,
  },
  drawerItem: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    position: 'relative',
  },
  activeDrawerItem: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  drawerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 16,
  },
  activeDrawerItemText: {
    color: SUPER_ADMIN_COLORS.primary,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: SUPER_ADMIN_COLORS.primary,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
