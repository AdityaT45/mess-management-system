import React from 'react';
import { Text } from 'react-native';

interface IconSymbolProps {
  name: string;
  size: number;
  color: string;
}

export function IconSymbol({ name, size, color }: IconSymbolProps) {
  // This is a simple text-based icon component
  // In a real app, you might want to use a proper icon library like @expo/vector-icons
  const iconMap: { [key: string]: string } = {
    'house.fill': '🏠',
    'paperplane.fill': '✈️',
  };

  return (
    <Text style={{ fontSize: size, color }}>
      {iconMap[name] || '📱'}
    </Text>
  );
}
