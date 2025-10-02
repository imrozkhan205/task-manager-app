// app/(tabs)/_layout.tsx
import { Tabs, router } from 'expo-router';
import { Platform, Text, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;

LogBox.ignoreAllLogs(true);

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === 'ios' ? 65 : 80;

  return (
    // We use a regular View and apply the bottom safe area inset as padding.
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            marginHorizontal: 16,
            // Use insets.bottom to dynamically add safe area spacing
            marginBottom: insets.bottom + 15,
            height: tabBarHeight,
            paddingBottom: 8,
            paddingTop: 10,
            paddingHorizontal: isSmallDevice ? 4 : 6,
            borderRadius: 20,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          tabBarLabelStyle: {
            fontSize: isSmallDevice ? 11 : 12,
            fontWeight: '500',
            marginTop: 3,
            marginBottom: 5,
          },
          tabBarIconStyle: {
            marginTop: 0,
            marginBottom: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="upcoming"
          options={{
            title: 'Upcoming',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="add"
          options={{
            title: '',
            tabBarIcon: () => <AddButton />,
            tabBarLabel: () => null,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.push('/add-task');
            },
          }}
        />

        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="browse"
          options={{
            title: 'Browse',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="menu" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

// **You were missing this part of the code!**
const AddButton = () => {
  return (
    <View
      style={{
        width: isSmallDevice ? 52 : 56,
        height: isSmallDevice ? 52 : 56,
        borderRadius: isSmallDevice ? 26 : 28,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Platform.OS === 'ios' ? 12 : 10,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      <Text style={{
        fontSize: isSmallDevice ? 24 : 28,
        color: '#ffffff',
        fontWeight: '300'
      }}>
        +
      </Text>
    </View>
  );
};