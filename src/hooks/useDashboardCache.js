import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

const CACHE_KEY = "dashboard_stats_cache";
const CACHE_EXPIRY_KEY = "dashboard_cache_expiry";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export const useDashboardCache = () => {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFresh, setIsFresh] = useState(false);

  // Load from cache if available and not expired
  const getCachedData = useCallback(() => {
    try {
      if (typeof window === "undefined") return null;

      const cachedData = localStorage.getItem(CACHE_KEY);
      const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);

      if (!cachedData || !expiry) return null;

      const now = Date.now();
      if (now > parseInt(expiry)) {
        // Cache expired
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_EXPIRY_KEY);
        return null;
      }

      return JSON.parse(cachedData);
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  }, []);

  // Save to cache
  const setCacheData = useCallback((data) => {
    try {
      if (typeof window === "undefined") return;

      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_EXPIRY_KEY, String(Date.now() + CACHE_DURATION));
    } catch (error) {
      console.error("Error saving cache:", error);
    }
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, lowStockRes, chartRes, salesReportRes] = await Promise.all([
        api.getDashboardStats(true),
        api.getLowStock(),
        api.getMonthlySalesChart(
          `?year=${new Date().getFullYear()}&month=${new Date().getMonth() + 1}`
        ),
        api.getSalesReport(),
      ]);

      const dashboardData = statsRes?.data || {};
      const fallbackTotals = salesReportRes?.data?.totals || {};

      const formattedStats = {
        ...dashboardData,
        totalSales: dashboardData.totalSales || {
          total: fallbackTotals.totalRevenue || 0,
          count: fallbackTotals.totalTransactions || 0,
        },
      };

      const cacheData = {
        stats: formattedStats,
        lowStock: lowStockRes.data,
        chartData: chartRes.data || [],
        timestamp: Date.now(),
      };

      // Update state
      setStats(formattedStats);
      setLowStock(lowStockRes.data);
      setChartData(chartRes.data || []);

      // Save to cache
      setCacheData(cacheData);
      setIsFresh(true);

      return cacheData;
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setIsFresh(false);
      return null;
    }
  }, [setCacheData]);

  // Initialize data on mount
  useEffect(() => {
    // Try to load from cache first
    const cachedData = getCachedData();

    if (cachedData) {
      // Load cached data immediately
      setStats(cachedData.stats);
      setLowStock(cachedData.lowStock);
      setChartData(cachedData.chartData);
      setLoading(false);

      // Fetch fresh data in background silently
      fetchDashboardData().catch(console.error);
    } else {
      // No cache, fetch data and show loading
      setLoading(true);
      fetchDashboardData()
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [getCachedData, fetchDashboardData]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchDashboardData().finally(() => setLoading(false));
  }, [fetchDashboardData]);

  // Clear cache function
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
      setStats(null);
      setLowStock([]);
      setChartData([]);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }, []);

  return {
    stats,
    lowStock,
    chartData,
    loading,
    isFresh,
    refresh,
    clearCache,
  };
};
