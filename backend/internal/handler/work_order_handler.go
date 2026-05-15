package handler

import (
	"net/http"
	"strings"

	"github.com/ngabengkel/backend/internal/service"
)

// POST /api/v1/work-orders/{id}/approve-action
func (h *WorkOrderHandler) ApproveAction(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	woID := r.PathValue("id")

	if err := h.WorkOrderService.ApproveAction(userID, woID); err != nil {
		switch err.Error() {
		case "akses ditolak":
			writeError(w, http.StatusForbidden, err.Error())
		case "work order tidak ditemukan":
			writeError(w, http.StatusNotFound, err.Error())
		case "work order tidak dalam status menunggu persetujuan":
			writeError(w, http.StatusUnprocessableEntity, err.Error())
		default:
			writeError(w, http.StatusInternalServerError, "Gagal menyetujui tindakan")
		}
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Tindakan disetujui, work order dilanjutkan"})
}

// POST /api/v1/work-orders/{id}/reject-action
func (h *WorkOrderHandler) RejectAction(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	woID := r.PathValue("id")

	if err := h.WorkOrderService.RejectAction(userID, woID); err != nil {
		switch err.Error() {
		case "akses ditolak":
			writeError(w, http.StatusForbidden, err.Error())
		case "work order tidak ditemukan":
			writeError(w, http.StatusNotFound, err.Error())
		case "work order tidak dalam status menunggu persetujuan":
			writeError(w, http.StatusUnprocessableEntity, err.Error())
		default:
			writeError(w, http.StatusInternalServerError, "Gagal menolak tindakan")
		}
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Tindakan ditolak"})
}

type WorkOrderHandler struct {
	WorkOrderService *service.WorkOrderService
}

// GET /api/v1/work-orders?type=active|histori
func (h *WorkOrderHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	switch r.URL.Query().Get("type") {
	case "active":
		wos, err := h.WorkOrderService.GetActive(userID)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "Gagal mengambil data work order")
			return
		}
		writeJSON(w, http.StatusOK, wos)

	case "histori":
		wos, err := h.WorkOrderService.GetHistori(userID)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "Gagal mengambil histori servis")
			return
		}
		writeJSON(w, http.StatusOK, wos)

	default:
		writeError(w, http.StatusBadRequest, "Parameter type tidak valid, gunakan: active atau histori")
	}
}

// GET /api/v1/work-orders/{id}
func (h *WorkOrderHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	woID := strings.TrimPrefix(r.URL.Path, "/api/v1/work-orders/")

	detail, err := h.WorkOrderService.GetByID(userID, woID)
	if err != nil {
		if err.Error() == "akses ditolak" {
			writeError(w, http.StatusForbidden, err.Error())
			return
		}
		if err.Error() == "work order tidak ditemukan" {
			writeError(w, http.StatusNotFound, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "Gagal mengambil detail work order")
		return
	}

	writeJSON(w, http.StatusOK, detail)
}
