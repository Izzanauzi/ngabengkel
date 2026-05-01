package repository

import (
	"database/sql"
	"errors"

	"github.com/ngabengkel/backend/internal/model"
)

type UserRepository struct {
	DB *sql.DB
}

// FindByEmail — cari user berdasarkan email
func (r *UserRepository) FindByEmail(email string) (*model.User, error) {
	query := `
        SELECT user_id, nama, email, telepon, password, role, created_at
        FROM ngabengkel.users
        WHERE email = $1
        LIMIT 1
    `

	user := &model.User{}
	err := r.DB.QueryRow(query, email).Scan(
		&user.UserID,
		&user.Nama,
		&user.Email,
		&user.Telepon,
		&user.Password,
		&user.Role,
		&user.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, errors.New("user tidak ditemukan")
	}
	if err != nil {
		return nil, err
	}

	return user, nil
}

// EmailExists — cek apakah email sudah dipakai
func (r *UserRepository) EmailExists(email string) (bool, error) {
	var count int
	err := r.DB.QueryRow(
		"SELECT COUNT(*) FROM ngabengkel.users WHERE email = $1", email,
	).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// TeleponExists — cek apakah nomor telepon sudah dipakai
func (r *UserRepository) TeleponExists(telepon string) (bool, error) {
	var count int
	err := r.DB.QueryRow(
		"SELECT COUNT(*) FROM ngabengkel.users WHERE telepon = $1", telepon,
	).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// Create — simpan user baru ke database
func (r *UserRepository) Create(user *model.User) error {
	query := `
        INSERT INTO ngabengkel.users 
            (user_id, nama, email, telepon, password, role, created_at)
        VALUES 
            ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING created_at
    `
	return r.DB.QueryRow(query,
		user.UserID,
		user.Nama,
		user.Email,
		user.Telepon,
		user.Password,
		user.Role,
	).Scan(&user.CreatedAt)
}
