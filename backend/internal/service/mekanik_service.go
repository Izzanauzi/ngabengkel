package service

import (
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/repository"
)

type MekanikService struct {
	MekanikRepo repository.MekanikRepositoryInterface
}

var validMekanikStatus = map[string]bool{
	"tersedia": true,
	"sibuk":    true,
}

// GetAll — ambil semua mekanik
func (s *MekanikService) GetAll() ([]model.Mekanik, error) {
	return s.MekanikRepo.GetAll()
}

// GetByID — ambil satu mekanik
func (s *MekanikService) GetByID(mekanikID string) (*model.Mekanik, error) {
	return s.MekanikRepo.FindByID(mekanikID)
}

// Create — tambah mekanik baru
func (s *MekanikService) Create(req model.MekanikRequest) (*model.Mekanik, error) {
	req.Nama = strings.TrimSpace(req.Nama)
	if req.Nama == "" {
		return nil, errors.New("nama wajib diisi")
	}
	if !validMekanikStatus[req.Status] {
		return nil, errors.New("status tidak valid, gunakan: tersedia atau sibuk")
	}

	m := &model.Mekanik{
		MekanikID: uuid.New().String(),
		Nama:      req.Nama,
		Telepon:   req.Telepon,
		Keahlian:  req.Keahlian,
		Status:    req.Status,
	}
	if err := s.MekanikRepo.Create(m); err != nil {
		return nil, err
	}
	return m, nil
}

// Update — edit data mekanik
func (s *MekanikService) Update(mekanikID string, req model.MekanikRequest) (*model.Mekanik, error) {
	m, err := s.MekanikRepo.FindByID(mekanikID)
	if err != nil {
		return nil, err
	}

	req.Nama = strings.TrimSpace(req.Nama)
	if req.Nama == "" {
		return nil, errors.New("nama wajib diisi")
	}
	if !validMekanikStatus[req.Status] {
		return nil, errors.New("status tidak valid, gunakan: tersedia atau sibuk")
	}

	m.Nama = req.Nama
	m.Telepon = req.Telepon
	m.Keahlian = req.Keahlian
	m.Status = req.Status

	if err := s.MekanikRepo.Update(m); err != nil {
		return nil, err
	}
	return m, nil
}

// Delete — hapus mekanik
func (s *MekanikService) Delete(mekanikID string) error {
	_, err := s.MekanikRepo.FindByID(mekanikID)
	if err != nil {
		return err
	}

	hasWO, err := s.MekanikRepo.HasActiveWO(mekanikID)
	if err != nil {
		return err
	}
	if hasWO {
		return errors.New("mekanik tidak dapat dihapus karena memiliki servis aktif")
	}

	return s.MekanikRepo.Delete(mekanikID)
}
