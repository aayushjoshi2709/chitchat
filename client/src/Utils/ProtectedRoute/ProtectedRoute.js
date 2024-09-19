import React from "react";
import { Navigate, Outlet } from "react-router-dom";
function ProtectedRoute({ JWTToken }) {
  return JWTToken && JWTToken.length > 0 ? (
    <Outlet />
  ) : (
    <Navigate to="/login" />
  );
}

export default ProtectedRoute;
