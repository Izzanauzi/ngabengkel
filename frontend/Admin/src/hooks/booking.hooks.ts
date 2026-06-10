import { baseFetch } from "../utils/baseFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Booking } from "../@types/booking.types";

// ============================================================
// GET PENDING — GET /admin/bookings
// ============================================================

export function useGetPendingBookings() {
  const { data, isLoading, isPending, refetch } = useQuery<Booking[]>({
    queryKey: ["adminBookingsPending"],

    queryFn: () =>
      baseFetch<Booking[]>({
        method: "GET",
        url: `/admin/bookings`,
        options: { showError: false },
      }).then((res) => res ?? []),

    retry: false,
    staleTime: 1 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const bookings = useMemo(() => data ?? [], [data]);
  return { bookings, isLoading, isPending, refetch };
}

// ============================================================
// ACCEPT — POST /bookings/{id}/approve
// ============================================================

export function useAcceptBookingMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
} = {}) {
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: (bookingId: string) =>
      baseFetch<{ message: string }>({
        method: "POST",
        url: `/admin/bookings/${bookingId}/accept`,
        options: { showError: false },
      }),

    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["adminBookingsPending"] });
      queryClient.invalidateQueries({ queryKey: ["adminBookingsAll"] });
    },

    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? error?.message ?? "Terjadi kesalahan";
      onError?.(msg);
    },
  });

  return { acceptMutation };
}

// ============================================================
// REJECT — POST /bookings/{id}/reject
// ============================================================

export function useRejectBookingMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
} = {}) {
  const queryClient = useQueryClient();

  const rejectMutation = useMutation({
    mutationFn: ({ bookingId, alasan_tolak }: { bookingId: string; alasan_tolak: string }) =>
      baseFetch<{ message: string }>({
        method: "POST",
        url: `/admin/bookings/${bookingId}/reject`,
        payload: { alasan_tolak },
        options: { showError: false },
      }),

    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["adminBookingsPending"] });
      queryClient.invalidateQueries({ queryKey: ["adminBookingsAll"] });
    },

    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? error?.message ?? "Terjadi kesalahan";
      onError?.(msg);
    },
  });

  return { rejectMutation };
}

// ============================================================
// GET ALL (semua status) — GET /bookings
// ============================================================

export function useGetAllBookings() {
  const { data, isLoading, refetch } = useQuery<Booking[]>({
    queryKey: ["adminBookingsAll"],

    queryFn: () =>
      baseFetch<Booking[]>({
        method: "GET",
        url: `/admin/bookings`,
        options: { showError: false },
      }).then((res) => res ?? []),

    retry: false,
    staleTime: 1 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const bookings = useMemo(() => data ?? [], [data]);
  return { bookings, isLoading, refetch };
}
