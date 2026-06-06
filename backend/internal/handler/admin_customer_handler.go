package handler

import (
	"encoding/json"
	"net/http"

	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/service"
)

type AdminCustomerHandler struct {
	AdminCustomerService *service.AdminCustomerService
}

// GET /api/v1/admin/customers
func (h *AdminCustomerHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	customers, err := h.AdminCustomerService.GetAll()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil data customer")
		return
	}
	writeJSON(w, http.StatusOK, customers)
}

// GET /api/v1/admin/customers/{id}
func (h *AdminCustomerHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("id")
	c, err := h.AdminCustomerService.GetByID(userID)
	if err != nil {
		if err.Error() == "customer tidak ditemukan" {
			writeError(w, http.StatusNotFound, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "Gagal mengambil data customer")
		return
	}
	writeJSON(w, http.StatusOK, c)
}

// POST /api/v1/admin/customers
func (h *AdminCustomerHandler) CreateWalkIn(w http.ResponseWriter, r *http.Request) {
	var req model.AdminCreateCustomerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}
	user, err := h.AdminCustomerService.CreateWalkIn(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, user)
}

// PUT /api/v1/admin/customers/{id}
func (h *AdminCustomerHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("id")
	var req struct {
		Nama    string `json:"nama"`
		Telepon string `json:"telepon"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}
	if err := h.AdminCustomerService.Update(userID, req.Nama, req.Telepon); err != nil {
		if err.Error() == "customer tidak ditemukan" {
			writeError(w, http.StatusNotFound, err.Error())
			return
		}
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Data customer berhasil diperbarui"})
}

// GET /api/v1/admin/kendaraan
func (h *AdminCustomerHandler) GetAllKendaraan(w http.ResponseWriter, r *http.Request) {
	kendaraan, err := h.AdminCustomerService.GetAllKendaraan()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil data kendaraan")
		return
	}
	writeJSON(w, http.StatusOK, kendaraan)
}

// POST /api/v1/admin/customers/{id}/kendaraan
func (h *AdminCustomerHandler) AddKendaraan(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("id")

	var req model.KendaraanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}

	k, err := h.AdminCustomerService.AddKendaraanForCustomer(userID, req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, k)
}

// DELETE /api/v1/admin/customers/{id}
func (h *AdminCustomerHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("id")
	if err := h.AdminCustomerService.Delete(userID); err != nil {
		switch err.Error() {
		case "customer tidak ditemukan":
			writeError(w, http.StatusNotFound, err.Error())
		case "customer tidak dapat dihapus karena memiliki servis aktif":
			writeError(w, http.StatusConflict, err.Error())
		default:
			writeError(w, http.StatusInternalServerError, "Gagal menghapus customer")
		}
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Customer berhasil dihapus"})
}
