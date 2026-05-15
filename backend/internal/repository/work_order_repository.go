package repository

import (
	"database/sql"
	"errors"

	"github.com/ngabengkel/backend/internal/model"
)

type WorkOrderRepository struct {
	DB *sql.DB
}

const woSelectCols = `
	wo.wo_id, wo.nomor_wo, wo.user_id, wo.kendaraan_id, wo.booking_id,
	wo.mekanik_id, wo.deskripsi_kerusakan, wo.estimasi_biaya, wo.biaya_jasa,
	wo.status, wo.created_at,
	k.merek, k.model, k.nomor_polisi
`

func scanWorkOrder(s interface {
	Scan(...any) error
}) (model.WorkOrder, error) {
	var wo model.WorkOrder
	wo.Kendaraan = &model.Kendaraan{}
	err := s.Scan(
		&wo.WoID, &wo.NomorWO, &wo.UserID, &wo.KendaraanID, &wo.BookingID,
		&wo.MekanikID, &wo.DeskripsiKerusakan, &wo.EstimasiBiaya, &wo.BiayaJasa,
		&wo.Status, &wo.CreatedAt,
		&wo.Kendaraan.Merek, &wo.Kendaraan.Model, &wo.Kendaraan.NomorPolisi,
	)
	return wo, err
}

// GetActiveByUserID — WO dengan status sedang_dikerjakan atau menunggu_persetujuan
func (r *WorkOrderRepository) GetActiveByUserID(userID string) ([]model.WorkOrder, error) {
	query := `
		SELECT ` + woSelectCols + `
		FROM ngabengkel.work_orders wo
		JOIN ngabengkel.kendaraan k ON k.kendaraan_id = wo.kendaraan_id
		WHERE wo.user_id = $1
		  AND wo.status IN ('sedang_dikerjakan', 'menunggu_persetujuan')
		ORDER BY wo.created_at DESC
	`
	rows, err := r.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := []model.WorkOrder{}
	for rows.Next() {
		wo, err := scanWorkOrder(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, wo)
	}
	return result, nil
}

// GetHistoriByUserID — WO dengan status lunas
func (r *WorkOrderRepository) GetHistoriByUserID(userID string) ([]model.WorkOrder, error) {
	query := `
		SELECT ` + woSelectCols + `
		FROM ngabengkel.work_orders wo
		JOIN ngabengkel.kendaraan k ON k.kendaraan_id = wo.kendaraan_id
		WHERE wo.user_id = $1
		  AND wo.status = 'lunas'
		ORDER BY wo.created_at DESC
	`
	rows, err := r.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := []model.WorkOrder{}
	for rows.Next() {
		wo, err := scanWorkOrder(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, wo)
	}
	return result, nil
}

// FindByID — detail WO + kendaraan, tanpa progress
func (r *WorkOrderRepository) FindByID(woID string) (*model.WorkOrderDetail, error) {
	query := `
		SELECT ` + woSelectCols + `
		FROM ngabengkel.work_orders wo
		JOIN ngabengkel.kendaraan k ON k.kendaraan_id = wo.kendaraan_id
		WHERE wo.wo_id = $1
	`
	wo, err := scanWorkOrder(r.DB.QueryRow(query, woID))
	if err == sql.ErrNoRows {
		return nil, errors.New("work order tidak ditemukan")
	}
	if err != nil {
		return nil, err
	}
	return &model.WorkOrderDetail{WorkOrder: wo, Progress: []model.Progress{}}, nil
}

// UpdateStatus — ubah status WO
func (r *WorkOrderRepository) UpdateStatus(woID, status string) error {
	_, err := r.DB.Exec(
		`UPDATE ngabengkel.work_orders SET status = $1 WHERE wo_id = $2`,
		status, woID,
	)
	return err
}

// GetProgressByWOID — semua progress untuk satu WO, urut dari terlama
func (r *WorkOrderRepository) GetProgressByWOID(woID string) ([]model.Progress, error) {
	query := `
		SELECT progress_id, wo_id, deskripsi, tipe, foto_url,
		       est_biaya_tambahan, created_at
		FROM ngabengkel.wo_progress
		WHERE wo_id = $1
		ORDER BY created_at ASC
	`
	rows, err := r.DB.Query(query, woID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := []model.Progress{}
	for rows.Next() {
		var p model.Progress
		err := rows.Scan(
			&p.ProgressID, &p.WoID, &p.Deskripsi, &p.Tipe, &p.FotoURL,
			&p.EstBiayaTambahan, &p.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		result = append(result, p)
	}
	return result, nil
}
