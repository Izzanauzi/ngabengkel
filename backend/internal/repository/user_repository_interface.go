package repository

import "github.com/ngabengkel/backend/internal/model"

type UserRepositoryInterface interface {
	FindByEmail(email string) (*model.User, error)
	EmailExists(email string) (bool, error)
	TeleponExists(telepon string) (bool, error)
	Create(user *model.User) error
}
