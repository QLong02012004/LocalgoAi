import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import type { RootState } from "../redux/store";

interface Props {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const location = useLocation();

  if (!isAuthenticated) {
    // Lưu lại vị trí hiện tại để sau khi login xong có thể quay lại
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;