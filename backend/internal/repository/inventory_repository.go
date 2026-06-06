package repository

import (
	"database/sql"
	"errors"

	"github.com/ngabengkel/backend/internal/model"
)

type InventoryRepository struct {
	DB *sql.DB
}

// GetAll — ambil semua item inventori
func (r *InventoryRepository) GetAll() ([]model.InventoryItem, error) {
	rows, err := r.DB.Query(`
		SELECT inventory_id, tipe, nama, kode_part, merek,
		       kompatibilitas, satuan, stok, harga_satuan
		FROM ngabengkel.inventory_items
		ORDER BY nama ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []model.InventoryItem{}
	for rows.Next() {
		var item model.InventoryItem
		if err := rows.Scan(
			&item.InventoryID, &item.Tipe, &item.Nama, &item.KodePart, &item.Merek,
			&item.Kompatibilitas, &item.Satuan, &item.Stok, &item.HargaSatuan,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

// FindByID — cari item inventori by ID
func (r *InventoryRepository) FindByID(inventoryID string) (*model.InventoryItem, error) {
	item := &model.InventoryItem{}
	err := r.DB.QueryRow(`
		SELECT inventory_id, tipe, nama, kode_part, merek,
		       kompatibilitas, satuan, stok, harga_satuan
		FROM ngabengkel.inventory_items
		WHERE inventory_id = $1
	`, inventoryID).Scan(
		&item.InventoryID, &item.Tipe, &item.Nama, &item.KodePart, &item.Merek,
		&item.Kompatibilitas, &item.Satuan, &item.Stok, &item.HargaSatuan,
	)
	if err == sql.ErrNoRows {
		return nil, errors.New("item inventori tidak ditemukan")
	}
	if err != nil {
		return nil, err
	}
	return item, nil
}

// Create — tambah item inventori baru
func (r *InventoryRepository) Create(item *model.InventoryItem) error {
	_, err := r.DB.Exec(`
		INSERT INTO ngabengkel.inventory_items
			(inventory_id, tipe, nama, kode_part, merek,
			 kompatibilitas, satuan, stok, harga_satuan)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`, item.InventoryID, item.Tipe, item.Nama, item.KodePart, item.Merek,
		item.Kompatibilitas, item.Satuan, item.Stok, item.HargaSatuan,
	)
	return err
}

// Update — update data item inventori
func (r *InventoryRepository) Update(item *model.InventoryItem) error {
	result, err := r.DB.Exec(`
		UPDATE ngabengkel.inventory_items
		SET tipe = $1, nama = $2, kode_part = $3, merek = $4,
		    kompatibilitas = $5, satuan = $6, stok = $7, harga_satuan = $8
		WHERE inventory_id = $9
	`, item.Tipe, item.Nama, item.KodePart, item.Merek,
		item.Kompatibilitas, item.Satuan, item.Stok, item.HargaSatuan,
		item.InventoryID,
	)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.New("item inventori tidak ditemukan")
	}
	return nil
}

// Delete — hapus item inventori
func (r *InventoryRepository) Delete(inventoryID string) error {
	result, err := r.DB.Exec(`
		DELETE FROM ngabengkel.inventory_items WHERE inventory_id = $1
	`, inventoryID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.New("item inventori tidak ditemukan")
	}
	return nil
}

// UpdateStok — kurangi stok sebesar jumlah
func (r *InventoryRepository) UpdateStok(inventoryID string, jumlah int) error {
	_, err := r.DB.Exec(`
		UPDATE ngabengkel.inventory_items
		SET stok = stok - $1
		WHERE inventory_id = $2
	`, jumlah, inventoryID)
	return err
}

// AddItemToWO — tambah item ke work order
func (r *InventoryRepository) AddItemToWO(woItem *model.WOItem) error {
	_, err := r.DB.Exec(`
		INSERT INTO ngabengkel.wo_items
			(wo_item_id, wo_id, inventory_id, nama_item, jumlah, harga_satuan, subtotal)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, woItem.WoItemID, woItem.WoID, woItem.InventoryID,
		woItem.NamaItem, woItem.Jumlah, woItem.HargaSatuan, woItem.Subtotal,
	)
	return err
}

// GetWOItems — ambil semua item dalam satu work order
func (r *InventoryRepository) GetWOItems(woID string) ([]model.WOItem, error) {
	rows, err := r.DB.Query(`
		SELECT wo_item_id, wo_id, inventory_id, nama_item,
		       jumlah, harga_satuan, subtotal
		FROM ngabengkel.wo_items
		WHERE wo_id = $1
		ORDER BY wo_item_id ASC
	`, woID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []model.WOItem{}
	for rows.Next() {
		var item model.WOItem
		if err := rows.Scan(
			&item.WoItemID, &item.WoID, &item.InventoryID, &item.NamaItem,
			&item.Jumlah, &item.HargaSatuan, &item.Subtotal,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}
