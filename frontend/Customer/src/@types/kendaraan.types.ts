export interface Kendaraan {
    kendaraan_id: string;
    user_id: string | null;
    merek: string;
    model: string;
    tahun: number;
    nomor_polisi: string;
    warna: string | null;
    nomor_rangka: string | null;
    created_at: string;
}

export interface KendaraanRequest {
    merek: string;
    model: string;
    tahun: number;
    nomor_polisi: string;
    warna: string | null;
    nomor_rangka: string | null;
}