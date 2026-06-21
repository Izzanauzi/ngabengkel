import { baseFetch } from "../utils/baseFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Mekanik, MekanikRequest } from "../@types/mekanik.types";

export function useGetAllMekanik() {
  const { data, isLoading, refetch } = useQuery<Mekanik[]>({
    queryKey: ["adminMekaniks"],
    queryFn: () =>
      baseFetch<Mekanik[]>({
        method: "GET",
        url: `/admin/mekaniks`,
        options: { showError: false },
      }).then((res) => res ?? []),
    retry: false,
    staleTime: 1 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const mekaniks = useMemo(() => data ?? [], [data]);
  return { mekaniks, isLoading, refetch };
}

export function useCreateMekanikMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
} = {}) {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (payload: MekanikRequest) =>
      baseFetch<Mekanik>({
        method: "POST",
        url: `/admin/mekaniks`,
        payload,
        options: { showError: false },
      }),
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["adminMekaniks"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? error?.message ?? "Terjadi kesalahan";
      onError?.(msg);
    },
  });
  return { createMutation };
}

export function useUpdateMekanikMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
} = {}) {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MekanikRequest }) =>
      baseFetch<Mekanik>({
        method: "PUT",
        url: `/admin/mekaniks/${id}`,
        payload,
        options: { showError: false },
      }),
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["adminMekaniks"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? error?.message ?? "Terjadi kesalahan";
      onError?.(msg);
    },
  });
  return { updateMutation };
}

export function useDeleteMekanikMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
} = {}) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      baseFetch<{ message: string }>({
        method: "DELETE",
        url: `/admin/mekaniks/${id}`,
        options: { showError: false },
      }),
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["adminMekaniks"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? error?.message ?? "Terjadi kesalahan";
      onError?.(msg);
    },
  });
  return { deleteMutation };
}
