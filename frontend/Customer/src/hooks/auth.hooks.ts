import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useAuth } from "../contexts/auth.context";
import { baseFetch } from "../utils/baseFetch";
import { AuthResponse, ApiError } from "../@types/auth.types";

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

// Register
interface UseRegisterMutationProps {
  onGlobalError: (message: string) => void;
}

export function useRegisterMutation({ onGlobalError }: UseRegisterMutationProps) {
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
      onGlobalError(apiError?.message ?? "Terjadi kesalahan. Silahkan coba lagi.");
    },
  });

  return { registerMutation };
}

// Login
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
        options: {
          showError: false,
          headers: {
            "X-App": "customer", 
          },
        },
      }),

    onSuccess: async (data) => {
      if (data?.token && data?.user) {
        await login(data.token, data.user);
      }
    },

    onError: (error: any) => {
      const apiError: ApiError | undefined = error?.response?.data;

      if (error?.response?.status === 403) {
        onError("Akses ditolak. Gunakan aplikasi admin untuk login sebagai admin.");
      } else if (error?.response?.status === 401) {
        onError(apiError?.message ?? "Email atau password salah.");
      } else {
        onError(apiError?.message ?? "Terjadi kesalahan. Silahkan coba lagi.");
      }
    },
  });

  return { loginMutation };
}