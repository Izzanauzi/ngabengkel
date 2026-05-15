// Cerminkan struct dari booking.go
export interface Booking {
    id: string;
    userId: string;
    kendaraanId: string;
    slotId: string;
    status: "pending" | "confirmed" | "cancelled";
    createdAt: string;
  }
  
  export interface BookingPayload {
    kendaraanId: string;
    slotId: string;
  }