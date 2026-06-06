package model

import "time"

type WorkOrder struct {
	WoID               string     `json:"wo_id"`
	NomorWO            string     `json:"nomor_wo"`
	UserID             string     `json:"user_id"`
	KendaraanID        string     `json:"kendaraan_id"`
	BookingID          *string    `json:"booking_id"`
	MekanikID          *string    `json:"mekanik_id"`
	DeskripsiKerusakan *string    `json:"deskripsi_kerusakan"`
	EstimasiBiaya      *float64   `json:"estimasi_biaya"`
	BiayaJasa          *float64   `json:"biaya_jasa"`
	Status             string     `json:"status"`
	CreatedAt          time.Time  `json:"created_at"`
	Kendaraan          *Kendaraan `json:"kendaraan,omitempty"`
}

type Progress struct {
	ProgressID       string    `json:"progress_id"`
	WoID             string    `json:"wo_id"`
	Deskripsi        *string   `json:"deskripsi"`
	Tipe             string    `json:"tipe"`
	FotoURL          *string   `json:"foto_url"`
	EstBiayaTambahan *float64  `json:"est_biaya_tambahan"`
	CreatedAt        time.Time `json:"created_at"`
}

type WorkOrderDetail struct {
	WorkOrder
	Progress []Progress `json:"progress"`
}

type WorkOrderRequest struct {
	UserID             *string  `json:"user_id"`
	KendaraanID        string   `json:"kendaraan_id"`
	BookingID          *string  `json:"booking_id"`
	MekanikID          *string  `json:"mekanik_id"`
	DeskripsiKerusakan *string  `json:"deskripsi_kerusakan"`
	EstimasiBiaya      *float64 `json:"estimasi_biaya"`
}

type ProgressRequest struct {
	Deskripsi        string   `json:"deskripsi"`
	Tipe             string   `json:"tipe"`
	FotoURL          *string  `json:"foto_url"`
	EstBiayaTambahan *float64 `json:"est_biaya_tambahan"`
}

type SuspendRequest struct {
	Deskripsi        string  `json:"deskripsi"`
	EstBiayaTambahan float64 `json:"est_biaya_tambahan"`
}
