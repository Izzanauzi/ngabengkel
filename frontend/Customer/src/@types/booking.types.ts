// ── Types ─────────────────────────────────────────────────────────────────────


export interface Booking {
  booking_id: string;
  user_id: string;
  kendaraan_id: string;
  kendaraan?: Kendaraan | null;  
  eta: string;                   
  keluhan_awal: string | null;    
  status: "menunggu_konfirmasi" | "disetujui" | "ditolak" | "dibatalkan" | string;
  alasan_tolak: string | null;    
  created_at: string;           
}

export interface BookingRequest {
  kendaraan_id: string;
  eta: string;                   
  keluhan_awal?: string | null;   
}