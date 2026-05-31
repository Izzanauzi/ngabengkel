package repository

import (
	"database/sql"
	"errors"

	"github.com/ngabengkel/backend/internal/model"
)

const customerSelectCols = `
	SELECT u.user_id, u.nama, COALESCE(u.email, '') as email,
	       u.telepon, u.role, u.created_at,
	       COUNT(k.kendaraan_id) as jumlah_kendaraan
	FROM ngabengkel.users u
	LEFT JOIN ngabengkel.kendaraan k ON k.user_id = u.user_id
`

func scanCustomer(s interface{ Scan(...any) error }) (model.AdminCustomerResponse, error) {
	var c model.AdminCustomerResponse
	err := s.Scan(&c.UserID, &c.Nama, &c.Email, &c.Telepon, &c.Role, &c.CreatedAt, &c.JumlahKendaraan)
	return c, err
}

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

// GetAllCustomers — ambil semua customer dengan jumlah kendaraan
func (r *UserRepository) GetAllCustomers() ([]model.AdminCustomerResponse, error) {
	query := customerSelectCols + `
		WHERE u.role = 'customer'
		GROUP BY u.user_id, u.nama, u.email, u.telepon, u.role, u.created_at
		ORDER BY u.created_at DESC
	`
	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	customers := []model.AdminCustomerResponse{}
	for rows.Next() {
		c, err := scanCustomer(rows)
		if err != nil {
			return nil, err
		}
		customers = append(customers, c)
	}
	return customers, nil
}

// FindCustomerByID — cari customer by ID beserta jumlah kendaraan
func (r *UserRepository) FindCustomerByID(userID string) (*model.AdminCustomerResponse, error) {
	query := customerSelectCols + `
		WHERE u.user_id = $1 AND u.role = 'customer'
		GROUP BY u.user_id, u.nama, u.email, u.telepon, u.role, u.created_at
	`
	c, err := scanCustomer(r.DB.QueryRow(query, userID))
	if err == sql.ErrNoRows {
		return nil, errors.New("customer tidak ditemukan")
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}

// CreateWalkIn — tambah customer walk-in, email dan password nullable
func (r *UserRepository) CreateWalkIn(user *model.User) error {
	var email, password sql.NullString
	if user.Email != "" {
		email = sql.NullString{String: user.Email, Valid: true}
	}
	if user.Password != "" {
		password = sql.NullString{String: user.Password, Valid: true}
	}
	return r.DB.QueryRow(`
		INSERT INTO ngabengkel.users
			(user_id, nama, email, telepon, password, role, created_at)
		VALUES ($1, $2, $3, $4, $5, 'customer', NOW())
		RETURNING created_at
	`, user.UserID, user.Nama, email, user.Telepon, password,
	).Scan(&user.CreatedAt)
}

// UpdateCustomer — update nama dan telepon customer
func (r *UserRepository) UpdateCustomer(userID, nama, telepon string) error {
	result, err := r.DB.Exec(`
		UPDATE ngabengkel.users SET nama = $1, telepon = $2
		WHERE user_id = $3 AND role = 'customer'
	`, nama, telepon, userID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.New("customer tidak ditemukan")
	}
	return nil
}

// DeleteCustomer — hapus customer
func (r *UserRepository) DeleteCustomer(userID string) error {
	result, err := r.DB.Exec(`
		DELETE FROM ngabengkel.users WHERE user_id = $1 AND role = 'customer'
	`, userID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.New("customer tidak ditemukan")
	}
	return nil
}

// HasActiveWO — cek apakah user punya WO yang belum selesai
func (r *UserRepository) HasActiveWO(userID string) (bool, error) {
	var count int
	err := r.DB.QueryRow(`
		SELECT COUNT(*) FROM ngabengkel.work_orders
		WHERE user_id = $1 AND status NOT IN ('selesai', 'lunas')
	`, userID).Scan(&count)
	return count > 0, err
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
