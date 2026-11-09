import { ApiHandler } from "@/api/ApiHandler";
import AxiosInstance from "@/api/AxiosIntance";

export interface CategoryData {
  id: number;
  name: string;
}

export interface OpportunityDocumentData {
  id: number | string;
  opportunity_id: number | string;
  title: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OpportunityData {
  id: number | string;
  parent_opportunity_id?: number | string | null;
  project_name: string;
  category_id: number;
  category?: CategoryData;
  municipality_id?: number | string;
  municipality?: {
    id: number | string;
    name: string;
    class: string;
  };
  roi_estimate?: number | string;
  land_area?: number | string;
  key_incentives?: string;
  description?: string;
  incentive_package?: string;
  image_path?: string;
  status: "Draft" | "Published" | "Closed";
  location?: string;
  source_name?: string;
  source_url?: string;
  documents?: OpportunityDocumentData[];
  spreadsheet_data?: {
    headers: string[];
    rows: string[][];
    filename?: string;
    updated_at?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface ParentOpportunityDocumentData {
  id: number | string;
  parent_opportunity_id: number | string;
  title: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AnnualReportFile {
  id?: string;
  filename: string;
  file_path: string;
  file_size?: number;
  uploaded_at?: string;
}

export interface ParentOperatorsAndProductionResponse {
  parent_opportunity: ParentOpportunityData;
  data_year?: string;
  annual_reports?: AnnualReportFile[];
  spreadsheet_data?: any;
  documents: ParentOpportunityDocumentData[];
}

export interface ParentOpportunityData {
  id: number | string;
  name: string;
  category_id?: number;
  category?: CategoryData;
  description?: string;
  data_year?: string;
  spreadsheet_data?: any;
  status: "Draft" | "Published" | "Closed";
  image_path?: string;
  projects_count: number;
  municipalities_summary: string[];
  total_land_area: number;
  projects?: OpportunityData[];
  documents?: ParentOpportunityDocumentData[];
  created_at?: string;
  updated_at?: string;
}

export interface ParentOpportunityResponse {
  parent_opportunities: ParentOpportunityData[];
  standalone_opportunities?: OpportunityData[];
  categories: CategoryData[];
  municipalities?: any[];
}

export interface OpportunityResponse {
  opportunities: OpportunityData[];
  categories: CategoryData[];
  municipalities?: any[];
}

export const OpportunityService = {
  /**
   * Fetch all parent opportunities and nested child projects.
   */
  getAllParents: async () => {
    return await ApiHandler.get<ParentOpportunityResponse>("/v1/parent-opportunities");
  },

  /**
   * Fetch public published parent opportunities for Investor Portal.
   */
  getPublicParents: async () => {
    return await ApiHandler.get<ParentOpportunityResponse>("/v1/portal/parent-opportunities");
  },

  /**
   * Create a new parent opportunity.
   */
  createParent: async (formData: FormData | Record<string, any>) => {
    return await ApiHandler.post<{ message: string; parent_opportunity: ParentOpportunityData }>(
      "/v1/parent-opportunities",
      formData,
      "Parent opportunity created!"
    );
  },


  /**
   * Update an existing parent opportunity.
   */
  updateParent: async (id: number | string, formData: FormData | Record<string, any>) => {
    if (formData instanceof FormData) {
      if (!formData.has("_method")) formData.append("_method", "PUT");
      return await ApiHandler.post<{ message: string; parent_opportunity: ParentOpportunityData }>(
        `/v1/parent-opportunities/${id}`,
        formData,
        "Parent opportunity updated!"
      );
    }
    return await ApiHandler.put<{ message: string; parent_opportunity: ParentOpportunityData }>(
      `/v1/parent-opportunities/${id}`,
      formData,
      "Parent opportunity updated!"
    );
  },


  /**
   * Delete a parent opportunity.
   */
  deleteParent: async (id: number | string) => {
    return await ApiHandler.delete<{ message: string }>(
      `/v1/parent-opportunities/${id}`,
      "Parent opportunity removed!"
    );
  },


  /**
   * Add a child project under a parent opportunity.
   */
  addChildProject: async (parentId: number | string, formData: FormData) => {
    return await ApiHandler.post<{ message: string; project: OpportunityData }>(
      `/v1/parent-opportunities/${parentId}/projects`,
      formData,
      "Project added to opportunity!"
    );
  },


  /**
   * Update a child project.
   */
  updateChildProject: async (id: number | string, formData: FormData) => {
    if (!formData.has("_method")) {
      formData.append("_method", "PUT");
    }
    return await ApiHandler.post<{ message: string; project: OpportunityData }>(
      `/v1/child-projects/${id}`,
      formData,
      "Project details updated!"
    );
  },


  /**
   * Move a child project to a different parent opportunity.
   */
  moveChildProject: async (id: number | string, parentOpportunityId: number | string) => {
    return await ApiHandler.put<{ message: string; project: OpportunityData }>(
      `/v1/child-projects/${id}/move`,
      { parent_opportunity_id: parentOpportunityId },
      "Project moved successfully!"
    );
  },


  /**
   * Delete a child project.
   */
  deleteChildProject: async (id: number | string) => {
    return await ApiHandler.delete<{ message: string }>(
      `/v1/child-projects/${id}`,
      "Project deleted successfully!"
    );
  },


  /**
   * Get overall operators and production data for a parent opportunity.
   */
  getParentOperatorsAndProduction: async (parentId: number | string) => {
    return await ApiHandler.get<ParentOperatorsAndProductionResponse>(
      `/v1/parent-opportunities/${parentId}/operators-and-production`
    );
  },


  /**
   * Update overall operators and production spreadsheet and data year.
   */
  updateParentOperatorsAndProduction: async (
    parentId: number | string,
    payload: { data_year?: string; headers: string[]; rows: string[][] }
  ) => {
    return await ApiHandler.put<{
      message: string;
      data_year: string;
      spreadsheet_data: any;
    }>(
      `/v1/parent-opportunities/${parentId}/operators-and-production`,
      payload,
      "Operators and production data updated!"
    );
  },


  /**
   * Upload one or multiple annual report spreadsheet files for parent opportunity.
   */
  uploadParentOperatorsSpreadsheet: async (
    parentId: number | string,
    files: File | File[]
  ) => {
    const formData = new FormData();
    if (Array.isArray(files)) {
      files.forEach((file) => formData.append("files[]", file));
    } else {
      formData.append("file", files);
    }
    return await ApiHandler.post<{
      message: string;
      annual_reports: any[];
      spreadsheet_data: any;
    }>(
      `/v1/parent-opportunities/${parentId}/operators-and-production/spreadsheet/upload`,
      formData,
      "Annual report file(s) uploaded successfully!"
    );
  },


  /**
   * Delete a specific annual report file for parent opportunity.
   */
  deleteParentOperatorsSpreadsheetFile: async (
    parentId: number | string,
    fileId: string
  ) => {
    return await ApiHandler.delete<{
      message: string;
      annual_reports: any[];
      spreadsheet_data: any;
    }>(
      `/v1/parent-opportunities/${parentId}/operators-and-production/spreadsheet/files/${fileId}`,
      "Annual report file removed!"
    );
  },


  /**
   * Delete / clear all annual report spreadsheets for parent opportunity.
   */
  deleteParentOperatorsSpreadsheet: async (parentId: number | string) => {
    return await ApiHandler.delete<{
      message: string;
      annual_reports: any[];
      spreadsheet_data: any;
    }>(
      `/v1/parent-opportunities/${parentId}/operators-and-production/spreadsheet`,
      "Annual report spreadsheets removed!"
    );
  },

  /**
   * Upload physical spreadsheet file (.xlsx, .csv) with high-fidelity preview payload for child opportunity.
   */
  uploadOpportunitySpreadsheet: async (
    opportunityId: number | string,
    formData: FormData
  ) => {
    return await ApiHandler.post<{
      message: string;
      spreadsheet_data: any;
    }>(
      `/v1/opportunities/${opportunityId}/spreadsheet/upload`,
      formData,
      "Project data sheet uploaded successfully!"
    );
  },

  /**
   * Delete / clear spreadsheet data for a child opportunity.
   */
  deleteOpportunitySpreadsheet: async (opportunityId: number | string) => {
    return await ApiHandler.delete<{
      message: string;
      spreadsheet_data: any;
    }>(
      `/v1/opportunities/${opportunityId}/spreadsheet`,
      "Data sheet removed successfully!"
    );
  },


  /**
   * Upload an overall document for parent opportunity.
   */
  uploadParentDocument: async (parentId: number | string, formData: FormData) => {
    return await ApiHandler.post<{
      message: string;
      document: ParentOpportunityDocumentData;
      documents: ParentOpportunityDocumentData[];
    }>(
      `/v1/parent-opportunities/${parentId}/documents`,
      formData,
      "Document uploaded successfully!"
    );
  },


  /**
   * Delete a parent opportunity document.
   */
  deleteParentDocument: async (parentId: number | string, documentId: number | string) => {
    return await ApiHandler.delete<{
      message: string;
      documents: ParentOpportunityDocumentData[];
    }>(
      `/v1/parent-opportunities/${parentId}/documents/${documentId}`,
      "Document deleted successfully!"
    );
  },


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


  /**
   * Synchronize published opportunities to the Capiz Investor Portal.
   */
  syncPortal: async () => {
    return await ApiHandler.post<{ message: string; synced_at: string; stats: { published: number; drafts: number; closed: number } }>(
      "/v1/opportunities/sync",
      {},
      "Investor Portal synchronized successfully!"
    );
  },


  /**
   * Upload an attachment document for an opportunity.
   */
  uploadDocument: async (opportunityId: number | string, formData: FormData) => {
    return await ApiHandler.post<{
      message: string;
      document: OpportunityDocumentData;
      documents: OpportunityDocumentData[];
    }>(
      `/v1/opportunities/${opportunityId}/documents`,
      formData,
      "Document uploaded successfully!"
    );
  },


  /**
   * Delete an attached document.
   */
  deleteDocument: async (opportunityId: number | string, documentId: number | string) => {
    return await ApiHandler.delete<{
      message: string;
      documents: OpportunityDocumentData[];
    }>(
      `/v1/opportunities/${opportunityId}/documents/${documentId}`,
      "Document deleted successfully!"
    );
  },

};

export const formatDocFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return "0 KB";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const resolveDocUrl = (path?: string, doc?: OpportunityDocumentData | ParentOpportunityDocumentData | any | null): string => {
  if (doc && doc.parent_opportunity_id && doc.id) {
    return `http://localhost:8000/api/v1/parent-opportunities/${doc.parent_opportunity_id}/documents/${doc.id}/file`;
  }
  if (doc && doc.opportunity_id && doc.id) {
    return `http://localhost:8000/api/v1/opportunities/${doc.opportunity_id}/documents/${doc.id}/file`;
  }
  if (!path) return "#";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
    return path;
  }
  return `http://localhost:8000${path.startsWith("/") ? "" : "/"}${path}`;
};

export const resolveParentDocUrl = (path?: string, doc?: ParentOpportunityDocumentData | null): string => {
  return resolveDocUrl(path, doc);
};

export const resolveAnnualReportUrl = (parentOpportunityId: number | string, report: AnnualReportFile | any): string => {
  const fileIdentifier = report?.id || report?.filename;
  if (!parentOpportunityId || !fileIdentifier) return "#";
  return `http://localhost:8000/api/v1/parent-opportunities/${parentOpportunityId}/annual-reports/${encodeURIComponent(fileIdentifier)}/download`;
};

export const downloadAnnualReportBlob = async (parentOpportunityId: number | string, report: AnnualReportFile | any) => {
  const fileIdentifier = report?.id || report?.filename;
  const endpoint = `/v1/parent-opportunities/${parentOpportunityId}/annual-reports/${encodeURIComponent(fileIdentifier)}/download`;
  const response = await AxiosInstance.get(endpoint, { responseType: "blob" });

  let filename = report?.filename || "Annual_Report.xlsx";
  const disposition = response.headers?.["content-disposition"];
  if (disposition && typeof disposition === "string") {
    const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, "").trim();
    }
  }

  const mimeType = typeof response.headers?.["content-type"] === "string"
    ? response.headers["content-type"]
    : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  const blob = new Blob([response.data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  return filename;
};

export const downloadDocumentBlob = async (doc: OpportunityDocumentData | ParentOpportunityDocumentData | any): Promise<string> => {
  const rawUrl = resolveDocUrl(doc?.file_path, doc);
  const downloadUrl = rawUrl.includes("?") ? `${rawUrl}&download=1` : `${rawUrl}?download=1`;
  
  let defaultFilename = doc?.file_name || doc?.title || "document";
  if (!defaultFilename.includes(".") && doc?.file_path) {
    const ext = doc.file_path.split(".").pop();
    if (ext) defaultFilename = `${defaultFilename}.${ext}`;
  }

  try {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    let filename = defaultFilename;
    const disposition = response.headers.get("content-disposition");
    if (disposition) {
      const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, "").trim();
      }
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    return filename;
  } catch (err) {
    console.warn("Direct blob download failed, falling back to direct navigation:", err);
    window.open(downloadUrl, "_blank");
    return defaultFilename;
  }
};

export default OpportunityService;
