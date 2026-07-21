import { ApiHandler } from "@/api/ApiHandler";

export interface InquiryData {
  id: number | string;
  opportunity_id?: number | string;
  opportunity?: {
    id: number | string;
    project_name: string;
    category?: { name: string };
  };
  investor_name: string;
  email: string;
  company?: string;
  message: string;
  status: "Pending" | "Under Review" | "Approved" | "Rejected" | "Responded";
  admin_notes?: string;
  reviewed_at?: string;
  created_at?: string;
}

export interface InquiryResponse {
  inquiries: InquiryData[];
}

export const InquiryService = {
  /**
   * Submit a new investor inquiry from the public Capiz Investor Portal.
   */
  submit: async (data: {
    opportunity_id?: number | string;
    investor_name: string;
    email: string;
    company?: string;
    message: string;
  }) => {
    return await ApiHandler.post<{ message: string; inquiry: InquiryData }>(
      "/v1/portal/inquiries",
      data,
      "Investment inquiry submitted successfully!"
    );
  },

  /**
   * Fetch all inquiries for official review.
   */
  getAll: async () => {
    return await ApiHandler.get<InquiryResponse>("/v1/inquiries");
  },

  /**
   * Update official review status and administrative notes.
   */
  updateReview: async (
    id: number | string,
    payload: { status: InquiryData["status"]; admin_notes?: string }
  ) => {
    return await ApiHandler.put<{ message: string; inquiry: InquiryData }>(
      `/v1/inquiries/${id}`,
      payload,
      "Inquiry review status updated!"
    );
  },

  /**
   * Delete an inquiry record.
   */
  delete: async (id: number | string) => {
    return await ApiHandler.delete<{ message: string }>(
      `/v1/inquiries/${id}`,
      "Inquiry deleted successfully!"
    );
  },
};

export default InquiryService;
