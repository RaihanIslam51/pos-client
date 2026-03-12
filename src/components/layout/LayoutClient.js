"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import DashboardShell from "./DashboardShell";

export default function LayoutClient({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <DashboardShell onMenuClick={() => setMobileOpen(true)}>{children}</DashboardShell>
    </div>
  );
}
