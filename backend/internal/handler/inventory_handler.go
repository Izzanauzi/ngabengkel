package handler

import (
	"encoding/json"
	"net/http"

	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/service"
)

type InventoryHandler struct {
	InventoryService *service.InventoryService
}

// GET /api/v1/admin/inventory
func (h *InventoryHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	items, err := h.InventoryService.GetAll()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil data inventori")
		return
	}
	writeJSON(w, http.StatusOK, items)
}

// GET /api/v1/admin/inventory/{id}
func (h *InventoryHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	inventoryID := r.PathValue("id")
	item, err := h.InventoryService.GetByID(inventoryID)
	if err != nil {
		if err.Error() == "item inventori tidak ditemukan" {
			writeError(w, http.StatusNotFound, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "Gagal mengambil data inventori")
		return
	}
	writeJSON(w, http.StatusOK, item)
}

// POST /api/v1/admin/inventory
func (h *InventoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req model.InventoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}
	item, err := h.InventoryService.Create(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

// PUT /api/v1/admin/inventory/{id}
func (h *InventoryHandler) Update(w http.ResponseWriter, r *http.Request) {
	inventoryID := r.PathValue("id")
	var req model.InventoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}
	item, err := h.InventoryService.Update(inventoryID, req)
	if err != nil {
		if err.Error() == "item inventori tidak ditemukan" {
			writeError(w, http.StatusNotFound, err.Error())
			return
		}
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, item)
}

// DELETE /api/v1/admin/inventory/{id}
func (h *InventoryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	inventoryID := r.PathValue("id")
	if err := h.InventoryService.Delete(inventoryID); err != nil {
		if err.Error() == "item inventori tidak ditemukan" {
			writeError(w, http.StatusNotFound, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "Gagal menghapus item inventori")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Item inventori berhasil dihapus"})
}

// POST /api/v1/admin/work-orders/{id}/items
func (h *InventoryHandler) AddToWO(w http.ResponseWriter, r *http.Request) {
	woID := r.PathValue("id")
	var req model.WOItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}
	woItem, err := h.InventoryService.AddToWO(woID, req)
	if err != nil {
		switch err.Error() {
		case "item inventori tidak ditemukan":
			writeError(w, http.StatusNotFound, err.Error())
		case "stok tidak mencukupi":
			writeError(w, http.StatusConflict, err.Error())
		default:
			writeError(w, http.StatusBadRequest, err.Error())
		}
		return
	}
	writeJSON(w, http.StatusCreated, woItem)
}
