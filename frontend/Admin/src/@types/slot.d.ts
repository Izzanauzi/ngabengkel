export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface Slot {
  slot_id: string;
  nomor_slot: string;
  status: 'tersedia' | 'terisi' | 'tidak_tersedia';
  wo_id: string | null;
}

// Response dari GET /slots (Admin)
export interface SlotAdminResponse {
  slots: Slot[];
  antrian: any[]; // Nanti kita bisa ganti 'any' dengan tipe WorkOrder saat fitur WO dikerjakan
}

export interface UpdateSlotRequest {
  status: 'tersedia' | 'tidak_tersedia';
}

export interface AssignSlotRequest {
  wo_id: string;
  slot_id: string;
}