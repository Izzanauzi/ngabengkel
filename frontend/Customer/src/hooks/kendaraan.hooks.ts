import { baseFetch } from "../utils/baseFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Kendaraan, KendaraanRequest } from "../@types/kendaraan.types";

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

interface UseCreateKendaraanMutationProps {
  successAction: () => void;
  onError?: (message: string) => void;
}

interface UseUpdateKendaraanMutationProps {
  successAction: () => void;
  onError?: (message: string) => void;
}

interface UpdateKendaraanArgs {
  kendaraanId: string;
  payload: KendaraanRequest;
}

interface UseDeleteKendaraanMutationProps {
  successAction: () => void;
  onError?: (message: string) => void;
}

const QUERY_KEYS = {
  all: ["getAllKendaraan"],
  byId: (id: string) => ["getKendaraanById", id],
} as const;

export function useGetAllKendaraan() {
  const { data, isLoading, isPending, refetch, status, error } = useQuery<Kendaraan[]>({
    queryKey: QUERY_KEYS.all,
    queryFn: async () => {
      console.log('queryFn dipanggil') // ← cek apakah function ini jalan
      // const result = await baseFetch<Kendaraan[]>({...})
      const result = await baseFetch<Kendaraan[]>({
        method: "GET",
        url: `/kendaraan`,
        options: { showError: false },
      })
      console.log('result type:', typeof result)
      console.log('result:', JSON.stringify(result))
      console.log('result dari API:', result) // ← cek raw result
      return result
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })

  console.log('query status:', status)  // ← 'pending', 'success', 'error'
  console.log('query error:', error)    // ← kalau ada error
  console.log('raw data:', data)

  const kendaraanList = useMemo(() => data ?? [], [data])
  return { kendaraanList, isLoading, isPending, refetch }
}

export function useGetKendaraanById(kendaraanId: string | undefined) {
  const { data, isLoading, refetch } = useQuery<Kendaraan | undefined>({
    enabled: !!kendaraanId,
    queryKey: QUERY_KEYS.byId(kendaraanId ?? ''),
    queryFn: () =>
      baseFetch<Kendaraan>({
        method: "GET",
        url: `/kendaraan/${kendaraanId}`,
        options: { showError: false },
      }),
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })

  const kendaraan = useMemo(() => data ?? null, [data])
  return { kendaraan, isLoading, refetch }
}

export function useCreateKendaraanMutation({ successAction, onError }: UseCreateKendaraanMutationProps) {
  const queryClient = useQueryClient()

  const createKendaraanMutation = useMutation({
    mutationFn: (payload: KendaraanRequest) =>
      baseFetch<Kendaraan>({      
        method: "POST",
        url: `/kendaraan`,
        payload,
        options: { showError: false },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all })
      successAction()
    },
    onError: (error: any) => {
      onError?.(error?.response?.data?.message ?? "Gagal menambahkan kendaraan.")
    },
  })

  return { createKendaraanMutation }
}

export function useUpdateKendaraanMutation({ successAction, onError }: UseUpdateKendaraanMutationProps) {
  const queryClient = useQueryClient()

  const updateKendaraanMutation = useMutation({
    mutationFn: ({ kendaraanId, payload }: UpdateKendaraanArgs) =>
      baseFetch<Kendaraan>({        
        method: "PUT",
        url: `/kendaraan/${kendaraanId}`,
        payload,
        options: { showError: false },
      }),
    onSuccess: (_, { kendaraanId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.byId(kendaraanId) })
      successAction()
    },
    onError: (error: any) => {
      onError?.(error?.response?.data?.message ?? "Gagal memperbarui kendaraan.")
    },
  })

  return { updateKendaraanMutation }
}

export function useDeleteKendaraanMutation({ successAction, onError }: UseDeleteKendaraanMutationProps) {
  const queryClient = useQueryClient()

  const deleteKendaraanMutation = useMutation({
    mutationFn: (kendaraanId: string) =>
      baseFetch<{ message: string }>({ 
        method: "DELETE",
        url: `/kendaraan/${kendaraanId}`,
        options: { showError: false },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all })
      successAction()
    },
    onError: (error: any) => {
      onError?.(error?.response?.data?.message ?? "Gagal menghapus kendaraan.")
    },
  })

  return { deleteKendaraanMutation }
}