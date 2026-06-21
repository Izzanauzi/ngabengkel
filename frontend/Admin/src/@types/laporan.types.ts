export interface Transaction {
  transaction_id: string;
  wo_id: string;
  total_biaya: number;
  metode_pembayaran: string;
  tanggal_bayar: string;
  status: string;
  created_at: string;
  nomor_wo?: string;
  customer_nama?: string;
  kendaraan_info?: string;
}

export interface TransactionReport {
  periode_dari: string;
  periode_sampai: string;
  total_pendapatan: number;
  jumlah_transaksi: number;
  transactions: Transaction[];
}

export interface Invoice {
  wo_id: string;
  nomor_wo: string;
  biaya_jasa: number;
  total_material: number;
  total_biaya: number;
  items: WOItem[];
}
 
export interface WOItem {
  wo_item_id: string;
  inventory_id: string;
  nama_item: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
}
 
export interface PaymentRequest {
  metode_pembayaran: string;
  total_biaya: number;
}