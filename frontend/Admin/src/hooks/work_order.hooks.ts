import { baseFetch } from "../utils/baseFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
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
        url: `/admin/work-orders`,
        options: { showError: false },
      }).then((res) => res ?? []),
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const workOrders = useMemo<WorkOrder[]>(() => {
    if (Array.isArray(data)) return data;
    const wrapped = (data as any)?.data;
    return Array.isArray(wrapped) ? wrapped : [];
  }, [data]);

  return { workOrders, isLoading, isPending, refetch };
}

// ============================================================
// GET WORK ORDER DETAIL BY ID
// ============================================================

export function useGetWorkOrderById(woId: string | undefined) {
  const { data, isLoading, refetch } = useQuery<WorkOrderDetail | null>({
    enabled: !!woId,
    queryKey: ["getWorkOrderById", woId],
    queryFn: () =>
      baseFetch<WorkOrderDetail>({
        method: "GET",
        url: `/admin/work-orders/${woId}`,
        options: { showError: false },
      }).then((res) => res ?? null),
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const workOrder = useMemo<WorkOrderDetail | null>(() => data ?? null, [data]);

  return { workOrder, isLoading, refetch };
}

// ============================================================
// DROPDOWN — GET ALL CUSTOMERS
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
        queryClient.invalidateQueries({ queryKey: ["getAllWorkOrders"] });
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

// ============================================================
// CONFIRM PAYMENT
// ============================================================

interface ConfirmPaymentPayload {
  woId: string;
  metode_pembayaran: string;
  total_biaya: number;
}

export function useConfirmPaymentMutation({
  successAction,
  onError,
}: {
  successAction: () => void;
  onError?: (msg: string) => void;
}) {
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
      queryClient.invalidateQueries({ queryKey: ["getAllWorkOrders"] });
      queryClient.invalidateQueries({ queryKey: ["getWorkOrderById", woId] });
      successAction();
    },

    onError: (error: any) => {
      onError?.(error?.message ?? "Gagal memproses pembayaran");
    },
  });

  return { confirmPaymentMutation };
}