package service

import (
	"errors"

	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/repository"
)

type WorkOrderService struct {
	WorkOrderRepo repository.WorkOrderRepositoryInterface
}

// GetActive — WO aktif (sedang_dikerjakan / menunggu_persetujuan) milik user
func (s *WorkOrderService) GetActive(userID string) ([]model.WorkOrder, error) {
	return s.WorkOrderRepo.GetActiveByUserID(userID)
}

// GetHistori — WO yang sudah lunas milik user
func (s *WorkOrderService) GetHistori(userID string) ([]model.WorkOrder, error) {
	return s.WorkOrderRepo.GetHistoriByUserID(userID)
}

// ApproveAction — setujui tindakan: WO menunggu_persetujuan → sedang_dikerjakan
func (s *WorkOrderService) ApproveAction(userID, woID string) error {
	wo, err := s.WorkOrderRepo.FindByID(woID)
	if err != nil {
		return err
	}
	if wo.UserID != userID {
		return errors.New("akses ditolak")
	}
	if wo.Status != "menunggu_persetujuan" {
		return errors.New("work order tidak dalam status menunggu persetujuan")
	}
	return s.WorkOrderRepo.UpdateStatus(woID, "sedang_dikerjakan")
}

// RejectAction — tolak tindakan: WO menunggu_persetujuan → tindakan_ditolak
func (s *WorkOrderService) RejectAction(userID, woID string) error {
	wo, err := s.WorkOrderRepo.FindByID(woID)
	if err != nil {
		return err
	}
	if wo.UserID != userID {
		return errors.New("akses ditolak")
	}
	if wo.Status != "menunggu_persetujuan" {
		return errors.New("work order tidak dalam status menunggu persetujuan")
	}
	return s.WorkOrderRepo.UpdateStatus(woID, "tindakan_ditolak")
}

// GetByID — detail WO lengkap dengan progress, validasi ownership
func (s *WorkOrderService) GetByID(userID, woID string) (*model.WorkOrderDetail, error) {
	detail, err := s.WorkOrderRepo.FindByID(woID)
	if err != nil {
		return nil, err
	}

	if detail.UserID != userID {
		return nil, errors.New("akses ditolak")
	}

	progress, err := s.WorkOrderRepo.GetProgressByWOID(woID)
	if err != nil {
		return nil, err
	}
	detail.Progress = progress

	return detail, nil
}
