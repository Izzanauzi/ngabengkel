export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface Customer {
  user_id: string;
  nama: string;
  email: string;
  telepon: string;
  role: string;
  // Opsional: Tambahan jika nanti backend menggabungkan data
  jumlah_kendaraan?: number;
  jumlah_wo?: number;
}

export interface UpdateCustomerRequest {
  nama: string;
  telepon: string;
}