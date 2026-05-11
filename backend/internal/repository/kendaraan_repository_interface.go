package repository

import "github.com/ngabengkel/backend/internal/model"

type KendaraanRepositoryInterface interface {
	GetByUserID(userID string) ([]model.Kendaraan, error)
	FindByID(kendaraanID string) (*model.Kendaraan, error)
	Create(k *model.Kendaraan) error
	Update(k *model.Kendaraan) error
	HasActiveWO(kendaraanID string) (bool, error)
	Delete(kendaraanID, userID string) error
	NomorPolisiExists(nomorPolisi string) (bool, error)
	NomorRangkaExists(nomorRangka string) (bool, error)
	NomorPolisiExistsExclude(nomorPolisi, kendaraanID string) (bool, error)
	NomorRangkaExistsExclude(nomorRangka, kendaraanID string) (bool, error)
}
