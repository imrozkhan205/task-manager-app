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
      // Setting token in axios defaults is redundant if using the request interceptor reliably, 
      // but keeping it here for immediate post-login/register requests before the interceptor runs.
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
        // Only set header if it's not already set, or for non-auth endpoints that need it
        if (!config.headers.Authorization) {
          config.headers = config.headers || {};
          config.headers["Authorization"] = `Bearer ${token}`;
          console.log("📤 Request with Authorization header (via Interceptor)");
        }
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

const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove(["auth_token", "user_data"]);
    delete api.defaults.headers.common["Authorization"];
    console.log("🧹 Auth data cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing auth data:", error);
  }
};

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log("🚫 Unauthorized - clearing stored auth data");
      await clearAuthData();
      // In a real app, you would dispatch an action or navigate to the login screen here
    }
    return Promise.reject(error);
  }
);

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
      
      // Set token in axios defaults for immediate use and interceptor fallback
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
      
      // Set token in axios defaults for immediate use and interceptor fallback
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

// ----------------- Task API Interfaces -----------------
export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in progress' | 'done'; // Changed to match the primary request
  priority: 'low' | 'medium' | 'high'; // Changed to match the primary request
  dueDate?: string;
  completed?: boolean; // Optional, might be derived from status
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse {
  tasks: Task[];
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  hasMore: boolean;
}

export interface TaskStats {
  pending: number;
  'in progress': number;
  done: number;
  total: number;
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

// Helper function to make authenticated requests
// NOTE: We rely on the axios request interceptor to add the token, 
// so we don't need to manually fetch and set it here, keeping this simpler.
const makeAuthenticatedRequest = async (method: string, url: string, data?: any) => {
  // The request interceptor will handle checking for the token and setting the header.
  // The response interceptor handles 401 (Unauthorized).
  
  // We throw an error here only if we explicitly want to block requests 
  // *before* they are sent if the token is missing, which is a good practice.
  if (!(await authAPI.isAuthenticated())) {
    throw new Error("User not authenticated. Please login first.");
  }

  const config = {
    method,
    url,
    data,
  };

  console.log(`📤 ${method.toUpperCase()} ${url}`);
  return await api.request(config);
};

// ----------------- Task API Implementation -----------------
export const taskAPI = {
  // Original method - keep for backward compatibility
  getTasks: async (): Promise<Task[]> => {
    console.log("📋 Fetching tasks...");
    const res = await makeAuthenticatedRequest('get', '/tasks');
    console.log(`✅ Fetched ${res.data.length} tasks`);
    return res.data;
  },
  
  updateTask: async (id: string, data: UpdateTaskData): Promise<Task> => {
    console.log("✏️ Updating task:", id);
    const res = await makeAuthenticatedRequest('put', `/tasks/${id}`, data);
    console.log("✅ Task updated successfully");
    return res.data;
  },

  // NEW: Get tasks with pagination
  getTasksPaginated: async (page: number = 1, limit: number = 5): Promise<PaginatedResponse> => {
    console.log(`📋 Fetching tasks - Page ${page}, Limit ${limit}...`);
    const res = await makeAuthenticatedRequest('get', `/tasks/paginated?page=${page}&limit=${limit}`);
    console.log(`✅ Fetched ${res.data.tasks.length} tasks (Page ${res.data.currentPage}/${res.data.totalPages})`);
    return res.data;
  },

  // NEW: Get task statistics (optional - for header counts)
  getTaskStats: async (): Promise<TaskStats> => {
    console.log("📊 Fetching task stats...");
    const res = await makeAuthenticatedRequest('get', '/tasks/stats');
    console.log(`✅ Stats: Pending=${res.data.pending}, In Progress=${res.data['in progress']}, Done=${res.data.done}`);
    return res.data;
  },

  getTask: async (id: string): Promise<Task> => {
    const res = await makeAuthenticatedRequest('get', `/tasks/${id}`);
    return res.data;
  },

  createTask: async (data: CreateTaskData): Promise<Task> => {
    console.log("➕ Creating task:", data.title);
    const res = await makeAuthenticatedRequest('post', '/tasks', data);
    console.log("✅ Task created successfully");
    return res.data;
  },

  // Updated to use PATCH and UpdateTaskData to align with standard REST practices
  

  deleteTask: async (id: string): Promise<{ message: string }> => {
    console.log("🗑️ Deleting task:", id);
    // The response for delete might be empty or include a message, 
    // I've kept it as returning a message object for consistency with common API patterns.
    const res = await makeAuthenticatedRequest('delete', `/tasks/${id}`);
    console.log("✅ Task deleted successfully");
    return res.data;
  },
  
  // Kept your existing custom endpoint
  toggleTask: async (id: string): Promise<Task> => {
    console.log("🔄 Toggling task:", id);
    const res = await makeAuthenticatedRequest('patch', `/tasks/${id}/toggle`);
    console.log("✅ Task toggled successfully");
    return res.data;
  },
};