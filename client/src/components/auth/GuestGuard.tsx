import React from "react";
import { Navigate } from "react-router-dom";
import { AuthService } from "../../services/Authservices";
import { PATHS } from "../../routes/paths";

interface GuestGuardProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that redirects to dashboard if the user is already authenticated.
 */
const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const isAuthenticated = AuthService.isAuthenticated();

  if (isAuthenticated) {
    return <Navigate to={PATHS.APP.DASHBOARD} replace />;
  }

  return <>{children}</>;
};

export default GuestGuard;
