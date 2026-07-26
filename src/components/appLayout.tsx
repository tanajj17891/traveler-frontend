// src/components/AppLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "./navBar";

export default function AppLayout() {
  return (
    <main className="app-page">
      <Navbar />
      <Outlet />
    </main>
  );
}