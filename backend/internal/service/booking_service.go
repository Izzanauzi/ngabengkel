package service

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/repository"
)

type BookingService struct {
	BookingRepo   *repository.BookingRepository
	KendaraanRepo *repository.KendaraanRepository
}

// GetAll — ambil semua booking milik user
func (s *BookingService) GetAll(userID string) ([]model.Booking, error) {
	return s.BookingRepo.GetByUserID(userID)
}

// Create — buat booking baru
func (s *BookingService) Create(userID string, req model.BookingRequest) (*model.Booking, error) {
	// 1. Validasi field wajib
	if req.KendaraanID == "" || req.ETA == "" {
		return nil, errors.New("kendaraan dan ETA wajib diisi")
	}

	// 2. Parse ETA
	eta, err := time.Parse(time.RFC3339, req.ETA)
	if err != nil {
		return nil, errors.New("format ETA tidak valid, gunakan format: 2006-01-02T15:04:05Z")
	}

	// 3. ETA tidak boleh di masa lalu
	if eta.Before(time.Now()) {
		return nil, errors.New("ETA tidak boleh di masa lalu")
	}

	// 4. Cek kendaraan milik user ini
	k, err := s.KendaraanRepo.FindByID(req.KendaraanID)
	if err != nil {
		return nil, errors.New("kendaraan tidak ditemukan")
	}
	if k.UserID == nil || *k.UserID != userID {
		return nil, errors.New("akses ditolak")
	}

	// 5. Cek kendaraan sudah punya booking aktif
	hasActive, err := s.BookingRepo.HasActiveBooking(req.KendaraanID)
	if err != nil {
		return nil, err
	}
	if hasActive {
		return nil, errors.New("kendaraan sudah memiliki booking yang menunggu konfirmasi")
	}

	// 6. Buat booking
	b := &model.Booking{
		BookingID:   uuid.New().String(),
		UserID:      userID,
		KendaraanID: req.KendaraanID,
		ETA:         eta,
		KeluhanAwal: req.KeluhanAwal,
		Status:      "menunggu_konfirmasi",
	}

	if err := s.BookingRepo.Create(b); err != nil {
		return nil, err
	}
	return b, nil
}

// Cancel — batalkan booking
func (s *BookingService) Cancel(userID, bookingID string) error {
	// 1. Cek booking ada
	b, err := s.BookingRepo.FindByID(bookingID)
	if err != nil {
		return err
	}

	// 2. Cek booking milik user ini
	if b.UserID != userID {
		return errors.New("akses ditolak")
	}

	// 3. Hanya bisa batalkan yang masih menunggu konfirmasi
	if b.Status != "menunggu_konfirmasi" {
		return errors.New("booking tidak dapat dibatalkan karena sudah diproses")
	}

	// 4. Update status
	return s.BookingRepo.UpdateStatus(bookingID, "dibatalkan")
}
