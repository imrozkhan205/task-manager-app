// app/_layout.tsx
import { Stack, Slot, Redirect } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import AuthGuard from '../components/AuthGuard';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          {/* 👇 Redirect root to tabs by default */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
