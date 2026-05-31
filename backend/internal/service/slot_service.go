package service

import (
	"errors"

	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/repository"
)

type SlotService struct {
	SlotRepo      repository.SlotRepositoryInterface
	WorkOrderRepo repository.WorkOrderRepositoryInterface
}

var validSlotStatus = map[string]bool{
	"tersedia":       true,
	"tidak_tersedia": true,
}

// GetAll — ambil semua slot
func (s *SlotService) GetAll() ([]model.Slot, error) {
	return s.SlotRepo.GetAllSlots()
}

// UpdateStatus — ubah status slot (bukan terisi — itu diatur AssignWO)
func (s *SlotService) UpdateStatus(slotID, status string) error {
	if !validSlotStatus[status] {
		return errors.New("status tidak valid, gunakan: tersedia atau tidak_tersedia")
	}

	hasActive, err := s.SlotRepo.HasActiveWO(slotID)
	if err != nil {
		return err
	}
	if hasActive {
		return errors.New("slot tidak dapat diubah karena memiliki WO aktif")
	}

	return s.SlotRepo.UpdateStatus(slotID, status)
}

// AssignWO — assign WO ke slot yang tersedia
func (s *SlotService) AssignWO(slotID, woID string) error {
	slot, err := s.SlotRepo.FindByID(slotID)
	if err != nil {
		return err
	}
	if slot.Status != "tersedia" {
		return errors.New("slot tidak tersedia")
	}

	wo, err := s.WorkOrderRepo.FindByID(woID)
	if err != nil {
		return err
	}
	if wo.Status != "dibuat" && wo.Status != "sedang_dikerjakan" {
		return errors.New("work order tidak dalam status yang valid untuk di-assign ke slot")
	}

	return s.SlotRepo.AssignWO(slotID, woID)
}

// GetQueue — ambil antrian yang sedang menunggu
func (s *SlotService) GetQueue() ([]model.QueueItem, error) {
	return s.SlotRepo.GetQueue()
}
