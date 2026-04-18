import { Alert } from "react-native";
import request from "./baseReq";

interface FetchArgs {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload?: any;
    params?: any;
    headers?: Record<string, string>;
  options?: {
    showError?: boolean;
  };
}

export const baseFetch = async <T>(data: FetchArgs): Promise<T | undefined> => {
  try {
    const response = await request({
      url: data.url,
      method: data.method.toLowerCase(),
      data: data.payload,
      params: data.params,
      headers: data.headers,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Terjadi kesalahan pada server";
    
    if (data.options?.showError !== false) {
      Alert.alert("Error", message);
    }
    throw error;
  }
};