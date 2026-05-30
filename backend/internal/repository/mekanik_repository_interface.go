package repository

import "github.com/ngabengkel/backend/internal/model"

type MekanikRepositoryInterface interface {
	GetAll() ([]model.Mekanik, error)
	FindByID(mekanikID string) (*model.Mekanik, error)
	Create(m *model.Mekanik) error
	Update(m *model.Mekanik) error
	Delete(mekanikID string) error
	HasActiveWO(mekanikID string) (bool, error)
}
