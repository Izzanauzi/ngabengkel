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
