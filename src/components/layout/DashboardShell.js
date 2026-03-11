"use client";
import { useState } from "react";
import Header from "./Header";
import StockPanel from "@/components/ui/StockPanel";

export default function DashboardShell({ children }) {
  const [showStock, setShowStock] = useState(false);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header showStock={showStock} onToggleStock={() => setShowStock((v) => !v)} />
      <main className="flex-1 overflow-y-auto p-6">
        {showStock ? <StockPanel onClose={() => setShowStock(false)} /> : children}
      </main>
    </div>
  );
}
