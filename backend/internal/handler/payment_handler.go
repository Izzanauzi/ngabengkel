package handler

import (
	"encoding/json"
	"net/http"

	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/service"
)

type PaymentHandler struct {
	PaymentService *service.PaymentService
}

// GET /api/v1/admin/work-orders/{id}/invoice
func (h *PaymentHandler) GetInvoice(w http.ResponseWriter, r *http.Request) {
	woID := r.PathValue("id")
	invoice, err := h.PaymentService.GenerateInvoice(woID)
	if err != nil {
		switch err.Error() {
		case "work order tidak ditemukan":
			writeError(w, http.StatusNotFound, err.Error())
		case "work order belum selesai":
			writeError(w, http.StatusUnprocessableEntity, err.Error())
		default:
			writeError(w, http.StatusInternalServerError, "Gagal generate invoice")
		}
		return
	}
	writeJSON(w, http.StatusOK, invoice)
}

// POST /api/v1/admin/work-orders/{id}/payment
func (h *PaymentHandler) ConfirmPayment(w http.ResponseWriter, r *http.Request) {
	woID := r.PathValue("id")

	var req model.PaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}

	t, err := h.PaymentService.ConfirmPayment(woID, req)
	if err != nil {
		switch err.Error() {
		case "work order tidak ditemukan":
			writeError(w, http.StatusNotFound, err.Error())
		case "work order belum selesai":
			writeError(w, http.StatusUnprocessableEntity, err.Error())
		case "work order sudah lunas":
			writeError(w, http.StatusConflict, err.Error())
		default:
			writeError(w, http.StatusBadRequest, err.Error())
		}
		return
	}
	writeJSON(w, http.StatusCreated, t)
}

// GET /api/v1/admin/reports/customers/{id}/history
func (h *PaymentHandler) GetCustomerHistory(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("id")
	history, err := h.PaymentService.GetCustomerHistory(userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil histori servis customer")
		return
	}
	writeJSON(w, http.StatusOK, history)
}

// GET /api/v1/admin/reports/transactions?from=&to=
func (h *PaymentHandler) GetReport(w http.ResponseWriter, r *http.Request) {
	from := r.URL.Query().Get("from")
	to := r.URL.Query().Get("to")

	report, err := h.PaymentService.GetReport(from, to)
	if err != nil {
		if err.Error() == "parameter from dan to wajib diisi" {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "Gagal mengambil laporan transaksi")
		return
	}
	writeJSON(w, http.StatusOK, report)
}
