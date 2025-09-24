import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ADMIN_COLORS } from '../config/colors';
import AdminProfile from '../screens/admin/AdminProfile';
import Attendance from '../screens/admin/Attendance';
import CustomerManagement from '../screens/admin/CustomerManagement';
import AdminDashboard from '../screens/admin/Dashboard';
import EditCustomerByAdmin from '../screens/admin/EditCustomerByAdmin';
import EditProfile from '../screens/admin/EditProfile';
import CreateMealTiming from '../screens/admin/mealtiming/CreateMealTiming';
import ManageMealTiming from '../screens/admin/mealtiming/ManageMealTiming';
import Payments from '../screens/admin/Payments';
import { AssignSubscription, CreateSubscription, EditSubscriptionPlan, ManageAssignSubscription, ManageSubscriptionPlan } from '../screens/admin/subscription';

const Tab = createBottomTabNavigator();
const CustomersStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const SubscriptionStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Custom Drawer Content Component
function CustomDrawerContent(props) {
  const { navigation, state } = props;

  const drawerItems = [
    {
      name: 'Admin',
      label: 'Dashboard',
      icon: 'home-outline',
      activeIcon: 'home',
      route: 'Admin'
    },
    {
      name: 'SubscriptionPlans',
      label: 'Subscription Plans',
      icon: 'card-outline',
      activeIcon: 'card',
      route: 'SubscriptionPlans'
    },
    {
      name: 'AssignSubscription',
      label: 'Assign Subscription',
      icon: 'swap-horizontal-outline',
      activeIcon: 'swap-horizontal',
      route: 'AssignSubscription'
    },
    {
      name: 'MealTiming',
      label: 'Meal Time Management',
      icon: 'time-outline',
      activeIcon: 'time',
      route: 'MealTiming'
    }
  ];

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="restaurant" size={32} color={ADMIN_COLORS.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Mess Management</Text>
            <Text style={styles.headerSubtitle}>Admin Panel</Text>
          </View>
        </View>
      </View>

      <DrawerContentScrollView {...props} style={styles.drawerContent}>
        {drawerItems.map((item, index) => {
          const isActive = state.routeNames[state.index] === item.route;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.drawerItem, isActive && styles.activeDrawerItem]}
              onPress={() => {
                if (item.route === 'AssignSubscription') {
                  navigation.navigate('SubscriptionPlans', { screen: 'ManageAssignSubscription' });
                } else if (item.route === 'SubscriptionPlans') {
                  navigation.navigate('SubscriptionPlans', { screen: 'ManageSubscriptionPlan' });
                } else if (item.route === 'MealTiming') {
                  navigation.navigate('MealTiming', { screen: 'ManageMealTiming' });
                } else {
                  navigation.navigate(item.route);
                }
              }}
            >
              <View style={styles.drawerItemContent}>
                <Ionicons
                  name={isActive ? item.activeIcon : item.icon}
                  size={24}
                  color={isActive ? ADMIN_COLORS.primary : '#6B7280'}
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

function AdminCustomersStack() {
  return (
    <CustomersStack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: ADMIN_COLORS.primary },
        headerTintColor: ADMIN_COLORS.white,
        headerTitleStyle: { color: ADMIN_COLORS.white },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ paddingHorizontal: 12 }}>
            <Ionicons name="menu" size={22} color={ADMIN_COLORS.white} />
          </TouchableOpacity>
        ),
      })}
    >
      <CustomersStack.Screen name="CustomerManagement" component={CustomerManagement} options={{ title: 'Customers' }} />
      <CustomersStack.Screen name="EditCustomerByAdmin" component={EditCustomerByAdmin} options={{ title: 'Edit Customer' }} />
    </CustomersStack.Navigator>
  );
}

function AdminProfileStack() {
  return (
    <ProfileStack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: ADMIN_COLORS.primary },
        headerTintColor: ADMIN_COLORS.white,
        headerTitleStyle: { color: ADMIN_COLORS.white },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 12 }}>
            <Ionicons name="arrow-back" size={22} color={ADMIN_COLORS.white} />
          </TouchableOpacity>
        ),
      })}
    >
      <ProfileStack.Screen name="AdminProfile" component={AdminProfile} options={{ title: 'Profile' }} />
      <ProfileStack.Screen name="EditProfile" component={EditProfile} options={{ title: 'Edit Profile' }} />
    </ProfileStack.Navigator>
  );
}

function AdminSubscriptionStack() {
  return (
    <SubscriptionStack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: ADMIN_COLORS.primary },
        headerTintColor: ADMIN_COLORS.white,
        headerTitleStyle: { color: ADMIN_COLORS.white },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 12 }}>
            <Ionicons name="arrow-back" size={22} color={ADMIN_COLORS.white} />
          </TouchableOpacity>
        ),
      })}
    >
      <SubscriptionStack.Screen
        name="ManageSubscriptionPlan"
        component={ManageSubscriptionPlan}
        options={({ navigation }) => ({
          title: 'Subscription Plans',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.getParent()?.openDrawer()} style={{ paddingHorizontal: 12 }}>
              <Ionicons name="menu" size={22} color={ADMIN_COLORS.white} />
            </TouchableOpacity>
          ),
        })}
      />
      <SubscriptionStack.Screen
        name="ManageAssignSubscription"
        component={ManageAssignSubscription}
        options={({ navigation }) => ({
          title: 'Assign Subscriptions',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.getParent()?.openDrawer()} style={{ paddingHorizontal: 12 }}>
              <Ionicons name="menu" size={22} color={ADMIN_COLORS.white} />
            </TouchableOpacity>
          ),
        })}
      />
      <SubscriptionStack.Screen
        name="CreateSubscription"
        component={CreateSubscription}
        options={{ title: 'Create Plan' }}
      />
      <SubscriptionStack.Screen
        name="EditSubscriptionPlan"
        component={EditSubscriptionPlan}
        options={{ title: 'Edit Plan' }}
      />
      <SubscriptionStack.Screen
        name="AssignSubscription"
        component={AssignSubscription}
        options={{ title: 'Assign Subscription' }}
      />
    </SubscriptionStack.Navigator>
  );
}

const MealTimingStack = createNativeStackNavigator();
function AdminMealTimingStack() {
  return (
    <MealTimingStack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: ADMIN_COLORS.primary },
        headerTintColor: ADMIN_COLORS.white,
        headerTitleStyle: { color: ADMIN_COLORS.white },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.getParent()?.openDrawer()} style={{ paddingHorizontal: 12 }}>
            <Ionicons name="menu" size={22} color={ADMIN_COLORS.white} />
          </TouchableOpacity>
        ),
      })}
    >
      <MealTimingStack.Screen
        name="ManageMealTiming"
        component={ManageMealTiming}
        options={{ title: 'Meal Time Management' }}
      />
      <MealTimingStack.Screen
        name="CreateMealTiming"
        component={CreateMealTiming}
        options={{ title: 'Create Meal Time' }}
      />
    </MealTimingStack.Navigator>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: ADMIN_COLORS.primary },
        headerTintColor: ADMIN_COLORS.white,
        headerTitleStyle: { color: ADMIN_COLORS.white },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ paddingHorizontal: 12 }}>
            <Ionicons name="menu" size={22} color={ADMIN_COLORS.white} />
          </TouchableOpacity>
        ),
        tabBarShowLabel: false,
        tabBarActiveTintColor: ADMIN_COLORS.white,
        tabBarInactiveTintColor: '#FFD7C6',
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          height: 54,
          backgroundColor: ADMIN_COLORS.primary,
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
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={23} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Customers" component={AdminCustomersStack} options={{ headerShown: false }} />
      <Tab.Screen name="Attendance" component={Attendance} />
      <Tab.Screen name="Payments" component={Payments} />
      <Tab.Screen name="Profile" component={AdminProfileStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: '#fff' },
      }}
    >
      <Drawer.Screen name="Admin" component={Tabs} />
      <Drawer.Screen
        name="SubscriptionPlans"
        component={AdminSubscriptionStack}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="MealTiming"
        component={AdminMealTimingStack}
        options={{ headerShown: false }}
      />
      {/* Assign Subscription uses the same stack and initial route is controlled via drawer item navigation */}
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  drawerHeader: {
    backgroundColor: ADMIN_COLORS.primary,
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
    backgroundColor: 'rgba(151, 8, 14, 0.1)',
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
    color: ADMIN_COLORS.primary,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: ADMIN_COLORS.primary,
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
