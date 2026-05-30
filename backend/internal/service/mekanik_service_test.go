package service

import (
	"errors"
	"testing"

	"github.com/ngabengkel/backend/internal/model"
)

// ── Create ────────────────────────────────────────────────────────────────────

func TestMekanikService_Create_HappyPath(t *testing.T) {
	svc := &MekanikService{MekanikRepo: &mockMekanikRepo{}}

	m, err := svc.Create(model.MekanikRequest{Nama: "Budi", Status: "tersedia"})
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if m.MekanikID == "" {
		t.Error("expect mekanik_id tidak kosong")
	}
	if m.Nama != "Budi" {
		t.Errorf("expect nama Budi, got %s", m.Nama)
	}
	if m.Status != "tersedia" {
		t.Errorf("expect status tersedia, got %s", m.Status)
	}
}

func TestMekanikService_Create_NamaKosong(t *testing.T) {
	svc := &MekanikService{MekanikRepo: &mockMekanikRepo{}}

	_, err := svc.Create(model.MekanikRequest{Nama: "", Status: "tersedia"})
	assertError(t, err, "nama wajib diisi")
}

func TestMekanikService_Create_NamaHanyaSpasi(t *testing.T) {
	svc := &MekanikService{MekanikRepo: &mockMekanikRepo{}}

	_, err := svc.Create(model.MekanikRequest{Nama: "   ", Status: "tersedia"})
	assertError(t, err, "nama wajib diisi")
}

func TestMekanikService_Create_StatusTidakValid(t *testing.T) {
	svc := &MekanikService{MekanikRepo: &mockMekanikRepo{}}

	_, err := svc.Create(model.MekanikRequest{Nama: "Budi", Status: "aktif"})
	assertError(t, err, "status tidak valid, gunakan: tersedia atau sibuk")
}

func TestMekanikService_Create_StatusSibuk(t *testing.T) {
	svc := &MekanikService{MekanikRepo: &mockMekanikRepo{}}

	m, err := svc.Create(model.MekanikRequest{Nama: "Andi", Status: "sibuk"})
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if m.Status != "sibuk" {
		t.Errorf("expect status sibuk, got %s", m.Status)
	}
}

// ── Delete ────────────────────────────────────────────────────────────────────

func TestMekanikService_Delete_HappyPath(t *testing.T) {
	svc := &MekanikService{
		MekanikRepo: &mockMekanikRepo{
			findByIDFn: func(_ string) (*model.Mekanik, error) {
				return &model.Mekanik{MekanikID: "m-1", Nama: "Budi", Status: "tersedia"}, nil
			},
		},
	}

	if err := svc.Delete("m-1"); err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
}

func TestMekanikService_Delete_TidakDitemukan(t *testing.T) {
	svc := &MekanikService{
		MekanikRepo: &mockMekanikRepo{
			findByIDFn: func(_ string) (*model.Mekanik, error) {
				return nil, errors.New("mekanik tidak ditemukan")
			},
		},
	}

	err := svc.Delete("m-99")
	assertError(t, err, "mekanik tidak ditemukan")
}

func TestMekanikService_Delete_AdaWOAktif(t *testing.T) {
	svc := &MekanikService{
		MekanikRepo: &mockMekanikRepo{
			findByIDFn: func(_ string) (*model.Mekanik, error) {
				return &model.Mekanik{MekanikID: "m-1", Nama: "Budi", Status: "sibuk"}, nil
			},
			hasActiveWOFn: func(_ string) (bool, error) { return true, nil },
		},
	}

	err := svc.Delete("m-1")
	assertError(t, err, "mekanik tidak dapat dihapus karena memiliki servis aktif")
}

// ── Update ────────────────────────────────────────────────────────────────────

func TestMekanikService_Update_HappyPath(t *testing.T) {
	svc := &MekanikService{
		MekanikRepo: &mockMekanikRepo{
			findByIDFn: func(_ string) (*model.Mekanik, error) {
				return &model.Mekanik{MekanikID: "m-1", Nama: "Budi", Status: "tersedia"}, nil
			},
		},
	}

	m, err := svc.Update("m-1", model.MekanikRequest{Nama: "Budi Updated", Status: "sibuk"})
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if m.Nama != "Budi Updated" {
		t.Errorf("expect nama Budi Updated, got %s", m.Nama)
	}
	if m.Status != "sibuk" {
		t.Errorf("expect status sibuk, got %s", m.Status)
	}
}

func TestMekanikService_Update_TidakDitemukan(t *testing.T) {
	svc := &MekanikService{
		MekanikRepo: &mockMekanikRepo{
			findByIDFn: func(_ string) (*model.Mekanik, error) {
				return nil, errors.New("mekanik tidak ditemukan")
			},
		},
	}

	_, err := svc.Update("m-99", model.MekanikRequest{Nama: "X", Status: "tersedia"})
	assertError(t, err, "mekanik tidak ditemukan")
}
