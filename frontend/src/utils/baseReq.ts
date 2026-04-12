import axios, { AxiosRequestConfig, AxiosError } from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";

export const axiosBaseConfig: AxiosRequestConfig = {
  // Gunakan IP 10.0.2.2 jika pakai Emulator Android agar bisa tembus ke Golang localhost:8080
  baseURL: process.env.EXPO_PUBLIC_API_URL, 
  headers: {
    // "X-Client-Type": "mobile",
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
  timeout: 30000,
};

const request = axios.create(axiosBaseConfig);

// Request interceptor: Tempelkan token otomatis setiap mau nembak API
request.interceptors.request.use(
  async (config) => {
    const accessToken = await AsyncStorage.getItem("access_token");
    if (accessToken && config.headers) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Kalau token mati (401), otomatis lempar ke login
request.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Di baseReq.ts atau auth.context.tsx


// ... di dalam interceptor atau fungsi logout
if (error.response?.status === 401) {
  // Gunakan 'any' sementara jika 'string[]' masih ditolak untuk memastikan fungsionalitas
  await AsyncStorage.removeItem("access_token");
await AsyncStorage.removeItem("refresh_token");
  
  // Pastikan memanggil router sebagai fungsi objek
  router.replace("/(auth)/login" as any); 
}
      return Promise.reject(error);
    }
  );

export default request;