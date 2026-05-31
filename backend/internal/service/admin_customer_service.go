package service

import (
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type AdminCustomerService struct {
	UserRepo      repository.UserRepositoryInterface
	KendaraanRepo repository.KendaraanRepositoryInterface
}

// GetAll — ambil semua customer
func (s *AdminCustomerService) GetAll() ([]model.AdminCustomerResponse, error) {
	return s.UserRepo.GetAllCustomers()
}

// GetByID — ambil satu customer
func (s *AdminCustomerService) GetByID(userID string) (*model.AdminCustomerResponse, error) {
	return s.UserRepo.FindCustomerByID(userID)
}

// CreateWalkIn — tambah customer walk-in (email & password opsional)
func (s *AdminCustomerService) CreateWalkIn(req model.AdminCreateCustomerRequest) (*model.User, error) {
	req.Nama = strings.TrimSpace(req.Nama)
	req.Telepon = strings.TrimSpace(req.Telepon)

	if req.Nama == "" {
		return nil, errors.New("nama wajib diisi")
	}
	if req.Telepon == "" {
		return nil, errors.New("telepon wajib diisi")
	}

	if req.Email != "" {
		emailExists, err := s.UserRepo.EmailExists(req.Email)
		if err != nil {
			return nil, err
		}
		if emailExists {
			return nil, errors.New("email sudah digunakan")
		}
	}

	teleponExists, err := s.UserRepo.TeleponExists(req.Telepon)
	if err != nil {
		return nil, err
	}
	if teleponExists {
		return nil, errors.New("nomor telepon sudah terdaftar")
	}

	var hashedPassword string
	if req.Password != nil && *req.Password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(*req.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, err
		}
		hashedPassword = string(hash)
	}

	user := &model.User{
		UserID:   uuid.New().String(),
		Nama:     req.Nama,
		Email:    req.Email,
		Telepon:  &req.Telepon,
		Password: hashedPassword,
		Role:     "customer",
	}

	if err := s.UserRepo.CreateWalkIn(user); err != nil {
		return nil, err
	}
	return user, nil
}

// Update — update nama dan telepon customer
func (s *AdminCustomerService) Update(userID, nama, telepon string) error {
	nama = strings.TrimSpace(nama)
	if nama == "" {
		return errors.New("nama wajib diisi")
	}
	return s.UserRepo.UpdateCustomer(userID, nama, telepon)
}

// Delete — hapus customer, tolak jika ada WO aktif
func (s *AdminCustomerService) Delete(userID string) error {
	_, err := s.UserRepo.FindCustomerByID(userID)
	if err != nil {
		return err
	}

	hasWO, err := s.UserRepo.HasActiveWO(userID)
	if err != nil {
		return err
	}
	if hasWO {
		return errors.New("customer tidak dapat dihapus karena memiliki servis aktif")
	}

	return s.UserRepo.DeleteCustomer(userID)
}
