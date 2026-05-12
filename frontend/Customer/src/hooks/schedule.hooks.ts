import { baseFetch } from "../utils/baseFetch";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ScheduleResponse, Slot } from "../@types/schedule.types";

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGetSchedule() {
  const { data, isLoading, isPending, refetch, isError } = useQuery<ScheduleResponse>({
    queryKey: ["getSchedule"],

    queryFn: () =>
      baseFetch<ScheduleResponse>({
        method: "GET",
        url: "/api/v1/schedule",
        options: { showError: false },
      }),

    retry: 2,
    staleTime: 30 * 1000,        // fresh 30 detik 
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000,  // auto-refresh tiap 1 menit
  });

  const schedule = useMemo(() => {
    return data ?? null;
  }, [data]);

  return {
    schedule,
    slots: schedule?.slots ?? [],
    jumlahAntrian: schedule?.jumlah_antrian ?? 0,
    isLoading,
    isPending,
    isError,
    refetch,
  };
}