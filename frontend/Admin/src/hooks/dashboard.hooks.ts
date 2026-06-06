import { useState, useEffect, useCallback } from 'react';
import { baseFetch } from '../utils/baseFetch';
import { DashboardData, SlotResponse } from '../@types/dashboard.types';

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch paralel: slots+antrian, booking menunggu, WO aktif
      const [slotsRes, bookingRes, woRes] = await Promise.all([
        baseFetch<SlotResponse>({
          url: '/slots',
          method: 'GET',
          options: { showError: false },
        }),
        baseFetch<any[]>({
          url: '/bookings',
          method: 'GET',
          params: { status: 'menunggu_konfirmasi' },
          options: { showError: false },
        }),
        baseFetch<any[]>({
          url: '/work-orders',
          method: 'GET',
          options: { showError: false },
        }),
      ]);

      const slots = slotsRes?.slots ?? [];
      const antrian = slotsRes?.antrian ?? [];
      const bookings = bookingRes ?? [];
      const workOrders = woRes ?? [];

      // Hitung statistik
      const woAktif = workOrders.filter(
        (wo) => wo.status === 'dibuat' || wo.status === 'sedang_dikerjakan'
      ).length;

      const menungguPersetujuan = workOrders.filter(
        (wo) => wo.status === 'menunggu_persetujuan'
      ).length;

      const slotTersedia = slots.filter((s) => s.status === 'tersedia').length;

      setData({
        woAktif,
        menungguPersetujuan,
        bookingMasuk: bookings.length,
        slotTersedia,
        slots,
        antrian,
      });
    } catch (err: any) {
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard };
};

// Hook untuk assign slot
export const useAssignSlot = () => {
  const [loading, setLoading] = useState(false);

  const assignSlot = async (wo_id: string, slot_id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await baseFetch({
        url: '/slots/assign',
        method: 'POST',
        payload: { wo_id, slot_id },
      });
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { assignSlot, loading };
};