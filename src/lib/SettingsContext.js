"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    shopName: "POS Pro",
    logo: "",
    favicon: "",
  });

  const refresh = useCallback(() => {
    api.getSettings().then((res) => {
      const d = res.data || {};
      setSettings({
        shopName: d.shopName || "POS Pro",
        logo: d.logo || "",
        favicon: d.favicon || "",
      });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Apply favicon whenever it changes
  useEffect(() => {
    if (!settings.favicon) return;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = settings.favicon;
  }, [settings.favicon]);

  return (
    <SettingsContext.Provider value={{ settings, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
