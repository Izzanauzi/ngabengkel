package repository

import "github.com/ngabengkel/backend/internal/model"

type WorkOrderRepositoryInterface interface {
	GetActiveByUserID(userID string) ([]model.WorkOrder, error)
	GetHistoriByUserID(userID string) ([]model.WorkOrder, error)
	FindByID(woID string) (*model.WorkOrderDetail, error)
	GetProgressByWOID(woID string) ([]model.Progress, error)
	UpdateStatus(woID, status string) error
}
