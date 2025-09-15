import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MessAppBar({
  title = 'Manage all messes in the system',
  onMenuPress,
  showMenu = true,
  backgroundColor = '#FFFFFF',
  textColor = '#111827',
  logoIconName = 'business',
  logoIconColor = '#8B5CF6',
  showNotifications = false,
  notificationCount = 0,
  onNotificationsPress,
  showProfile = false,
  onProfilePress,
  rightActions = null,
  profileAvatarUri,
}) {
  const insets = useSafeAreaInsets();
  const isLight = backgroundColor === '#FFFFFF';
  return (
    <View style={{ backgroundColor: backgroundColor }}>
      <View style={{ height: insets.top, backgroundColor: backgroundColor }} />
      <View style={[styles.header, { backgroundColor: backgroundColor }]}>
        <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} />
        <View style={styles.headerTop}>
          {showMenu ? (
            <TouchableOpacity  onPress={onMenuPress}>
              <Ionicons name="menu" size={24} color={textColor} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 44 }} />
          )}
          <View style={styles.headerCenter}>
            <Text style={[styles.systemName, { color: textColor }]} numberOfLines={1}>{title}</Text>
          </View>
          <View style={styles.headerRight}>
            {rightActions}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderBottomWidth: 0,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    height: 56,
  },
  menuButton: {
    padding: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    // backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  systemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationButton: {
    padding: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F56565',
  },
  profileButton: {
    padding: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});


