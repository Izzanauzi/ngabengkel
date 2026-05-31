package model

type InventoryItem struct {
	InventoryID   string   `json:"inventory_id"`
	Tipe          *string  `json:"tipe"`
	Nama          string   `json:"nama"`
	KodePart      *string  `json:"kode_part"`
	Merek         *string  `json:"merek"`
	Kompatibilitas *string `json:"kompatibilitas"`
	Satuan        string   `json:"satuan"`
	Stok          int      `json:"stok"`
	HargaSatuan   float64  `json:"harga_satuan"`
}

type InventoryRequest struct {
	Tipe           *string `json:"tipe"`
	Nama           string  `json:"nama"`
	KodePart       *string `json:"kode_part"`
	Merek          *string `json:"merek"`
	Kompatibilitas *string `json:"kompatibilitas"`
	Satuan         string  `json:"satuan"`
	Stok           int     `json:"stok"`
	HargaSatuan    float64 `json:"harga_satuan"`
}

type WOItemRequest struct {
	InventoryID string `json:"inventory_id"`
	Jumlah      int    `json:"jumlah"`
}

type WOItem struct {
	WoItemID    string  `json:"wo_item_id"`
	WoID        string  `json:"wo_id"`
	InventoryID string  `json:"inventory_id"`
	NamaItem    string  `json:"nama_item"`
	Jumlah      int     `json:"jumlah"`
	HargaSatuan float64 `json:"harga_satuan"`
	Subtotal    float64 `json:"subtotal"`
}
