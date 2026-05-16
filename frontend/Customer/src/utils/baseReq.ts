import axios, { AxiosRequestConfig, AxiosError } from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";

export const axiosBaseConfig: AxiosRequestConfig = {
  // Pakai IP 10.0.2.2 (di .env) kl pakai Emulator Android biar bisa ke Golang localhost:8080
  baseURL: process.env.EXPO_PUBLIC_API_URL, 
  headers: {
    // "X-Client-Type": "mobile",
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
  timeout: 30000,
};

const request = axios.create(axiosBaseConfig);
// token
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

request.interceptors.response.use(
    (response) => response,
    async (error) => {


      if (error.response?.status === 401) {
        
        if (!error.config?.url?.includes('/auth/')) {
          await AsyncStorage.removeItem("access_token");
          await AsyncStorage.removeItem("refresh_token");
        }
      }
      return Promise.reject(error);
    }
  );

export default request;