import { Tabs, router } from 'expo-router';
import { Platform, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Custom Add Button Component (keep this as-is)
// const AddButton = () => {
//     // ... (Your existing AddButton component code)
// };

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          marginLeft: 10,
          marginRight: 10,
          paddingBottom: Platform.OS === 'ios' ? 20 : 30,
          height: Platform.OS === 'ios' ? 90 : 80,
          marginBottom: Platform.OS === 'ios' ? 10 : 15,
          borderRadius: 20,
          position: 'absolute',
          left: 16,
          right: 16,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
          marginBottom: 10,
        },
        tabBarIconStyle: {
          marginBottom: 3,
          marginTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="upcoming"
        options={{
          title: 'Upcoming',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      {/* The key change is here */}
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => <AddButton />,
          tabBarLabel: () => null,
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent the default action (which is to navigate to the "add" tab's route)
            e.preventDefault();
            // Manually push to the add-task route
            router.push('/add-task');
          },
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

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
        marginTop: 21,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 0.8,
        elevation: 10,
      }}
    >
      <Text style={{ fontSize: 28, color: '#ffffff', fontWeight: '300' }}>
        +
      </Text>
    </View>
  );
};