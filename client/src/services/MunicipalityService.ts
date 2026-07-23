import { ApiHandler } from "@/api/ApiHandler";

// Structure definition for a Municipality economic profile
export interface MunicipalityData {
  id?: number | string;
  name: string;
  slug?: string;
  class: string; // e.g. "1st Class", "Component City"
  population: number;
  land_area: number; // in sq km
  barangay_count: number;
  gdp: number;
  key_industries?: string; // comma-separated or text
  description?: string;
  seal_path?: string;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const MunicipalityService = {
  /**
   * Fetch all municipalities.
   */
  getAll: async () => {
    return await ApiHandler.get<{ municipalities: MunicipalityData[] }>("/v1/municipalities");
  },

  /**
   * Fetch details of a single municipality.
   */
  getOne: async (id: number | string) => {
    return await ApiHandler.get<MunicipalityData>(`/v1/municipalities/${id}`);
  },

  /**
   * Create a new municipality profile (Admin only).
   */
  create: async (formData: FormData) => {
    return await ApiHandler.post<{ message: string; municipality: MunicipalityData }>(
      "/v1/municipalities",
      formData,
      "Municipality profile created successfully!"
    );
  },

  /**
   * Update an existing municipality profile (Admin only).
   * Uses POST with a spoofed or simple payload, or directly POST multipart form-data.
   */
  update: async (id: number | string, formData: FormData) => {
    return await ApiHandler.post<{ message: string; municipality: MunicipalityData }>(
      `/v1/municipalities/${id}`,
      formData,
      "Municipality profile updated successfully!"
    );
  },

  /**
   * Remove/Delete a municipality profile (Admin only).
   */
  delete: async (id: number | string) => {
    return await ApiHandler.delete<{ message: string }>(
      `/v1/municipalities/${id}`,
      "Municipality profile deleted successfully!"
    );
  },
};
