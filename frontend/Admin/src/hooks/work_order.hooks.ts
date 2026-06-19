import { baseFetch } from "../utils/baseFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useCallback } from "react";
import type {
  WorkOrder,
  WorkOrderDetail,
  InvoiceData,
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

// Payload create WO — field sesuai backend
export interface CreateWorkOrderPayload {
  kendaraan_id: string;
  user_id?: string;
  booking_id?: string;
  mekanik_id?: string;
  deskripsi_kerusakan?: string;
  estimasi_biaya?: number;
}

// ============================================================
// GET ALL WORK ORDERS
// ============================================================

export function useGetAllWorkOrders() {
  const { data, isLoading, isPending, refetch } = useQuery<WorkOrder[]>({
    queryKey: ["getAllWorkOrders"],
    queryFn: () =>
      baseFetch<WorkOrder[]>({
        method: "GET",
        url: "/admin/work-orders",
        options: { showError: false },
      }).then((res) => res ?? []),
    retry: false,
    staleTime: 1 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const workOrders = useMemo<WorkOrder[]>(() => {
    if (Array.isArray(data)) return data;
    const wrapped = (data as any)?.data;
    return Array.isArray(wrapped) ? wrapped : [];
  }, [data]);

  return { workOrders, isLoading, isPending, refetch };
}

// ============================================================
// GET BY ID — GET /admin/work-orders/{id}
// ============================================================

export function useGetWorkOrderById(woId: string | undefined) {
  const { data, isLoading, refetch } = useQuery<WorkOrderDetail | null>({
    enabled: !!woId,
    queryFn: () =>
      baseFetch<WorkOrderDetail>({
        method: "GET",
        url: `/admin/work-orders/${woId}`,
        options: { showError: false },
      }).then((res) => res ?? null),
    retry: false,
    staleTime: 30 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const workOrder = useMemo<WorkOrderDetail | null>(() => data ?? null, [data]);

  return { workOrder, isLoading, refetch };
}

// ============================================================
// CREATE — POST /admin/work-orders
// ============================================================

export function useGetAllCustomers() {
  const { data, isLoading } = useQuery<CustomerOption[]>({
    queryKey: ["getAllCustomers"],
    queryFn: () =>
      baseFetch<CustomerOption[]>({
        method: "GET",
        url: `/admin/customers`,
        options: { showError: false },
      }).then((res) => res ?? []),
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const customers = useMemo<CustomerOption[]>(() => {
    if (Array.isArray(data)) return data;
    const wrapped = (data as any)?.data;
    return Array.isArray(wrapped) ? wrapped : [];
  }, [data]);

  return { customers, isLoading };
}

// ============================================================
// DROPDOWN — GET ALL KENDARAAN (opsional: filter by userId)
// ============================================================

export function useGetAllKendaraan(userId?: string) {
  const { data, isLoading } = useQuery<KendaraanOption[]>({
    queryKey: ["getAllKendaraan", userId ?? "all"],
    queryFn: () =>
      baseFetch<KendaraanOption[]>({
        method: "GET",
        url: `/admin/kendaraan`,
        params: userId ? { user_id: userId } : undefined,
        options: { showError: false },
      }).then((res) => res ?? []),
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const kendaraanList = useMemo<KendaraanOption[]>(() => {
    if (Array.isArray(data)) return data;
    const wrapped = (data as any)?.data;
    return Array.isArray(wrapped) ? wrapped : [];
  }, [data]);

  return { kendaraanList, isLoading };
}

// ============================================================
// DROPDOWN — GET ALL MEKANIK
// ============================================================

export function useGetAllMekanik() {
  const { data, isLoading } = useQuery<MekanikOption[]>({
    queryKey: ["getAllMekanik"],
    queryFn: () =>
      baseFetch<MekanikOption[]>({
        method: "GET",
        url: `/admin/mekaniks`,
        options: { showError: false },
      }).then((res) => res ?? []),
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const mekanikList = useMemo<MekanikOption[]>(() => {
    if (Array.isArray(data)) return data;
    const wrapped = (data as any)?.data;
    return Array.isArray(wrapped) ? wrapped : [];
  }, [data]);

  return { mekanikList, isLoading };
}

// ============================================================
// GET INVOICE BY WO ID
// ============================================================

export function useGetInvoice(woId: string | undefined) {
  const { data, isLoading, refetch } = useQuery<InvoiceData | null>({
    enabled: !!woId,
    queryKey: ["getInvoice", woId],
    queryFn: () =>
      baseFetch<InvoiceData>({
        method: "GET",
        url: `/admin/work-orders/${woId}/invoice`,
        options: { showError: false },
      }).then((res) => res ?? null),
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  return { invoice: data ?? null, isLoading, refetch };
}

// ============================================================
// CREATE WORK ORDER
// ============================================================

interface UseCreateWorkOrderMutationProps {
  onSuccess: (woId: string) => void;
  onError?: (message: string) => void;
}

export function useCreateWorkOrderMutation({
  onSuccess,
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
        onSuccess(data.data.wo_id);
      } else {
        onError?.(data?.message ?? "Gagal membuat work order");
      }
    },

    onError: (_error: any) => {
      const msg = _error?.message ?? "Gagal membuat work order. Coba lagi.";
      onError?.(msg);
    },
  });

  return { createWorkOrderMutation };
}

// ============================================================
// START — POST /admin/work-orders/{id}/start
// Return: startWorkOrderMutation (sesuai work_order_detail.tsx)
// ============================================================

export function useStartWorkOrderMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
} = {}) {
  const queryClient = useQueryClient();

  const startWorkOrderMutation = useMutation({
    mutationFn: (woId: string) =>
      baseFetch<{ message: string }>({
        method: "POST",
        url: `/admin/work-orders/${woId}/start`,
        options: { showError: true },
      }),

    onSuccess: (data, woId) => {
      if (data?.statusCode === 200) {
        onSuccess?.();
        queryClient.invalidateQueries({ queryKey: ["getAllWorkOrders"] });
        queryClient.invalidateQueries({ queryKey: ["getWorkOrderById", woId] });
      }
    },

    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? error?.message ?? "Gagal memulai WO";
      onError?.(msg);
    },
  });

  return { startWorkOrderMutation };
}

// ============================================================
// UPLOAD PROGRESS — POST /admin/work-orders/{id}/progress
// Return: uploadProgressMutation (sesuai work_order_detail.tsx)
// ============================================================

interface UploadProgressPayload {
  woId: string;
  payload: ProgressRequest;
}

export function useUploadProgressMutation({
  onSuccess,
}: {
  onSuccess?: () => void;
} = {}) {
  const queryClient = useQueryClient();

  const uploadProgressMutation = useMutation({
    mutationFn: ({ woId, payload }: {
      woId: string;
      payload: { deskripsi: string; tipe?: string; foto_url?: string };
    }) =>
      baseFetch<{ message: string }>({
        method: "POST",
        url: `/admin/work-orders/${woId}/progress`,
        payload,
        options: { showError: true },
      }),

    onSuccess: (data, { woId }) => {
      if (data?.statusCode === 200 || data?.statusCode === 201) {
        onSuccess?.();
        queryClient.invalidateQueries({ queryKey: ["getWorkOrderById", woId] });
        queryClient.invalidateQueries({ queryKey: ["getAllWorkOrders"] });
      }
    },
  });

  return { uploadProgressMutation };
}

// ============================================================
// SUSPEND — POST /admin/work-orders/{id}/suspend
// Return: suspendWorkOrderMutation (sesuai work_order_detail.tsx)
// ============================================================

interface SuspendPayload {
  woId: string;
  payload: SuspendRequest;
}

export function useSuspendWorkOrderMutation({
  onSuccess,
}: {
  onSuccess?: () => void;
} = {}) {
  const queryClient = useQueryClient();

  const suspendWorkOrderMutation = useMutation({
    mutationFn: ({ woId, payload }: {
      woId: string;
      payload: { deskripsi: string; est_biaya_tambahan: number };
    }) =>
      baseFetch<{ message: string }>({
        method: "POST",
        url: `/admin/work-orders/${woId}/suspend`,
        payload,
        options: { showError: true },
      }),

    onSuccess: (data, { woId }) => {
      if (data?.statusCode === 200) {
        onSuccess?.();
        queryClient.invalidateQueries({ queryKey: ["getAllWorkOrders"] });
        queryClient.invalidateQueries({ queryKey: ["getWorkOrderById", woId] });
      }
    },
  });

  return { suspendWorkOrderMutation };
}

// ============================================================
// FINISH — POST /admin/work-orders/{id}/finish
// Return: finishWorkOrderMutation (sesuai work_order_detail.tsx)
// ============================================================

interface FinishWorkOrderPayload {
  woId: string;
  biaya_jasa: number;
}

export function useFinishWorkOrderMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
} = {}) {
  const queryClient = useQueryClient();

  const finishWorkOrderMutation = useMutation({
    mutationFn: ({ woId, biaya_jasa }: FinishWorkOrderPayload) =>
      baseFetch<ApiResponse<null>>({
        method: "POST",
        url: `/admin/work-orders/${woId}/finish`,
        payload: { biaya_jasa },
        options: { showError: false },
      }),

    onSuccess: (data, { woId }) => {
      if (data?.statusCode === 200) {
        onSuccess?.();
        queryClient.invalidateQueries({ queryKey: ["getAllWorkOrders"] });
        queryClient.invalidateQueries({ queryKey: ["getWorkOrderById", woId] });
      }
    },

    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? error?.message ?? "Gagal menyelesaikan WO";
      onError?.(msg);
    },
  });

  return { finishWorkOrderMutation };
}

// ============================================================
// ADD MATERIAL TO WORK ORDER
// ============================================================

interface AddMaterialPayload {
  woId: string;
  inventory_id: string;
  jumlah: number;
}

export function useAddMaterialMutation({
  onSuccess,
}: {
  onSuccess?: () => void;
} = {}) {
  const queryClient = useQueryClient();

  const addMaterialMutation = useMutation({
    mutationFn: ({ woId, inventory_id, jumlah }: AddMaterialPayload) =>
      baseFetch<ApiResponse<null>>({
        method: "POST",
        url: `/admin/work-orders/${woId}/items`,
        payload: { inventory_id, jumlah },
        options: { showError: false },
      }),

    onSuccess: (data, { woId }) => {
      if (data?.statusCode === 200 || data?.statusCode === 201) {
        onSuccess?.();
        queryClient.invalidateQueries({ queryKey: ["getWorkOrderById", woId] });
        queryClient.invalidateQueries({ queryKey: ["getAllWorkOrders"] });
      }
    },
  });

  return { addMaterialMutation };
}

// ============================================================
// CONFIRM PAYMENT
// ============================================================

interface ConfirmPaymentPayload {
  woId: string;
  metode_pembayaran: string;
  total_biaya: number;
}

export function useConfirmPaymentMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
} = {}) {
  const queryClient = useQueryClient();

  const confirmPaymentMutation = useMutation({
    mutationFn: ({ woId, metode_pembayaran, total_biaya }: ConfirmPaymentPayload) =>
      baseFetch<ApiResponse<null>>({
        method: "POST",
        url: `/admin/work-orders/${woId}/payment`,
        payload: { metode_pembayaran, total_biaya },
        options: { showError: false },
      }),

    onSuccess: (data, { woId }) => {
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["getAllWorkOrders"] });
      queryClient.invalidateQueries({ queryKey: ["getWorkOrderById", woId] });
    },

    onError: (error: any) => {
      onError?.(error?.message ?? "Gagal memproses pembayaran");
    },
  });

  return { confirmPaymentMutation };
}