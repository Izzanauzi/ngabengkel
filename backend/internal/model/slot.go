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

type SlotUpdateRequest struct {
	Status string `json:"status"`
}

type AssignRequest struct {
	WoID string `json:"wo_id"`
}

type QueueItem struct {
	QueueID     string    `json:"queue_id"`
	WoID        string    `json:"wo_id"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	NomorWO     string    `json:"nomor_wo"`
	Merek       string    `json:"merek"`
	Model       string    `json:"model"`
	NomorPolisi string    `json:"nomor_polisi"`
}
