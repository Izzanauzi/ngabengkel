import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useAuth } from "../contexts/auth.context";
import { baseFetch } from "../utils/baseFetch";
import { AuthResponse, ApiError } from "../@types/auth.types";

interface LoginPayload {
  email: string;
  password: string;
}

interface UseLoginMutationProps {
  onError: (message: string) => void;
}

export function useLoginMutation({ onError }: UseLoginMutationProps) {
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) =>
      baseFetch<AuthResponse>({
        url: "/auth/login",
        method: "POST",
        payload,
        headers: { "X-App": "admin" }, // ← level atas, bukan di dalam options
        options: { showError: false },
      }),

    onSuccess: async (data) => {
      if (data?.token && data?.user) {
        await login(data.token, data.user);
      }
    },

    onError: (error: any) => {
      const apiError: ApiError | undefined = error?.response?.data;

      if (error?.response?.status === 403) {
        onError("Akses ditolak. Gunakan aplikasi customer untuk login sebagai customer.");
      } else if (error?.response?.status === 401) {
        onError(apiError?.message ?? "Email atau password salah.");
      } else {
        onError(apiError?.message ?? "Terjadi kesalahan. Silahkan coba lagi.");
      }
    },
  });

  return { loginMutation };
}