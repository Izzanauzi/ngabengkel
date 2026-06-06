package model

import "time"

type Kendaraan struct {
	KendaraanID string    `json:"kendaraan_id"`
	UserID      *string   `json:"user_id"`
	Merek       string    `json:"merek"`
	Model       string    `json:"model"`
	Tahun       int       `json:"tahun"`
	NomorPolisi string    `json:"nomor_polisi"`
	Warna       *string   `json:"warna"`
	NomorRangka *string   `json:"nomor_rangka"`
	CreatedAt   time.Time `json:"created_at"`
	NamaPemilik *string   `json:"nama_pemilik,omitempty"`
}

type KendaraanRequest struct {
	Merek       string  `json:"merek"`
	Model       string  `json:"model"`
	Tahun       int     `json:"tahun"`
	NomorPolisi string  `json:"nomor_polisi"`
	Warna       *string `json:"warna"`
	NomorRangka *string `json:"nomor_rangka"`
}
