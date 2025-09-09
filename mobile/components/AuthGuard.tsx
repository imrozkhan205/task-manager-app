import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter, usePathname } from 'expo-router';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublicRoute) router.replace('/login');
      else if (isAuthenticated && isPublicRoute) router.replace('/');
    }
  }, [isAuthenticated, isLoading, isPublicRoute, router]);

  if (isLoading || (!isAuthenticated && !isPublicRoute) || (isAuthenticated && isPublicRoute)) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4ECDC4" />
        </View>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
