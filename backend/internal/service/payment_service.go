package service

import (
	"errors"

	"github.com/google/uuid"
	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/repository"
)

type PaymentService struct {
	TransactionRepo repository.TransactionRepositoryInterface
	WorkOrderRepo   repository.WorkOrderRepositoryInterface
	InventoryRepo   repository.InventoryRepositoryInterface
}

// GenerateInvoice — hitung tagihan untuk WO yang sudah selesai
func (s *PaymentService) GenerateInvoice(woID string) (*model.Invoice, error) {
	detail, err := s.WorkOrderRepo.FindByID(woID)
	if err != nil {
		return nil, err
	}
	if detail.Status != "selesai" {
		return nil, errors.New("work order belum selesai")
	}

	items, err := s.InventoryRepo.GetWOItems(woID)
	if err != nil {
		return nil, err
	}

	var totalMaterial float64
	for _, item := range items {
		totalMaterial += item.Subtotal
	}

	var biayaJasa float64
	if detail.BiayaJasa != nil {
		biayaJasa = *detail.BiayaJasa
	}

	return &model.Invoice{
		WoID:          detail.WoID,
		NomorWO:       detail.NomorWO,
		BiayaJasa:     biayaJasa,
		TotalMaterial: totalMaterial,
		TotalBiaya:    biayaJasa + totalMaterial,
		Items:         items,
	}, nil
}

// ConfirmPayment — konfirmasi pembayaran dan ubah status WO ke lunas
func (s *PaymentService) ConfirmPayment(woID string, req model.PaymentRequest) (*model.Transaction, error) {
	if req.MetodePembayaran == "" {
		return nil, errors.New("metode pembayaran wajib diisi")
	}
	if req.TotalBiaya <= 0 {
		return nil, errors.New("total biaya harus lebih dari 0")
	}

	detail, err := s.WorkOrderRepo.FindByID(woID)
	if err != nil {
		return nil, err
	}
	if detail.Status == "lunas" {
		return nil, errors.New("work order sudah lunas")
	}
	if detail.Status != "selesai" {
		return nil, errors.New("work order belum selesai")
	}

	t := &model.Transaction{
		TransactionID:    uuid.New().String(),
		WoID:             woID,
		TotalBiaya:       req.TotalBiaya,
		MetodePembayaran: req.MetodePembayaran,
		Status:           "lunas",
	}
	if err := s.TransactionRepo.Create(t); err != nil {
		return nil, err
	}
	if err := s.WorkOrderRepo.UpdateStatus(woID, "lunas"); err != nil {
		return nil, err
	}
	return t, nil
}

// GetReport — rekap transaksi dalam periode
func (s *PaymentService) GetReport(from, to string) (*model.TransactionReport, error) {
	if from == "" || to == "" {
		return nil, errors.New("parameter from dan to wajib diisi")
	}

	transactions, err := s.TransactionRepo.GetByPeriode(from, to)
	if err != nil {
		return nil, err
	}

	var totalPendapatan float64
	for _, t := range transactions {
		totalPendapatan += t.TotalBiaya
	}

	return &model.TransactionReport{
		PeriodeDari:     from,
		PeriodeSampai:   to,
		TotalPendapatan: totalPendapatan,
		JumlahTransaksi: len(transactions),
		Transactions:    transactions,
	}, nil
}
