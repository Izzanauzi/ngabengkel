import { Kendaraan } from "./kendaraan.types";

export interface Mekanik {
  mekanik_id: string;
  nama: string;
  telepon: string;
  keahlian: string;
  status: "tersedia" | "tidak_tersedia";
}

export interface Progress {
  progress_id: string;
  wo_id: string;
  deskripsi: string;
  tipe: "update" | "suspend";
  foto_url: string | null;
  est_biaya_tambahan: number | null;
  created_at: string;
}

export interface WOItem {
  wo_item_id: string;
  inventory_id: string;
  nama_item: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
}

export interface WorkOrder {
  wo_id: string;
  nomor_wo: string;
  user_id: string | null;
  kendaraan_id: string;
  kendaraan?: Kendaraan | null;
  booking_id: string | null;
  slot_id: string | null;
  mekanik_id: string | null;
  mekanik?: Mekanik | null;
  deskripsi_kerusakan: string;
  estimasi_biaya: number;
  biaya_jasa: number;
  status: "dibuat" | "sedang_dikerjakan" | "menunggu_persetujuan" | "selesai" | "lunas" | string;
  progress: Progress[];
  items: WOItem[];
  created_at: string;
}
