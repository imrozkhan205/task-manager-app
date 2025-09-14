// app/_layout.tsx
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import AuthGuard from '../components/AuthGuard';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="add-task" />
          <Stack.Screen name="edit-task" />
          <Stack.Screen name="privacy-policy" />
        </Stack>
      </AuthGuard>
    </AuthProvider>
  );
}