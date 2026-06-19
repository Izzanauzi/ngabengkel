import { baseFetch } from "../utils/baseFetch";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { TransactionReport } from "../@types/laporan.types";

// ============================================================
// GET REPORT — GET /admin/reports/transactions?from=&to=
// ============================================================

export function useGetTransactionReport(from: string, to: string) {
  const enabled = !!from && !!to;

  const { data, isLoading, isPending, refetch } = useQuery<TransactionReport>({
    queryKey: ["transactionReport", from, to],
    enabled,

    queryFn: () =>
      baseFetch<TransactionReport>({
        method: "GET",
        url: "/admin/reports/transactions",
        params: { from, to },
        options: { showError: false },
      }).then((res) => {
        if (!res) throw new Error("Gagal mengambil laporan");
        return res;
      }),

    retry: false,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const report = useMemo(() => data ?? null, [data]);

  // Hitung rata-rata per transaksi
  const rataRata = useMemo(() => {
    if (!report || report.jumlah_transaksi === 0) return 0;
    return report.total_pendapatan / report.jumlah_transaksi;
  }, [report]);

  return { report, rataRata, isLoading, isPending, refetch };
}