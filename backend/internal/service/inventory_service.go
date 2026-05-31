package service

import (
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/repository"
)

type InventoryService struct {
	InventoryRepo repository.InventoryRepositoryInterface
}

// GetAll — ambil semua item inventori
func (s *InventoryService) GetAll() ([]model.InventoryItem, error) {
	return s.InventoryRepo.GetAll()
}

// GetByID — ambil satu item inventori
func (s *InventoryService) GetByID(inventoryID string) (*model.InventoryItem, error) {
	return s.InventoryRepo.FindByID(inventoryID)
}

// Create — tambah item inventori baru
func (s *InventoryService) Create(req model.InventoryRequest) (*model.InventoryItem, error) {
	req.Nama = strings.TrimSpace(req.Nama)
	req.Satuan = strings.TrimSpace(req.Satuan)

	if req.Nama == "" {
		return nil, errors.New("nama wajib diisi")
	}
	if req.Satuan == "" {
		return nil, errors.New("satuan wajib diisi")
	}
	if req.Stok < 0 {
		return nil, errors.New("stok tidak boleh negatif")
	}

	item := &model.InventoryItem{
		InventoryID:    uuid.New().String(),
		Tipe:           req.Tipe,
		Nama:           req.Nama,
		KodePart:       req.KodePart,
		Merek:          req.Merek,
		Kompatibilitas: req.Kompatibilitas,
		Satuan:         req.Satuan,
		Stok:           req.Stok,
		HargaSatuan:    req.HargaSatuan,
	}
	if err := s.InventoryRepo.Create(item); err != nil {
		return nil, err
	}
	return item, nil
}

// Update — edit item inventori
func (s *InventoryService) Update(inventoryID string, req model.InventoryRequest) (*model.InventoryItem, error) {
	item, err := s.InventoryRepo.FindByID(inventoryID)
	if err != nil {
		return nil, err
	}

	req.Nama = strings.TrimSpace(req.Nama)
	req.Satuan = strings.TrimSpace(req.Satuan)

	if req.Nama == "" {
		return nil, errors.New("nama wajib diisi")
	}
	if req.Satuan == "" {
		return nil, errors.New("satuan wajib diisi")
	}
	if req.Stok < 0 {
		return nil, errors.New("stok tidak boleh negatif")
	}

	item.Tipe = req.Tipe
	item.Nama = req.Nama
	item.KodePart = req.KodePart
	item.Merek = req.Merek
	item.Kompatibilitas = req.Kompatibilitas
	item.Satuan = req.Satuan
	item.Stok = req.Stok
	item.HargaSatuan = req.HargaSatuan

	if err := s.InventoryRepo.Update(item); err != nil {
		return nil, err
	}
	return item, nil
}

// Delete — hapus item inventori
func (s *InventoryService) Delete(inventoryID string) error {
	_, err := s.InventoryRepo.FindByID(inventoryID)
	if err != nil {
		return err
	}
	return s.InventoryRepo.Delete(inventoryID)
}

// AddToWO — tambah material dari inventori ke work order
func (s *InventoryService) AddToWO(woID string, req model.WOItemRequest) (*model.WOItem, error) {
	if req.Jumlah <= 0 {
		return nil, errors.New("jumlah harus lebih dari 0")
	}

	item, err := s.InventoryRepo.FindByID(req.InventoryID)
	if err != nil {
		return nil, err
	}

	if item.Stok < req.Jumlah {
		return nil, errors.New("stok tidak mencukupi")
	}

	subtotal := item.HargaSatuan * float64(req.Jumlah)
	woItem := &model.WOItem{
		WoItemID:    uuid.New().String(),
		WoID:        woID,
		InventoryID: req.InventoryID,
		NamaItem:    item.Nama,
		Jumlah:      req.Jumlah,
		HargaSatuan: item.HargaSatuan,
		Subtotal:    subtotal,
	}

	if err := s.InventoryRepo.AddItemToWO(woItem); err != nil {
		return nil, err
	}
	if err := s.InventoryRepo.UpdateStok(req.InventoryID, req.Jumlah); err != nil {
		return nil, err
	}

	return woItem, nil
}
