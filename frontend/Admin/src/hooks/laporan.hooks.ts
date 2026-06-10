import { useState, useCallback } from "react";
import { baseFetch } from "../utils/baseFetch";
import { LaporanTransaksi, LaporanFilter } from "../@types/laporan.types";

export const useLaporan = () => {
  const [data, setData] = useState<LaporanTransaksi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLaporan = useCallback(async (filter: LaporanFilter) => {
    setLoading(true);
    setError(null);
    try {
      const result = await baseFetch<LaporanTransaksi>({
        url: "/reports/transactions",
        method: "GET",
        params: {
          start_date: filter.start_date,
          end_date: filter.end_date,
        },
        options: { showError: false },
      });
      if (result) setData(result);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal memuat laporan";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, fetchLaporan, reset };
};