package handler

import (
	"net/http"

	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/repository"
)

type ScheduleHandler struct {
	SlotRepo *repository.SlotRepository
}

// GET /api/v1/schedule
func (h *ScheduleHandler) GetSchedule(w http.ResponseWriter, r *http.Request) {
	// 1. Ambil semua slot
	slots, err := h.SlotRepo.GetAllSlots()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil data slot")
		return
	}

	// 2. Hitung jumlah antrian
	jumlahAntrian, err := h.SlotRepo.CountAntrian()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil data antrian")
		return
	}

	// 3. Kirim response
	writeJSON(w, http.StatusOK, model.ScheduleResponse{
		Slots:         slots,
		JumlahAntrian: jumlahAntrian,
	})
}
