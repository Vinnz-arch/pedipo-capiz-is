import { ApiHandler } from "@/api/ApiHandler";

export interface CategoryData {
  id: number;
  name: string;
}

export interface OpportunityData {
  id: number | string;
  project_name: string;
  category_id: number;
  category?: CategoryData;
  roi_estimate?: number | string;
  land_area?: number | string;
  incentive_package?: string;
  image_path?: string;
  status: "Draft" | "Published" | "Closed";
  created_at?: string;
  updated_at?: string;
}

export interface OpportunityResponse {
  opportunities: OpportunityData[];
  categories: CategoryData[];
}

export const OpportunityService = {
  /**
   * Fetch all opportunities and categories from backend API.
   */
  getAll: async () => {
    return await ApiHandler.get<OpportunityResponse>("/v1/opportunities");
  },

  /**
   * Create a new opportunity in the database.
   */
  create: async (formData: FormData) => {
    return await ApiHandler.post<{ message: string; opportunity: OpportunityData }>(
      "/v1/opportunities",
      formData,
      "Opportunity created and saved to database!"
    );
  },

  /**
   * Update an existing opportunity in the database.
   */
  update: async (id: number | string, formData: FormData) => {
    // Append spoof method for multipart/form-data support in Laravel
    if (!formData.has("_method")) {
      formData.append("_method", "PUT");
    }
    return await ApiHandler.post<{ message: string; opportunity: OpportunityData }>(
      `/v1/opportunities/${id}`,
      formData,
      "Opportunity updated successfully!"
    );
  },

  /**
   * Delete an opportunity from the database.
   */
  delete: async (id: number | string) => {
    return await ApiHandler.delete<{ message: string }>(
      `/v1/opportunities/${id}`,
      "Opportunity deleted successfully!"
    );
  },
};

export default OpportunityService;
