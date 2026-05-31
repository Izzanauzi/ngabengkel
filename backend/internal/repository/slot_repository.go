package repository

import (
	"database/sql"
	"errors"

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

// FindByID — cari slot by ID
func (r *SlotRepository) FindByID(slotID string) (*model.Slot, error) {
	s := &model.Slot{}
	err := r.DB.QueryRow(`
		SELECT slot_id, nomor_slot, status, wo_id, updated_at
		FROM ngabengkel.slots WHERE slot_id = $1
	`, slotID).Scan(&s.SlotID, &s.NomorSlot, &s.Status, &s.WoID, &s.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, errors.New("slot tidak ditemukan")
	}
	if err != nil {
		return nil, err
	}
	return s, nil
}

// UpdateStatus — ubah status slot (tersedia | tidak_tersedia)
func (r *SlotRepository) UpdateStatus(slotID, status string) error {
	result, err := r.DB.Exec(`
		UPDATE ngabengkel.slots SET status = $1, updated_at = NOW()
		WHERE slot_id = $2
	`, status, slotID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.New("slot tidak ditemukan")
	}
	return nil
}

// AssignWO — assign WO ke slot, set status jadi terisi
func (r *SlotRepository) AssignWO(slotID, woID string) error {
	result, err := r.DB.Exec(`
		UPDATE ngabengkel.slots
		SET wo_id = $1, status = 'terisi', updated_at = NOW()
		WHERE slot_id = $2
	`, woID, slotID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.New("slot tidak ditemukan")
	}
	return nil
}

// HasActiveWO — cek apakah slot punya WO yang masih aktif
func (r *SlotRepository) HasActiveWO(slotID string) (bool, error) {
	var count int
	err := r.DB.QueryRow(`
		SELECT COUNT(*)
		FROM ngabengkel.slots s
		JOIN ngabengkel.work_orders wo ON wo.wo_id = s.wo_id
		WHERE s.slot_id = $1
		  AND wo.status NOT IN ('selesai', 'lunas')
	`, slotID).Scan(&count)
	return count > 0, err
}

// GetQueue — ambil antrian yang sedang menunggu
func (r *SlotRepository) GetQueue() ([]model.QueueItem, error) {
	rows, err := r.DB.Query(`
		SELECT q.queue_id, q.wo_id, q.status, q.created_at,
		       COALESCE(wo.nomor_wo, ''),
		       k.merek, k.model, k.nomor_polisi
		FROM ngabengkel.queue q
		JOIN ngabengkel.work_orders wo ON wo.wo_id = q.wo_id
		JOIN ngabengkel.kendaraan k ON k.kendaraan_id = wo.kendaraan_id
		WHERE q.status = 'menunggu'
		ORDER BY q.created_at ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []model.QueueItem{}
	for rows.Next() {
		var item model.QueueItem
		if err := rows.Scan(
			&item.QueueID, &item.WoID, &item.Status, &item.CreatedAt,
			&item.NomorWO, &item.Merek, &item.Model, &item.NomorPolisi,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}
