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
  user?: {
    nama: string;
  } | null;
  mekanik?: {
    nama: string;
  } | null;
}

export interface WorkOrderItem {
  item_id?: string;
  nama_barang: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
}

export interface WOItem {
  wo_item_id: string;
  wo_id: string;
  inventory_id: string;
  nama_item: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
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
  items: WOItem[];
  tanggal_selesai?: string | null;
}

export interface InvoiceData {
  biaya_jasa: number;
  total_material: number;
  total_biaya: number;
  items: WorkOrderItem[];
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