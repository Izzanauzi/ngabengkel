export type InventoryTipe = 'sparepart' | 'material';

export type InventorySatuan =
  | 'pcs'
  | 'liter'
  | 'botol'
  | 'pasang'
  | 'set'
  | 'roll'
  | 'kg'
  | 'gram'
  | 'meter';

export interface InventoryItem {
  inventory_id: string;
  tipe: InventoryTipe;
  nama: string;
  kode_part?: string | null;
  merek?: string | null;
  kompatibilitas?: string | null;
  satuan: InventorySatuan;
  stok: number;
  harga_satuan: number;
}

export interface InventoryRequest {
  tipe: InventoryTipe;
  nama: string;
  kode_part?: string | null;
  merek?: string | null;
  kompatibilitas?: string | null;
  satuan: InventorySatuan;
  stok: number;
  harga_satuan: number;
}

export type InventoryFilterTab = 'semua' | 'sparepart' | 'material' | 'menipis';

export const STOK_MENIPIS_THRESHOLD = 5;