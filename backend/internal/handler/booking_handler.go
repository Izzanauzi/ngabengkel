package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/service"
)

type BookingHandler struct {
	BookingService *service.BookingService
}

// GET /api/v1/bookings
func (h *BookingHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	bookings, err := h.BookingService.GetAll(userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil data booking")
		return
	}

	writeJSON(w, http.StatusOK, bookings)
}

// POST /api/v1/bookings
func (h *BookingHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req model.BookingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}

	result, err := h.BookingService.Create(userID, req)
	if err != nil {
		if err.Error() == "akses ditolak" {
			writeError(w, http.StatusForbidden, err.Error())
			return
		}
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, result)
}

// DELETE /api/v1/bookings/{booking_id}
func (h *BookingHandler) Cancel(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	bookingID := strings.TrimPrefix(r.URL.Path, "/api/v1/bookings/")

	if err := h.BookingService.Cancel(userID, bookingID); err != nil {
		if err.Error() == "akses ditolak" {
			writeError(w, http.StatusForbidden, err.Error())
			return
		}
		if err.Error() == "booking tidak ditemukan" {
			writeError(w, http.StatusNotFound, err.Error())
			return
		}
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "Booking berhasil dibatalkan",
	})
}
