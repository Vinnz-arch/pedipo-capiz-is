import { createBrowserRouter, Navigate } from "react-router-dom";
import { PATHS } from "./paths";
import ManageInquiries from "@/pages/ManageInquires/ManageInquires";
import AuthGuard from "../components/auth/AuthGuard";
import UserAuthGuard from "../components/auth/UserAuthGuard";
import GuestGuard from "../components/auth/GuestGuard";
import React from "react";
import DataEntry from "@/pages/DataEntry/DataEntry";
import DataManagement from "@/pages/DataManagement/DataManagement";

// LazyLoading
const Dashboard = React.lazy(() => import("../pages/Dashboard"))
const Login = React.lazy(() => import("../pages/auth/Login"))
const ManageUsers = React.lazy(() => import("../pages/Users/ManageUsers"))
const UserLogin = React.lazy(() => import("../pages/auth/UserLogin"))
const UserDashboard = React.lazy(() => import("../pages/UserDashboard"))
const Municipalities = React.lazy(() => import("../pages/Municipalities/Municipalities"))
const InvestmentOpportunies = React.lazy(() => import("../pages/InvestmentOpportunities/InvestmentOpportunies"))
const ComparisonTool = React.lazy(() => import("../pages/ComparisonTool/ComparisonTool"))


export const Routes = createBrowserRouter([
  // Public Routes
  {
    path: PATHS.LOGIN,
    element: (
      <GuestGuard>
        <Login />
      </GuestGuard>
    ),
  },
  {
    path: PATHS.USER_LOGIN,
    element: (
      <UserLogin />
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
            <Dashboard />
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
            <ManageUsers />
          </AuthGuard>
        )
      },
      {
        path: "manageMunicipalities",
        element: (
          <AuthGuard>
            <Municipalities />
          </AuthGuard>
        )
      },
      {
        path: "manageInvestmentOpportunities",
        element: (
          <AuthGuard>
            <InvestmentOpportunies />
          </AuthGuard>
        )
      },
      {
        path: "manageComparisonTool",
        element: (
          <AuthGuard>
            <ComparisonTool />
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
            <UserDashboard />
          </UserAuthGuard>
        ),
      },
    ]
  },

]);
