package service

import (
	"errors"
	"testing"

	"github.com/ngabengkel/backend/internal/model"
)

// ── GetActive ─────────────────────────────────────────────────────────────────

func TestWorkOrderService_GetActive_HappyPath(t *testing.T) {
	want := []model.WorkOrder{
		{WoID: "wo-1", UserID: "u-1", Status: "sedang_dikerjakan"},
		{WoID: "wo-2", UserID: "u-1", Status: "menunggu_persetujuan"},
	}

	svc := &WorkOrderService{WorkOrderRepo: &mockWorkOrderRepo{
		getActiveByUserIDFn: func(_ string) ([]model.WorkOrder, error) { return want, nil },
	}}

	got, err := svc.GetActive("u-1")
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if len(got) != 2 {
		t.Errorf("expect 2 WO aktif, got %d", len(got))
	}
}

func TestWorkOrderService_GetActive_TidakPunyaWO(t *testing.T) {
	svc := &WorkOrderService{WorkOrderRepo: &mockWorkOrderRepo{
		getActiveByUserIDFn: func(_ string) ([]model.WorkOrder, error) {
			return []model.WorkOrder{}, nil
		},
	}}

	got, err := svc.GetActive("u-1")
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if len(got) != 0 {
		t.Errorf("expect 0 WO aktif, got %d", len(got))
	}
}

// ── GetHistori ────────────────────────────────────────────────────────────────

func TestWorkOrderService_GetHistori_HappyPath(t *testing.T) {
	want := []model.WorkOrder{
		{WoID: "wo-3", UserID: "u-1", Status: "lunas"},
		{WoID: "wo-4", UserID: "u-1", Status: "lunas"},
	}

	svc := &WorkOrderService{WorkOrderRepo: &mockWorkOrderRepo{
		getHistoriByUserIDFn: func(_ string) ([]model.WorkOrder, error) { return want, nil },
	}}

	got, err := svc.GetHistori("u-1")
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if len(got) != 2 {
		t.Errorf("expect 2 histori WO, got %d", len(got))
	}
}

func TestWorkOrderService_GetHistori_TidakPunyaHistori(t *testing.T) {
	svc := &WorkOrderService{WorkOrderRepo: &mockWorkOrderRepo{
		getHistoriByUserIDFn: func(_ string) ([]model.WorkOrder, error) {
			return []model.WorkOrder{}, nil
		},
	}}

	got, err := svc.GetHistori("u-1")
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if len(got) != 0 {
		t.Errorf("expect 0 histori WO, got %d", len(got))
	}
}

// ── GetByID ───────────────────────────────────────────────────────────────────

func TestWorkOrderService_GetByID_HappyPath(t *testing.T) {
	progress := []model.Progress{
		{ProgressID: "p-1", WoID: "wo-1", Tipe: "update"},
	}

	svc := &WorkOrderService{WorkOrderRepo: &mockWorkOrderRepo{
		findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
			return &model.WorkOrderDetail{
				WorkOrder: model.WorkOrder{WoID: "wo-1", UserID: "u-1", Status: "sedang_dikerjakan"},
				Progress:  []model.Progress{},
			}, nil
		},
		getProgressByWOIDFn: func(_ string) ([]model.Progress, error) { return progress, nil },
	}}

	detail, err := svc.GetByID("u-1", "wo-1")
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if detail.WoID != "wo-1" {
		t.Errorf("expect wo_id wo-1, got %s", detail.WoID)
	}
	if len(detail.Progress) != 1 {
		t.Errorf("expect 1 progress, got %d", len(detail.Progress))
	}
}

func TestWorkOrderService_GetByID_WOTidakDitemukan(t *testing.T) {
	svc := &WorkOrderService{WorkOrderRepo: &mockWorkOrderRepo{
		findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
			return nil, errors.New("work order tidak ditemukan")
		},
	}}

	_, err := svc.GetByID("u-1", "wo-99")
	assertError(t, err, "work order tidak ditemukan")
}

func TestWorkOrderService_GetByID_BukanMilikUser(t *testing.T) {
	svc := &WorkOrderService{WorkOrderRepo: &mockWorkOrderRepo{
		findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
			return &model.WorkOrderDetail{
				WorkOrder: model.WorkOrder{WoID: "wo-1", UserID: "u-other", Status: "sedang_dikerjakan"},
				Progress:  []model.Progress{},
			}, nil
		},
	}}

	_, err := svc.GetByID("u-1", "wo-1")
	assertError(t, err, "akses ditolak")
}
