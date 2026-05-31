package repository

import (
	"database/sql"
	"errors"

	"github.com/ngabengkel/backend/internal/model"
)

type TransactionRepository struct {
	DB *sql.DB
}

// Create — simpan transaksi baru
func (r *TransactionRepository) Create(t *model.Transaction) error {
	return r.DB.QueryRow(`
		INSERT INTO ngabengkel.transactions
			(transaction_id, wo_id, total_biaya, metode_pembayaran,
			 tanggal_bayar, status, created_at)
		VALUES ($1, $2, $3, $4, NOW(), 'lunas', NOW())
		RETURNING tanggal_bayar, created_at
	`, t.TransactionID, t.WoID, t.TotalBiaya, t.MetodePembayaran,
	).Scan(&t.TanggalBayar, &t.CreatedAt)
}

// GetByWOID — cari transaksi by WO ID
func (r *TransactionRepository) GetByWOID(woID string) (*model.Transaction, error) {
	t := &model.Transaction{}
	err := r.DB.QueryRow(`
		SELECT transaction_id, wo_id, total_biaya, metode_pembayaran,
		       tanggal_bayar, status, created_at
		FROM ngabengkel.transactions
		WHERE wo_id = $1
	`, woID).Scan(
		&t.TransactionID, &t.WoID, &t.TotalBiaya, &t.MetodePembayaran,
		&t.TanggalBayar, &t.Status, &t.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, errors.New("transaksi tidak ditemukan")
	}
	if err != nil {
		return nil, err
	}
	return t, nil
}

// GetByPeriode — ambil transaksi dalam rentang tanggal (inklusif)
func (r *TransactionRepository) GetByPeriode(from, to string) ([]model.Transaction, error) {
	rows, err := r.DB.Query(`
		SELECT t.transaction_id, t.wo_id, t.total_biaya, t.metode_pembayaran,
		       t.tanggal_bayar, t.status, t.created_at
		FROM ngabengkel.transactions t
		JOIN ngabengkel.work_orders wo ON wo.wo_id = t.wo_id
		JOIN ngabengkel.kendaraan k ON k.kendaraan_id = wo.kendaraan_id
		WHERE DATE(t.tanggal_bayar) BETWEEN $1::date AND $2::date
		ORDER BY t.tanggal_bayar DESC
	`, from, to)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := []model.Transaction{}
	for rows.Next() {
		var t model.Transaction
		if err := rows.Scan(
			&t.TransactionID, &t.WoID, &t.TotalBiaya, &t.MetodePembayaran,
			&t.TanggalBayar, &t.Status, &t.CreatedAt,
		); err != nil {
			return nil, err
		}
		result = append(result, t)
	}
	return result, nil
}
