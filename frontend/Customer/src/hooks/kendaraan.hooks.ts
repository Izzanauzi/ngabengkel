/**
 * hooks/kendaraan.hooks.ts
 *
 * Pasangan dari backend/internal/service/kendaraan_service.go
 *
 * BE service          → FE hook
 * ─────────────────────────────────────────
 * GetAll(userID)      → useGetAllKendaraan()
 * GetByID(...)        → useGetKendaraanById()
 * Create(...)         → useCreateKendaraanMutation()
 * Update(...)         → useUpdateKendaraanMutation()
 * Delete(...)         → useDeleteKendaraanMutation()
 */
import { baseFetch } from "../utils/baseFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Kendaraan, KendaraanRequest } from "../@types/kendaraan.types";
 
 // ── Response wrapper ──
 
 interface ApiResponse<T> {
   statusCode: number;
   message: string;
   data: T;
 }
 
 const QUERY_KEYS = {
   all: "getAllKendaraan",
   byId: "getKendaraanById",
 } as const;
 
 
 export function useGetAllKendaraan() {
   const { data, isLoading, isPending, refetch } = useQuery<
     ApiResponse<Kendaraan[]> | undefined
   >({
     queryKey: [QUERY_KEYS.all],
     queryFn: () =>
       baseFetch<ApiResponse<Kendaraan[]>>({
         method: "GET",
         url: `/kendaraan`,
         options: { showError: false },
       }),
     retry: false,
     staleTime: 5 * 60 * 1000,
     refetchOnMount: false,
     refetchOnWindowFocus: false,
   });
 
   const kendaraanList = useMemo(() => {
    return data ?? [];
  }, [data]);
 
   return { kendaraanList, isLoading, isPending, refetch };
 }
 
 // ── GET BY ID ──────────
 
 export function useGetKendaraanById(kendaraanId: string | undefined) {
   const { data, isLoading, refetch } = useQuery<
     ApiResponse<Kendaraan> | undefined
   >({
     enabled: !!kendaraanId,
     queryKey: [QUERY_KEYS.byId, kendaraanId],
     queryFn: () =>
       baseFetch<ApiResponse<Kendaraan>>({
         method: "GET",
         url: `/kendaraan/${kendaraanId}`,
         options: { showError: false },
       }),
     retry: false,
     staleTime: 5 * 60 * 1000,
     refetchOnMount: false,
     refetchOnWindowFocus: false,
   });
 
   const kendaraan = useMemo(() => {
     return data?.statusCode === 200 ? data.data : null;
   }, [data]);
 
   return { kendaraan, isLoading, refetch };
 }
 
 // ── CREATE ──
 
 interface UseCreateKendaraanMutationProps {
   successAction: () => void;
   onError?: (message: string) => void;
 }
 
 export function useCreateKendaraanMutation({
   successAction,
   onError,
 }: UseCreateKendaraanMutationProps) {
   const queryClient = useQueryClient();
 
   const createKendaraanMutation = useMutation({
     mutationFn: (payload: KendaraanRequest) =>
       baseFetch<ApiResponse<Kendaraan>>({
         method: "POST",
         url: `/kendaraan`,
         payload,
         options: { showError: false },
       }),
 
     onSuccess: (data) => {
       if (data?.statusCode === 200 || data?.statusCode === 201) {
         queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.all] });
         successAction();
       }
     },
 
     onError: (error: any) => {
       const message =
         error?.response?.data?.message ?? "Gagal menambahkan kendaraan.";
       onError?.(message);
     },
   });
 
   return { createKendaraanMutation };
 }
 
 // ── UPDATE ───
 
 interface UseUpdateKendaraanMutationProps {
   successAction: () => void;
   onError?: (message: string) => void;
 }
 
 interface UpdateKendaraanArgs {
   kendaraanId: string;
   payload: KendaraanRequest;
 }
 
 export function useUpdateKendaraanMutation({
   successAction,
   onError,
 }: UseUpdateKendaraanMutationProps) {
   const queryClient = useQueryClient();
 
   const updateKendaraanMutation = useMutation({
     mutationFn: ({ kendaraanId, payload }: UpdateKendaraanArgs) =>
       baseFetch<ApiResponse<Kendaraan>>({
         method: "PUT",
         url: `/kendaraan/${kendaraanId}`,
         payload,
         options: { showError: false },
       }),
 
     onSuccess: (data) => {
       if (data?.statusCode === 200) {
         // Refresh list dan detail setelah update
         queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.all] });
         queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.byId] });
         successAction();
       }
     },
 
     onError: (error: any) => {
       const message =
         error?.response?.data?.message ?? "Gagal memperbarui kendaraan.";
       onError?.(message);
     },
   });
 
   return { updateKendaraanMutation };
 }
 
 // ── DELETE ───
 
 interface UseDeleteKendaraanMutationProps {
   successAction: () => void;
   onError?: (message: string) => void;
 }
 
 export function useDeleteKendaraanMutation({
   successAction,
   onError,
 }: UseDeleteKendaraanMutationProps) {
   const queryClient = useQueryClient();
 
   const deleteKendaraanMutation = useMutation({
     mutationFn: (kendaraanId: string) =>
       baseFetch<ApiResponse<null>>({
         method: "DELETE",
         url: `/kendaraan/${kendaraanId}`,
         options: { showError: false },
       }),
 
     onSuccess: (data) => {
       if (data?.statusCode === 200) {
         queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.all] });
         successAction();
       }
     },
 
     onError: (error: any) => {
       const message =
         error?.response?.data?.message ?? "Gagal menghapus kendaraan.";
       onError?.(message);
     },
   });
 
   return { deleteKendaraanMutation };
 }