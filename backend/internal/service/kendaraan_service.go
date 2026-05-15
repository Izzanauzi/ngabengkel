package service

import (
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/repository"
)

type KendaraanService struct {
	KendaraanRepo repository.KendaraanRepositoryInterface
}

// GetAll — ambil semua kendaraan milik user
func (s *KendaraanService) GetAll(userID string) ([]model.Kendaraan, error) {
	return s.KendaraanRepo.GetByUserID(userID)
}

// Create — tambah kendaraan baru
func (s *KendaraanService) Create(userID string, req model.KendaraanRequest) (*model.Kendaraan, error) {
	// Validasi field wajib
	req.Merek = strings.TrimSpace(req.Merek)
	req.Model = strings.TrimSpace(req.Model)
	req.NomorPolisi = strings.TrimSpace(req.NomorPolisi)

	if req.Merek == "" || req.Model == "" || req.NomorPolisi == "" {
		return nil, errors.New("merek, model, dan nomor polisi wajib diisi")
	}

	// Cek nomor polisi sudah dipakai
	polisiExists, err := s.KendaraanRepo.NomorPolisiExists(req.NomorPolisi)
	if err != nil {
		return nil, err
	}
	if polisiExists {
		return nil, errors.New("nomor polisi sudah terdaftar")
	}

	// Cek nomor rangka (hanya kalau diisi)
	if req.NomorRangka != nil && *req.NomorRangka != "" {
		rangkaExists, err := s.KendaraanRepo.NomorRangkaExists(*req.NomorRangka)
		if err != nil {
			return nil, err
		}
		if rangkaExists {
			return nil, errors.New("nomor rangka sudah terdaftar")
		}
	}

	if req.Tahun < 1900 || req.Tahun > 2100 {
		return nil, errors.New("tahun tidak valid")
	}

	k := &model.Kendaraan{
		KendaraanID: uuid.New().String(),
		UserID:      &userID,
		Merek:       req.Merek,
		Model:       req.Model,
		Tahun:       req.Tahun,
		NomorPolisi: req.NomorPolisi,
		Warna:       req.Warna,
		NomorRangka: req.NomorRangka,
	}

	if err := s.KendaraanRepo.Create(k); err != nil {
		return nil, err
	}
	return k, nil
}

// Update — edit kendaraan
func (s *KendaraanService) Update(userID, kendaraanID string, req model.KendaraanRequest) (*model.Kendaraan, error) {
	// Cek kendaraan ada dan milik user ini
	k, err := s.KendaraanRepo.FindByID(kendaraanID)
	if err != nil {
		return nil, err
	}
	if k.UserID == nil || *k.UserID != userID {
		return nil, errors.New("akses ditolak")
	}

	// Cek nomor polisi duplikat (exclude diri sendiri)
	polisiExists, err := s.KendaraanRepo.NomorPolisiExistsExclude(req.NomorPolisi, kendaraanID)
	if err != nil {
		return nil, err
	}
	if polisiExists {
		return nil, errors.New("nomor polisi sudah terdaftar")
	}

	// Cek nomor rangka duplikat (hanya kalau diisi)
	if req.NomorRangka != nil && *req.NomorRangka != "" {
		rangkaExists, err := s.KendaraanRepo.NomorRangkaExistsExclude(*req.NomorRangka, kendaraanID)
		if err != nil {
			return nil, err
		}
		if rangkaExists {
			return nil, errors.New("nomor rangka sudah terdaftar")
		}
	}

	// Update field
	k.Merek = strings.TrimSpace(req.Merek)
	k.Model = strings.TrimSpace(req.Model)
	k.NomorPolisi = strings.TrimSpace(req.NomorPolisi)
	k.Tahun = req.Tahun
	k.Warna = req.Warna
	k.NomorRangka = req.NomorRangka

	if err := s.KendaraanRepo.Update(k); err != nil {
		return nil, err
	}
	return k, nil
}

// Delete — hapus kendaraan
func (s *KendaraanService) Delete(userID, kendaraanID string) error {
	// Cek kendaraan ada dan milik user ini
	k, err := s.KendaraanRepo.FindByID(kendaraanID)
	if err != nil {
		return err
	}
	if k.UserID == nil || *k.UserID != userID {
		return errors.New("akses ditolak")
	}

	// Cek ada WO aktif
	hasWO, err := s.KendaraanRepo.HasActiveWO(kendaraanID)
	if err != nil {
		return err
	}
	if hasWO {
		return errors.New("kendaraan tidak dapat dihapus karena memiliki servis aktif")
	}

	return s.KendaraanRepo.Delete(kendaraanID, userID)
}

// GetByID — ambil satu kendaraan by ID
func (s *KendaraanService) GetByID(userID, kendaraanID string) (*model.Kendaraan, error) {
	k, err := s.KendaraanRepo.FindByID(kendaraanID)
	if err != nil {
		return nil, err
	}
	if k.UserID == nil || *k.UserID != userID {
		return nil, errors.New("akses ditolak")
	}
	return k, nil
}
