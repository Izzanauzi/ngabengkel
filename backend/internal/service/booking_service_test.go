package service

import (
	"errors"
	"testing"
	"time"

	"github.com/ngabengkel/backend/internal/model"
)

// futureETA — ETA 24 jam dari sekarang dalam format RFC3339
func futureETA() string {
	return time.Now().Add(24 * time.Hour).Format(time.RFC3339)
}

// ── GetAll ────────────────────────────────────────────────────────────────────

func TestBookingService_GetAll_HappyPath(t *testing.T) {
	want := []model.Booking{
		{BookingID: "b-1", UserID: "u-1", Status: "menunggu_konfirmasi"},
		{BookingID: "b-2", UserID: "u-1", Status: "dikonfirmasi"},
	}

	svc := &BookingService{
		BookingRepo:   &mockBookingRepo{getByUserIDFn: func(_ string) ([]model.Booking, error) { return want, nil }},
		KendaraanRepo: &mockKendaraanRepo{},
	}

	got, err := svc.GetAll("u-1")
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if len(got) != 2 {
		t.Errorf("expect 2 booking, got %d", len(got))
	}
}

func TestBookingService_GetAll_TidakPunyaBooking(t *testing.T) {
	svc := &BookingService{
		BookingRepo:   &mockBookingRepo{getByUserIDFn: func(_ string) ([]model.Booking, error) { return []model.Booking{}, nil }},
		KendaraanRepo: &mockKendaraanRepo{},
	}

	got, err := svc.GetAll("u-1")
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if len(got) != 0 {
		t.Errorf("expect 0 booking, got %d", len(got))
	}
}

// ── Create ────────────────────────────────────────────────────────────────────

func TestBookingService_Create_HappyPath(t *testing.T) {
	uid := "u-1"
	svc := &BookingService{
		BookingRepo: &mockBookingRepo{},
		KendaraanRepo: &mockKendaraanRepo{
			findByIDFn: func(_ string) (*model.Kendaraan, error) {
				return &model.Kendaraan{KendaraanID: "k-1", UserID: &uid}, nil
			},
		},
	}

	b, err := svc.Create("u-1", model.BookingRequest{
		KendaraanID: "k-1",
		ETA:         futureETA(),
	})
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if b.BookingID == "" {
		t.Error("expect booking_id tidak kosong")
	}
	if b.Status != "menunggu_konfirmasi" {
		t.Errorf("expect status menunggu_konfirmasi, got %s", b.Status)
	}
}

func TestBookingService_Create_KendaraanTidakDitemukan(t *testing.T) {
	svc := &BookingService{
		BookingRepo: &mockBookingRepo{},
		KendaraanRepo: &mockKendaraanRepo{
			findByIDFn: func(_ string) (*model.Kendaraan, error) {
				return nil, errors.New("kendaraan tidak ditemukan")
			},
		},
	}

	_, err := svc.Create("u-1", model.BookingRequest{KendaraanID: "k-99", ETA: futureETA()})
	assertError(t, err, "kendaraan tidak ditemukan")
}

func TestBookingService_Create_BukanMilikUser(t *testing.T) {
	other := "u-other"
	svc := &BookingService{
		BookingRepo: &mockBookingRepo{},
		KendaraanRepo: &mockKendaraanRepo{
			findByIDFn: func(_ string) (*model.Kendaraan, error) {
				return &model.Kendaraan{KendaraanID: "k-1", UserID: &other}, nil
			},
		},
	}

	_, err := svc.Create("u-1", model.BookingRequest{KendaraanID: "k-1", ETA: futureETA()})
	assertError(t, err, "akses ditolak")
}

func TestBookingService_Create_SudahAdaBookingAktif(t *testing.T) {
	uid := "u-1"
	svc := &BookingService{
		BookingRepo: &mockBookingRepo{
			hasActiveBookingFn: func(_ string) (bool, error) { return true, nil },
		},
		KendaraanRepo: &mockKendaraanRepo{
			findByIDFn: func(_ string) (*model.Kendaraan, error) {
				return &model.Kendaraan{KendaraanID: "k-1", UserID: &uid}, nil
			},
		},
	}

	_, err := svc.Create("u-1", model.BookingRequest{KendaraanID: "k-1", ETA: futureETA()})
	assertError(t, err, "kendaraan sudah memiliki booking yang menunggu konfirmasi")
}

func TestBookingService_Create_ETAMasaLalu(t *testing.T) {
	uid := "u-1"
	svc := &BookingService{
		BookingRepo: &mockBookingRepo{},
		KendaraanRepo: &mockKendaraanRepo{
			findByIDFn: func(_ string) (*model.Kendaraan, error) {
				return &model.Kendaraan{KendaraanID: "k-1", UserID: &uid}, nil
			},
		},
	}

	pastETA := time.Now().Add(-24 * time.Hour).Format(time.RFC3339)
	_, err := svc.Create("u-1", model.BookingRequest{KendaraanID: "k-1", ETA: pastETA})
	assertError(t, err, "ETA tidak boleh di masa lalu")
}

func TestBookingService_Create_FormatETASalah(t *testing.T) {
	svc := &BookingService{
		BookingRepo:   &mockBookingRepo{},
		KendaraanRepo: &mockKendaraanRepo{},
	}

	_, err := svc.Create("u-1", model.BookingRequest{KendaraanID: "k-1", ETA: "bukan-tanggal"})
	assertError(t, err, "format ETA tidak valid, gunakan format: 2006-01-02T15:04:05Z")
}

// ── Cancel ────────────────────────────────────────────────────────────────────

func TestBookingService_Cancel_HappyPath(t *testing.T) {
	svc := &BookingService{
		BookingRepo: &mockBookingRepo{
			findByIDFn: func(_ string) (*model.Booking, error) {
				return &model.Booking{BookingID: "b-1", UserID: "u-1", Status: "menunggu_konfirmasi"}, nil
			},
		},
		KendaraanRepo: &mockKendaraanRepo{},
	}

	err := svc.Cancel("u-1", "b-1")
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
}

func TestBookingService_Cancel_TidakDitemukan(t *testing.T) {
	svc := &BookingService{
		BookingRepo: &mockBookingRepo{
			findByIDFn: func(_ string) (*model.Booking, error) {
				return nil, errors.New("booking tidak ditemukan")
			},
		},
		KendaraanRepo: &mockKendaraanRepo{},
	}

	err := svc.Cancel("u-1", "b-99")
	assertError(t, err, "booking tidak ditemukan")
}

func TestBookingService_Cancel_BukanMilikUser(t *testing.T) {
	svc := &BookingService{
		BookingRepo: &mockBookingRepo{
			findByIDFn: func(_ string) (*model.Booking, error) {
				return &model.Booking{BookingID: "b-1", UserID: "u-other", Status: "menunggu_konfirmasi"}, nil
			},
		},
		KendaraanRepo: &mockKendaraanRepo{},
	}

	err := svc.Cancel("u-1", "b-1")
	assertError(t, err, "akses ditolak")
}

func TestBookingService_Cancel_StatusSudahDiproses(t *testing.T) {
	svc := &BookingService{
		BookingRepo: &mockBookingRepo{
			findByIDFn: func(_ string) (*model.Booking, error) {
				return &model.Booking{BookingID: "b-1", UserID: "u-1", Status: "dikonfirmasi"}, nil
			},
		},
		KendaraanRepo: &mockKendaraanRepo{},
	}

	err := svc.Cancel("u-1", "b-1")
	assertError(t, err, "booking tidak dapat dibatalkan karena sudah diproses")
}
