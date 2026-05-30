package handler

import (
	"encoding/json"
	"net/http"

	"github.com/ngabengkel/backend/internal/repository"
)

type AdminBookingHandler struct {
	BookingRepo repository.BookingRepositoryInterface
}

// GET /api/v1/admin/bookings
func (h *AdminBookingHandler) GetPending(w http.ResponseWriter, r *http.Request) {
	bookings, err := h.BookingRepo.GetPending()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil data booking")
		return
	}
	writeJSON(w, http.StatusOK, bookings)
}

// POST /api/v1/admin/bookings/{id}/accept
func (h *AdminBookingHandler) Accept(w http.ResponseWriter, r *http.Request) {
	bookingID := r.PathValue("id")

	b, err := h.BookingRepo.FindByID(bookingID)
	if err != nil {
		writeError(w, http.StatusNotFound, "Booking tidak ditemukan")
		return
	}
	if b.Status != "menunggu_konfirmasi" {
		writeError(w, http.StatusUnprocessableEntity, "Booking tidak dalam status menunggu konfirmasi")
		return
	}

	if err := h.BookingRepo.Accept(bookingID); err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal menyetujui booking")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Booking berhasil disetujui"})
}

// POST /api/v1/admin/bookings/{id}/reject
func (h *AdminBookingHandler) Reject(w http.ResponseWriter, r *http.Request) {
	bookingID := r.PathValue("id")

	var body struct {
		AlasanTolak string `json:"alasan_tolak"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}
	if body.AlasanTolak == "" {
		writeError(w, http.StatusBadRequest, "Alasan tolak wajib diisi")
		return
	}

	b, err := h.BookingRepo.FindByID(bookingID)
	if err != nil {
		writeError(w, http.StatusNotFound, "Booking tidak ditemukan")
		return
	}
	if b.Status != "menunggu_konfirmasi" {
		writeError(w, http.StatusUnprocessableEntity, "Booking tidak dalam status menunggu konfirmasi")
		return
	}

	if err := h.BookingRepo.Reject(bookingID, body.AlasanTolak); err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal menolak booking")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Booking berhasil ditolak"})
}
