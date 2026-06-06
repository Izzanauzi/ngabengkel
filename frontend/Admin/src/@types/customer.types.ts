export interface CustomerKendaraan {
  kendaraan_id: string;
  merek: string;
  model: string;
  nomor_polisi: string;
}

export interface Customer {
  user_id: string;
  nama: string;
  telepon: string;
  email?: string;
  jumlah_wo?: number;
  kendaraan?: CustomerKendaraan[];
}

export interface CustomerRequest {
  nama: string;
  telepon: string;
}
