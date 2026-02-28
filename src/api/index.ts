import axios from "axios";
import type { Task } from "../types/task";

const api = axios.create({
  baseURL: "/api", 
});

export const projectsApi = {
  getAll: () => api.get("/projects"),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: { name: string; description?: string }) =>
    api.post("/projects", {
      ...data,
      createdAt: new Date().toISOString(),
    }),
  update: (id: string, data: Partial<{ name: string; description: string }>) =>
    api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

export const tasksApi = {
  getByProject: (projectId: string) => api.get(`/tasks?projectId=${projectId}`),
  create: (data: Omit<Task, "id" | "order">) =>
    api.post("/tasks", {
      ...data,
      order: 0, 
    }),
  update: (id: string, data: Partial<Task>) => api.patch(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};
