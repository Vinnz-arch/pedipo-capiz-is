const APP_ROOT = "/app";
const CLIENT_ROOT = "/portal";

export const PATHS = {
  // Public Routes
  HOME: "/",
  LOGIN: "/login",
  USER_LOGIN: "/user/login",
  NEWS: "/news",
  NEWS_DETAIL: "/news/:slug",

  // Admin Portal
  APP: {
    ROOT: `${APP_ROOT}`,
    DASHBOARD: `${APP_ROOT}/dashboard`,
    MANAGE_INQUIRIES: `${APP_ROOT}/manageInquires`,
    MANAGE_USERS: `${APP_ROOT}/manageUsers`,
    MANAGE_INVESTMENT_MANAGEMENT: `${APP_ROOT}/manageInvestmentManagement`,
    MANAGE_LANDING_PAGE: `${APP_ROOT}/manageLandingPage`,
    MANAGE_NEWS: `${APP_ROOT}/manageNews`,
    MANAGE_MSMES: `${APP_ROOT}/manageMsmes`,
    DATA_ENTRY: `${APP_ROOT}/dataEntry`
  },

  // User Portal
  PORTAL: {
    ROOT: `${CLIENT_ROOT}`,
    DASHBOARD: `${CLIENT_ROOT}/dashboard`,
    INVESTOR_PORTAL: `${CLIENT_ROOT}/investorPortal`,
    MSME_ASSISTANCE: `${CLIENT_ROOT}/msmeAssistance`,
    COMPARISON_TOOL: `${CLIENT_ROOT}/comparisonTool`,
    MSME_DIRECTORY: `${CLIENT_ROOT}/msmeDirectory`,
    MSME_DETAIL: `${CLIENT_ROOT}/msmeDirectory/:id`
  }
};