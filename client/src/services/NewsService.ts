import { ApiHandler } from "@/api/ApiHandler";

export interface NewsCommentData {
  id?: number | string;
  news_article_id: number | string;
  name: string;
  email: string;
  comment: string;
  created_at?: string;
}

export interface NewsArticleData {
  id?: number | string;
  title: string;
  slug?: string;
  summary: string;
  content: string;
  image_path?: string;
  author?: string;
  status?: "Published" | "Draft";
  published_at?: string;
  source_name?: string;
  source_url?: string;
  created_at?: string;
  comments?: NewsCommentData[];
}

export const NewsService = {
  /**
   * Fetch all news articles.
   */
  getAll: async () => {
    return await ApiHandler.get<{ articles: NewsArticleData[] }>("/v1/news");
  },

  /**
   * Fetch a single news article details.
   */
  get: async (slugOrId: string) => {
    return await ApiHandler.get<{ article: NewsArticleData }>(`/v1/news/${slugOrId}`);
  },

  /**
   * Create a new news article (Admin).
   */
  create: async (formData: FormData) => {
    return await ApiHandler.post<{ message: string; article: NewsArticleData }>(
      "/v1/news",
      formData,
      "News article created successfully!"
    );
  },

  /**
   * Update an existing news article (Admin).
   */
  update: async (id: number | string, formData: FormData) => {
    return await ApiHandler.post<{ message: string; article: NewsArticleData }>(
      `/v1/news/${id}`,
      formData,
      "News article updated successfully!"
    );
  },

  /**
   * Delete a news article (Admin).
   */
  delete: async (id: number | string) => {
    return await ApiHandler.delete<{ message: string }>(
      `/v1/news/${id}`,
      "News article deleted successfully!"
    );
  },

  /**
   * Add a comment to a news article (Public).
   */
  addComment: async (articleId: number | string, commentData: { name: string; email: string; comment: string }) => {
    return await ApiHandler.post<{ message: string; comment: NewsCommentData }>(
      `/v1/news/${articleId}/comments`,
      commentData,
      "Comment posted successfully!"
    );
  },
};
