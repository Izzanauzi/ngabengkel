package repository

import "github.com/ngabengkel/backend/internal/model"

type UserRepositoryInterface interface {
	FindByEmail(email string) (*model.User, error)
	EmailExists(email string) (bool, error)
	TeleponExists(telepon string) (bool, error)
	Create(user *model.User) error
	GetAllCustomers() ([]model.AdminCustomerResponse, error)
	FindCustomerByID(userID string) (*model.AdminCustomerResponse, error)
	CreateWalkIn(user *model.User) error
	UpdateCustomer(userID, nama, telepon string) error
	DeleteCustomer(userID string) error
	HasActiveWO(userID string) (bool, error)
}
