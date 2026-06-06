package repository

import "github.com/ngabengkel/backend/internal/model"

type WorkOrderRepositoryInterface interface {
	GetActiveByUserID(userID string) ([]model.WorkOrder, error)
	GetHistoriByUserID(userID string) ([]model.WorkOrder, error)
	GetHistoriByCustomerID(userID string) ([]model.WorkOrder, error)
	FindByID(woID string) (*model.WorkOrderDetail, error)
	GetProgressByWOID(woID string) ([]model.Progress, error)
	UpdateStatus(woID, status string) error
	FinishWO(woID string, biayaJasa float64) error
	UpdateBiaya(woID string, biayaJasa, estimasiBiaya float64) error
	GetAll() ([]model.WorkOrder, error)
	Create(wo *model.WorkOrder) error
	AddProgress(p *model.Progress) error
	GenerateNomorWO() (string, error)
}
