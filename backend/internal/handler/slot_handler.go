package handler

import (
	"encoding/json"
	"net/http"

	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/service"
)

type SlotHandler struct {
	SlotService *service.SlotService
}

// GET /api/v1/admin/slots
func (h *SlotHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	slots, err := h.SlotService.GetAll()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil data slot")
		return
	}
	writeJSON(w, http.StatusOK, slots)
}

// PUT /api/v1/admin/slots/{id}
func (h *SlotHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	slotID := r.PathValue("id")

	var req model.SlotUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}

	if err := h.SlotService.UpdateStatus(slotID, req.Status); err != nil {
		switch err.Error() {
		case "slot tidak ditemukan":
			writeError(w, http.StatusNotFound, err.Error())
		case "slot tidak dapat diubah karena memiliki WO aktif":
			writeError(w, http.StatusConflict, err.Error())
		default:
			writeError(w, http.StatusBadRequest, err.Error())
		}
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Status slot berhasil diperbarui"})
}

// POST /api/v1/admin/slots/{id}/assign
func (h *SlotHandler) AssignWO(w http.ResponseWriter, r *http.Request) {
	slotID := r.PathValue("id")

	var req model.AssignRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}
	if req.WoID == "" {
		writeError(w, http.StatusBadRequest, "wo_id wajib diisi")
		return
	}

	if err := h.SlotService.AssignWO(slotID, req.WoID); err != nil {
		switch err.Error() {
		case "slot tidak ditemukan", "work order tidak ditemukan":
			writeError(w, http.StatusNotFound, err.Error())
		case "slot tidak tersedia":
			writeError(w, http.StatusConflict, err.Error())
		case "work order tidak dalam status yang valid untuk di-assign ke slot":
			writeError(w, http.StatusUnprocessableEntity, err.Error())
		default:
			writeError(w, http.StatusInternalServerError, "Gagal assign WO ke slot")
		}
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "WO berhasil di-assign ke slot"})
}

// GET /api/v1/admin/queue
func (h *SlotHandler) GetQueue(w http.ResponseWriter, r *http.Request) {
	items, err := h.SlotService.GetQueue()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil data antrian")
		return
	}
	writeJSON(w, http.StatusOK, items)
}
