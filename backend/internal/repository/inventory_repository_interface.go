package repository

import "github.com/ngabengkel/backend/internal/model"

type InventoryRepositoryInterface interface {
	GetAll() ([]model.InventoryItem, error)
	FindByID(inventoryID string) (*model.InventoryItem, error)
	Create(item *model.InventoryItem) error
	Update(item *model.InventoryItem) error
	Delete(inventoryID string) error
	UpdateStok(inventoryID string, jumlah int) error
	AddItemToWO(woItem *model.WOItem) error
	GetWOItems(woID string) ([]model.WOItem, error)
}
