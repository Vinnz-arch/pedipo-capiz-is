import AxiosInstance from "./AxiosIntance";
import { notify } from "../util/notify";

/**
 * A wrapper for handling API calls with automatic error reporting.
 */
export const ApiHandler = {
  /**
   * Perform a GET request.
   */
  get: async <T>(url: string, showNotify: boolean = false) => {
    try {
      const response = await AxiosInstance.get<T>(url);
      if (showNotify) notify.success("Success", "Data retrieved successfully.");
      return response.data;
    } catch (error: any) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * Perform a POST request.
   */
  post: async <T>(url: string, data?: any, successMsg?: string) => {
    try {
      const config = data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined;
      const response = await AxiosInstance.post<T>(url, data, config);
      if (successMsg) notify.success("Success", successMsg);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * Perform a PUT request.
   */
  put: async <T>(url: string, data?: any, successMsg?: string) => {
    try {
      const config = data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined;
      const response = await AxiosInstance.put<T>(url, data, config);
      if (successMsg) notify.success("Success", successMsg);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * Perform a DELETE request.
   */
  delete: async <T>(url: string, successMsg?: string) => {
    try {
      const response = await AxiosInstance.delete<T>(url);
      if (successMsg) notify.success("Success", successMsg);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
      throw error;
    }
  },
};

/**
 * Internal helper to handle and notify API errors.
 */
const handleApiError = (error: any) => {
  const message = error.response?.data?.message || "Something went wrong. Please try again.";
  const title = error.response?.status === 422 ? "Validation Error" : "API Error";

  // We don't show notifications for 401 as AxiosInstance handles the redirect
  if (error.response?.status !== 401) {
    notify.error(title, message);
  }
};
