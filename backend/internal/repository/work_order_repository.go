package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
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

// GetHistoriByCustomerID — histori WO lunas untuk customer tertentu (admin view)
func (r *WorkOrderRepository) GetHistoriByCustomerID(userID string) ([]model.WorkOrder, error) {
	return r.GetHistoriByUserID(userID)
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

// GetAll — semua WO (admin), urut terbaru
func (r *WorkOrderRepository) GetAll() ([]model.WorkOrder, error) {
	query := `
		SELECT COALESCE(wo.wo_id, ''), COALESCE(wo.nomor_wo, ''),
		       COALESCE(wo.user_id, ''), COALESCE(wo.kendaraan_id, ''),
		       wo.booking_id, wo.mekanik_id,
		       wo.deskripsi_kerusakan, wo.estimasi_biaya, wo.biaya_jasa,
		       COALESCE(wo.status, ''), wo.created_at,
		       k.merek, k.model, k.nomor_polisi
		FROM ngabengkel.work_orders wo
		JOIN ngabengkel.kendaraan k ON k.kendaraan_id = wo.kendaraan_id
		ORDER BY wo.created_at DESC
	`
	rows, err := r.DB.Query(query)
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

// Create — buat WO baru + entry queue dalam satu transaksi
func (r *WorkOrderRepository) Create(wo *model.WorkOrder) error {
	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var userID sql.NullString
	if wo.UserID != "" {
		userID = sql.NullString{String: wo.UserID, Valid: true}
	}

	err = tx.QueryRow(`
		INSERT INTO ngabengkel.work_orders
			(wo_id, nomor_wo, user_id, kendaraan_id, booking_id, mekanik_id,
			 deskripsi_kerusakan, estimasi_biaya, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
		RETURNING created_at
	`, wo.WoID, wo.NomorWO, userID, wo.KendaraanID, wo.BookingID, wo.MekanikID,
		wo.DeskripsiKerusakan, wo.EstimasiBiaya, wo.Status,
	).Scan(&wo.CreatedAt)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`
		INSERT INTO ngabengkel.queue (queue_id, wo_id, status, created_at)
		VALUES ($1, $2, 'menunggu', NOW())
	`, uuid.New().String(), wo.WoID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

// AddProgress — tambah entri progress WO
func (r *WorkOrderRepository) AddProgress(p *model.Progress) error {
	return r.DB.QueryRow(`
		INSERT INTO ngabengkel.wo_progress
			(progress_id, wo_id, deskripsi, tipe, foto_url, est_biaya_tambahan, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
		RETURNING created_at
	`, p.ProgressID, p.WoID, p.Deskripsi, p.Tipe, p.FotoURL, p.EstBiayaTambahan,
	).Scan(&p.CreatedAt)
}

// GenerateNomorWO — buat nomor WO unik format WO-YYYYMMDD-XXX
func (r *WorkOrderRepository) GenerateNomorWO() (string, error) {
	var count int
	err := r.DB.QueryRow(`
		SELECT COUNT(*) FROM ngabengkel.work_orders
		WHERE DATE(created_at) = CURRENT_DATE
	`).Scan(&count)
	if err != nil {
		return "", err
	}
	today := time.Now().Format("20060102")
	return fmt.Sprintf("WO-%s-%03d", today, count+1), nil
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
