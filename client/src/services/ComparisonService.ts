import { ApiHandler } from "@/api/ApiHandler";

export interface IndicatorValueDetail {
  value: number;
  year: number;
  quarter: number | null;
  source: string;
  source_name: string;
  source_url: string;
  confidence_level: string;
  last_updated: string;
}

export interface ComparisonMunicipality {
  id: number;
  name: string;
  class: string;
  population: number;
  land_area: number;
  seal_path: string | null;
  website_url: string | null;
  values: {
    [indicatorCode: string]: IndicatorValueDetail;
  };
}

export interface IndicatorData {
  id: number;
  name: string;
  code: string;
  category: string;
  unit: string | null;
  description: string | null;
}

export interface ComparisonResponse {
  selected: ComparisonMunicipality[];
  indicators: IndicatorData[];
  provincialAverages: {
    [indicatorCode: string]: number;
  };
}

export interface IndicatorSourceData {
  id: number;
  name: string;
  code: string;
  website_url: string | null;
  logo_path: string | null;
  description: string | null;
  confidence_level: string;
}

export interface SourceHistoryResponse {
  current_page: number;
  data: Array<{
    id: number;
    source: IndicatorSourceData;
    status: string;
    records_scraped: number;
    error_message: string | null;
    run_at: string;
  }>;
  last_page: number;
  total: number;
}

export interface LatestUpdateItem {
  id: number;
  municipality_name: string;
  indicator_name: string;
  indicator_code: string;
  value: number;
  unit: string | null;
  year: number;
  source: string;
  last_updated: string;
}

export const ComparisonService = {
  /**
   * Fetch comparison data for list of municipality names.
   */
  getComparison: async (municipalities: string[], year?: number): Promise<ComparisonResponse> => {
    const muniParam = encodeURIComponent(municipalities.join(","));
    const yearParam = year ? `&year=${year}` : "";
    return await ApiHandler.get<ComparisonResponse>(`/v1/comparison?municipalities=${muniParam}${yearParam}`);
  },

  /**
   * Fetch all indicators.
   */
  getIndicators: async (): Promise<{ indicators: IndicatorData[] }> => {
    return await ApiHandler.get<{ indicators: IndicatorData[] }>("/v1/indicators");
  },

  /**
   * Fetch all indicator sources.
   */
  getIndicatorSources: async (): Promise<{ sources: IndicatorSourceData[] }> => {
    return await ApiHandler.get<{ sources: IndicatorSourceData[] }>("/v1/indicator-sources");
  },

  /**
   * Fetch source histories log.
   */
  getSourceHistory: async (page = 1): Promise<SourceHistoryResponse> => {
    return await ApiHandler.get<SourceHistoryResponse>(`/v1/source-history?page=${page}`);
  },

  /**
   * Fetch latest update items.
   */
  getLatestUpdates: async (): Promise<{ updates: LatestUpdateItem[] }> => {
    return await ApiHandler.get<{ updates: LatestUpdateItem[] }>("/v1/latest-updates");
  },

  /**
   * Manually upload new indicator values (Admin only).
   */
  uploadManualData: async (data: Array<{
    municipality_id: number | string;
    indicator_code: string;
    source_code: string;
    value: number;
    year: number;
    quarter?: number | null;
    verification_status?: string;
  }>) => {
    return await ApiHandler.post<{ message: string; records_uploaded: number }>(
      "/v1/admin/manual-upload",
      { data },
      "Data uploaded successfully!"
    );
  }
};
