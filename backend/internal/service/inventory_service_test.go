package service

import (
	"errors"
	"testing"

	"github.com/ngabengkel/backend/internal/model"
)

// ── Create ────────────────────────────────────────────────────────────────────

func TestInventoryService_Create_HappyPath(t *testing.T) {
	svc := &InventoryService{InventoryRepo: &mockInventoryRepo{}}

	item, err := svc.Create(model.InventoryRequest{
		Nama:        "Oli Mesin",
		Satuan:      "liter",
		Stok:        10,
		HargaSatuan: 50000,
	})
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if item.InventoryID == "" {
		t.Error("expect inventory_id tidak kosong")
	}
	if item.Nama != "Oli Mesin" {
		t.Errorf("expect nama Oli Mesin, got %s", item.Nama)
	}
	if item.Stok != 10 {
		t.Errorf("expect stok 10, got %d", item.Stok)
	}
}

func TestInventoryService_Create_NamaKosong(t *testing.T) {
	svc := &InventoryService{InventoryRepo: &mockInventoryRepo{}}

	_, err := svc.Create(model.InventoryRequest{Nama: "", Satuan: "liter", Stok: 5})
	assertError(t, err, "nama wajib diisi")
}

func TestInventoryService_Create_NamaHanyaSpasi(t *testing.T) {
	svc := &InventoryService{InventoryRepo: &mockInventoryRepo{}}

	_, err := svc.Create(model.InventoryRequest{Nama: "   ", Satuan: "pcs", Stok: 0})
	assertError(t, err, "nama wajib diisi")
}

func TestInventoryService_Create_SatuanKosong(t *testing.T) {
	svc := &InventoryService{InventoryRepo: &mockInventoryRepo{}}

	_, err := svc.Create(model.InventoryRequest{Nama: "Kampas Rem", Satuan: "", Stok: 3})
	assertError(t, err, "satuan wajib diisi")
}

func TestInventoryService_Create_StokNegatif(t *testing.T) {
	svc := &InventoryService{InventoryRepo: &mockInventoryRepo{}}

	_, err := svc.Create(model.InventoryRequest{Nama: "Filter Oli", Satuan: "pcs", Stok: -1})
	assertError(t, err, "stok tidak boleh negatif")
}

func TestInventoryService_Create_StokNol(t *testing.T) {
	svc := &InventoryService{InventoryRepo: &mockInventoryRepo{}}

	item, err := svc.Create(model.InventoryRequest{Nama: "Busi", Satuan: "pcs", Stok: 0})
	if err != nil {
		t.Fatalf("stok 0 harus valid, got: %v", err)
	}
	if item.Stok != 0 {
		t.Errorf("expect stok 0, got %d", item.Stok)
	}
}

// ── AddToWO ───────────────────────────────────────────────────────────────────

func TestInventoryService_AddToWO_HappyPath(t *testing.T) {
	var capturedStokUpdate int
	svc := &InventoryService{
		InventoryRepo: &mockInventoryRepo{
			findByIDFn: func(_ string) (*model.InventoryItem, error) {
				return &model.InventoryItem{
					InventoryID: "inv-1",
					Nama:        "Oli Mesin",
					Stok:        10,
					HargaSatuan: 50000,
					Satuan:      "liter",
				}, nil
			},
			updateStokFn: func(_ string, jumlah int) error {
				capturedStokUpdate = jumlah
				return nil
			},
		},
	}

	woItem, err := svc.AddToWO("wo-1", model.WOItemRequest{InventoryID: "inv-1", Jumlah: 3})
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if woItem.WoItemID == "" {
		t.Error("expect wo_item_id tidak kosong")
	}
	if woItem.NamaItem != "Oli Mesin" {
		t.Errorf("expect nama_item Oli Mesin, got %s", woItem.NamaItem)
	}
	if woItem.Subtotal != 150000 {
		t.Errorf("expect subtotal 150000, got %.0f", woItem.Subtotal)
	}
	if capturedStokUpdate != 3 {
		t.Errorf("expect stok dikurangi 3, got %d", capturedStokUpdate)
	}
}

func TestInventoryService_AddToWO_ItemTidakAda(t *testing.T) {
	svc := &InventoryService{
		InventoryRepo: &mockInventoryRepo{
			findByIDFn: func(_ string) (*model.InventoryItem, error) {
				return nil, errors.New("item inventori tidak ditemukan")
			},
		},
	}

	_, err := svc.AddToWO("wo-1", model.WOItemRequest{InventoryID: "inv-99", Jumlah: 1})
	assertError(t, err, "item inventori tidak ditemukan")
}

func TestInventoryService_AddToWO_StokTidakCukup(t *testing.T) {
	svc := &InventoryService{
		InventoryRepo: &mockInventoryRepo{
			findByIDFn: func(_ string) (*model.InventoryItem, error) {
				return &model.InventoryItem{
					InventoryID: "inv-1",
					Nama:        "Kampas Rem",
					Stok:        2,
					HargaSatuan: 80000,
					Satuan:      "pcs",
				}, nil
			},
		},
	}

	_, err := svc.AddToWO("wo-1", model.WOItemRequest{InventoryID: "inv-1", Jumlah: 5})
	assertError(t, err, "stok tidak mencukupi")
}

func TestInventoryService_AddToWO_JumlahNol(t *testing.T) {
	svc := &InventoryService{InventoryRepo: &mockInventoryRepo{}}

	_, err := svc.AddToWO("wo-1", model.WOItemRequest{InventoryID: "inv-1", Jumlah: 0})
	assertError(t, err, "jumlah harus lebih dari 0")
}

// ── Delete ────────────────────────────────────────────────────────────────────

func TestInventoryService_Delete_HappyPath(t *testing.T) {
	svc := &InventoryService{
		InventoryRepo: &mockInventoryRepo{
			findByIDFn: func(_ string) (*model.InventoryItem, error) {
				return &model.InventoryItem{InventoryID: "inv-1", Nama: "Oli"}, nil
			},
		},
	}
	if err := svc.Delete("inv-1"); err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
}

func TestInventoryService_Delete_TidakDitemukan(t *testing.T) {
	svc := &InventoryService{
		InventoryRepo: &mockInventoryRepo{
			findByIDFn: func(_ string) (*model.InventoryItem, error) {
				return nil, errors.New("item inventori tidak ditemukan")
			},
		},
	}
	err := svc.Delete("inv-99")
	assertError(t, err, "item inventori tidak ditemukan")
}
