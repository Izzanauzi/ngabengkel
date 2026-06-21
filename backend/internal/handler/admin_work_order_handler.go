package handler

import (
	"encoding/json"
	"net/http"

	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/service"
)

type AdminWorkOrderHandler struct {
	AdminWOService *service.AdminWorkOrderService
}

// GET /api/v1/admin/work-orders
func (h *AdminWorkOrderHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	wos, err := h.AdminWOService.GetAll()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil data work order")
		return
	}
	writeJSON(w, http.StatusOK, wos)
}

// GET /api/v1/admin/work-orders/{id}
func (h *AdminWorkOrderHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	woID := r.PathValue("id")
	detail, err := h.AdminWOService.GetByID(woID)
	if err != nil {
		if err.Error() == "work order tidak ditemukan" {
			writeError(w, http.StatusNotFound, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "Gagal mengambil detail work order")
		return
	}
	writeJSON(w, http.StatusOK, detail)
}

// POST /api/v1/admin/work-orders
func (h *AdminWorkOrderHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req model.WorkOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}
	wo, err := h.AdminWOService.Create(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, wo)
}

// POST /api/v1/admin/work-orders/{id}/start
func (h *AdminWorkOrderHandler) Start(w http.ResponseWriter, r *http.Request) {
	woID := r.PathValue("id")
	if err := h.AdminWOService.Start(woID); err != nil {
		switch err.Error() {
		case "work order tidak ditemukan":
			writeError(w, http.StatusNotFound, err.Error())
		case "work order tidak dalam status dibuat":
			writeError(w, http.StatusUnprocessableEntity, err.Error())
		default:
			writeError(w, http.StatusInternalServerError, "Gagal memulai work order")
		}
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Work order dimulai"})
}

// POST /api/v1/admin/work-orders/{id}/progress
func (h *AdminWorkOrderHandler) UploadProgress(w http.ResponseWriter, r *http.Request) {
	woID := r.PathValue("id")
	var req model.ProgressRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}
	if err := h.AdminWOService.UploadProgress(woID, req); err != nil {
		switch err.Error() {
		case "work order tidak ditemukan":
			writeError(w, http.StatusNotFound, err.Error())
		case "work order tidak dalam status sedang dikerjakan":
			writeError(w, http.StatusUnprocessableEntity, err.Error())
		default:
			writeError(w, http.StatusBadRequest, err.Error())
		}
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"message": "Progress berhasil ditambahkan"})
}

// POST /api/v1/admin/work-orders/{id}/suspend
func (h *AdminWorkOrderHandler) Suspend(w http.ResponseWriter, r *http.Request) {
	woID := r.PathValue("id")
	var req model.SuspendRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}
	if err := h.AdminWOService.Suspend(woID, req); err != nil {
		switch err.Error() {
		case "work order tidak ditemukan":
			writeError(w, http.StatusNotFound, err.Error())
		case "work order tidak dalam status sedang dikerjakan":
			writeError(w, http.StatusUnprocessableEntity, err.Error())
		default:
			writeError(w, http.StatusBadRequest, err.Error())
		}
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Work order disuspend, menunggu persetujuan customer"})
}

// POST /api/v1/admin/work-orders/{id}/finish
func (h *AdminWorkOrderHandler) Finish(w http.ResponseWriter, r *http.Request) {
	woID := r.PathValue("id")
	var req model.FinishRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}
	if err := h.AdminWOService.Finish(woID, req); err != nil {
		switch err.Error() {
		case "work order tidak ditemukan":
			writeError(w, http.StatusNotFound, err.Error())
		case "work order tidak dalam status sedang dikerjakan":
			writeError(w, http.StatusUnprocessableEntity, err.Error())
		default:
			writeError(w, http.StatusInternalServerError, "Gagal menyelesaikan work order")
		}
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Work order selesai"})
}

// PUT /api/v1/admin/work-orders/{id}/biaya
func (h *AdminWorkOrderHandler) UpdateBiaya(w http.ResponseWriter, r *http.Request) {
	woID := r.PathValue("id")
	var req model.UpdateBiayaRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}
	if err := h.AdminWOService.UpdateBiaya(woID, req); err != nil {
		if err.Error() == "work order tidak ditemukan" {
			writeError(w, http.StatusNotFound, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "Gagal update biaya work order")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Biaya work order berhasil diperbarui"})
}
