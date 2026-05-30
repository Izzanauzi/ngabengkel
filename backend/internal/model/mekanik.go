package model

type Mekanik struct {
	MekanikID string  `json:"mekanik_id"`
	Nama      string  `json:"nama"`
	Telepon   *string `json:"telepon"`
	Keahlian  *string `json:"keahlian"`
	Status    string  `json:"status"`
}

type MekanikRequest struct {
	Nama     string  `json:"nama"`
	Telepon  *string `json:"telepon"`
	Keahlian *string `json:"keahlian"`
	Status   string  `json:"status"`
}
