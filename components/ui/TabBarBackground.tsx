import React from 'react';
import { View } from 'react-native';
import { BlurView } from 'expo-blur';

interface TabBarBackgroundProps {
  children?: React.ReactNode;
}

export default function TabBarBackground({ children }: TabBarBackgroundProps) {
  return (
    <BlurView intensity={80} style={{ flex: 1 }}>
      <View style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        flex: 1 
      }}>
        {children}
      </View>
    </BlurView>
  );
}
