import { baseFetch } from "../utils/baseFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Slot, QueueItem } from "../@types/slot.types";

export function useGetAllSlots() {
  const { data, isLoading, refetch } = useQuery<Slot[]>({
    queryKey: ["adminSlots"],
    queryFn: () =>
      baseFetch<Slot[]>({
        method: "GET",
        url: `/admin/slots`,
        options: { showError: false },
      }).then((res) => res ?? []),
    retry: false,
    staleTime: 30 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const slots = useMemo(() => data ?? [], [data]);
  return { slots, isLoading, refetch };
}

export function useGetQueue() {
  const { data, isLoading, refetch } = useQuery<QueueItem[]>({
    queryKey: ["adminQueue"],
    queryFn: () =>
      baseFetch<QueueItem[]>({
        method: "GET",
        url: `/admin/queue`,
        options: { showError: false },
      }).then((res) => res ?? []),
    retry: false,
    staleTime: 30 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const queue = useMemo(() => data ?? [], [data]);
  return { queue, isLoading, refetch };
}

export function useUpdateSlotStatus({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
} = {}) {
  const queryClient = useQueryClient();
  const updateSlotStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      baseFetch<Slot>({
        method: "PUT",
        url: `/admin/slots/${id}`,
        payload: { status },
        options: { showError: false },
      }),
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["adminSlots"] });
      queryClient.invalidateQueries({ queryKey: ["adminQueue"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? error?.message ?? "Terjadi kesalahan";
      onError?.(msg);
    },
  });
  return { updateSlotStatus };
}

export function useAssignSlot({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
} = {}) {
  const queryClient = useQueryClient();
  const assignSlot = useMutation({
    mutationFn: ({ slotId, wo_id }: { slotId: string; wo_id: string }) =>
      baseFetch<{ message: string }>({
        method: "POST",
        url: `/admin/slots/${slotId}/assign`,
        payload: { wo_id },
        options: { showError: false },
      }),
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["adminSlots"] });
      queryClient.invalidateQueries({ queryKey: ["adminQueue"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? error?.message ?? "Terjadi kesalahan";
      onError?.(msg);
    },
  });
  return { assignSlot };
}
