import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthService, type ManagementRole } from "../../services/Authservices";
import { PATHS } from "../../routes/paths";
import { notify } from "../../util/notify";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ManagementRole[];
}

const ForbiddenRedirect: React.FC = () => {
  useEffect(() => {
    notify.warning("Access Restricted", "Your account does not have permission to open that section.");
  }, []);

  return <Navigate to={PATHS.APP.DASHBOARD} replace />;
};

/**
 * A wrapper component that verifies authentication and optional management role permissions.
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles = ["admin", "staff"] }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const role = AuthService.getRole();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login but save the current location so we can redirect back after login
    return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <ForbiddenRedirect />;
  }

  return <>{children}</>;
};

export default AuthGuard;
