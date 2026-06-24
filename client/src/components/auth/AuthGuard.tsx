import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthService } from "../../services/Authservices";
import { PATHS } from "../../routes/paths";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that redirects to login if the user is not authenticated.
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login but save the current location so we can redirect back after login
    return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
