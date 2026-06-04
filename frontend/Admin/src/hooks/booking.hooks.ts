import { baseFetch } from "../utils/baseFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Booking, RejectPayload } from "../@types/booking.types";

// ============================================================
// Response shape dari backend Go:
//   GET  /api/v1/admin/bookings        → Booking[]  (langsung array)
//   POST /api/v1/admin/bookings/{id}/accept  → { message: string }
//   POST /api/v1/admin/bookings/{id}/reject  → { message: string }
//   Error                               → { error: string }
// ============================================================

// ============================================================
// GET PENDING — ambil semua booking menunggu konfirmasi (admin)
// GET /admin/bookings
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
// ACCEPT — setujui booking
// POST /admin/bookings/{id}/accept
// ============================================================

interface UseAcceptBookingProps {
  successAction?: () => void;
}

export function useAcceptBookingMutation({ successAction }: UseAcceptBookingProps = {}) {
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: (bookingId: string) =>
      baseFetch<{ message: string }>({
        method: "POST",
        url: `/admin/bookings/${bookingId}/accept`,
        options: { showError: true }, // tampilkan error dari server otomatis
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBookingsPending"] });
      successAction?.();
    },
  });

  return { acceptMutation };
}

// ============================================================
// REJECT — tolak booking dengan alasan
// POST /api/v1/admin/bookings/{id}/reject
// ============================================================

interface UseRejectBookingProps {
  successAction?: () => void;
}

export function useRejectBookingMutation({ successAction }: UseRejectBookingProps = {}) {
  const queryClient = useQueryClient();

  const rejectMutation = useMutation({
    mutationFn: ({ bookingId, payload }: { bookingId: string; payload: RejectPayload }) =>
      baseFetch<{ message: string }>({
        method: "POST",
        url: `/admin/bookings/${bookingId}/reject`,
        payload,
        options: { showError: true }, // tampilkan error dari server otomatis
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBookingsPending"] });
      successAction?.();
    },
  });

  return { rejectMutation };
}