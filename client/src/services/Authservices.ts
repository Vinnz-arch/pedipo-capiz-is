import { ApiHandler } from "../api/ApiHandler";

/**
 * Authentication Response Type
 */
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    [key: string]: any;
  };
}

/**
 * Service for handling authentication logic and state.
 */
export const AuthService = {
  /**
   * Log in a user and store their token.
   */
  login: async (credentials: any): Promise<LoginResponse> => {
    const data = await ApiHandler.post<LoginResponse>("/v1/login", credentials);
    
    // Save to local storage
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    
    return data;
  },

  /**
   * Log out the current user and clear local storage.
   */
  logout: async (): Promise<void> => {
    try {
      // Notify backend to invalidate token
      await ApiHandler.post("/v1/logout");
    } catch (error) {
      console.error("Logout API call failed", error);
    } finally {
      // Always clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  /**
   * Get the currently logged-in user from storage.
   */
  getUser: () => {
    const user = localStorage.getItem("user");
    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  /**
   * Get the stored auth token.
   */
  getToken: () => {
    return localStorage.getItem("token");
  },

  /**
   * Check if a user is currently authenticated.
   */
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    return !!token;
  }
};
