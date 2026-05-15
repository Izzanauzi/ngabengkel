package repository

import "github.com/ngabengkel/backend/internal/model"

type SlotRepositoryInterface interface {
	GetAllSlots() ([]model.Slot, error)
	CountAntrian() (int, error)
}
