// ─── Kendaraan ────────────────────────────────────────────────────────────────
export interface Kendaraan {
  kendaraan_id: string;
  user_id: string | null;
  merek: string;
  model: string;
  tahun: number;
  nomor_polisi: string;
  warna: string | null;
  nomor_rangka: string | null;
}

// ─── Mekanik ──────────────────────────────────────────────────────────────────
export interface Mekanik {
  mekanik_id: string;
  nama: string;
  telepon: string;
  keahlian: string | null;
  status: "tersedia" | "tidak_tersedia";
}

// ─── Progress ─────────────────────────────────────────────────────────────────
export interface Progress {
  progress_id: string;
  wo_id: string;
  deskripsi: string;
  tipe: "update" | "suspend";
  foto_url: string | null;
  est_biaya_tambahan: number | null;
  created_at: string;
}

// ─── WO Item ──────────────────────────────────────────────────────────────────
export interface WOItem {
  wo_item_id: string;
  inventory_id: string;
  nama_item: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
}

// ─── Work Order ───────────────────────────────────────────────────────────────
export type WOStatus =
  | "dibuat"
  | "sedang_dikerjakan"
  | "menunggu_persetujuan"
  | "selesai"
  | "lunas";

export interface WorkOrder {
  wo_id: string;
  nomor_wo: string;
  user_id: string | null;
  kendaraan_id: string;
  kendaraan: Kendaraan;
  booking_id: string | null;
  slot_id: string | null;
  mekanik_id: string | null;
  mekanik: Mekanik | null;
  deskripsi_kerusakan: string;
  estimasi_biaya: number;
  biaya_jasa: number;
  status: WOStatus;
  progress: Progress[];
  items: WOItem[];
  created_at: string;
}

// ─── Customer ─────────────────────────────────────────────────────────────────
export interface Customer {
  user_id: string;
  nama: string;
  email: string;
  telepon: string;
  role: "customer" | "admin";
}

// ─── Customer dengan statistik (dihitung dari histori WO) ────────────────────
export interface CustomerWithStats extends Customer {
  total_wo: number;
  total_biaya: number;
  terakhir_servis: string | null;
}

// ─── Summary histori per customer ────────────────────────────────────────────
export interface CustomerHistorySummary {
  totalWO: number;
  totalBiaya: number;
}

// ─── Summary stats header halaman daftar customer ────────────────────────────
export interface HistoryPageStats {
  totalCustomer: number;
  totalWO: number;
  totalTransaksi: number;
}