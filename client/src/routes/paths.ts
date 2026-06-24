const APP_ROOT = "/app";
const CLIENT_ROOT = "/portal";

export const PATHS = {
  // Public Routes
  HOME: "/",
  LOGIN: "/login",
  USER_LOGIN: "/user/login",

  // Admin Portal
  APP: {
    ROOT: `${APP_ROOT}`,
    DASHBOARD: `${APP_ROOT}/dashboard`,
    MANAGE_INQUIRIES: `${APP_ROOT}/manageInquires`,
    MANAGE_USERS: `${APP_ROOT}/manageUsers`,
    MANAGE_MUNICIPALITIES: `${APP_ROOT}/manageMunicipalities`,
    MANAGE_INVESTMENT_OPPORTUNITIES: `${APP_ROOT}/manageInvestmentOpportunities`,
    MANAGE_COMPARISON_TOOL: `${APP_ROOT}/manageComparisonTool`,
    MANAGE_DATA_ENTRY: `${APP_ROOT}/manageDataEntry`,
    MANAGE_DATA_MANAGEMENT: `${APP_ROOT}/manageDataManagement`
  },

  // User Portal
  PORTAL: {
    ROOT: `${CLIENT_ROOT}`,
    DASHBOARD: `${CLIENT_ROOT}/dashboard`,
  }
};