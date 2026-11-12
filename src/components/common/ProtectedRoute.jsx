import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { getStoredUser, getAuthToken } from "../../utils/cookieUtils";

/**
 * Route guard component that restricts access by authentication and roles.
 * Admins are granted access to all roles.
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const { isLogin, userDetail } = useSelector((state) => state.auth);
  const cookieUser = getStoredUser();
  const token = useSelector((state) => state.auth.token) || getAuthToken() || localStorage.getItem("authToken");

  const loggedIn = Boolean(isLogin || token);

  if (!loggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalize user role
  const rawRole = userDetail?.role || cookieUser?.role || "CUSTOMER";
  const userRole = rawRole.toUpperCase() === "USER" ? "CUSTOMER" : rawRole.toUpperCase();

  if (allowedRoles.length > 0) {
    const isAllowed = allowedRoles.some(
      (r) => r.toUpperCase() === userRole || userRole === "ADMIN"
    );

    if (!isAllowed) {
      return (
        <Navigate
          to="/unauthorized"
          state={{ attemptedRole: userRole, requiredRoles: allowedRoles }}
          replace
        />
      );
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;

