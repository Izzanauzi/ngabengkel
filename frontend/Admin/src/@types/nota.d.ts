export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface WOItem {
  wo_item_id: string;
  inventory_id: string;
  nama_item: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
}

export interface Nota {
  wo_id: string;
  nomor_wo: string;
  customer: {
    user_id: string;
    nama: string;
    telepon: string;
    email?: string;
  };
  kendaraan: {
    kendaraan_id: string;
    merek: string;
    model: string;
    nomor_polisi: string;
  };
  items: WOItem[];
  biaya_jasa: number;
  total_material: number;
  total_biaya: number;
}

export interface Transaction {
  transaction_id: string;
  wo_id: string;
  total_biaya: number;
  metode_pembayaran: string;
  tanggal_bayar: string;
}

export interface ConfirmPaymentRequest {
  metode_pembayaran: string;
}