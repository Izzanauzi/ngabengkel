import axios, { AxiosRequestConfig, AxiosError } from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";

export const axiosBaseConfig: AxiosRequestConfig = {
  // Pakai IP 10.0.2.2 (di .env) kl pakai Emulator Android biar bisa tembus ke Golang localhost:8080
  baseURL: process.env.EXPO_PUBLIC_API_URL, 
  headers: {
    // "X-Client-Type": "mobile",
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
  timeout: 30000,
};

const request = axios.create(axiosBaseConfig);

// Tempel token otomatis setiap mau nembak API
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


      if (error.response?.status === 401) {
        
        // Hanya redirect kalau BUKAN dari endpoint auth
        if (!error.config?.url?.includes('/auth/')) {
          await AsyncStorage.removeItem("access_token");
          await AsyncStorage.removeItem("refresh_token");
          router.replace("/(auth)/login");
        }
      }
      return Promise.reject(error);
    }
  );

export default request;