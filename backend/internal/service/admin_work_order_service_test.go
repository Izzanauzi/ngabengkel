package service

import (
	"errors"
	"testing"

	"github.com/ngabengkel/backend/internal/model"
)

func adminWOSvc(repo *mockWorkOrderRepo) *AdminWorkOrderService {
	return &AdminWorkOrderService{WorkOrderRepo: repo, BookingRepo: &mockBookingRepo{}}
}

// ── Create ────────────────────────────────────────────────────────────────────

func TestAdminWOService_Create_HappyPath(t *testing.T) {
	svc := adminWOSvc(&mockWorkOrderRepo{})

	wo, err := svc.Create(model.WorkOrderRequest{KendaraanID: "k-1"})
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if wo.WoID == "" {
		t.Error("expect wo_id tidak kosong")
	}
	if wo.NomorWO == "" {
		t.Error("expect nomor_wo tidak kosong")
	}
	if wo.Status != "dibuat" {
		t.Errorf("expect status dibuat, got %s", wo.Status)
	}
	if wo.KendaraanID != "k-1" {
		t.Errorf("expect kendaraan_id k-1, got %s", wo.KendaraanID)
	}
}

func TestAdminWOService_Create_KendaraanKosong(t *testing.T) {
	svc := adminWOSvc(&mockWorkOrderRepo{})

	_, err := svc.Create(model.WorkOrderRequest{KendaraanID: ""})
	assertError(t, err, "kendaraan_id wajib diisi")
}

func TestAdminWOService_Create_KendaraanTidakAda(t *testing.T) {
	svc := adminWOSvc(&mockWorkOrderRepo{
		createFn: func(_ *model.WorkOrder) error {
			return errors.New("insert or update on table \"work_orders\" violates foreign key constraint")
		},
	})

	_, err := svc.Create(model.WorkOrderRequest{KendaraanID: "k-99"})
	if err == nil {
		t.Fatal("expect error, got nil")
	}
}

func TestAdminWOService_Create_WithUserID(t *testing.T) {
	uid := "u-1"
	svc := adminWOSvc(&mockWorkOrderRepo{})

	wo, err := svc.Create(model.WorkOrderRequest{KendaraanID: "k-1", UserID: &uid})
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if wo.UserID != "u-1" {
		t.Errorf("expect user_id u-1, got %s", wo.UserID)
	}
}

// ── UploadProgress ────────────────────────────────────────────────────────────

func TestAdminWOService_UploadProgress_HappyPath(t *testing.T) {
	var capturedProgress *model.Progress
	svc := adminWOSvc(&mockWorkOrderRepo{
		findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
			return &model.WorkOrderDetail{
				WorkOrder: model.WorkOrder{WoID: "wo-1", Status: "sedang_dikerjakan"},
			}, nil
		},
		addProgressFn: func(p *model.Progress) error {
			capturedProgress = p
			return nil
		},
	})

	err := svc.UploadProgress("wo-1", model.ProgressRequest{
		Deskripsi: "Ganti oli mesin",
		Tipe:      "update",
	})
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if capturedProgress == nil {
		t.Fatal("expect progress tersimpan")
	}
	if capturedProgress.Tipe != "update" {
		t.Errorf("expect tipe update, got %s", capturedProgress.Tipe)
	}
}

func TestAdminWOService_UploadProgress_DeskripsiKosong(t *testing.T) {
	svc := adminWOSvc(&mockWorkOrderRepo{})

	err := svc.UploadProgress("wo-1", model.ProgressRequest{Deskripsi: "", Tipe: "update"})
	assertError(t, err, "deskripsi wajib diisi")
}

func TestAdminWOService_UploadProgress_WOTidakDitemukan(t *testing.T) {
	svc := adminWOSvc(&mockWorkOrderRepo{
		findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
			return nil, errors.New("work order tidak ditemukan")
		},
	})

	err := svc.UploadProgress("wo-99", model.ProgressRequest{Deskripsi: "x", Tipe: "update"})
	assertError(t, err, "work order tidak ditemukan")
}

func TestAdminWOService_UploadProgress_StatusSalah(t *testing.T) {
	svc := adminWOSvc(&mockWorkOrderRepo{
		findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
			return &model.WorkOrderDetail{
				WorkOrder: model.WorkOrder{WoID: "wo-1", Status: "dibuat"},
			}, nil
		},
	})

	err := svc.UploadProgress("wo-1", model.ProgressRequest{Deskripsi: "x", Tipe: "update"})
	assertError(t, err, "work order tidak dalam status sedang dikerjakan")
}

// ── Suspend ───────────────────────────────────────────────────────────────────

func TestAdminWOService_Suspend_HappyPath(t *testing.T) {
	var capturedStatus string
	svc := adminWOSvc(&mockWorkOrderRepo{
		findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
			return &model.WorkOrderDetail{
				WorkOrder: model.WorkOrder{WoID: "wo-1", Status: "sedang_dikerjakan"},
			}, nil
		},
		updateStatusFn: func(_ string, status string) error {
			capturedStatus = status
			return nil
		},
	})

	err := svc.Suspend("wo-1", model.SuspendRequest{
		Deskripsi:        "Perlu ganti kampas rem",
		EstBiayaTambahan: 150000,
	})
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if capturedStatus != "menunggu_persetujuan" {
		t.Errorf("expect status menunggu_persetujuan, got %s", capturedStatus)
	}
}

func TestAdminWOService_Suspend_DeskripsiKosong(t *testing.T) {
	svc := adminWOSvc(&mockWorkOrderRepo{})

	err := svc.Suspend("wo-1", model.SuspendRequest{Deskripsi: "", EstBiayaTambahan: 100000})
	assertError(t, err, "deskripsi wajib diisi")
}

func TestAdminWOService_Suspend_WOTidakDitemukan(t *testing.T) {
	svc := adminWOSvc(&mockWorkOrderRepo{
		findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
			return nil, errors.New("work order tidak ditemukan")
		},
	})

	err := svc.Suspend("wo-99", model.SuspendRequest{Deskripsi: "x", EstBiayaTambahan: 50000})
	assertError(t, err, "work order tidak ditemukan")
}

func TestAdminWOService_Suspend_StatusSalah(t *testing.T) {
	svc := adminWOSvc(&mockWorkOrderRepo{
		findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
			return &model.WorkOrderDetail{
				WorkOrder: model.WorkOrder{WoID: "wo-1", Status: "menunggu_persetujuan"},
			}, nil
		},
	})

	err := svc.Suspend("wo-1", model.SuspendRequest{Deskripsi: "x", EstBiayaTambahan: 50000})
	assertError(t, err, "work order tidak dalam status sedang dikerjakan")
}

// ── Finish ────────────────────────────────────────────────────────────────────

func TestAdminWOService_Finish_HappyPath(t *testing.T) {
	var capturedStatus string
	svc := adminWOSvc(&mockWorkOrderRepo{
		findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
			return &model.WorkOrderDetail{
				WorkOrder: model.WorkOrder{WoID: "wo-1", Status: "sedang_dikerjakan"},
			}, nil
		},
		updateStatusFn: func(_ string, status string) error {
			capturedStatus = status
			return nil
		},
	})

	if err := svc.Finish("wo-1"); err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if capturedStatus != "selesai" {
		t.Errorf("expect status selesai, got %s", capturedStatus)
	}
}

func TestAdminWOService_Finish_WOTidakDitemukan(t *testing.T) {
	svc := adminWOSvc(&mockWorkOrderRepo{
		findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
			return nil, errors.New("work order tidak ditemukan")
		},
	})

	err := svc.Finish("wo-99")
	assertError(t, err, "work order tidak ditemukan")
}

func TestAdminWOService_Finish_StatusSalah(t *testing.T) {
	svc := adminWOSvc(&mockWorkOrderRepo{
		findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
			return &model.WorkOrderDetail{
				WorkOrder: model.WorkOrder{WoID: "wo-1", Status: "selesai"},
			}, nil
		},
	})

	err := svc.Finish("wo-1")
	assertError(t, err, "work order tidak dalam status sedang dikerjakan")
}
