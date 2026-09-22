import { ApiHandler } from "@/api/ApiHandler";

export interface DashboardKpis {
  total_msmes: number;
  archived_msmes: number;
  total_opportunities: number;
  published_opportunities: number;
  draft_opportunities: number;
  total_inquiries: number;
  pending_inquiries: number;
  total_msme_requests: number;
  pending_msme_requests: number;
  completed_msme_requests: number;
  total_users: number;
  total_indicator_values: number;
  total_indicators: number;
  total_news_articles: number;
}

export interface ProvincialSummary {
  population: number;
  land_area: number;
  barangays: number;
  coastline?: number | null;
  coastline_display?: string;
  total_lgus: number;
  total_gdp: number;
  gdp_formatted?: string;
  gdp_growth?: number;
}

export interface OfficialStatisticItem {
  id?: number;
  metric_key: string;
  value: number | null;
  display_value: string;
  unit?: string | null;
  reference_year?: number | null;
  growth_rate?: number | null;
  source_name: string;
  source_url: string;
  source_title: string;
  retrieved_at?: string;
  status: "verified" | "updated" | "unavailable";
  notes?: string;
}

export interface MetricVerificationResult {
  status: "verified" | "updated" | "unavailable";
  display_value: string;
  reference_year?: number | null;
  growth_rate?: number | null;
  source: string;
  message: string;
}

export interface RefreshDashboardResponse {
  status: string;
  message: string;
  results: Record<string, MetricVerificationResult>;
  statistics: Record<string, OfficialStatisticItem>;
  last_updated: string;
}

export interface ChartItem {
  category?: string;
  enterprise_type?: string;
  municipality?: string;
  status?: string;
  count: number;
}

export interface RecentInquiryItem {
  id: number;
  opportunity_id?: number | null;
  investor_name: string;
  email: string;
  company?: string;
  subject?: string;
  status: string;
  created_at: string;
  opportunity?: {
    id: number;
    project_name: string;
  } | null;
}

export interface RecentMsmeRequestItem {
  id: number;
  user_id?: number;
  company_name: string;
  contact_person: string;
  email: string;
  classification: string;
  status: string;
  created_at: string;
  user?: {
    id: number;
    fullname: string;
    email: string;
  };
}

export interface RecentMsmeItem {
  id: number;
  business_name: string;
  owner_name: string;
  category_name: string;
  enterprise_type: string;
  municipality_name: string;
  status: string;
  date_registered?: string;
  created_at?: string;
}

export interface RecentOpportunityItem {
  id: number;
  project_name: string;
  category_name: string;
  municipality_name: string;
  roi_estimate?: number;
  land_area?: number | string;
  status: string;
  created_at?: string;
}

export interface AdminDashboardData {
  kpis: DashboardKpis;
  provincial_summary: ProvincialSummary;
  official_statistics?: Record<string, OfficialStatisticItem>;
  msmes_by_industry: { category: string; count: number }[];
  msmes_by_type: { enterprise_type: string; count: number }[];
  msmes_by_municipality: { municipality: string; count: number }[];
  opportunities_by_category: { category: string; count: number }[];
  inquiries_by_status: { status: string; count: number }[];
  msme_requests_by_status: { status: string; count: number }[];
  recent_inquiries: RecentInquiryItem[];
  recent_msme_requests: RecentMsmeRequestItem[];
  recent_msmes: RecentMsmeItem[];
  recent_opportunities: RecentOpportunityItem[];
}

export const AdminDashboardService = {
  /**
   * Fetch live aggregated dashboard data for the admin portal.
   */
  getDashboardData: async (bustCache = false) => {
    const query = bustCache ? `?t=${Date.now()}` : "";
    return await ApiHandler.get<AdminDashboardData>(`/v1/admin/dashboard${query}`);
  },

  /**
   * Trigger authoritative government data verification and live refresh.
   */
  refreshDashboardData: async () => {
    return await ApiHandler.post<RefreshDashboardResponse>("/v1/admin/dashboard/refresh", {});
  },
};

export default AdminDashboardService;
