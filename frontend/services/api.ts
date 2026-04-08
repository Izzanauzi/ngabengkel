import axios from 'axios';

// Gunakan IP laptop Anda (cek via ipconfig) agar bisa diakses Emulator/HP
const BASE_URL = 'http://192.168.1.4:8080'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Pastikan ada kata 'export' di depan variabel
export const authService = {
  login: async (email: string, password: string) => {
    // Menyesuaikan dengan path /auth/login di OpenAPI
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

export default api;