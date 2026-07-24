import { ApiHandler } from "@/api/ApiHandler";

export interface MsmeRequestData {
  id?: number | string;
  user_id?: number | string;
  user?: {
    id: number | string;
    fullname: string;
    email: string;
  };
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  classification: "Simple Transaction" | "Complex Transaction";
  description: string;
  request_letter_path: string;
  other_docs_path?: string | null;
  status: "Submitted" | "Under Review" | "Endorsed" | "Processing" | "Completed";
  admin_notes?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const MsmeService = {
  /**
   * Fetch all MSME assistance requests.
   * Regular users get their own, admins get all.
   */
  getAll: async () => {
    return await ApiHandler.get<{ requests: MsmeRequestData[] }>("/v1/msme-requests");
  },

  /**
   * Submit a new MSME assistance request (with file uploads).
   */
  create: async (formData: FormData) => {
    return await ApiHandler.post<{ message: string; request: MsmeRequestData }>(
      "/v1/msme-requests",
      formData,
      "Business Processing Assistance request submitted successfully!"
    );
  },

  /**
   * Update request status or admin notes (Admin/User).
   */
  update: async (id: number | string, data: Partial<MsmeRequestData>) => {
    return await ApiHandler.put<{ message: string; request: MsmeRequestData }>(
      `/v1/msme-requests/${id}`,
      data,
      "Request updated successfully!"
    );
  },

  /**
   * Delete an MSME request.
   */
  delete: async (id: number | string) => {
    return await ApiHandler.delete<{ message: string }>(
      `/v1/msme-requests/${id}`,
      "Request deleted successfully!"
    );
  },
};

export default MsmeService;
