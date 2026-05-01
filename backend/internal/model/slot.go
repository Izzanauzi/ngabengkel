package model

import "time"

type Slot struct {
	SlotID    string    `json:"slot_id"`
	NomorSlot string    `json:"nomor_slot"`
	Status    string    `json:"status"`
	WoID      *string   `json:"wo_id"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ScheduleResponse struct {
	Slots         []Slot `json:"slots"`
	JumlahAntrian int    `json:"jumlah_antrian"`
}
