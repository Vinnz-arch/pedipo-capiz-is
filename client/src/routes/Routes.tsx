import { createBrowserRouter, Navigate } from "react-router-dom";
import { PATHS } from "./paths";
import AuthGuard from "../components/auth/AuthGuard";
import UserAuthGuard from "../components/auth/UserAuthGuard";
import GuestGuard from "../components/auth/GuestGuard";
import React, { Suspense } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";
import LandingPage from "../pages/LandingPage";

// Helper to load components lazily
const lazyWithDelay = (importFn: () => Promise<any>) => {
  return React.lazy(importFn);
};

// LazyLoading with minimum display delay
const Dashboard = lazyWithDelay(() => import("../pages/Dashboard"))
const Login = lazyWithDelay(() => import("../pages/auth/Login"))
const ManageUsers = lazyWithDelay(() => import("../pages/Users/ManageUsers"))
const UserLogin = lazyWithDelay(() => import("../pages/auth/UserLogin"))
const UserDashboard = lazyWithDelay(() => import("../pages/UserDashboard"))
const InvestmentManagement = lazyWithDelay(() => import("../pages/InvestmentManagement/InvestmentManagement"))
const InvestorPortal = lazyWithDelay(() => import("../pages/user/InvestorPortal"))
const ManageInquiries = lazyWithDelay(() => import("../pages/ManageInquires/ManageInquires"))
const ManageLandingPage = lazyWithDelay(() => import("../pages/ManageLandingPage/ManageLandingPage"))
const NewsList = lazyWithDelay(() => import("../pages/NewsList"))
const NewsDetail = lazyWithDelay(() => import("../pages/NewsDetail"))
const MsmeAssistance = lazyWithDelay(() => import("../pages/user/MsmeAssistance"))
const ComparisonTool = lazyWithDelay(() => import("../pages/user/ComparisonTool/ComparisonTool"))
const ManageMsmes = lazyWithDelay(() => import("../pages/DataManagement/ManageMsmes"))
const MsmeDirectory = lazyWithDelay(() => import("../pages/user/MsmeDirectory"))
const MsmeDetail = lazyWithDelay(() => import("../pages/user/MsmeDetail"))
const DataEntry = lazyWithDelay(() => import("../pages/DataEntry/DataEntry"))

const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component />
  </Suspense>
);

export const Routes = createBrowserRouter([
  // Public Routes
  {
    path: PATHS.LOGIN,
    element: (
      <GuestGuard>
        {withSuspense(Login)}
      </GuestGuard>
    ),
  },
  {
    path: PATHS.USER_LOGIN,
    element: (
      withSuspense(UserLogin)
    ),
  },
  {
    path: PATHS.HOME,
    element: (
      <LandingPage />
    ),
  },
  {
    path: PATHS.NEWS,
    element: (
      withSuspense(NewsList)
    ),
  },
  {
    path: PATHS.NEWS_DETAIL,
    element: (
      withSuspense(NewsDetail)
    ),
  },

  // Authenticated Admin Routes
  {
    path: PATHS.APP.ROOT,
    element: (
      <AuthGuard>
        <Navigate to={PATHS.APP.DASHBOARD} replace />
      </AuthGuard>
    ),
  },
  {
    path: PATHS.APP.DASHBOARD,
    element: (
      <AuthGuard>
        {withSuspense(Dashboard)}
      </AuthGuard>
    ),
  },
  {
    path: PATHS.APP.MANAGE_INQUIRIES,
    element: (
      <AuthGuard allowedRoles={["admin"]}>
        {withSuspense(ManageInquiries)}
      </AuthGuard>
    ),
  },
  {
    path: PATHS.APP.MANAGE_USERS,
    element: (
      <AuthGuard allowedRoles={["admin"]}>
        {withSuspense(ManageUsers)}
      </AuthGuard>
    ),
  },

  {
    path: PATHS.APP.MANAGE_INVESTMENT_MANAGEMENT,
    element: (
      <AuthGuard>
        {withSuspense(InvestmentManagement)}
      </AuthGuard>
    ),
  },
  {
    path: PATHS.APP.MANAGE_LANDING_PAGE,
    element: (
      <AuthGuard>
        {withSuspense(ManageLandingPage)}
      </AuthGuard>
    ),
  },
  {
    path: PATHS.APP.MANAGE_MSMES,
    element: (
      <AuthGuard>
        {withSuspense(ManageMsmes)}
      </AuthGuard>
    ),
  },
  {
    path: PATHS.APP.DATA_ENTRY,
    element: (
      <AuthGuard>
        {withSuspense(DataEntry)}
      </AuthGuard>
    ),
  },

  // User Portal Routes
  {
    path: PATHS.PORTAL.ROOT,
    element: (
      <UserAuthGuard>
        <Navigate to={PATHS.PORTAL.DASHBOARD} replace />
      </UserAuthGuard>
    ),
  },
  {
    path: PATHS.PORTAL.DASHBOARD,
    element: (
      <UserAuthGuard>
        {withSuspense(UserDashboard)}
      </UserAuthGuard>
    ),
  },
  {
    path: PATHS.PORTAL.INVESTOR_PORTAL,
    element: (
      <UserAuthGuard>
        {withSuspense(InvestorPortal)}
      </UserAuthGuard>
    ),
  },
  {
    path: PATHS.PORTAL.MSME_ASSISTANCE,
    element: (
      <UserAuthGuard>
        {withSuspense(MsmeAssistance)}
      </UserAuthGuard>
    ),
  },
  {
    path: PATHS.PORTAL.COMPARISON_TOOL,
    element: (
      <UserAuthGuard>
        {withSuspense(ComparisonTool)}
      </UserAuthGuard>
    ),
  },
  {
    path: PATHS.PORTAL.MSME_DIRECTORY,
    element: (
      <UserAuthGuard>
        {withSuspense(MsmeDirectory)}
      </UserAuthGuard>
    ),
  },
  {
    path: PATHS.PORTAL.MSME_DETAIL,
    element: (
      <UserAuthGuard>
        {withSuspense(MsmeDetail)}
      </UserAuthGuard>
    ),
  }

  
]);
