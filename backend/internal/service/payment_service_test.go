package service

import (
	"errors"
	"testing"

	"github.com/ngabengkel/backend/internal/model"
)

func paymentSvc(txRepo *mockTransactionRepo, woRepo *mockWorkOrderRepo, invRepo *mockInventoryRepo) *PaymentService {
	return &PaymentService{
		TransactionRepo: txRepo,
		WorkOrderRepo:   woRepo,
		InventoryRepo:   invRepo,
	}
}

// ── GenerateInvoice ───────────────────────────────────────────────────────────

func TestPaymentService_GenerateInvoice_HappyPath(t *testing.T) {
	biayaJasa := 100000.0
	svc := paymentSvc(
		&mockTransactionRepo{},
		&mockWorkOrderRepo{
			findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
				return &model.WorkOrderDetail{
					WorkOrder: model.WorkOrder{
						WoID:      "wo-1",
						NomorWO:   "WO-20260101-001",
						Status:    "selesai",
						BiayaJasa: &biayaJasa,
					},
				}, nil
			},
		},
		&mockInventoryRepo{
			getWOItemsFn: func(_ string) ([]model.WOItem, error) {
				return []model.WOItem{
					{WoItemID: "wi-1", Jumlah: 2, HargaSatuan: 50000, Subtotal: 100000},
					{WoItemID: "wi-2", Jumlah: 1, HargaSatuan: 75000, Subtotal: 75000},
				}, nil
			},
		},
	)

	invoice, err := svc.GenerateInvoice("wo-1")
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if invoice.BiayaJasa != 100000 {
		t.Errorf("expect biaya_jasa 100000, got %.0f", invoice.BiayaJasa)
	}
	if invoice.TotalMaterial != 175000 {
		t.Errorf("expect total_material 175000, got %.0f", invoice.TotalMaterial)
	}
	if invoice.TotalBiaya != 275000 {
		t.Errorf("expect total_biaya 275000, got %.0f", invoice.TotalBiaya)
	}
	if len(invoice.Items) != 2 {
		t.Errorf("expect 2 items, got %d", len(invoice.Items))
	}
	if invoice.NomorWO != "WO-20260101-001" {
		t.Errorf("expect nomor_wo WO-20260101-001, got %s", invoice.NomorWO)
	}
}

func TestPaymentService_GenerateInvoice_TanpaBiayaJasa(t *testing.T) {
	svc := paymentSvc(
		&mockTransactionRepo{},
		&mockWorkOrderRepo{
			findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
				return &model.WorkOrderDetail{
					WorkOrder: model.WorkOrder{
						WoID:      "wo-1",
						Status:    "selesai",
						BiayaJasa: nil,
					},
				}, nil
			},
		},
		&mockInventoryRepo{
			getWOItemsFn: func(_ string) ([]model.WOItem, error) {
				return []model.WOItem{
					{Subtotal: 50000},
				}, nil
			},
		},
	)

	invoice, err := svc.GenerateInvoice("wo-1")
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if invoice.BiayaJasa != 0 {
		t.Errorf("expect biaya_jasa 0 jika nil, got %.0f", invoice.BiayaJasa)
	}
	if invoice.TotalBiaya != 50000 {
		t.Errorf("expect total_biaya 50000, got %.0f", invoice.TotalBiaya)
	}
}

func TestPaymentService_GenerateInvoice_WOBelumSelesai(t *testing.T) {
	svc := paymentSvc(
		&mockTransactionRepo{},
		&mockWorkOrderRepo{
			findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
				return &model.WorkOrderDetail{
					WorkOrder: model.WorkOrder{WoID: "wo-1", Status: "sedang_dikerjakan"},
				}, nil
			},
		},
		&mockInventoryRepo{},
	)

	_, err := svc.GenerateInvoice("wo-1")
	assertError(t, err, "work order belum selesai")
}

func TestPaymentService_GenerateInvoice_WOTidakDitemukan(t *testing.T) {
	svc := paymentSvc(
		&mockTransactionRepo{},
		&mockWorkOrderRepo{
			findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
				return nil, errors.New("work order tidak ditemukan")
			},
		},
		&mockInventoryRepo{},
	)

	_, err := svc.GenerateInvoice("wo-99")
	assertError(t, err, "work order tidak ditemukan")
}

// ── ConfirmPayment ────────────────────────────────────────────────────────────

func TestPaymentService_ConfirmPayment_HappyPath(t *testing.T) {
	var capturedWOStatus string
	svc := paymentSvc(
		&mockTransactionRepo{},
		&mockWorkOrderRepo{
			findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
				return &model.WorkOrderDetail{
					WorkOrder: model.WorkOrder{WoID: "wo-1", Status: "selesai"},
				}, nil
			},
			updateStatusFn: func(_, status string) error {
				capturedWOStatus = status
				return nil
			},
		},
		&mockInventoryRepo{},
	)

	tx, err := svc.ConfirmPayment("wo-1", model.PaymentRequest{
		MetodePembayaran: "tunai",
		TotalBiaya:       275000,
	})
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if tx.TransactionID == "" {
		t.Error("expect transaction_id tidak kosong")
	}
	if tx.Status != "lunas" {
		t.Errorf("expect status lunas, got %s", tx.Status)
	}
	if capturedWOStatus != "lunas" {
		t.Errorf("expect WO diupdate ke lunas, got %s", capturedWOStatus)
	}
}

func TestPaymentService_ConfirmPayment_WOBelumSelesai(t *testing.T) {
	svc := paymentSvc(
		&mockTransactionRepo{},
		&mockWorkOrderRepo{
			findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
				return &model.WorkOrderDetail{
					WorkOrder: model.WorkOrder{WoID: "wo-1", Status: "sedang_dikerjakan"},
				}, nil
			},
		},
		&mockInventoryRepo{},
	)

	_, err := svc.ConfirmPayment("wo-1", model.PaymentRequest{
		MetodePembayaran: "tunai",
		TotalBiaya:       100000,
	})
	assertError(t, err, "work order belum selesai")
}

func TestPaymentService_ConfirmPayment_WOSudahLunas(t *testing.T) {
	svc := paymentSvc(
		&mockTransactionRepo{},
		&mockWorkOrderRepo{
			findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
				return &model.WorkOrderDetail{
					WorkOrder: model.WorkOrder{WoID: "wo-1", Status: "lunas"},
				}, nil
			},
		},
		&mockInventoryRepo{},
	)

	_, err := svc.ConfirmPayment("wo-1", model.PaymentRequest{
		MetodePembayaran: "tunai",
		TotalBiaya:       100000,
	})
	assertError(t, err, "work order sudah lunas")
}

func TestPaymentService_ConfirmPayment_MetodeKosong(t *testing.T) {
	svc := paymentSvc(&mockTransactionRepo{}, &mockWorkOrderRepo{}, &mockInventoryRepo{})

	_, err := svc.ConfirmPayment("wo-1", model.PaymentRequest{MetodePembayaran: "", TotalBiaya: 100000})
	assertError(t, err, "metode pembayaran wajib diisi")
}

func TestPaymentService_ConfirmPayment_WOTidakDitemukan(t *testing.T) {
	svc := paymentSvc(
		&mockTransactionRepo{},
		&mockWorkOrderRepo{
			findByIDFn: func(_ string) (*model.WorkOrderDetail, error) {
				return nil, errors.New("work order tidak ditemukan")
			},
		},
		&mockInventoryRepo{},
	)

	_, err := svc.ConfirmPayment("wo-99", model.PaymentRequest{
		MetodePembayaran: "tunai",
		TotalBiaya:       100000,
	})
	assertError(t, err, "work order tidak ditemukan")
}

// ── GetReport ─────────────────────────────────────────────────────────────────

func TestPaymentService_GetReport_HappyPath(t *testing.T) {
	svc := paymentSvc(
		&mockTransactionRepo{
			getByPeriodeFn: func(_, _ string) ([]model.Transaction, error) {
				return []model.Transaction{
					{TransactionID: "tx-1", TotalBiaya: 150000, Status: "lunas"},
					{TransactionID: "tx-2", TotalBiaya: 200000, Status: "lunas"},
				}, nil
			},
		},
		&mockWorkOrderRepo{},
		&mockInventoryRepo{},
	)

	report, err := svc.GetReport("2026-01-01", "2026-01-31")
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if report.JumlahTransaksi != 2 {
		t.Errorf("expect 2 transaksi, got %d", report.JumlahTransaksi)
	}
	if report.TotalPendapatan != 350000 {
		t.Errorf("expect total_pendapatan 350000, got %.0f", report.TotalPendapatan)
	}
	if report.PeriodeDari != "2026-01-01" {
		t.Errorf("expect periode_dari 2026-01-01, got %s", report.PeriodeDari)
	}
}

func TestPaymentService_GetReport_ParameterKosong(t *testing.T) {
	svc := paymentSvc(&mockTransactionRepo{}, &mockWorkOrderRepo{}, &mockInventoryRepo{})

	_, err := svc.GetReport("", "2026-01-31")
	assertError(t, err, "parameter from dan to wajib diisi")
}

func TestPaymentService_GetReport_KosongTransaksi(t *testing.T) {
	svc := paymentSvc(&mockTransactionRepo{}, &mockWorkOrderRepo{}, &mockInventoryRepo{})

	report, err := svc.GetReport("2026-01-01", "2026-01-31")
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if report.JumlahTransaksi != 0 {
		t.Errorf("expect 0 transaksi, got %d", report.JumlahTransaksi)
	}
	if report.TotalPendapatan != 0 {
		t.Errorf("expect 0 pendapatan, got %.0f", report.TotalPendapatan)
	}
}
