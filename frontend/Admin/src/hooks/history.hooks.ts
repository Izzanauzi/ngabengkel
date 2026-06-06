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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        if (refreshTrigger > 0) setIsRefreshing(true);
        else setIsLoading(true);
        setError(null);

        const query = searchQuery.trim();
        const customerList = await baseFetch<Customer[]>({
          url: "/admin/customers",
          method: "GET",
          params: query ? { q: query } : undefined,
          options: { showError: false },
        });

        if (!customerList) {
          if (!cancelled) {
            setCustomers([]);
            setStats({ totalCustomer: 0, totalWO: 0, totalTransaksi: 0 });
          }
          return;
        }

        const customerWithStats: CustomerWithStats[] = await Promise.all(
          customerList.map(async (c) => {
            try {
              const history = await baseFetch<WorkOrder[]>({
                url: `/admin/reports/customers/${c.user_id}/history`,
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

        customerWithStats.sort((a, b) => b.total_wo - a.total_wo);

        if (!cancelled) {
          setCustomers(customerWithStats);
          setStats({
            totalCustomer: customerWithStats.length,
            totalWO: customerWithStats.reduce((sum, c) => sum + c.total_wo, 0),
            totalTransaksi: customerWithStats.reduce(
              (sum, c) => sum + c.total_biaya,
              0
            ),
          });
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Gagal memuat data customer");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [searchQuery, refreshTrigger]);

  const refresh = useCallback(() => setRefreshTrigger((t) => t + 1), []);

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!userId || userId === "undefined") {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        if (refreshTrigger > 0) setIsRefreshing(true);
        else setIsLoading(true);
        setError(null);

        const [customerList, history] = await Promise.all([
          baseFetch<Customer[]>({
            url: "/admin/customers",
            method: "GET",
            options: { showError: false },
          }),
          baseFetch<WorkOrder[]>({
            url: `/admin/reports/customers/${userId}/history`,
            method: "GET",
            options: { showError: false },
          }),
        ]);

        const found =
          (customerList ?? []).find((c) => c.user_id === userId) ?? null;

        const woList = history ?? [];
        const sorted = [...woList].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        const totalBiaya = sorted
          .filter((wo) => wo.status === "lunas")
          .reduce((sum, wo) => sum + calcTotalBiaya(wo), 0);

        if (!cancelled) {
          setCustomer(found);
          setWorkOrders(sorted);
          setSummary({ totalWO: sorted.length, totalBiaya });
        }
      } catch (err: any) {
        if (!cancelled)
          setError(err?.message ?? "Gagal memuat histori customer");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, refreshTrigger]);

  const refresh = useCallback(() => setRefreshTrigger((t) => t + 1), []);

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
