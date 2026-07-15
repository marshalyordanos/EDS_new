import { Route, Navigate, Outlet } from "react-router-dom";

import React from "react";

const ProtectedRoute = () => {
  const t = JSON.parse(localStorage.getItem("accessToken"));

  return t ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
