import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

// 1. Mendefinisikan struktur data User agar sesuai dengan backend Go
export interface UserData {
  user_id: string;
  nama: string;
  email: string;
  telepon?: string;
  role: string;
}

// 2. Mendefinisikan tipe data yang akan disediakan oleh Context ini
interface AuthContextType {
  token: string | null;
  user: UserData | null;
  login: (token: string, userData: UserData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // 3. Memuat data dari AsyncStorage saat aplikasi pertama kali dijalankan
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("access_token");
        const savedUser = await AsyncStorage.getItem("user_data");

        if (savedToken && savedUser) {
          setToken(savedToken);
          // JSON.parse digunakan untuk mengubah string kembali menjadi objek JavaScript
          setUser(JSON.parse(savedUser)); 
        }
      } catch (e) {
        console.error("Gagal memuat data autentikasi dari storage:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 4. Fungsi Login: Menyimpan token dan data profil pengguna
  const login = async (newToken: string, userData: UserData) => {
    try {
      await AsyncStorage.setItem("access_token", newToken);
      // JSON.stringify digunakan karena AsyncStorage hanya bisa menyimpan tipe string
      await AsyncStorage.setItem("user_data", JSON.stringify(userData)); 
      
      setToken(newToken);
      setUser(userData);
      
      // Arahkan ke halaman utama setelah login sukses
      router.replace("/(beranda)/home");
    } catch (e) {
      console.error("Gagal menyimpan data saat login:", e);
    }
  };

  // 5. Fungsi Logout: Membersihkan token dan data profil pengguna
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("user_data");

      setToken(null);
      setUser(null);
      queryClient.clear();

      // Arahkan kembali ke halaman awal setelah logout
      // router.replace("/(beranda)/home");
    } catch (e) {
      console.error("Gagal menghapus data saat logout:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 6. Custom Hook untuk mempermudah pengambilan state di komponen lain
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam cakupan AuthProvider");
  }
  return context;
};