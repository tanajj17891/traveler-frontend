import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

type TokenPayload = {
  exp: number;
};

export default function ProtectedRoute() {
  // Using lazy initialization to run the logic safely exactly once on mount
  const [isValid] = useState<boolean>(() => { // tells react to run the setup logic only once 
    const accessToken = localStorage.getItem("accessToken");
 
    if (accessToken) {
      try {
        console.log('here');
        const decoded = jwtDecode<TokenPayload>(accessToken); //decodes the access token 
        const isExpired = !!decoded.exp && decoded.exp > Date.now() / 1000; /* JSON Web Tokens express their expiration time (exp) in seconds. 
        However, JavaScript's Date.now() returns the current time in milliseconds. The code divides Date.now() / 1000 to convert milliseconds to seconds so they can be compared properly. */
        
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
    return <Navigate to="/login" replace />; // if is valid is false then navigate back to /login
  }

  return <Outlet />;
}
