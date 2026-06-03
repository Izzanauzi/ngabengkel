// ============================================================
// BOOKING TYPES — disesuaikan dengan model.Booking di backend
// ============================================================

export type BookingStatus =
  | "menunggu_konfirmasi"
  | "disetujui"
  | "ditolak"
  | "dibatalkan";

export interface Kendaraan {
  kendaraan_id: string;
  merek: string;
  model: string;
  nomor_polisi: string;
}

export interface User {
  user_id: string;
  nama: string;
  email: string;
  telepon: string;
}

export interface Booking {
  booking_id: string;
  user_id: string;
  kendaraan_id: string;
  kendaraan?: Kendaraan;
  user?: User;
  eta: string; // ISO 8601 / RFC3339
  keluhan_awal?: string | null;
  status: BookingStatus;
  alasan_tolak?: string | null;
  created_at: string;
}

export interface BookingRequest {
  kendaraan_id: string;
  eta: string;
  keluhan_awal?: string;
}

// Admin reject payload
export interface RejectPayload {
  alasan_tolak: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}