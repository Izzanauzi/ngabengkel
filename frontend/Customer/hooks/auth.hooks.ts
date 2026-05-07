/**
 * hooks/auth.hooks.ts
 *
 *
 */
import { baseFetch } from "../src/utils/baseFetch";
// import {useMutation}
 import { useMutation } from "@tanstack/react-query";
 import { router } from "expo-router";
 import AsyncStorage from "@react-native-async-storage/async-storage";
 import { AuthResponse, ApiError } from "@/types/auth.types";
 
 // ── Payload types (khusus untuk API call) ─────────────────────
 
 interface RegisterPayload {
   nama: string;
   email: string;
   telepon: string;
   password: string;
 }
 
 interface LoginPayload {
   email: string;
   password: string;
 }
 
 // ── Register ──────────────────────────────────────────────────
 
 interface UseRegisterMutationProps {
   onApiErrors: (errors: string[]) => void;   
   onGlobalError: (message: string) => void;  
 }
 
 export function useRegisterMutation({
   onApiErrors,
   onGlobalError,
 }: UseRegisterMutationProps) {
   const registerMutation = useMutation({
     mutationFn: (payload: RegisterPayload) =>
       baseFetch<AuthResponse>({
         url: "/auth/register",
         method: "POST",
         payload,
         options: { showError: false },
       }),
 
     onSuccess: () => {
       router.replace("/(auth)/login");
     },
 
     onError: (error: any) => {
       const apiError: ApiError | undefined = error?.response?.data;
 
       if (error?.response?.status === 400) {
         if (apiError?.errors && apiError.errors.length > 0) {
           onApiErrors(apiError.errors);
         } else {
           onGlobalError(
             apiError?.message ?? "Email sudah terdaftar. Silahkan gunakan email lain."
           );
         }
       } else if (error?.response?.status === 401) {
         onGlobalError("Tidak terotorisasi. Silahkan coba lagi.");
       } else {
         onGlobalError(
           apiError?.message ?? "Terjadi kesalahan. Silahkan coba lagi."
         );
       }
     },
   });
 
   return { registerMutation };
 }
 
 // ── Login ─────────────────────────────────────────────────────
 
 interface UseLoginMutationProps {
   onError: (message: string) => void;
 }
 
 export function useLoginMutation({ onError }: UseLoginMutationProps) {
   const loginMutation = useMutation({
     mutationFn: (payload: LoginPayload) =>
       baseFetch<AuthResponse>({
         url: "/auth/login",
         method: "POST",
         payload,
         options: { showError: false },
       }),
 
     onSuccess: async (data) => {
       if (data?.token) {
         await AsyncStorage.setItem("access_token", data.token);
         router.replace("/(beranda)");
       }
     },
 
     onError: (error: any) => {
       const message =
         error?.response?.data?.message ?? "Email atau password salah.";
       onError(message);
     },
   });
 
   return { loginMutation };
 }