import { baseFetch } from "../utils/baseFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { WorkOrder } from "../@types/workorder.types";

// ── GET ALL WORK ORDERS (customer: active) ────────────────────────────────────
// Backend wajib ?type=active, tanpa itu return 400

export function useGetAllWorkOrders() {
  const { data, isLoading, isPending, refetch } = useQuery<WorkOrder[]>({
    queryKey: ["getAllWorkOrders"],

    queryFn: () =>
      baseFetch<WorkOrder[]>({
        method: "GET",
        url: "/work-orders",
        params: { type: "active" }, // ← wajib
        options: { showError: false },
      }).then((res) => res ?? []),

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

    queryFn: () =>
      baseFetch<WorkOrder>({
        method: "GET",
        url: `/work-orders/${woId}`,
        options: { showError: false },
      }).then((res) => {
        if (!res) throw new Error("work order tidak ditemukan");
        return res;
      }),

    retry: false,
    staleTime: 30 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  return { workOrder: data ?? null, isLoading, isPending, refetch };
}

// ── APPROVE ACTION ────────────────────────────────────────────────────────────

export function useApproveAction(woId: string, { successAction }: { successAction: () => void }) {
  const queryClient = useQueryClient();

  const approveActionMutation = useMutation({
    mutationFn: () =>
      baseFetch<{ message: string }>({
        method: "POST",
        url: `/work-orders/${woId}/approve-action`,
        options: { showError: true },
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getWorkOrder", woId] });
      queryClient.invalidateQueries({ queryKey: ["getAllWorkOrders"] });
      successAction();
    },
  });

  return { approveActionMutation };
}

// ── REJECT ACTION ─────────────────────────────────────────────────────────────

export function useRejectAction(woId: string, { successAction }: { successAction: () => void }) {
  const queryClient = useQueryClient();

  const rejectActionMutation = useMutation({
    mutationFn: () =>
      baseFetch<{ message: string }>({
        method: "POST",
        url: `/work-orders/${woId}/reject-action`,
        options: { showError: true },
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getWorkOrder", woId] });
      queryClient.invalidateQueries({ queryKey: ["getAllWorkOrders"] });
      successAction();
    },
  });

  return { rejectActionMutation };
}

// ── GET HISTORY ───────────────────────────────────────────────────────────────
// Backend: GET /work-orders?type=histori

export function useGetHistory() {
  const { data, isLoading, isPending, refetch } = useQuery<WorkOrder[]>({
    queryKey: ["getHistory"],

    queryFn: () =>
      baseFetch<WorkOrder[]>({
        method: "GET",
        url: "/work-orders",
        params: { type: "histori" }, // ← wajib
        options: { showError: false },
      }).then((res) => res ?? []),

    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const history = useMemo(() => data ?? [], [data]);
  return { history, isLoading, isPending, refetch };
}