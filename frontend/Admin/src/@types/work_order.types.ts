// ============================================================
// WORK ORDER TYPES — sesuai model.WorkOrder backend Go
// ============================================================

export type WorkOrderStatus =
  | "dibuat"
  | "sedang_dikerjakan"
  | "menunggu_persetujuan"
  | "tindakan_ditolak"
  | "selesai"
  | "lunas"
  | "suspend";

export interface WorkOrder {
  wo_id: string;
  nomor_wo: string;
  user_id: string;
  kendaraan_id: string;
  booking_id: string | null;
  mekanik_id: string | null;
  deskripsi_kerusakan: string | null;
  estimasi_biaya: number | null;
  biaya_jasa: number | null;
  status: WorkOrderStatus | string;
  created_at: string;
  kendaraan?: {
    merek: string;
    model: string;
    nomor_polisi: string;
  } | null;
  // Untuk admin GetAll — user info dari join
  user?: {
    nama: string;
  } | null;
}

export interface Progress {
  progress_id: string;
  wo_id: string;
  deskripsi: string | null;
  tipe: string;
  foto_url: string | null;
  est_biaya_tambahan: number | null;
  created_at: string;
}

export interface WorkOrderDetail extends WorkOrder {
  progress: Progress[];
}

export interface WorkOrderRequest {
  user_id?: string;
  kendaraan_id: string;
  booking_id?: string;
  mekanik_id?: string;
  deskripsi_kerusakan?: string;
  estimasi_biaya?: number;
}

export interface ProgressRequest {
  deskripsi: string;
  tipe: string;
  foto_url?: string;
  est_biaya_tambahan?: number;
}

export interface SuspendRequest {
  deskripsi: string;
  est_biaya_tambahan: number;
}