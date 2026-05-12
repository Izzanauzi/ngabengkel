package service

import (
	"errors"
	"testing"

	"github.com/ngabengkel/backend/internal/model"
)

// ── GetAll ────────────────────────────────────────────────────────────────────

func TestKendaraanService_GetAll_HappyPath(t *testing.T) {
	uid := "u-1"
	want := []model.Kendaraan{
		{KendaraanID: "k-1", UserID: &uid, Merek: "Toyota", NomorPolisi: "B 1234 CD"},
		{KendaraanID: "k-2", UserID: &uid, Merek: "Honda", NomorPolisi: "B 5678 EF"},
	}

	svc := &KendaraanService{KendaraanRepo: &mockKendaraanRepo{
		getByUserIDFn: func(_ string) ([]model.Kendaraan, error) { return want, nil },
	}}

	got, err := svc.GetAll("u-1")
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if len(got) != 2 {
		t.Errorf("expect 2 kendaraan, got %d", len(got))
	}
}

func TestKendaraanService_GetAll_TidakPunyaKendaraan(t *testing.T) {
	svc := &KendaraanService{KendaraanRepo: &mockKendaraanRepo{
		getByUserIDFn: func(_ string) ([]model.Kendaraan, error) { return []model.Kendaraan{}, nil },
	}}

	got, err := svc.GetAll("u-1")
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if len(got) != 0 {
		t.Errorf("expect 0 kendaraan, got %d", len(got))
	}
}

// ── GetByID ───────────────────────────────────────────────────────────────────

func TestKendaraanService_GetByID_HappyPath(t *testing.T) {
	uid := "u-1"
	svc := &KendaraanService{KendaraanRepo: &mockKendaraanRepo{
		findByIDFn: func(_ string) (*model.Kendaraan, error) {
			return &model.Kendaraan{KendaraanID: "k-1", UserID: &uid}, nil
		},
	}}

	k, err := svc.GetByID("u-1", "k-1")
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if k.KendaraanID != "k-1" {
		t.Errorf("expect kendaraan_id k-1, got %s", k.KendaraanID)
	}
}

func TestKendaraanService_GetByID_TidakDitemukan(t *testing.T) {
	svc := &KendaraanService{KendaraanRepo: &mockKendaraanRepo{
		findByIDFn: func(_ string) (*model.Kendaraan, error) {
			return nil, errors.New("kendaraan tidak ditemukan")
		},
	}}

	_, err := svc.GetByID("u-1", "k-99")
	assertError(t, err, "kendaraan tidak ditemukan")
}

func TestKendaraanService_GetByID_BukanMilikUser(t *testing.T) {
	other := "u-other"
	svc := &KendaraanService{KendaraanRepo: &mockKendaraanRepo{
		findByIDFn: func(_ string) (*model.Kendaraan, error) {
			return &model.Kendaraan{KendaraanID: "k-1", UserID: &other}, nil
		},
	}}

	_, err := svc.GetByID("u-1", "k-1")
	assertError(t, err, "akses ditolak")
}

// ── Create ────────────────────────────────────────────────────────────────────

func TestKendaraanService_Create_HappyPath(t *testing.T) {
	svc := &KendaraanService{KendaraanRepo: &mockKendaraanRepo{}}

	k, err := svc.Create("u-1", model.KendaraanRequest{
		Merek: "Toyota", Model: "Avanza", Tahun: 2020, NomorPolisi: "B 1234 CD",
	})
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if k.NomorPolisi != "B 1234 CD" {
		t.Errorf("expect nomor polisi B 1234 CD, got %s", k.NomorPolisi)
	}
	if k.KendaraanID == "" {
		t.Error("expect kendaraan_id tidak kosong (UUID)")
	}
}

func TestKendaraanService_Create_NomorPolisiDuplikat(t *testing.T) {
	svc := &KendaraanService{KendaraanRepo: &mockKendaraanRepo{
		nomorPolisiExistsFn: func(_ string) (bool, error) { return true, nil },
	}}

	_, err := svc.Create("u-1", model.KendaraanRequest{
		Merek: "Toyota", Model: "Avanza", Tahun: 2020, NomorPolisi: "B 1234 CD",
	})
	assertError(t, err, "nomor polisi sudah terdaftar")
}

func TestKendaraanService_Create_NomorRangkaDuplikat(t *testing.T) {
	rangka := "ABC123"
	svc := &KendaraanService{KendaraanRepo: &mockKendaraanRepo{
		nomorRangkaExistsFn: func(_ string) (bool, error) { return true, nil },
	}}

	_, err := svc.Create("u-1", model.KendaraanRequest{
		Merek: "Toyota", Model: "Avanza", Tahun: 2020, NomorPolisi: "B 1234 CD",
		NomorRangka: &rangka,
	})
	assertError(t, err, "nomor rangka sudah terdaftar")
}

func TestKendaraanService_Create_FieldKosong(t *testing.T) {
	svc := &KendaraanService{KendaraanRepo: &mockKendaraanRepo{}}

	cases := []model.KendaraanRequest{
		{Merek: "", Model: "Avanza", Tahun: 2020, NomorPolisi: "B 1234 CD"},
		{Merek: "Toyota", Model: "", Tahun: 2020, NomorPolisi: "B 1234 CD"},
		{Merek: "Toyota", Model: "Avanza", Tahun: 2020, NomorPolisi: ""},
	}
	for _, req := range cases {
		_, err := svc.Create("u-1", req)
		assertError(t, err, "merek, model, dan nomor polisi wajib diisi")
	}
}

// ── Update ────────────────────────────────────────────────────────────────────

func TestKendaraanService_Update_HappyPath(t *testing.T) {
	uid := "u-1"
	svc := &KendaraanService{KendaraanRepo: &mockKendaraanRepo{
		findByIDFn: func(_ string) (*model.Kendaraan, error) {
			return &model.Kendaraan{KendaraanID: "k-1", UserID: &uid}, nil
		},
	}}

	k, err := svc.Update("u-1", "k-1", model.KendaraanRequest{
		Merek: "Honda", Model: "Jazz", Tahun: 2021, NomorPolisi: "B 9999 ZZ",
	})
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if k.Merek != "Honda" {
		t.Errorf("expect merek Honda, got %s", k.Merek)
	}
}

func TestKendaraanService_Update_TidakDitemukan(t *testing.T) {
	svc := &KendaraanService{KendaraanRepo: &mockKendaraanRepo{
		findByIDFn: func(_ string) (*model.Kendaraan, error) {
			return nil, errors.New("kendaraan tidak ditemukan")
		},
	}}

	_, err := svc.Update("u-1", "k-99", model.KendaraanRequest{
		Merek: "Honda", Model: "Jazz", Tahun: 2021, NomorPolisi: "B 9999 ZZ",
	})
	assertError(t, err, "kendaraan tidak ditemukan")
}

func TestKendaraanService_Update_BukanMilikUser(t *testing.T) {
	other := "u-other"
	svc := &KendaraanService{KendaraanRepo: &mockKendaraanRepo{
		findByIDFn: func(_ string) (*model.Kendaraan, error) {
			return &model.Kendaraan{KendaraanID: "k-1", UserID: &other}, nil
		},
	}}

	_, err := svc.Update("u-1", "k-1", model.KendaraanRequest{
		Merek: "Honda", Model: "Jazz", Tahun: 2021, NomorPolisi: "B 9999 ZZ",
	})
	assertError(t, err, "akses ditolak")
}

func TestKendaraanService_Update_NomorPolisiDuplikat(t *testing.T) {
	uid := "u-1"
	svc := &KendaraanService{KendaraanRepo: &mockKendaraanRepo{
		findByIDFn: func(_ string) (*model.Kendaraan, error) {
			return &model.Kendaraan{KendaraanID: "k-1", UserID: &uid}, nil
		},
		nomorPolisiExistsExcludeFn: func(_, _ string) (bool, error) { return true, nil },
	}}

	_, err := svc.Update("u-1", "k-1", model.KendaraanRequest{
		Merek: "Honda", Model: "Jazz", Tahun: 2021, NomorPolisi: "B 9999 ZZ",
	})
	assertError(t, err, "nomor polisi sudah terdaftar")
}

// ── Delete ────────────────────────────────────────────────────────────────────

func TestKendaraanService_Delete_HappyPath(t *testing.T) {
	uid := "u-1"
	svc := &KendaraanService{KendaraanRepo: &mockKendaraanRepo{
		findByIDFn: func(_ string) (*model.Kendaraan, error) {
			return &model.Kendaraan{KendaraanID: "k-1", UserID: &uid}, nil
		},
	}}

	err := svc.Delete("u-1", "k-1")
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
}

func TestKendaraanService_Delete_TidakDitemukan(t *testing.T) {
	svc := &KendaraanService{KendaraanRepo: &mockKendaraanRepo{
		findByIDFn: func(_ string) (*model.Kendaraan, error) {
			return nil, errors.New("kendaraan tidak ditemukan")
		},
	}}

	err := svc.Delete("u-1", "k-99")
	assertError(t, err, "kendaraan tidak ditemukan")
}

func TestKendaraanService_Delete_BukanMilikUser(t *testing.T) {
	other := "u-other"
	svc := &KendaraanService{KendaraanRepo: &mockKendaraanRepo{
		findByIDFn: func(_ string) (*model.Kendaraan, error) {
			return &model.Kendaraan{KendaraanID: "k-1", UserID: &other}, nil
		},
	}}

	err := svc.Delete("u-1", "k-1")
	assertError(t, err, "akses ditolak")
}

func TestKendaraanService_Delete_AdaWOAktif(t *testing.T) {
	uid := "u-1"
	svc := &KendaraanService{KendaraanRepo: &mockKendaraanRepo{
		findByIDFn: func(_ string) (*model.Kendaraan, error) {
			return &model.Kendaraan{KendaraanID: "k-1", UserID: &uid}, nil
		},
		hasActiveWOFn: func(_ string) (bool, error) { return true, nil },
	}}

	err := svc.Delete("u-1", "k-1")
	assertError(t, err, "kendaraan tidak dapat dihapus karena memiliki servis aktif")
}
