import { Navigate } from "react-router-dom";
import { getToken } from "../lib/api";

export const ProtectedRoute = ({ children }) => {
  if (!getToken()) return <Navigate to="/login" replace />;
  return children;
};
