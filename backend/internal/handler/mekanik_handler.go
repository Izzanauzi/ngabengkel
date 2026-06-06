package handler

import (
	"encoding/json"
	"net/http"

	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/service"
)

type MekanikHandler struct {
	MekanikService *service.MekanikService
}

// GET /api/v1/admin/mekaniks
func (h *MekanikHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	mekaniks, err := h.MekanikService.GetAll()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil data mekanik")
		return
	}
	writeJSON(w, http.StatusOK, mekaniks)
}

// GET /api/v1/admin/mekaniks/{id}
func (h *MekanikHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	mekanikID := r.PathValue("id")
	m, err := h.MekanikService.GetByID(mekanikID)
	if err != nil {
		if err.Error() == "mekanik tidak ditemukan" {
			writeError(w, http.StatusNotFound, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "Gagal mengambil data mekanik")
		return
	}
	writeJSON(w, http.StatusOK, m)
}

// POST /api/v1/admin/mekaniks
func (h *MekanikHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req model.MekanikRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}

	m, err := h.MekanikService.Create(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, m)
}

// PUT /api/v1/admin/mekaniks/{id}
func (h *MekanikHandler) Update(w http.ResponseWriter, r *http.Request) {
	mekanikID := r.PathValue("id")

	var req model.MekanikRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}

	m, err := h.MekanikService.Update(mekanikID, req)
	if err != nil {
		if err.Error() == "mekanik tidak ditemukan" {
			writeError(w, http.StatusNotFound, err.Error())
			return
		}
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, m)
}

// DELETE /api/v1/admin/mekaniks/{id}
func (h *MekanikHandler) Delete(w http.ResponseWriter, r *http.Request) {
	mekanikID := r.PathValue("id")

	if err := h.MekanikService.Delete(mekanikID); err != nil {
		switch err.Error() {
		case "mekanik tidak ditemukan":
			writeError(w, http.StatusNotFound, err.Error())
		case "mekanik tidak dapat dihapus karena memiliki servis aktif":
			writeError(w, http.StatusConflict, err.Error())
		default:
			writeError(w, http.StatusInternalServerError, "Gagal menghapus mekanik")
		}
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Mekanik berhasil dihapus"})
}
