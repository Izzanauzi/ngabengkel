package repository

import "github.com/ngabengkel/backend/internal/model"

type SlotRepositoryInterface interface {
	GetAllSlots() ([]model.Slot, error)
	CountAntrian() (int, error)
	FindByID(slotID string) (*model.Slot, error)
	UpdateStatus(slotID, status string) error
	AssignWO(slotID, woID string) error
	HasActiveWO(slotID string) (bool, error)
	GetQueue() ([]model.QueueItem, error)
}
