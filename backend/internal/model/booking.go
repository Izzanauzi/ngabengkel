package model

import "time"

type Booking struct {
	BookingID   string     `json:"booking_id"`
	UserID      string     `json:"user_id"`
	KendaraanID string     `json:"kendaraan_id"`
	Kendaraan   *Kendaraan `json:"kendaraan,omitempty"`
	ETA         time.Time  `json:"eta"`
	KeluhanAwal *string    `json:"keluhan_awal"`
	Status      string     `json:"status"`
	AlasanTolak *string    `json:"alasan_tolak"`
	CreatedAt   time.Time  `json:"created_at"`
}

type BookingRequest struct {
	KendaraanID string  `json:"kendaraan_id"`
	ETA         string  `json:"eta"`
	KeluhanAwal *string `json:"keluhan_awal"`
}
