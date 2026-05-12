export interface Slot {
  id: string;
  name?: string;
  label?: string;
  status: "tersedia" | "tidak_tersedia" | "diservis" | "ditutup" | string;
}

export interface ScheduleResponse {
  slots: Slot[];
  jumlah_antrian: number;
}