import { ApiHandler } from "@/api/ApiHandler";
import type { CategoryData } from "./OpportunityService";

export interface MsmeData {
  id?: number | string;
  business_name: string;
  owner_name: string;
  category_id: number | string;
  category?: CategoryData;
  enterprise_type: "Micro" | "Small" | "Medium";
  municipality_id: number | string;
  municipality?: {
    id: number | string;
    name: string;
    class: string;
  };
  barangay: string;
  complete_address: string;
  contact_number: string;
  email_address?: string | null;
  business_description: string;
  products_services?: string | null;
  logo_path?: string | null;
  cover_path?: string | null;
  product_image_1?: string | null;
  product_image_2?: string | null;
  product_image_3?: string | null;
  status: "Active" | "Inactive" | "Pending Approval";
  date_registered: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MsmeStats {
  total_msmes: number;
  msmes_by_municipality: { name: string; count: number }[];
  msmes_by_industry: { name: string; count: number }[];
  new_businesses: MsmeData[];
}

export interface MsmeListResponse {
  msmes: MsmeData[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const MsmeDirectoryService = {
  // Admin Methods
  getAllAdmin: async (params?: Record<string, any>) => {
    const query = new URLSearchParams(params).toString();
    return await ApiHandler.get<MsmeListResponse>(`/v1/msmes?${query}`);
  },

  getByIdAdmin: async (id: number | string) => {
    return await ApiHandler.get<{ msme: MsmeData }>(`/v1/msmes/${id}`);
  },

  createAdmin: async (formData: FormData) => {
    return await ApiHandler.post<{ message: string; msme: MsmeData }>(
      "/v1/msmes",
      formData,
      "MSME record created successfully!"
    );
  },

  updateAdmin: async (id: number | string, formData: FormData) => {
    // We send to POST /v1/msmes/{id} because Laravel PUT does not support files natively
    return await ApiHandler.post<{ message: string; msme: MsmeData }>(
      `/v1/msmes/${id}`,
      formData,
      "MSME record updated successfully!"
    );
  },

  deleteAdmin: async (id: number | string) => {
    return await ApiHandler.delete<{ message: string }>(
      `/v1/msmes/${id}`,
      "MSME record deleted successfully!"
    );
  },

  archiveAdmin: async (id: number | string) => {
    return await ApiHandler.post<{ message: string; msme: MsmeData }>(
      `/v1/msmes/${id}/archive`,
      {},
      "MSME record status updated!"
    );
  },

  getDashboardStats: async () => {
    return await ApiHandler.get<MsmeStats>("/v1/msmes/dashboard-stats");
  },

  // Public Methods
  getAllPublic: async (params?: Record<string, any>) => {
    const query = new URLSearchParams(params).toString();
    return await ApiHandler.get<MsmeListResponse>(`/v1/public/msmes?${query}`);
  },

  getByIdPublic: async (id: number | string) => {
    return await ApiHandler.get<{ msme: MsmeData }>(`/v1/public/msmes/${id}`);
  },
};

export default MsmeDirectoryService;
