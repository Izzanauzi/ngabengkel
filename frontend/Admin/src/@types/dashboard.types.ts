// Types untuk Dashboard Admin

import { Slot, WorkOrder, Booking } from './api.d'; // sesuaikan dengan path types kalian

export interface DashboardData {
  // Statistik ringkasan
  woAktif: number;
  menungguPersetujuan: number;
  bookingMasuk: number;
  slotTersedia: number;

  // Data slot & antrian dari GET /slots
  slots: Slot[];
  antrian: WorkOrder[];
}

export interface SlotResponse {
  slots: Slot[];
  antrian: WorkOrder[];
}