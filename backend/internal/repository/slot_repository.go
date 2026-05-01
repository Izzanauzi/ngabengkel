package repository

import (
	"database/sql"

	"github.com/ngabengkel/backend/internal/model"
)

type SlotRepository struct {
	DB *sql.DB
}

// GetAllSlots — ambil semua slot beserta statusnya
func (r *SlotRepository) GetAllSlots() ([]model.Slot, error) {
	query := `
        SELECT slot_id, nomor_slot, status, wo_id, updated_at
        FROM ngabengkel.slots
        ORDER BY nomor_slot ASC
    `

	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	slots := []model.Slot{}
	for rows.Next() {
		var s model.Slot
		err := rows.Scan(
			&s.SlotID,
			&s.NomorSlot,
			&s.Status,
			&s.WoID,
			&s.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		slots = append(slots, s)
	}

	return slots, nil
}

// CountAntrian — hitung jumlah kendaraan dalam antrian
func (r *SlotRepository) CountAntrian() (int, error) {
	var count int
	err := r.DB.QueryRow(
		"SELECT COUNT(*) FROM ngabengkel.queue",
	).Scan(&count)
	return count, err
}
