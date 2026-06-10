import { baseFetch } from "../utils/baseFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useCallback } from "react";
import type {
  WorkOrder,
  WorkOrderDetail,
  WorkOrderRequest,
} from "../@types/work_order.types";

// ============================================================
// GET ALL — GET /admin/work-orders
// ============================================================

export function useGetAllWorkOrders() {
  const { data, isLoading, isPending, refetch } = useQuery<WorkOrder[]>({
    queryKey: ["adminWorkOrders"],
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

  const workOrders = useMemo(() => data ?? [], [data]);
  return { workOrders, isLoading, isPending, refetch };
}

// ============================================================
// GET BY ID — GET /admin/work-orders/{id}
// ============================================================

export function useGetWorkOrderById(woId: string) {
  const { data, isLoading, refetch } = useQuery<WorkOrderDetail>({
    queryKey: ["adminWorkOrderDetail", woId],
    enabled: !!woId,
    queryFn: () =>
      baseFetch<WorkOrderDetail>({
        method: "GET",
        url: `/admin/work-orders/${woId}`,
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

  return { workOrder: data ?? null, isLoading, refetch };
}

// ============================================================
// CREATE — POST /admin/work-orders
// ============================================================

export function useCreateWorkOrderMutation({ successAction }: { successAction?: () => void } = {}) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: WorkOrderRequest) =>
      baseFetch<WorkOrder>({ ... }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminWorkOrders"] });
      if (data?.wo_id) successAction?.(data.wo_id);  // ← kirim wo_id
    },
  });

  return { createMutation };
}

// ============================================================
// START — POST /admin/work-orders/{id}/start
// Return: startWorkOrderMutation (sesuai work_order_detail.tsx)
// ============================================================

export function useStartWorkOrderMutation({ successAction }: { successAction?: () => void } = {}) {
  const queryClient = useQueryClient();

  const startWorkOrderMutation = useMutation({
    mutationFn: (woId: string) =>
      baseFetch<{ message: string }>({
        method: "POST",
        url: `/admin/work-orders/${woId}/start`,
        options: { showError: true },
      }),
    onSuccess: (_, woId) => {
      queryClient.invalidateQueries({ queryKey: ["adminWorkOrders"] });
      queryClient.invalidateQueries({ queryKey: ["adminWorkOrderDetail", woId] });
      successAction?.();
    },
  });

  return { startWorkOrderMutation };
}

// ============================================================
// UPLOAD PROGRESS — POST /admin/work-orders/{id}/progress
// Return: uploadProgressMutation (sesuai work_order_detail.tsx)
// ============================================================

export function useUploadProgressMutation({ successAction }: { successAction?: () => void } = {}) {
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
    onSuccess: (_, { woId }) => {
      queryClient.invalidateQueries({ queryKey: ["adminWorkOrderDetail", woId] });
      successAction?.();
    },
  });

  return { uploadProgressMutation };
}

// ============================================================
// SUSPEND — POST /admin/work-orders/{id}/suspend
// Return: suspendWorkOrderMutation (sesuai work_order_detail.tsx)
// ============================================================

export function useSuspendWorkOrderMutation({ successAction }: { successAction?: () => void } = {}) {
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
    onSuccess: (_, { woId }) => {
      queryClient.invalidateQueries({ queryKey: ["adminWorkOrders"] });
      queryClient.invalidateQueries({ queryKey: ["adminWorkOrderDetail", woId] });
      successAction?.();
    },
  });

  return { suspendWorkOrderMutation };
}

// ============================================================
// FINISH — POST /admin/work-orders/{id}/finish
// Return: finishWorkOrderMutation (sesuai work_order_detail.tsx)
// ============================================================

export function useFinishWorkOrderMutation({ successAction }: { successAction?: () => void } = {}) {
  const queryClient = useQueryClient();

  const finishWorkOrderMutation = useMutation({
    mutationFn: (woId: string) =>
      baseFetch<{ message: string }>({
        method: "POST",
        url: `/admin/work-orders/${woId}/finish`,
        options: { showError: true },
      }),
    onSuccess: (_, woId) => {
      queryClient.invalidateQueries({ queryKey: ["adminWorkOrders"] });
      queryClient.invalidateQueries({ queryKey: ["adminWorkOrderDetail", woId] });
      successAction?.();
    },
  });

  return { finishWorkOrderMutation };
}

// ============================================================
// useWorkOrderFilter — dipakai di work_order/index.tsx
// ============================================================

export type WOTabKey =
  | "semua"
  | "dibuat"
  | "sedang_dikerjakan"
  | "menunggu_persetujuan"
  | "selesai";

export function useWorkOrderFilter() {
  const [search, setSearch]       = useState("");
  const [activeTab, setActiveTab] = useState<WOTabKey>("semua");
  const [refreshing, setRefreshing] = useState(false);

  const { workOrders, isLoading, refetch } = useGetAllWorkOrders();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const countByStatus = useMemo(() => ({
    semua:               workOrders.length,
    dibuat:              workOrders.filter(w => w.status === "dibuat").length,
    sedang_dikerjakan:   workOrders.filter(w => w.status === "sedang_dikerjakan").length,
    menunggu_persetujuan:workOrders.filter(w => w.status === "menunggu_persetujuan").length,
    selesai:             workOrders.filter(w => w.status === "selesai" || w.status === "lunas").length,
  }), [workOrders]);

  const summaryCount = useMemo(() => ({
    total:    workOrders.length,
    dikerjakan: countByStatus.sedang_dikerjakan,
    suspend:  countByStatus.menunggu_persetujuan,
    selesai:  countByStatus.selesai,
  }), [workOrders, countByStatus]);

  const filtered = useMemo(() => {
    let result = workOrders;

    if (activeTab !== "semua") {
      if (activeTab === "selesai") {
        result = result.filter(w => w.status === "selesai" || w.status === "lunas");
      } else {
        result = result.filter(w => w.status === activeTab);
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(w =>
        w.nomor_wo?.toLowerCase().includes(q) ||
        w.kendaraan?.nomor_polisi?.toLowerCase().includes(q) ||
        w.kendaraan?.merek?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [workOrders, activeTab, search]);

  return {
    search, setSearch,
    activeTab, setActiveTab,
    refreshing,
    filtered,
    countByStatus,
    summaryCount,
    isLoading,
    handleRefresh,
  };
}