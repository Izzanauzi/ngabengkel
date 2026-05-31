package service

import (
	"errors"
	"testing"

	"github.com/ngabengkel/backend/internal/model"
)

func slotSvc(slotRepo *mockSlotRepo, woRepo *mockWorkOrderRepo) *SlotService {
	return &SlotService{SlotRepo: slotRepo, WorkOrderRepo: woRepo}
}

// ── UpdateStatus ──────────────────────────────────────────────────────────────

func TestSlotService_UpdateStatus_HappyPath(t *testing.T) {
	var capturedStatus string
	svc := slotSvc(
		&mockSlotRepo{
			updateStatusFn: func(_, status string) error {
				capturedStatus = status
				return nil
			},
		},
		&mockWorkOrderRepo{},
	)

	if err := svc.UpdateStatus("slot-1", "tidak_tersedia"); err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if capturedStatus != "tidak_tersedia" {
		t.Errorf("expect status tidak_tersedia, got %s", capturedStatus)
	}
}

func TestSlotService_UpdateStatus_TersediaValid(t *testing.T) {
	svc := slotSvc(&mockSlotRepo{}, &mockWorkOrderRepo{})

	if err := svc.UpdateStatus("slot-1", "tersedia"); err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
}

func TestSlotService_UpdateStatus_StatusTidakValid(t *testing.T) {
	svc := slotSvc(&mockSlotRepo{}, &mockWorkOrderRepo{})

	err := svc.UpdateStatus("slot-1", "terisi")
	assertError(t, err, "status tidak valid, gunakan: tersedia atau tidak_tersedia")
}

func TestSlotService_UpdateStatus_StatusKosong(t *testing.T) {
	svc := slotSvc(&mockSlotRepo{}, &mockWorkOrderRepo{})

	err := svc.UpdateStatus("slot-1", "")
	assertError(t, err, "status tidak valid, gunakan: tersedia atau tidak_tersedia")
}

func TestSlotService_UpdateStatus_AdaWOAktif(t *testing.T) {
	svc := slotSvc(
		&mockSlotRepo{
			hasActiveWOFn: func(_ string) (bool, error) { return true, nil },
		},
		&mockWorkOrderRepo{},
	)

	err := svc.UpdateStatus("slot-1", "tidak_tersedia")
	assertError(t, err, "slot tidak dapat diubah karena memiliki WO aktif")
}

// ── AssignWO ──────────────────────────────────────────────────────────────────

func TestSlotService_AssignWO_HappyPath(t *testing.T) {
	var capturedSlot, capturedWO string
	svc := slotSvc(
		&mockSlotRepo{
			findByIDFn: func(_ string) (*model.Slot, error) {
				return &model.Slot{SlotID: "slot-1", Status: "tersedia"}, nil
			},
			assignWOFn: func(slotID, woID string) error {
				capturedSlot = slotID
				capturedWO = woID
				return nil
			},
		},
		&mockWorkOrderRepo{
			findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
				return &model.WorkOrderDetail{
					WorkOrder: model.WorkOrder{WoID: "wo-1", Status: "dibuat"},
				}, nil
			},
		},
	)

	if err := svc.AssignWO("slot-1", "wo-1"); err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if capturedSlot != "slot-1" || capturedWO != "wo-1" {
		t.Errorf("expect assign slot-1 + wo-1, got slot=%s wo=%s", capturedSlot, capturedWO)
	}
}

func TestSlotService_AssignWO_WOSedangDikerjakan(t *testing.T) {
	svc := slotSvc(
		&mockSlotRepo{
			findByIDFn: func(_ string) (*model.Slot, error) {
				return &model.Slot{SlotID: "slot-1", Status: "tersedia"}, nil
			},
		},
		&mockWorkOrderRepo{
			findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
				return &model.WorkOrderDetail{
					WorkOrder: model.WorkOrder{WoID: "wo-1", Status: "sedang_dikerjakan"},
				}, nil
			},
		},
	)

	if err := svc.AssignWO("slot-1", "wo-1"); err != nil {
		t.Fatalf("status sedang_dikerjakan harus valid, got: %v", err)
	}
}

func TestSlotService_AssignWO_SlotTidakDitemukan(t *testing.T) {
	svc := slotSvc(
		&mockSlotRepo{
			findByIDFn: func(_ string) (*model.Slot, error) {
				return nil, errors.New("slot tidak ditemukan")
			},
		},
		&mockWorkOrderRepo{},
	)

	err := svc.AssignWO("slot-99", "wo-1")
	assertError(t, err, "slot tidak ditemukan")
}

func TestSlotService_AssignWO_SlotTidakTersedia(t *testing.T) {
	svc := slotSvc(
		&mockSlotRepo{
			findByIDFn: func(_ string) (*model.Slot, error) {
				return &model.Slot{SlotID: "slot-1", Status: "terisi"}, nil
			},
		},
		&mockWorkOrderRepo{},
	)

	err := svc.AssignWO("slot-1", "wo-1")
	assertError(t, err, "slot tidak tersedia")
}

func TestSlotService_AssignWO_SlotTidakTersediaStatus(t *testing.T) {
	svc := slotSvc(
		&mockSlotRepo{
			findByIDFn: func(_ string) (*model.Slot, error) {
				return &model.Slot{SlotID: "slot-1", Status: "tidak_tersedia"}, nil
			},
		},
		&mockWorkOrderRepo{},
	)

	err := svc.AssignWO("slot-1", "wo-1")
	assertError(t, err, "slot tidak tersedia")
}

func TestSlotService_AssignWO_WOTidakDitemukan(t *testing.T) {
	svc := slotSvc(
		&mockSlotRepo{
			findByIDFn: func(_ string) (*model.Slot, error) {
				return &model.Slot{SlotID: "slot-1", Status: "tersedia"}, nil
			},
		},
		&mockWorkOrderRepo{
			findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
				return nil, errors.New("work order tidak ditemukan")
			},
		},
	)

	err := svc.AssignWO("slot-1", "wo-99")
	assertError(t, err, "work order tidak ditemukan")
}

func TestSlotService_AssignWO_WOStatusTidakValid(t *testing.T) {
	svc := slotSvc(
		&mockSlotRepo{
			findByIDFn: func(_ string) (*model.Slot, error) {
				return &model.Slot{SlotID: "slot-1", Status: "tersedia"}, nil
			},
		},
		&mockWorkOrderRepo{
			findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
				return &model.WorkOrderDetail{
					WorkOrder: model.WorkOrder{WoID: "wo-1", Status: "selesai"},
				}, nil
			},
		},
	)

	err := svc.AssignWO("slot-1", "wo-1")
	assertError(t, err, "work order tidak dalam status yang valid untuk di-assign ke slot")
}
