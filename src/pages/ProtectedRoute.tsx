import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

type TokenPayload = {
  exp: number;
};

export default function ProtectedRoute() {
  // Using lazy initialization to run the logic safely exactly once on mount
  const [isValid] = useState<boolean>(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      try {
        const decoded = jwtDecode<TokenPayload>(accessToken);
        const isExpired = !!decoded.exp && decoded.exp > Date.now() / 1000;
        
        if (isExpired) {
          return true;
        }
      } catch {
        // Fall through to clear and return false
      }
    }

    localStorage.clear();
    return false;
  });

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
