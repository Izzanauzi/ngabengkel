import { baseFetch } from "../utils/baseFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Customer, CustomerRequest } from "../@types/customer.types";

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

export function useCreateCustomerMutation({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient();
 
  const createMutation = useMutation({
    mutationFn: (payload: CustomerRequest) =>
      baseFetch<Customer>({
        method: "POST",
        url: "/admin/customers",
        payload,
        options: { showError: true },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCustomers"] });
      onSuccess?.();
    },
  });
 
  return { createMutation };
}

export function useUpdateCustomerMutation({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient();
 
  const updateMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: CustomerRequest }) =>
      baseFetch<{ message: string }>({
        method: "PUT",
        url: `/admin/customers/${userId}`,
        payload,
        options: { showError: true },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCustomers"] });
      onSuccess?.();
    },
  });
 
  return { updateMutation };
}

// ── GET ALL KENDARAAN — GET /admin/kendaraan ──────────────────────────────────
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