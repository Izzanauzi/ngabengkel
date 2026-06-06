package service

import (
	"errors"

	"github.com/google/uuid"
	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/repository"
)

type AdminWorkOrderService struct {
	WorkOrderRepo repository.WorkOrderRepositoryInterface
	BookingRepo   repository.BookingRepositoryInterface
}

// GetAll — semua WO untuk admin
func (s *AdminWorkOrderService) GetAll() ([]model.WorkOrder, error) {
	return s.WorkOrderRepo.GetAll()
}

// GetByID — detail WO + progress (tanpa cek ownership)
func (s *AdminWorkOrderService) GetByID(woID string) (*model.WorkOrderDetail, error) {
	detail, err := s.WorkOrderRepo.FindByID(woID)
	if err != nil {
		return nil, err
	}
	progress, err := s.WorkOrderRepo.GetProgressByWOID(woID)
	if err != nil {
		return nil, err
	}
	detail.Progress = progress
	return detail, nil
}

// Create — buat WO baru, generate nomor WO otomatis, status awal 'dibuat'
func (s *AdminWorkOrderService) Create(req model.WorkOrderRequest) (*model.WorkOrder, error) {
	if req.KendaraanID == "" {
		return nil, errors.New("kendaraan_id wajib diisi")
	}

	nomorWO, err := s.WorkOrderRepo.GenerateNomorWO()
	if err != nil {
		return nil, err
	}

	wo := &model.WorkOrder{
		WoID:               uuid.New().String(),
		NomorWO:            nomorWO,
		KendaraanID:        req.KendaraanID,
		BookingID:          req.BookingID,
		MekanikID:          req.MekanikID,
		DeskripsiKerusakan: req.DeskripsiKerusakan,
		EstimasiBiaya:      req.EstimasiBiaya,
		Status:             "dibuat",
	}
	if req.UserID != nil {
		wo.UserID = *req.UserID
	}

	if err := s.WorkOrderRepo.Create(wo); err != nil {
		return nil, err
	}
	return wo, nil
}

// Start — ubah status WO dari 'dibuat' ke 'sedang_dikerjakan'
func (s *AdminWorkOrderService) Start(woID string) error {
	wo, err := s.WorkOrderRepo.FindByID(woID)
	if err != nil {
		return err
	}
	if wo.Status != "dibuat" {
		return errors.New("work order tidak dalam status dibuat")
	}
	return s.WorkOrderRepo.UpdateStatus(woID, "sedang_dikerjakan")
}

// UploadProgress — tambah progress update ke WO aktif
func (s *AdminWorkOrderService) UploadProgress(woID string, req model.ProgressRequest) error {
	if req.Deskripsi == "" {
		return errors.New("deskripsi wajib diisi")
	}
	wo, err := s.WorkOrderRepo.FindByID(woID)
	if err != nil {
		return err
	}
	if wo.Status != "sedang_dikerjakan" {
		return errors.New("work order tidak dalam status sedang dikerjakan")
	}
	p := &model.Progress{
		ProgressID:       uuid.New().String(),
		WoID:             woID,
		Deskripsi:        &req.Deskripsi,
		Tipe:             req.Tipe,
		FotoURL:          req.FotoURL,
		EstBiayaTambahan: req.EstBiayaTambahan,
	}
	return s.WorkOrderRepo.AddProgress(p)
}

// Suspend — suspend WO: tambah progress suspend + update status
func (s *AdminWorkOrderService) Suspend(woID string, req model.SuspendRequest) error {
	if req.Deskripsi == "" {
		return errors.New("deskripsi wajib diisi")
	}
	wo, err := s.WorkOrderRepo.FindByID(woID)
	if err != nil {
		return err
	}
	if wo.Status != "sedang_dikerjakan" {
		return errors.New("work order tidak dalam status sedang dikerjakan")
	}
	p := &model.Progress{
		ProgressID:       uuid.New().String(),
		WoID:             woID,
		Deskripsi:        &req.Deskripsi,
		Tipe:             "suspend",
		EstBiayaTambahan: &req.EstBiayaTambahan,
	}
	if err := s.WorkOrderRepo.AddProgress(p); err != nil {
		return err
	}
	return s.WorkOrderRepo.UpdateStatus(woID, "menunggu_persetujuan")
}

// Finish — selesaikan WO: set biaya_jasa dan ubah status ke 'selesai'
func (s *AdminWorkOrderService) Finish(woID string, req model.FinishRequest) error {
	wo, err := s.WorkOrderRepo.FindByID(woID)
	if err != nil {
		return err
	}
	if wo.Status != "sedang_dikerjakan" {
		return errors.New("work order tidak dalam status sedang dikerjakan")
	}
	return s.WorkOrderRepo.FinishWO(woID, req.BiayaJasa)
}

// UpdateBiaya — update biaya_jasa dan estimasi_biaya kapan saja
func (s *AdminWorkOrderService) UpdateBiaya(woID string, req model.UpdateBiayaRequest) error {
	_, err := s.WorkOrderRepo.FindByID(woID)
	if err != nil {
		return err
	}
	return s.WorkOrderRepo.UpdateBiaya(woID, req.BiayaJasa, req.EstimasiBiaya)
}
