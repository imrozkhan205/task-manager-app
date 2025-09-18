import axios, { InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL = "https://task-manager-mv55.onrender.com/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------- Token Management ----------------
export const getStoredToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    console.log("🔍 Retrieved token from storage:", token ? "✅ Found" : "❌ Not found");
    return token;
  } catch (error) {
    console.error("❌ Error retrieving token:", error);
    return null;
  }
};

export const setAuthToken = async (token: string | null) => {
  try {
    if (token) {
      await AsyncStorage.setItem("auth_token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log("✅ Auth token set successfully");
    } else {
      await AsyncStorage.removeItem("auth_token");
      delete api.defaults.headers.common["Authorization"];
      console.log("❌ Auth token removed");
    }
  } catch (error) {
    console.error("❌ Error managing token:", error);
  }
};

// Request interceptor - ensure token is always fresh
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getStoredToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
        console.log("📤 Request with Authorization header");
      } else {
        console.log("📤 Request without token (public endpoint)");
      }
    } catch (error) {
      console.error("❌ Error in request interceptor:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log("🚫 Unauthorized - clearing stored auth data");
      await clearAuthData();
      // Optionally redirect to login screen here
    }
    return Promise.reject(error);
  }
);

const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove(["auth_token", "user_data"]);
    delete api.defaults.headers.common["Authorization"];
    console.log("🧹 Auth data cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing auth data:", error);
  }
};

// ----------------- Auth API -----------------
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    console.log("🔐 Attempting login...");
    const res = await api.post("/auth/login", data);
    
    if (res.data.token && res.data.user) {
      await AsyncStorage.setItem("auth_token", res.data.token);
      await AsyncStorage.setItem("user_data", JSON.stringify(res.data.user));
      
      // Set token in axios defaults for immediate use
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      
      console.log("✅ Login successful, token stored");
    } else {
      throw new Error("Invalid response from server");
    }
    
    return res.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    console.log("📝 Attempting registration...");
    const res = await api.post("/auth/register", data);
    
    if (res.data.token && res.data.user) {
      await AsyncStorage.setItem("auth_token", res.data.token);
      await AsyncStorage.setItem("user_data", JSON.stringify(res.data.user));
      
      // Set token in axios defaults for immediate use
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      
      console.log("✅ Registration successful, token stored");
    } else {
      throw new Error("Invalid response from server");
    }
    
    return res.data;
  },

  logout: async (): Promise<void> => {
    console.log("👋 Logging out...");
    await clearAuthData();
  },

  // Helper to check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    const token = await getStoredToken();
    return !!token;
  },

  // Get current user data
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userData = await AsyncStorage.getItem("user_data");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("❌ Error getting current user:", error);
      return null;
    }
  }
};

// ----------------- Task API -----------------
export interface Task {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  status?: "pending" | "in progress" | "done";
  createdAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  completed?: boolean;
  status?: "pending" | "in progress" | "done";
}

// Helper function to ensure user is authenticated before making requests
const ensureAuthenticated = async () => {
  const isAuth = await authAPI.isAuthenticated();
  if (!isAuth) {
    throw new Error("User not authenticated. Please login first.");
  }
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (method: string, url: string, data?: any) => {
  await ensureAuthenticated();
  
  const token = await getStoredToken();
  if (!token) {
    throw new Error("No authentication token available");
  }

  const config = {
    method,
    url,
    data,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  console.log(`📤 ${method.toUpperCase()} ${url} with explicit auth header`);
  return await api.request(config);
};

export const taskAPI = {
  getTasks: async (): Promise<Task[]> => {
    console.log("📋 Fetching tasks...");
    const res = await makeAuthenticatedRequest('get', '/tasks');
    console.log(`✅ Fetched ${res.data.length} tasks`);
    return res.data;
  },

  createTask: async (data: CreateTaskData): Promise<Task> => {
    console.log("➕ Creating task:", data.title);
    const res = await makeAuthenticatedRequest('post', '/tasks', data);
    console.log("✅ Task created successfully");
    return res.data;
  },

  updateTask: async (id: string, data: UpdateTaskData): Promise<Task> => {
    console.log("✏️ Updating task:", id);
    const res = await makeAuthenticatedRequest('put', `/tasks/${id}`, data);
    console.log("✅ Task updated successfully");
    return res.data;
  },

  deleteTask: async (id: string): Promise<{ message: string }> => {
    console.log("🗑️ Deleting task:", id);
    const res = await makeAuthenticatedRequest('delete', `/tasks/${id}`);
    console.log("✅ Task deleted successfully");
    return res.data;
  },

  toggleTask: async (id: string): Promise<Task> => {
    console.log("🔄 Toggling task:", id);
    const res = await makeAuthenticatedRequest('patch', `/tasks/${id}/toggle`);
    console.log("✅ Task toggled successfully");
    return res.data;
  },
};