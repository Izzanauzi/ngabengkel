import { baseFetch } from "../utils/baseFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  WorkOrder,
  WorkOrderDetail,
  ProgressRequest,
  SuspendRequest,
} from "../../src/@types/work_order.types";

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// ============================================================
// TIPE DROPDOWN
// ============================================================

export interface CustomerOption {
  user_id: string;
  nama: string;
  email: string;
  telepon?: string | null;
}

export interface KendaraanOption {
  kendaraan_id: string;
  merek: string;
  model: string;
  nomor_polisi: string;
  tahun: number;
}

export interface MekanikOption {
  mekanik_id: string;
  nama: string;
}

// Payload create WO — field sesuai backend (catatan_awal, bukan deskripsi_kerusakan)
export interface CreateWorkOrderPayload {
  kendaraan_id: string;
  user_id?: string;
  booking_id?: string;
  mekanik_id?: string;
  catatan_awal?: string;
  estimasi_biaya?: number;
}

// ============================================================
// GET ALL WORK ORDERS
// ============================================================

export function useGetAllWorkOrders() {
  const { data, isLoading, isPending, refetch } = useQuery<WorkOrder[]>({ // 👈 Ubah tipe generic menjadi array langsung
    queryKey: ["getAllWorkOrders"],
    queryFn: () =>
      baseFetch<WorkOrder[]>({ // 👈 Sesuai tipe data kembalian dari server
        method: "GET",
        url: `/admin/work-orders`,
        options: { showError: false },
      }),
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // 👇 Karena data dari server langsung berbentuk array, langsung return data jika ada
  const workOrders = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  return { workOrders, isLoading, isPending, refetch };
}

// ============================================================
// GET WORK ORDER DETAIL BY ID
// ============================================================

export function useGetWorkOrderById(woId: string | undefined) {
  const { data, isLoading, refetch } = useQuery<WorkOrderDetail>({ // 👈 Ubah generic type
    enabled: !!woId,
    queryKey: ["getWorkOrderById", woId],
    queryFn: () =>
      baseFetch<WorkOrderDetail>({ // 👈 Ubah generic type
        method: "GET",
        url: `/admin/work-orders/${woId}`,
        options: { showError: false },
      }),
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // 👇 Langsung berikan objek data jika berhasil diambil
  const workOrder = useMemo(() => {
    return data ? data : null;
  }, [data]);

  return { workOrder, isLoading, refetch };
}

// ============================================================
// DROPDOWN — GET ALL CUSTOMERS
// ============================================================

export function useGetAllCustomers() {
  const { data, isLoading } = useQuery<ApiResponse<CustomerOption[]>>({
    queryKey: ["getAllCustomers"],
    queryFn: () =>
      baseFetch<ApiResponse<CustomerOption[]>>({
        method: "GET",
        url: `/admin/customers`,
        options: { showError: false },
      }),
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const customers = useMemo(() => {
    return data?.statusCode === 200 ? data.data : [];
  }, [data]);

  return { customers, isLoading };
}

// ============================================================
// DROPDOWN — GET ALL KENDARAAN (opsional: filter by userId)
// ============================================================

export function useGetAllKendaraan(userId?: string) {
  // Kalau userId diberikan → ambil kendaraan milik customer itu
  // Kalau tidak → ambil semua kendaraan via GET /admin/kendaraan
  const url = `/admin/kendaraan`;

  const { data, isLoading } = useQuery<ApiResponse<KendaraanOption[]>>({
    queryKey: ["getAllKendaraan", userId ?? "all"],
    queryFn: () =>
      baseFetch<ApiResponse<KendaraanOption[]>>({
        method: "GET",
        url,
        options: { showError: false },
      }),
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const kendaraanList = useMemo(() => {
    return data?.statusCode === 200 ? data.data : [];
  }, [data]);

  return { kendaraanList, isLoading };
}

// ============================================================
// DROPDOWN — GET ALL MEKANIK
// ============================================================

export function useGetAllMekanik() {
  const { data, isLoading } = useQuery<ApiResponse<MekanikOption[]>>({
    queryKey: ["getAllMekanik"],
    queryFn: () =>
      baseFetch<ApiResponse<MekanikOption[]>>({
        method: "GET",
        url: `/admin/mekaniks`,
        options: { showError: false },
      }),
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const mekanikList = useMemo(() => {
    return data?.statusCode === 200 ? data.data : [];
  }, [data]);

  return { mekanikList, isLoading };
}

// ============================================================
// CREATE WORK ORDER
// ============================================================

interface UseCreateWorkOrderMutationProps {
  successAction: (woId: string) => void;
  onError?: (message: string) => void;
}

export function useCreateWorkOrderMutation({
  successAction,
  onError,
}: UseCreateWorkOrderMutationProps) {
  const queryClient = useQueryClient();

  const createWorkOrderMutation = useMutation({
    mutationFn: (payload: CreateWorkOrderPayload) =>
      baseFetch<ApiResponse<WorkOrder>>({
        method: "POST",
        url: `/admin/work-orders`,
        payload,
        options: { showError: false },
      }),

    onSuccess: (data) => {
      if (data?.statusCode === 200 || data?.statusCode === 201) {
        queryClient.invalidateQueries({ queryKey: ["getAllWorkOrders"] });
        successAction(data.data.wo_id);
      } else {
        // API return non-2xx tapi tidak throw (edge case baseFetch)
        onError?.(data?.message ?? "Gagal membuat work order");
      }
    },

    onError: (_error: any) => {
      const msg =
        _error?.message ?? "Gagal membuat work order. Coba lagi.";
      onError?.(msg);
    },
  });

  return { createWorkOrderMutation };
}

// ============================================================
// START WORK ORDER
// ============================================================

export function useStartWorkOrderMutation({
  successAction,
}: {
  successAction: () => void;
}) {
  const queryClient = useQueryClient();

  const startWorkOrderMutation = useMutation({
    mutationFn: (woId: string) =>
      baseFetch<ApiResponse<null>>({
        method: "POST",
        url: `/admin/work-orders/${woId}/start`,
        options: { showError: false },
      }),

    onSuccess: (data, woId) => {
      if (data?.statusCode === 200) {
        queryClient.invalidateQueries({ queryKey: ["getAllWorkOrders"] });
        queryClient.invalidateQueries({ queryKey: ["getWorkOrderById", woId] });
        successAction();
      }
    },
  });

  return { startWorkOrderMutation };
}

// ============================================================
// UPLOAD PROGRESS
// ============================================================

interface UploadProgressPayload {
  woId: string;
  payload: ProgressRequest;
}

export function useUploadProgressMutation({
  successAction,
}: {
  successAction: () => void;
}) {
  const queryClient = useQueryClient();

  const uploadProgressMutation = useMutation({
    mutationFn: ({ woId, payload }: UploadProgressPayload) =>
      baseFetch<ApiResponse<null>>({
        method: "POST",
        url: `/admin/work-orders/${woId}/progress`,
        payload,
        options: { showError: false },
      }),

    onSuccess: (data, { woId }) => {
      if (data?.statusCode === 200 || data?.statusCode === 201) {
        queryClient.invalidateQueries({ queryKey: ["getWorkOrderById", woId] });
        successAction();
      }
    },
  });

  return { uploadProgressMutation };
}

// ============================================================
// SUSPEND WORK ORDER
// ============================================================

interface SuspendPayload {
  woId: string;
  payload: SuspendRequest;
}

export function useSuspendWorkOrderMutation({
  successAction,
}: {
  successAction: () => void;
}) {
  const queryClient = useQueryClient();

  const suspendWorkOrderMutation = useMutation({
    mutationFn: ({ woId, payload }: SuspendPayload) =>
      baseFetch<ApiResponse<null>>({
        method: "POST",
        url: `/admin/work-orders/${woId}/suspend`,
        payload,
        options: { showError: false },
      }),

    onSuccess: (data, { woId }) => {
      if (data?.statusCode === 200) {
        queryClient.invalidateQueries({ queryKey: ["getAllWorkOrders"] });
        queryClient.invalidateQueries({ queryKey: ["getWorkOrderById", woId] });
        successAction();
      }
    },
  });

  return { suspendWorkOrderMutation };
}

// ============================================================
// FINISH WORK ORDER
// ============================================================

export function useFinishWorkOrderMutation({
  successAction,
}: {
  successAction: () => void;
}) {
  const queryClient = useQueryClient();

  const finishWorkOrderMutation = useMutation({
    mutationFn: (woId: string) =>
      baseFetch<ApiResponse<null>>({
        method: "POST",
        url: `/admin/work-orders/${woId}/finish`,
        options: { showError: false },
      }),

    onSuccess: (data, woId) => {
      if (data?.statusCode === 200) {
        queryClient.invalidateQueries({ queryKey: ["getAllWorkOrders"] });
        queryClient.invalidateQueries({ queryKey: ["getWorkOrderById", woId] });
        successAction();
      }
    },
  });

  return { finishWorkOrderMutation };
}