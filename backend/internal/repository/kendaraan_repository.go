package repository

import (
	"database/sql"
	"errors"

	"github.com/ngabengkel/backend/internal/model"
)

type KendaraanRepository struct {
	DB *sql.DB
}

// GetAll — semua kendaraan (admin), JOIN users untuk info pemilik
func (r *KendaraanRepository) GetAll() ([]model.Kendaraan, error) {
	query := `
		SELECT k.kendaraan_id, k.user_id, k.merek, k.model, k.tahun,
		       k.nomor_polisi, k.warna, k.nomor_rangka, k.created_at,
		       u.nama AS nama_pemilik
		FROM ngabengkel.kendaraan k
		LEFT JOIN ngabengkel.users u ON u.user_id = k.user_id
		ORDER BY k.created_at ASC
	`

	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	kendaraan := []model.Kendaraan{}
	for rows.Next() {
		var k model.Kendaraan
		err := rows.Scan(
			&k.KendaraanID, &k.UserID, &k.Merek, &k.Model,
			&k.Tahun, &k.NomorPolisi, &k.Warna, &k.NomorRangka,
			&k.CreatedAt, &k.NamaPemilik,
		)
		if err != nil {
			return nil, err
		}
		kendaraan = append(kendaraan, k)
	}
	return kendaraan, nil
}

// GetByUserID — ambil semua kendaraan milik user
func (r *KendaraanRepository) GetByUserID(userID string) ([]model.Kendaraan, error) {
	query := `
		SELECT kendaraan_id, user_id, merek, model, tahun,
		       nomor_polisi, warna, nomor_rangka, created_at
		FROM ngabengkel.kendaraan
		WHERE user_id = $1
		ORDER BY created_at ASC
	`

	rows, err := r.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	kendaraan := []model.Kendaraan{}
	for rows.Next() {
		var k model.Kendaraan
		err := rows.Scan(
			&k.KendaraanID, &k.UserID, &k.Merek, &k.Model,
			&k.Tahun, &k.NomorPolisi, &k.Warna, &k.NomorRangka,
			&k.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		kendaraan = append(kendaraan, k)
	}
	return kendaraan, nil
}

// FindByID — cari kendaraan by ID
func (r *KendaraanRepository) FindByID(kendaraanID string) (*model.Kendaraan, error) {
	query := `
		SELECT kendaraan_id, user_id, merek, model, tahun,
		       nomor_polisi, warna, nomor_rangka, created_at
		FROM ngabengkel.kendaraan
		WHERE kendaraan_id = $1
	`

	k := &model.Kendaraan{}
	err := r.DB.QueryRow(query, kendaraanID).Scan(
		&k.KendaraanID, &k.UserID, &k.Merek, &k.Model,
		&k.Tahun, &k.NomorPolisi, &k.Warna, &k.NomorRangka,
		&k.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, errors.New("kendaraan tidak ditemukan")
	}
	if err != nil {
		return nil, err
	}
	return k, nil
}

// Create — tambah kendaraan baru
func (r *KendaraanRepository) Create(k *model.Kendaraan) error {
	query := `
		INSERT INTO ngabengkel.kendaraan
			(kendaraan_id, user_id, merek, model, tahun,
			 nomor_polisi, warna, nomor_rangka, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
		RETURNING created_at
	`
	return r.DB.QueryRow(query,
		k.KendaraanID, k.UserID, k.Merek, k.Model,
		k.Tahun, k.NomorPolisi, k.Warna, k.NomorRangka,
	).Scan(&k.CreatedAt)
}

// Update — edit kendaraan
func (r *KendaraanRepository) Update(k *model.Kendaraan) error {
	query := `
		UPDATE ngabengkel.kendaraan
		SET merek = $1, model = $2, tahun = $3,
		    nomor_polisi = $4, warna = $5, nomor_rangka = $6
		WHERE kendaraan_id = $7 AND user_id = $8
	`
	result, err := r.DB.Exec(query,
		k.Merek, k.Model, k.Tahun,
		k.NomorPolisi, k.Warna, k.NomorRangka,
		k.KendaraanID, k.UserID,
	)
	if err != nil {
		return err
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.New("kendaraan tidak ditemukan")
	}
	return nil
}

// HasActiveWO — cek apakah kendaraan punya WO aktif
func (r *KendaraanRepository) HasActiveWO(kendaraanID string) (bool, error) {
	var count int
	err := r.DB.QueryRow(`
		SELECT COUNT(*) FROM ngabengkel.work_orders
		WHERE kendaraan_id = $1
		AND status NOT IN ('selesai', 'lunas')
	`, kendaraanID).Scan(&count)
	return count > 0, err
}

// Delete — hapus kendaraan
func (r *KendaraanRepository) Delete(kendaraanID, userID string) error {
	result, err := r.DB.Exec(`
		DELETE FROM ngabengkel.kendaraan
		WHERE kendaraan_id = $1 AND user_id = $2
	`, kendaraanID, userID)
	if err != nil {
		return err
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.New("kendaraan tidak ditemukan")
	}
	return nil
}

// NomorPolisiExists — cek apakah nomor polisi sudah terdaftar
func (r *KendaraanRepository) NomorPolisiExists(nomorPolisi string) (bool, error) {
	var count int
	err := r.DB.QueryRow(
		"SELECT COUNT(*) FROM ngabengkel.kendaraan WHERE nomor_polisi = $1",
		nomorPolisi,
	).Scan(&count)
	return count > 0, err
}

// NomorRangkaExists — cek apakah nomor rangka sudah terdaftar
func (r *KendaraanRepository) NomorRangkaExists(nomorRangka string) (bool, error) {
	var count int
	err := r.DB.QueryRow(
		"SELECT COUNT(*) FROM ngabengkel.kendaraan WHERE nomor_rangka = $1",
		nomorRangka,
	).Scan(&count)
	return count > 0, err
}

// NomorPolisiExistsExclude — cek duplikat nomor polisi, kecuali kendaraan ini sendiri
func (r *KendaraanRepository) NomorPolisiExistsExclude(nomorPolisi, kendaraanID string) (bool, error) {
	var count int
	err := r.DB.QueryRow(
		`SELECT COUNT(*) FROM ngabengkel.kendaraan 
		 WHERE nomor_polisi = $1 AND kendaraan_id != $2`,
		nomorPolisi, kendaraanID,
	).Scan(&count)
	return count > 0, err
}

// NomorRangkaExistsExclude — cek duplikat nomor rangka, kecuali kendaraan ini sendiri
func (r *KendaraanRepository) NomorRangkaExistsExclude(nomorRangka, kendaraanID string) (bool, error) {
	var count int
	err := r.DB.QueryRow(
		`SELECT COUNT(*) FROM ngabengkel.kendaraan 
		 WHERE nomor_rangka = $1 AND kendaraan_id != $2`,
		nomorRangka, kendaraanID,
	).Scan(&count)
	return count > 0, err
}
