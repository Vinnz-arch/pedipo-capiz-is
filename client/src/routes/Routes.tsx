import { createBrowserRouter, Navigate } from "react-router-dom";
import { PATHS } from "./paths";
import ManageInquiries from "@/pages/ManageInquires/ManageInquires";
import AuthGuard from "../components/auth/AuthGuard";
import UserAuthGuard from "../components/auth/UserAuthGuard";
import GuestGuard from "../components/auth/GuestGuard";
import React, { Suspense } from "react";
import DataEntry from "@/pages/DataEntry/DataEntry";
import DataManagement from "@/pages/DataManagement/DataManagement";
import LoadingScreen from "@/components/common/LoadingScreen";

// Configurable minimum loading delay in milliseconds (e.g. 1000 = 1 second)
export const LOADING_DELAY_MS = 3000;

// Helper to enforce a minimum loading screen display time
const lazyWithDelay = (importFn: () => Promise<any>, delay = LOADING_DELAY_MS) => {
  return React.lazy(() =>
    Promise.all([
      importFn(),
      new Promise((resolve) => setTimeout(resolve, delay))
    ]).then(([moduleExports]) => moduleExports)
  );
};

// LazyLoading with minimum display delay
const Dashboard = lazyWithDelay(() => import("../pages/Dashboard"))
const Login = lazyWithDelay(() => import("../pages/auth/Login"))
const ManageUsers = lazyWithDelay(() => import("../pages/Users/ManageUsers"))
const UserLogin = lazyWithDelay(() => import("../pages/auth/UserLogin"))
const UserDashboard = lazyWithDelay(() => import("../pages/UserDashboard"))
const Municipalities = lazyWithDelay(() => import("../pages/Municipalities/Municipalities"))
const InvestmentOpportunies = lazyWithDelay(() => import("../pages/InvestmentOpportunities/InvestmentOpportunies"))
const ComparisonTool = lazyWithDelay(() => import("../pages/ComparisonTool/ComparisonTool"))

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
    element: <Navigate to={PATHS.LOGIN} replace />,
  },

  // Authenticated
  {
    path: PATHS.APP.ROOT,
    children: [
      {
        index: true,
        element: (
          <AuthGuard>
            <Navigate to={PATHS.APP.DASHBOARD} replace />
          </AuthGuard>
        ),
      },
      {
        path: "dashboard",
        element: (
          <AuthGuard>
            {withSuspense(Dashboard)}
          </AuthGuard>
        ),
      },
      {
        path: "manageInquires",
        element: (
          <AuthGuard>
            <ManageInquiries />
          </AuthGuard>
        )
      },
      {
        path: "manageUsers",
        element: (
          <AuthGuard>
            {withSuspense(ManageUsers)}
          </AuthGuard>
        )
      },
      {
        path: "manageMunicipalities",
        element: (
          <AuthGuard>
            {withSuspense(Municipalities)}
          </AuthGuard>
        )
      },
      {
        path: "manageInvestmentOpportunities",
        element: (
          <AuthGuard>
            {withSuspense(InvestmentOpportunies)}
          </AuthGuard>
        )
      },
      {
        path: "manageComparisonTool",
        element: (
          <AuthGuard>
            {withSuspense(ComparisonTool)}
          </AuthGuard>
        )
      },
      {
        path: "manageDataEntry",
        element: (
          <AuthGuard>
            <DataEntry />
          </AuthGuard>
        )
      },
      {
        path: "manageDataManagement",
        element: (
          <AuthGuard>
            <DataManagement />
          </AuthGuard>
        )
      }
    ]
  },

  // User Portal
  {
    path: PATHS.PORTAL.ROOT,
    children: [
      {
        index: true,
        element: <Navigate to={PATHS.PORTAL.DASHBOARD} replace />,
      },
      {
        path: "dashboard",
        element: (
          <UserAuthGuard>
            {withSuspense(UserDashboard)}
          </UserAuthGuard>
        ),
      },
    ]
  },
]);
