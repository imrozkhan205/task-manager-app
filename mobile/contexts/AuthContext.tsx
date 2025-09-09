import React, { createContext, ReactNode, useEffect, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, setAuthToken, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  // In your authContext.tsx, update the initializeAuth function:
  const initializeAuth = async () => {
  try {
    console.log("🔍 Initializing auth...");
    const [storedToken, storedUser] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(USER_KEY),
    ]);

    console.log("📱 Stored token:", storedToken);
    console.log("👤 Stored user:", storedUser);

    // Only set user if both token and user exist
    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
      // No need to call setAuthToken here since it's already stored
      console.log("✅ Auth token set successfully");
    }
  } catch (error) {
    console.error("❌ Failed to initialize auth:", error);
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  } finally {
    setIsLoading(false);
  }
};

  const login = async (email: string, password: string) => {
    try {
      console.log("🔐 AuthContext: Starting login...");
      const response = await authAPI.login({ email, password });
      setUser(response.user);
      setAuthToken(response.token);
      console.log("✅ AuthContext: User logged in");
    } catch (error) {
      console.error("❌ AuthContext: Login failed:", error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log("📝 AuthContext: Starting registration...");
      const response = await authAPI.register({ name, email, password });
      setUser(response.user);
      setAuthToken(response.token);
      console.log("✅ AuthContext: User registered & logged in");
    } catch (error) {
      console.error("❌ AuthContext: Registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("🚪 AuthContext: Logging out...");
      await authAPI.logout();
    } finally {
      setUser(null);
      setAuthToken(null);
      console.log("🧹 AuthContext: User logged out");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
