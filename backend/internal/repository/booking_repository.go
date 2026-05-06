package repository

import (
	"database/sql"
	"errors"

	"github.com/ngabengkel/backend/internal/model"
)

type BookingRepository struct {
	DB *sql.DB
}

// GetByUserID — ambil semua booking milik user
func (r *BookingRepository) GetByUserID(userID string) ([]model.Booking, error) {
	query := `
		SELECT b.booking_id, b.user_id, b.kendaraan_id, b.eta,
		       b.keluhan_awal, b.status, b.alasan_tolak, b.created_at,
		       k.merek, k.model, k.nomor_polisi
		FROM ngabengkel.bookings b
		JOIN ngabengkel.kendaraan k ON k.kendaraan_id = b.kendaraan_id
		WHERE b.user_id = $1
		ORDER BY b.created_at DESC
	`

	rows, err := r.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	bookings := []model.Booking{}
	for rows.Next() {
		var b model.Booking
		b.Kendaraan = &model.Kendaraan{}
		err := rows.Scan(
			&b.BookingID, &b.UserID, &b.KendaraanID, &b.ETA,
			&b.KeluhanAwal, &b.Status, &b.AlasanTolak, &b.CreatedAt,
			&b.Kendaraan.Merek, &b.Kendaraan.Model, &b.Kendaraan.NomorPolisi,
		)
		if err != nil {
			return nil, err
		}
		bookings = append(bookings, b)
	}
	return bookings, nil
}

// FindByID — cari booking by ID
func (r *BookingRepository) FindByID(bookingID string) (*model.Booking, error) {
	query := `
		SELECT b.booking_id, b.user_id, b.kendaraan_id, b.eta,
		       b.keluhan_awal, b.status, b.alasan_tolak, b.created_at,
		       k.merek, k.model, k.nomor_polisi
		FROM ngabengkel.bookings b
		JOIN ngabengkel.kendaraan k ON k.kendaraan_id = b.kendaraan_id
		WHERE b.booking_id = $1
	`

	b := &model.Booking{Kendaraan: &model.Kendaraan{}}
	err := r.DB.QueryRow(query, bookingID).Scan(
		&b.BookingID, &b.UserID, &b.KendaraanID, &b.ETA,
		&b.KeluhanAwal, &b.Status, &b.AlasanTolak, &b.CreatedAt,
		&b.Kendaraan.Merek, &b.Kendaraan.Model, &b.Kendaraan.NomorPolisi,
	)

	if err == sql.ErrNoRows {
		return nil, errors.New("booking tidak ditemukan")
	}
	if err != nil {
		return nil, err
	}
	return b, nil
}

// Create — buat booking baru
func (r *BookingRepository) Create(b *model.Booking) error {
	query := `
		INSERT INTO ngabengkel.bookings
			(booking_id, user_id, kendaraan_id, eta, keluhan_awal, status, created_at)
		VALUES ($1, $2, $3, $4, $5, 'menunggu_konfirmasi', NOW())
		RETURNING created_at
	`
	return r.DB.QueryRow(query,
		b.BookingID, b.UserID, b.KendaraanID, b.ETA, b.KeluhanAwal,
	).Scan(&b.CreatedAt)
}

// UpdateStatus — update status booking
func (r *BookingRepository) UpdateStatus(bookingID, status string) error {
	result, err := r.DB.Exec(`
		UPDATE ngabengkel.bookings
		SET status = $1
		WHERE booking_id = $2
	`, status, bookingID)
	if err != nil {
		return err
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.New("booking tidak ditemukan")
	}
	return nil
}

// HasActiveBooking — cek apakah kendaraan punya booking aktif
func (r *BookingRepository) HasActiveBooking(kendaraanID string) (bool, error) {
	var count int
	err := r.DB.QueryRow(`
		SELECT COUNT(*) FROM ngabengkel.bookings
		WHERE kendaraan_id = $1
		AND status = 'menunggu_konfirmasi'
	`, kendaraanID).Scan(&count)
	return count > 0, err
}
