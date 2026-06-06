import { baseFetch } from "../utils/baseFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { WorkOrder } from "../@types/workorder.types";

// Pastikan tipe ini ada agar TypeScript tidak bingung dengan bungkus dari Backend
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// ── GET ALL WORK ORDERS (customer: active WOs milik sendiri) ──────────────────
export function useGetAllWorkOrders() {
  const { data, isLoading, isPending, refetch } = useQuery<WorkOrder[]>({
    queryKey: ["getAllWorkOrders"],
    queryFn: async () => {
      const res = await baseFetch<ApiResponse<WorkOrder[]>>({
        method: "GET",
        url: "/work-orders",
        options: { showError: false },
      });
      return res.data; // Keluarkan array-nya langsung
    },
    retry: false,
    staleTime: 30 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const workOrders = useMemo(() => data ?? [], [data]);
  return { workOrders, isLoading, isPending, refetch };
}

// ── GET WORK ORDER BY ID ──────────────────────────────────────────────────────
export function useGetWorkOrderById(woId: string) {
  const { data, isLoading, isPending, refetch } = useQuery<WorkOrder>({
    queryKey: ["getWorkOrder", woId],
    enabled: !!woId,
    queryFn: async () => {
      const res = await baseFetch<ApiResponse<WorkOrder>>({
        method: "GET",
        url: `/work-orders/${woId}`,
        options: { showError: false },
      });
      return res.data;
    },
    retry: false,
    staleTime: 30 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  return { workOrder: data ?? null, isLoading, isPending, refetch };
}

// ── APPROVE ACTION (customer menyetujui biaya tambahan) ───────────────────────
interface UseApproveActionProps {
  successAction: () => void;
}
export function useApproveAction(woId: string, { successAction }: UseApproveActionProps) {
  const queryClient = useQueryClient();
  const approveActionMutation = useMutation({
    mutationFn: () =>
      baseFetch<{ message: string }>({
        method: "POST",
        url: `/work-orders/${woId}/approve-action`,
        options: { showError: false },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getWorkOrder", woId] });
      queryClient.invalidateQueries({ queryKey: ["getAllWorkOrders"] });
      successAction();
    },
  });
  return { approveActionMutation };
}

// ── REJECT ACTION (customer menolak biaya tambahan) ───────────────────────────
interface UseRejectActionProps {
  successAction: () => void;
}
export function useRejectAction(woId: string, { successAction }: UseRejectActionProps) {
  const queryClient = useQueryClient();
  const rejectActionMutation = useMutation({
    mutationFn: () =>
      baseFetch<{ message: string }>({
        method: "POST",
        url: `/work-orders/${woId}/reject-action`,
        options: { showError: false },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getWorkOrder", woId] });
      queryClient.invalidateQueries({ queryKey: ["getAllWorkOrders"] });
      successAction();
    },
  });
  return { rejectActionMutation };
}

// ── GET HISTORY (riwayat servis milik customer) ───────────────────────────────
export function useGetHistory() {
  const { data, isLoading, isPending, refetch } = useQuery<WorkOrder[]>({
    queryKey: ["getHistory"],
    queryFn: async () => {
      const res = await baseFetch<ApiResponse<WorkOrder[]>>({
        method: "GET",
        url: "/reports/history",
        options: { showError: false },
      });
      return res.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const history = useMemo(() => data ?? [], [data]);
  return { history, isLoading, isPending, refetch };
}