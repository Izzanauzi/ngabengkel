package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/service"
)

type KendaraanHandler struct {
	KendaraanService *service.KendaraanService
}

// GET /api/v1/kendaraan
func (h *KendaraanHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	kendaraan, err := h.KendaraanService.GetAll(userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil data kendaraan")
		return
	}

	writeJSON(w, http.StatusOK, kendaraan)
}

// POST /api/v1/kendaraan
func (h *KendaraanHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req model.KendaraanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}

	result, err := h.KendaraanService.Create(userID, req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, result)
}

// PUT /api/v1/kendaraan/{kendaraan_id}
func (h *KendaraanHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	kendaraanID := strings.TrimPrefix(r.URL.Path, "/api/v1/kendaraan/")

	var req model.KendaraanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}

	result, err := h.KendaraanService.Update(userID, kendaraanID, req)
	if err != nil {
		if err.Error() == "akses ditolak" {
			writeError(w, http.StatusForbidden, err.Error())
			return
		}
		if err.Error() == "kendaraan tidak ditemukan" {
			writeError(w, http.StatusNotFound, err.Error())
			return
		}
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// DELETE /api/v1/kendaraan/{kendaraan_id}
func (h *KendaraanHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	kendaraanID := strings.TrimPrefix(r.URL.Path, "/api/v1/kendaraan/")

	if err := h.KendaraanService.Delete(userID, kendaraanID); err != nil {
		if err.Error() == "akses ditolak" {
			writeError(w, http.StatusForbidden, err.Error())
			return
		}
		if err.Error() == "kendaraan tidak ditemukan" {
			writeError(w, http.StatusNotFound, err.Error())
			return
		}
		if err.Error() == "kendaraan tidak dapat dihapus karena memiliki servis aktif" {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "Gagal menghapus kendaraan")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "Kendaraan berhasil dihapus",
	})
}

// GET /api/v1/kendaraan/{kendaraan_id}
func (h *KendaraanHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	kendaraanID := strings.TrimPrefix(r.URL.Path, "/api/v1/kendaraan/")

	k, err := h.KendaraanService.GetByID(userID, kendaraanID)
	if err != nil {
		if err.Error() == "akses ditolak" {
			writeError(w, http.StatusForbidden, err.Error())
			return
		}
		writeError(w, http.StatusNotFound, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, k)
}
