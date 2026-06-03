import { baseFetch } from "../utils/baseFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { ApiResponse, Booking, RejectPayload } from "../@types/booking.types";

// ============================================================
// GET PENDING — ambil semua booking menunggu konfirmasi (admin)
// GET /api/v1/admin/bookings
// ============================================================

export function useGetPendingBookings() {
  const { data, isLoading, isPending, refetch } = useQuery<ApiResponse<Booking[]>>({
    queryKey: ["adminBookingsPending"],

    queryFn: () =>
      baseFetch<ApiResponse<Booking[]>>({
        method: "GET",
        url: `/admin/bookings`,
        options: { showError: false },
      }),

    retry: false,
    staleTime: 1 * 60 * 1000,     // Fresh selama 1 menit (data booking cepat berubah)
    refetchOnMount: true,
    refetchOnWindowFocus: true,    // Refresh saat kembali ke tab
  });

  const bookings = useMemo(() => {
    return data?.statusCode === 200 ? data.data : [];
  }, [data]);

  return { bookings, isLoading, isPending, refetch };
}

// ============================================================
// GET ALL — ambil semua booking (semua status) untuk admin
// Jika backend punya endpoint terpisah, sesuaikan URL-nya
// ============================================================

export function useGetAllBookingsAdmin() {
  const { data, isLoading, isPending, refetch } = useQuery<ApiResponse<Booking[]>>({
    queryKey: ["adminBookingsAll"],

    queryFn: () =>
      baseFetch<ApiResponse<Booking[]>>({
        method: "GET",
        url: `/admin/bookings/all`,
        options: { showError: false },
      }),

    retry: false,
    staleTime: 1 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const bookings = useMemo(() => {
    return data?.statusCode === 200 ? data.data : [];
  }, [data]);

  return { bookings, isLoading, isPending, refetch };
}

// ============================================================
// ACCEPT — setujui booking
// POST /api/v1/admin/bookings/{id}/accept
// ============================================================

interface UseAcceptBookingProps {
  successAction?: () => void;
}

export function useAcceptBookingMutation({ successAction }: UseAcceptBookingProps = {}) {
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: (bookingId: string) =>
      baseFetch<ApiResponse<{ message: string }>>({
        method: "POST",
        url: `/admin/bookings/${bookingId}/accept`,
        options: { showError: false },
      }),

    onSuccess: (data) => {
      if (data?.statusCode === 200) {
        // Invalidate semua cache booking admin agar list refresh
        queryClient.invalidateQueries({ queryKey: ["adminBookingsPending"] });
        queryClient.invalidateQueries({ queryKey: ["adminBookingsAll"] });
        successAction?.();
      }
    },

    onError: (_error) => {
      // Tangani error di komponen jika perlu
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
      baseFetch<ApiResponse<{ message: string }>>({
        method: "POST",
        url: `/admin/bookings/${bookingId}/reject`,
        payload,
        options: { showError: false },
      }),

    onSuccess: (data) => {
      if (data?.statusCode === 200) {
        queryClient.invalidateQueries({ queryKey: ["adminBookingsPending"] });
        queryClient.invalidateQueries({ queryKey: ["adminBookingsAll"] });
        successAction?.();
      }
    },

    onError: (_error) => {
      // Tangani error di komponen jika perlu
    },
  });

  return { rejectMutation };
}