"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import DashboardShell from "./DashboardShell";
import { SettingsProvider } from "@/lib/SettingsContext";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { cacheUtils } from "@/lib/api";

function AuthGuard({ children }) {
  const { user, checked } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (checked && !user) router.replace("/");
  }, [checked, user, router]);

  // Pre-warm the entire cache as soon as auth is confirmed.
  // All pages will now open instantly because data is already in memory.
  useEffect(() => {
    if (checked && user) cacheUtils.prefetchAll();
  }, [checked, user]);

  if (!checked || !user) {
    return (
      <div className="min-h-screen bg-[#1E3A8A] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return children;
}

export default function LayoutClient({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthProvider>
      <AuthGuard>
        <SettingsProvider>
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
        </SettingsProvider>
      </AuthGuard>
    </AuthProvider>
  );
}
