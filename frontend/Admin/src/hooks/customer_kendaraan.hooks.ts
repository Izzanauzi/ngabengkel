import { baseFetch } from "../utils/baseFetch";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CustomerOption {
  user_id: string;
  nama: string;
  email: string;
  telepon: string | null;
  role: string;
  created_at: string;
  jumlah_kendaraan?: number;
}

export interface KendaraanOption {
  kendaraan_id: string;
  user_id: string | null;
  merek: string;
  model: string;
  tahun: number;
  nomor_polisi: string;
  warna: string | null;
  nama_pemilik?: string | null;
}

export interface MekanikOption {
  mekanik_id: string;
  nama: string;
  telepon: string;
  keahlian: string | null;
  status: "tersedia" | "tidak_tersedia";
}

// ── GET ALL CUSTOMERS — GET /admin/customers ──────────────────────────────────

export function useGetAllCustomers() {
  const { data, isLoading, refetch } = useQuery<CustomerOption[]>({
    queryKey: ["adminCustomers"],
    queryFn: () =>
      baseFetch<CustomerOption[]>({
        method: "GET",
        url: "/admin/customers",
        options: { showError: false },
      }).then((res) => res ?? []),
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
  return { customers: useMemo(() => data ?? [], [data]), isLoading, refetch };
}

// ── GET ALL KENDARAAN — GET /admin/kendaraan ──────────────────────────────────
// Handler: AdminCustomerHandler.GetAllKendaraan

export function useGetAllKendaraan() {
  const { data, isLoading, refetch } = useQuery<KendaraanOption[]>({
    queryKey: ["adminKendaraan"],
    queryFn: () =>
      baseFetch<KendaraanOption[]>({
        method: "GET",
        url: "/admin/kendaraan",
        options: { showError: false },
      }).then((res) => res ?? []),
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
  return { kendaraanList: useMemo(() => data ?? [], [data]), isLoading, refetch };
}

// ── GET ALL MEKANIK — GET /admin/mekaniks ─────────────────────────────────────

export function useGetAllMekanik() {
  const { data, isLoading } = useQuery<MekanikOption[]>({
    queryKey: ["adminMekanik"],
    queryFn: () =>
      baseFetch<MekanikOption[]>({
        method: "GET",
        url: "/admin/mekaniks",
        options: { showError: false },
      }).then((res) => res ?? []),
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
  return { mekanikList: useMemo(() => data ?? [], [data]), isLoading };
}