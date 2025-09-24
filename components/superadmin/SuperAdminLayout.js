import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SUPER_ADMIN_COLORS } from '../../config/colors';


export default function SuperAdminLayout({

  children,
}) {
  return (
    <View style={styles.container}>
     
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SUPER_ADMIN_COLORS.surface,
  },
  content: {
    flex: 1,
  },
});


