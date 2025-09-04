import axios from "axios";

const BASE_URL = "https://task-manager-app-f4dm.onrender.com/api"; // Render backend URL

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Task {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  completed?: boolean;
}

export const taskAPI = {
    getTasks: async (): Promise<Task[]> => {
      const res = await api.get("/tasks");
      return res.data;
    },
  
    createTask: async (data: CreateTaskData): Promise<Task> => {
      const res = await api.post("/tasks", data);
      return res.data;
    },
  
    updateTask: async (id: string, data: UpdateTaskData): Promise<Task> => {
      const res = await api.put(`/tasks/${id}`, data);
      return res.data;
    },
  
    deleteTask: async (id: string): Promise<{ message: string }> => {
      const res = await api.delete(`/tasks/${id}`);
      return res.data;
    },
  
    toggleTask: async (id: string): Promise<Task> => {
      const res = await api.patch(`/tasks/${id}/toggle`);
      return res.data;
    },
  };
  
