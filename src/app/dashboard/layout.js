import LayoutClient from "@/components/layout/LayoutClient";

export const metadata = {
  title: { default: "Dashboard | POS Pro", template: "%s | POS Pro" },
  description: "Professional Point of Sale system for Pharmacy, Electronics, and General Stores",
};

export default function DashboardLayout({ children }) {
  return <LayoutClient>{children}</LayoutClient>;
}
