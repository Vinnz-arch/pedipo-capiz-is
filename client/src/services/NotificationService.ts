import { ApiHandler } from "@/api/ApiHandler";

export interface AppNotification {
  id: number;
  user_id?: number | null;
  role: "admin" | "client";
  type: "inquiry" | "inquiry_status" | "msme_request" | "msme_status" | "system" | "report" | string;
  title: string;
  message: string;
  action_url?: string | null;
  data?: Record<string, any> | null;
  read_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface NotificationResponse {
  unread_count: number;
  notifications: AppNotification[];
}

export const NotificationService = {
  /**
   * Fetch recent notifications and unread count.
   */
  getNotifications: async () => {
    return await ApiHandler.get<NotificationResponse>("/v1/notifications");
  },

  /**
   * Mark a single notification as read.
   */
  markAsRead: async (id: number) => {
    return await ApiHandler.patch<{ message: string; notification: AppNotification }>(
      `/v1/notifications/${id}/read`
    );
  },

  /**
   * Mark all notifications as read.
   */
  markAllAsRead: async () => {
    return await ApiHandler.patch<{ message: string }>(
      "/v1/notifications/read-all",
      undefined,
      "All notifications marked as read."
    );
  },

  /**
   * Delete a notification.
   */
  deleteNotification: async (id: number) => {
    return await ApiHandler.delete<{ message: string }>(
      `/v1/notifications/${id}`
    );
  },
};

export default NotificationService;
