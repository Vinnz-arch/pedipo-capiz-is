import { ApiHandler } from "@/api/ApiHandler";

export interface LandingPageSettingData {
  id?: number | string;
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  vision_text: string;
  mission_point_1: string;
  mission_point_2: string;
  mission_point_3: string;
  msme_title: string;
  msme_description: string;
  mandate_text: string;
  service_pledge_1: string;
  service_pledge_2: string;
  service_pledge_3: string;
  service_pledge_4: string;
  contact_address: string;
  contact_email: string;
  contact_phone: string;
  contact_facebook?: string;
  contact_twitter?: string;
  contact_linkedin?: string;
  hero_image_path?: string;
  msme_image_path?: string;
  mandate_image_path?: string;
  division_1_title: string;
  division_1_subtitle: string;
  division_1_bullets: string;
  division_2_title: string;
  division_2_subtitle: string;
  division_2_bullets: string;
  division_3_title: string;
  division_3_subtitle: string;
  division_3_bullets: string;
}

export const LandingPageService = {
  /**
   * Fetch landing page settings.
   */
  getSettings: async () => {
    return await ApiHandler.get<{ settings: LandingPageSettingData }>("/v1/landing-settings");
  },

  /**
   * Update landing page settings (Admin only).
   */
  updateSettings: async (data: LandingPageSettingData | FormData) => {
    return await ApiHandler.post<{ message: string; settings: LandingPageSettingData }>(
      "/v1/landing-settings",
      data,
      "Landing page settings updated successfully!"
    );
  },
};
