// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366f1', // Purple color like in the image
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            paddingBottom: Platform.OS === 'ios' ? 20 : 20, // more padding
            height: Platform.OS === 'ios' ? 90 : 70,        // make it taller
            marginBottom: Platform.OS === 'ios' ? 10 : 15,  // lift it above bottom
            borderRadius: 20,                               // optional: rounded edges
            position: 'absolute',                           // floating style
            left: 16,
            right: 16,
            elevation: 8,                                   // shadow on Android
          },
          
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 3,
          marginBottom:10,
        },
        tabBarIconStyle: {
          marginBottom: 3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="upcoming"
        options={{
          title: 'Upcoming',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <AddButton />
          ),
          tabBarLabel: () => null, // Hide label for the add button
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="search" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="menu" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

import { Text, View } from 'react-native';

// Custom Tab Icon Component
interface TabIconProps {
  name: string;
  color: string;
  size: number;
}

const TabIcon = ({ name, color, size }: TabIconProps) => {
  const getIconText = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return '🏠';
      case 'calendar':
        return '📅';
      case 'search':
        return '🔍';
      case 'menu':
        return '📋';
      default:
        return '📋';
    }
  };

  return (
    <Text style={{ fontSize: size, color }}>
      {getIconText(name)}
    </Text>
  );
};

// Custom Add Button Component
const AddButton = () => {
  return (
    <View
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 21, // Elevate the button above the tab bar
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      <Text style={{ fontSize: 28, color: '#ffffff', fontWeight: '300' }}>
        +
      </Text>
    </View>
  );
};