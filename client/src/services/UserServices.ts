import { ApiHandler } from "../api/ApiHandler";
import { PATHS } from "../routes/paths";

export interface User {
  id: number;
  fullname: string;
  username: string;
  email: string;
  role: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export const UserServices = {
  /**
   * User Portal Login
   */
  login: async (credentials: any) => {
    const data = await ApiHandler.post<any>("/v1/user/login", credentials, "Welcome to Portal!");
    localStorage.setItem("client_token", data.access_token);
    localStorage.setItem("client_user", JSON.stringify(data.user || data.client));
    return data;
  },

  /**
   * User Portal Logout
   */
  logout: async () => {
    await ApiHandler.post("/v1/user/logout", {}, "Successfully logged out.");
    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
  },

  /**
   * Fetch all users (paginated).
   */
  getAll: async (page: number = 1, perPage: number = 10, search: string = "") => {
    return await ApiHandler.get<PaginatedResponse<User>>(`/v1/users?page=${page}&per_page=${perPage}&search=${search}`);
  },

  /**
   * Fetch a single user by ID.
   */
  getById: async (id: number) => {
    return await ApiHandler.get<User>(`/v1/users/${id}`);
  },

  /**
   * Create a new user.
   */
  create: async (data: Partial<User>) => {
    return await ApiHandler.post<User>("/v1/users", data, "User created successfully.");
  },

  /**
   * Update an existing user.
   */
  update: async (id: number, data: Partial<User>) => {
    return await ApiHandler.put<User>(`/v1/users/${id}`, data, "User updated successfully.");
  },

  /**
   * Delete a user.
   */
  delete: async (id: number) => {
    return await ApiHandler.delete(`/v1/users/${id}`, "User deleted successfully.");
  },

  /**
   * Fetch logs for a specific user.
   */
  getLogs: async (userId: number, page: number = 1) => {
    return await ApiHandler.get<PaginatedResponse<any>>(`/v1/users/${userId}/logs?page=${page}`);
  },

  /**
   * Get the stored user auth token.
   */
  getToken: () => {
    return localStorage.getItem("client_token");
  },

  /**
   * Check if a user is currently authenticated.
   */
  isAuthenticated: () => {
    const token = localStorage.getItem("client_token");
    return !!token;
  }
};
