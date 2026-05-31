package repository

import "github.com/ngabengkel/backend/internal/model"

type TransactionRepositoryInterface interface {
	Create(t *model.Transaction) error
	GetByWOID(woID string) (*model.Transaction, error)
	GetByPeriode(from, to string) ([]model.Transaction, error)
}
