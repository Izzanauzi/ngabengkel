export interface Transaction {
  transaction_id: string;
  wo_id: string;
  total_biaya: number;
  metode_pembayaran: string;
  tanggal_bayar: string;
  // enriched from WO (populated by hooks)
  nomor_wo?: string;
  customer_nama?: string;
  kendaraan_info?: string;
}

export interface LaporanTransaksi {
  periode_mulai: string;
  periode_akhir: string;
  total_pendapatan: number;
  jumlah_transaksi: number;
  transaksi: Transaction[];
}

export interface LaporanFilter {
  start_date: string; // format: YYYY-MM-DD
  end_date: string;   // format: YYYY-MM-DD
}