import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserServices } from "../../services/UserServices";
import { PATHS } from "../../routes/paths";

interface UserAuthGuardProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that redirects to user login if the user is not authenticated.
 */
const UserAuthGuard: React.FC<UserAuthGuardProps> = ({ children }) => {
  const isAuthenticated = UserServices.isAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to user login but save the current location
    return <Navigate to={PATHS.USER_LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default UserAuthGuard;
