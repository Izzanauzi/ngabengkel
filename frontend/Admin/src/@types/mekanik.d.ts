// Format standar balasan dari Backend (Sesuai dengan struktur Go rekan Anda)
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface Mekanik {
  mekanik_id: string;
  nama: string;
  telepon: string;
  keahlian: string;
  status: 'tersedia' | 'tidak_tersedia';
}

export interface MekanikRequest {
  nama: string;
  telepon: string;
  keahlian: string;
  status?: 'tersedia' | 'tidak_tersedia';
}