import { baseFetch } from "../utils/baseFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Customer, CustomerRequest } from "../@types/customer.types";

export function useGetAllCustomers() {
  const { data, isLoading, refetch } = useQuery<Customer[]>({
    queryKey: ["adminCustomers"],
    queryFn: () =>
      baseFetch<Customer[]>({
        method: "GET",
        url: `/admin/customers`,
        options: { showError: false },
      }).then((res) => res ?? []),
    retry: false,
    staleTime: 1 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const customers = useMemo(() => data ?? [], [data]);
  return { customers, isLoading, refetch };
}

export function useCreateCustomerMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
} = {}) {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (payload: CustomerRequest) =>
      baseFetch<Customer>({
        method: "POST",
        url: `/admin/customers`,
        payload,
        options: { showError: false },
      }),
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["adminCustomers"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? error?.message ?? "Terjadi kesalahan";
      onError?.(msg);
    },
  });
  return { createMutation };
}

export function useUpdateCustomerMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
} = {}) {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerRequest }) =>
      baseFetch<Customer>({
        method: "PUT",
        url: `/admin/customers/${id}`,
        payload: data,
        options: { showError: false },
      }),
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["adminCustomers"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? error?.message ?? "Terjadi kesalahan";
      onError?.(msg);
    },
  });
  return { updateMutation };
}

// Tambahan hook untuk delete Customer
export function useDeleteCustomerMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
} = {}) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      baseFetch({
        method: "DELETE",
        url: `/admin/customers/${id}`,
        options: { showError: false },
      }),
    onSuccess: () => {
      onSuccess?.();
      // Refresh list customer setelah berhasil dihapus
      queryClient.invalidateQueries({ queryKey: ["adminCustomers"] });
    },
    onError: (error: any) => {
      // Tangkap pesan error dari backend (misal: "Customer masih memiliki WO aktif")
      const msg = error?.response?.data?.message ?? error?.message ?? "Terjadi kesalahan saat menghapus data";
      onError?.(msg);
    },
  });
  return { deleteMutation };
}