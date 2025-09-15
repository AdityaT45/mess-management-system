import React from 'react';
import { StyleSheet, View } from 'react-native';
import MessAppBar from './MessAppBar';

export default function SuperAdminLayout({
  title,
  onMenuPress,
  backgroundColor = '#8B5CF6',
  textColor = '#FFFFFF',
  logoIconName = 'business',
  logoIconColor = '#8B5CF6',
  showNotifications = true,
  notificationCount = 0,
  onNotificationsPress,
  profileAvatarUri,
  showProfile = true,
  onProfilePress,
  rightActions = null,
  children,
}) {
  return (
    <View style={styles.container}>
      <MessAppBar
        title={title}
        onMenuPress={onMenuPress}
        showMenu
        backgroundColor={backgroundColor}
        textColor={textColor}
        logoIconName={logoIconName}
        logoIconColor={logoIconColor}
        showNotifications={showNotifications}
        notificationCount={notificationCount}
        onNotificationsPress={onNotificationsPress}
        showProfile={showProfile}
        onProfilePress={onProfilePress}
        rightActions={rightActions}
        profileAvatarUri={profileAvatarUri}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  content: {
    flex: 1,
  },
});


