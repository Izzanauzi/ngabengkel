package repository

import (
	"database/sql"
	"errors"

	"github.com/ngabengkel/backend/internal/model"
)

type MekanikRepository struct {
	DB *sql.DB
}

// GetAll — ambil semua mekanik
func (r *MekanikRepository) GetAll() ([]model.Mekanik, error) {
	rows, err := r.DB.Query(`
		SELECT mekanik_id, nama, telepon, keahlian, status
		FROM ngabengkel.mekaniks
		ORDER BY nama ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	mekaniks := []model.Mekanik{}
	for rows.Next() {
		var m model.Mekanik
		if err := rows.Scan(&m.MekanikID, &m.Nama, &m.Telepon, &m.Keahlian, &m.Status); err != nil {
			return nil, err
		}
		mekaniks = append(mekaniks, m)
	}
	return mekaniks, nil
}

// FindByID — cari mekanik by ID
func (r *MekanikRepository) FindByID(mekanikID string) (*model.Mekanik, error) {
	m := &model.Mekanik{}
	err := r.DB.QueryRow(`
		SELECT mekanik_id, nama, telepon, keahlian, status
		FROM ngabengkel.mekaniks
		WHERE mekanik_id = $1
	`, mekanikID).Scan(&m.MekanikID, &m.Nama, &m.Telepon, &m.Keahlian, &m.Status)

	if err == sql.ErrNoRows {
		return nil, errors.New("mekanik tidak ditemukan")
	}
	if err != nil {
		return nil, err
	}
	return m, nil
}

// Create — tambah mekanik baru
func (r *MekanikRepository) Create(m *model.Mekanik) error {
	_, err := r.DB.Exec(`
		INSERT INTO ngabengkel.mekaniks (mekanik_id, nama, telepon, keahlian, status)
		VALUES ($1, $2, $3, $4, $5)
	`, m.MekanikID, m.Nama, m.Telepon, m.Keahlian, m.Status)
	return err
}

// Update — update data mekanik
func (r *MekanikRepository) Update(m *model.Mekanik) error {
	result, err := r.DB.Exec(`
		UPDATE ngabengkel.mekaniks
		SET nama = $1, telepon = $2, keahlian = $3, status = $4
		WHERE mekanik_id = $5
	`, m.Nama, m.Telepon, m.Keahlian, m.Status, m.MekanikID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.New("mekanik tidak ditemukan")
	}
	return nil
}

// Delete — hapus mekanik
func (r *MekanikRepository) Delete(mekanikID string) error {
	result, err := r.DB.Exec(`
		DELETE FROM ngabengkel.mekaniks WHERE mekanik_id = $1
	`, mekanikID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.New("mekanik tidak ditemukan")
	}
	return nil
}

// HasActiveWO — cek apakah mekanik assigned ke WO yang belum selesai
func (r *MekanikRepository) HasActiveWO(mekanikID string) (bool, error) {
	var count int
	err := r.DB.QueryRow(`
		SELECT COUNT(*) FROM ngabengkel.work_orders
		WHERE mekanik_id = $1
		AND status NOT IN ('selesai', 'lunas')
	`, mekanikID).Scan(&count)
	return count > 0, err
}
