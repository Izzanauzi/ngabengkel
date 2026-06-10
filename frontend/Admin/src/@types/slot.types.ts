export type SlotStatus = 'Tersedia' | 'Terisi' | 'Tidak Tersedia';

export interface Slot {
  slot_id: string;
  nama: string;
  status: SlotStatus;
}

export interface QueueItem {
  wo_id: string;
  kendaraan?: {
    merek: string;
    model: string;
    nomor_polisi: string;
  };
  eta?: string;
}
