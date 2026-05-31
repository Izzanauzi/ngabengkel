package service

import (
	"errors"
	"testing"

	"github.com/ngabengkel/backend/internal/model"
)

func customerSvc(userRepo *mockUserRepo) *AdminCustomerService {
	return &AdminCustomerService{
		UserRepo:      userRepo,
		KendaraanRepo: &mockKendaraanRepo{},
	}
}

// ── GetAll ────────────────────────────────────────────────────────────────────

func TestAdminCustomerService_GetAll_HappyPath(t *testing.T) {
	want := []model.AdminCustomerResponse{
		{UserID: "u-1", Nama: "Budi", Email: "budi@test.com", JumlahKendaraan: 2},
		{UserID: "u-2", Nama: "Ani", Email: "", JumlahKendaraan: 0},
	}
	svc := customerSvc(&mockUserRepo{
		getAllCustomersFn: func() ([]model.AdminCustomerResponse, error) { return want, nil },
	})

	got, err := svc.GetAll()
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if len(got) != 2 {
		t.Errorf("expect 2 customer, got %d", len(got))
	}
	if got[0].JumlahKendaraan != 2 {
		t.Errorf("expect jumlah_kendaraan 2, got %d", got[0].JumlahKendaraan)
	}
}

func TestAdminCustomerService_GetAll_Empty(t *testing.T) {
	svc := customerSvc(&mockUserRepo{})

	got, err := svc.GetAll()
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if len(got) != 0 {
		t.Errorf("expect 0 customer, got %d", len(got))
	}
}

// ── CreateWalkIn ──────────────────────────────────────────────────────────────

func TestAdminCustomerService_CreateWalkIn_HappyPath(t *testing.T) {
	svc := customerSvc(&mockUserRepo{})

	user, err := svc.CreateWalkIn(model.AdminCreateCustomerRequest{
		Nama:    "Budi Walk-in",
		Telepon: "08123456789",
	})
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if user.UserID == "" {
		t.Error("expect user_id tidak kosong")
	}
	if user.Nama != "Budi Walk-in" {
		t.Errorf("expect nama Budi Walk-in, got %s", user.Nama)
	}
	if user.Role != "customer" {
		t.Errorf("expect role customer, got %s", user.Role)
	}
	if user.Password != "" {
		t.Error("expect password kosong untuk walk-in tanpa password")
	}
}

func TestAdminCustomerService_CreateWalkIn_DenganPassword(t *testing.T) {
	pw := "rahasia123"
	svc := customerSvc(&mockUserRepo{})

	user, err := svc.CreateWalkIn(model.AdminCreateCustomerRequest{
		Nama:     "Ani",
		Telepon:  "08111111111",
		Password: &pw,
	})
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if user.Password == "" {
		t.Error("expect password ter-hash, got kosong")
	}
	if user.Password == pw {
		t.Error("expect password di-hash, bukan plain text")
	}
}

func TestAdminCustomerService_CreateWalkIn_NamaKosong(t *testing.T) {
	svc := customerSvc(&mockUserRepo{})

	_, err := svc.CreateWalkIn(model.AdminCreateCustomerRequest{Nama: "", Telepon: "08123456789"})
	assertError(t, err, "nama wajib diisi")
}

func TestAdminCustomerService_CreateWalkIn_NamaHanyaSpasi(t *testing.T) {
	svc := customerSvc(&mockUserRepo{})

	_, err := svc.CreateWalkIn(model.AdminCreateCustomerRequest{Nama: "   ", Telepon: "08123456789"})
	assertError(t, err, "nama wajib diisi")
}

func TestAdminCustomerService_CreateWalkIn_TeleponKosong(t *testing.T) {
	svc := customerSvc(&mockUserRepo{})

	_, err := svc.CreateWalkIn(model.AdminCreateCustomerRequest{Nama: "Budi", Telepon: ""})
	assertError(t, err, "telepon wajib diisi")
}

func TestAdminCustomerService_CreateWalkIn_EmailSudahDipakai(t *testing.T) {
	svc := customerSvc(&mockUserRepo{
		emailExistsFn: func(_ string) (bool, error) { return true, nil },
	})

	_, err := svc.CreateWalkIn(model.AdminCreateCustomerRequest{
		Nama:    "Budi",
		Telepon: "08123456789",
		Email:   "duplicate@test.com",
	})
	assertError(t, err, "email sudah digunakan")
}

func TestAdminCustomerService_CreateWalkIn_TeleponSudahDipakai(t *testing.T) {
	svc := customerSvc(&mockUserRepo{
		teleponExistsFn: func(_ string) (bool, error) { return true, nil },
	})

	_, err := svc.CreateWalkIn(model.AdminCreateCustomerRequest{
		Nama:    "Budi",
		Telepon: "08123456789",
	})
	assertError(t, err, "nomor telepon sudah terdaftar")
}

// ── Delete ────────────────────────────────────────────────────────────────────

func TestAdminCustomerService_Delete_HappyPath(t *testing.T) {
	svc := customerSvc(&mockUserRepo{
		findCustomerByIDFn: func(_ string) (*model.AdminCustomerResponse, error) {
			return &model.AdminCustomerResponse{UserID: "u-1", Nama: "Budi"}, nil
		},
	})

	if err := svc.Delete("u-1"); err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
}

func TestAdminCustomerService_Delete_TidakDitemukan(t *testing.T) {
	svc := customerSvc(&mockUserRepo{
		findCustomerByIDFn: func(_ string) (*model.AdminCustomerResponse, error) {
			return nil, errors.New("customer tidak ditemukan")
		},
	})

	err := svc.Delete("u-99")
	assertError(t, err, "customer tidak ditemukan")
}

func TestAdminCustomerService_Delete_AdaWOAktif(t *testing.T) {
	svc := customerSvc(&mockUserRepo{
		findCustomerByIDFn: func(_ string) (*model.AdminCustomerResponse, error) {
			return &model.AdminCustomerResponse{UserID: "u-1"}, nil
		},
		hasActiveWOFn: func(_ string) (bool, error) { return true, nil },
	})

	err := svc.Delete("u-1")
	assertError(t, err, "customer tidak dapat dihapus karena memiliki servis aktif")
}
