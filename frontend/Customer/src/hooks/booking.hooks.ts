import { baseFetch } from "../utils/baseFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";



// ── GET ALL BOOKINGS ──────────────────────────────────────────────────────────

export function useGetAllBookings() {
  const { data, isLoading, isPending, refetch } = useQuery<Booking[]>({
    queryKey: ["getAllBookings"],

    queryFn: () =>
      baseFetch<Booking[]>({
        method: "GET",
        url: "/bookings",
        options: { showError: false },
      }),

    retry: false,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const bookings = useMemo(() => data ?? [], [data]);

  const bookingAktif = useMemo(
    () => bookings.filter((b) => b.status === "menunggu_konfirmasi" || b.status === "dikonfirmasi"),
    [bookings]
  );

  return { bookings, bookingAktif, isLoading, isPending, refetch };
}

// ── CREATE BOOKING ────────────────────────────────────────────────────────────

interface UseCreateBookingProps {
  successAction: () => void;
}

export function useCreateBooking({ successAction }: UseCreateBookingProps) {
  const queryClient = useQueryClient();

  const createBookingMutation = useMutation({
    mutationFn: (payload: BookingRequest) =>
      baseFetch<Booking>({
        method: "POST",
        url: "/bookings",
        payload,
        options: { showError: false },
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllBookings"] });
      successAction();
    },

    onError: (_error) => {
      // handle error di komponen kalau perlu
    },
  });

  return { createBookingMutation };
}

// ── CANCEL BOOKING ────────────────────────────────────────────────────────────

interface UseCancelBookingProps {
  successAction: () => void;
}

export function useCancelBooking({ successAction }: UseCancelBookingProps) {
  const queryClient = useQueryClient();

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: string) =>
      baseFetch<{ message: string }>({
        method: "DELETE",
        url: `/bookings/${bookingId}`,
        options: { showError: false },
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllBookings"] });
      successAction();
    },

    onError: (_error) => {},
  });

  return { cancelBookingMutation };
}