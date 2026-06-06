package model

import "time"

type Transaction struct {
	TransactionID    string     `json:"transaction_id"`
	WoID             string     `json:"wo_id"`
	TotalBiaya       float64    `json:"total_biaya"`
	MetodePembayaran string     `json:"metode_pembayaran"`
	TanggalBayar     *time.Time `json:"tanggal_bayar"`
	Status           string     `json:"status"`
	CreatedAt        time.Time  `json:"created_at"`
}

type PaymentRequest struct {
	MetodePembayaran string  `json:"metode_pembayaran"`
	TotalBiaya       float64 `json:"total_biaya"`
}

type Invoice struct {
	WoID          string   `json:"wo_id"`
	NomorWO       string   `json:"nomor_wo"`
	BiayaJasa     float64  `json:"biaya_jasa"`
	TotalMaterial float64  `json:"total_material"`
	TotalBiaya    float64  `json:"total_biaya"`
	Items         []WOItem `json:"items"`
}

type TransactionReport struct {
	PeriodeDari     string        `json:"periode_dari"`
	PeriodeSampai   string        `json:"periode_sampai"`
	TotalPendapatan float64       `json:"total_pendapatan"`
	JumlahTransaksi int           `json:"jumlah_transaksi"`
	Transactions    []Transaction `json:"transactions"`
}
