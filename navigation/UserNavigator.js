import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import CUSTOMER_COLORS from '../config/colors';
import Attendance from '../screens/user/Attendance';
import CustomerDashboard from '../screens/user/CustomerDashboard';
import EditProfile from '../screens/user/EditProfile';
import Menu from '../screens/user/Menu';
import Payments from '../screens/user/Payments';
import Profile from '../screens/user/Profile';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function UserDrawerContent(props) {
  const { user } = useSelector((state) => state.auth);
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
      <View style={styles.drawerHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{(user?.name || user?.email || 'U').charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.drawerName}>{user?.name || '-'}</Text>
        <Text style={styles.drawerEmail}>{user?.email || '-'}</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: CUSTOMER_COLORS.white,
        tabBarInactiveTintColor: '#d9c9f2',
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          height: 54,
          backgroundColor: CUSTOMER_COLORS.primary,
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
          } else if (route.name === 'Attendance') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Payments') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Menu') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Activity') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={23} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={CustomerDashboard} />
      <Tab.Screen name="Attendance" component={Attendance} />
      <Tab.Screen name="Payments" component={Payments} />
      <Tab.Screen name="Menu" component={Menu} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default function UserNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <UserDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: CUSTOMER_COLORS.primary },
        headerTintColor: CUSTOMER_COLORS.white,
        headerTitleStyle: { color: CUSTOMER_COLORS.white },
        drawerActiveTintColor: CUSTOMER_COLORS.primary,
        drawerInactiveTintColor: '#000',
        drawerStyle: { backgroundColor: '#fff' },
      }}
    >
      <Drawer.Screen name="Customer Portal" component={Tabs} />
      <Drawer.Screen name="EditProfile" component={EditProfile} options={{ drawerItemStyle: { display: 'none' } }} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    backgroundColor: CUSTOMER_COLORS.primary,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: CUSTOMER_COLORS.primary,
    fontWeight: '700',
    fontSize: 20,
  },
  drawerName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  drawerEmail: {
    color: '#f3f3f3',
    fontSize: 12,
    marginTop: 2,
  },
});
