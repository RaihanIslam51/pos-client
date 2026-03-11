import Sidebar from "@/components/layout/Sidebar";
import DashboardShell from "@/components/layout/DashboardShell";

export const metadata = {
  title: { default: "Dashboard | POS Pro", template: "%s | POS Pro" },
  description: "Professional Point of Sale system for Pharmacy, Electronics, and General Stores",
};

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
