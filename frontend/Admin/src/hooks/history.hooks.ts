import { useState, useEffect, useCallback } from "react";
import { baseFetch } from "../utils/baseFetch";
import type {
  Customer,
  CustomerWithStats,
  CustomerHistorySummary,
  HistoryPageStats,
  WorkOrder,
} from "../@types/history.types";

// ─── Helper: hitung total biaya satu WO ──────────────────────────────────────
function calcTotalBiaya(wo: WorkOrder): number {
  const totalMaterial = wo.items?.reduce((sum, i) => sum + i.subtotal, 0) ?? 0;
  return (wo.biaya_jasa ?? 0) + totalMaterial;
}

// ═══════════════════════════════════════════════════════════════════════════════
// useCustomerHistory
// Dipakai di: history/index.tsx
// ═══════════════════════════════════════════════════════════════════════════════
export function useCustomerHistory(searchQuery: string = "") {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [stats, setStats] = useState<HistoryPageStats>({
    totalCustomer: 0,
    totalWO: 0,
    totalTransaksi: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setIsRefreshing(true);
        else setIsLoading(true);
        setError(null);

        // 1. Ambil daftar customer, dengan optional search
        const query = searchQuery.trim();
        const customerList = await baseFetch<Customer[]>({
          url: "/customers",
          method: "GET",
          params: query ? { q: query } : undefined,
          options: { showError: false },
        });

        if (!customerList) {
          setCustomers([]);
          setStats({ totalCustomer: 0, totalWO: 0, totalTransaksi: 0 });
          return;
        }

        // 2. Untuk setiap customer, ambil histori WO-nya secara paralel
        const customerWithStats: CustomerWithStats[] = await Promise.all(
          customerList.map(async (c) => {
            try {
              const history = await baseFetch<WorkOrder[]>({
                url: `/customers/${c.user_id}/history`,
                method: "GET",
                options: { showError: false },
              });

              const woList = history ?? [];
              const total_wo = woList.length;
              const total_biaya = woList
                .filter((wo) => wo.status === "lunas")
                .reduce((sum, wo) => sum + calcTotalBiaya(wo), 0);

              const sorted = [...woList].sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              );
              const terakhir_servis = sorted[0]?.created_at ?? null;

              return { ...c, total_wo, total_biaya, terakhir_servis };
            } catch {
              return { ...c, total_wo: 0, total_biaya: 0, terakhir_servis: null };
            }
          })
        );

        // Urutkan: customer dengan WO terbanyak di atas
        customerWithStats.sort((a, b) => b.total_wo - a.total_wo);
        setCustomers(customerWithStats);

        setStats({
          totalCustomer: customerWithStats.length,
          totalWO: customerWithStats.reduce((sum, c) => sum + c.total_wo, 0),
          totalTransaksi: customerWithStats.reduce(
            (sum, c) => sum + c.total_biaya,
            0
          ),
        });
      } catch (err: any) {
        setError(err?.message ?? "Gagal memuat data customer");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [searchQuery]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  return { customers, stats, isLoading, isRefreshing, refresh, error };
}

// ═══════════════════════════════════════════════════════════════════════════════
// useCustomerHistoryDetail
// Dipakai di: history/[id].tsx
// ═══════════════════════════════════════════════════════════════════════════════
export function useCustomerHistoryDetail(userId: string | undefined) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [summary, setSummary] = useState<CustomerHistorySummary>({
    totalWO: 0,
    totalBiaya: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      // Jangan fetch kalau userId belum ada / undefined
      if (!userId || userId === "undefined") {
        setIsLoading(false);
        return;
      }

      try {
        if (isRefresh) setIsRefreshing(true);
        else setIsLoading(true);
        setError(null);

        // Fetch customer list & histori WO paralel
        const [customerList, history] = await Promise.all([
          baseFetch<Customer[]>({
            url: "/customers",
            method: "GET",
            options: { showError: false },
          }),
          baseFetch<WorkOrder[]>({
            url: `/customers/${userId}/history`,
            method: "GET",
            options: { showError: false },
          }),
        ]);

        const found =
          (customerList ?? []).find((c) => c.user_id === userId) ?? null;
        setCustomer(found);

        const woList = history ?? [];
        const sorted = [...woList].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setWorkOrders(sorted);

        const totalBiaya = sorted
          .filter((wo) => wo.status === "lunas")
          .reduce((sum, wo) => sum + calcTotalBiaya(wo), 0);

        setSummary({ totalWO: sorted.length, totalBiaya });
      } catch (err: any) {
        setError(err?.message ?? "Gagal memuat histori customer");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  return {
    customer,
    workOrders,
    summary,
    isLoading,
    isRefreshing,
    refresh,
    error,
  };
}