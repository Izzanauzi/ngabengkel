package main

import (
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AdminUser struct {
	UserID    string
	Nama      string
	Email     string
	Password  string
	CreatedAt string
}

// countAdmin — hitung jumlah akun admin
func countAdmin(db *sql.DB) (int, error) {
	var count int
	err := db.QueryRow(
		"SELECT COUNT(*) FROM ngabengkel.users WHERE role = 'admin'",
	).Scan(&count)
	return count, err
}

// findAdminByEmail — cari admin berdasarkan email
func findAdminByEmail(db *sql.DB, email string) (*AdminUser, error) {
	user := &AdminUser{}
	err := db.QueryRow(`
		SELECT user_id, nama, email, password
		FROM ngabengkel.users
		WHERE email = $1 AND role = 'admin'
	`, email).Scan(&user.UserID, &user.Nama, &user.Email, &user.Password)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

// getAllAdmins — ambil semua akun admin
func getAllAdmins(db *sql.DB) ([]AdminUser, error) {
	rows, err := db.Query(`
		SELECT user_id, nama, email, created_at
		FROM ngabengkel.users
		WHERE role = 'admin'
		ORDER BY created_at ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var admins []AdminUser
	for rows.Next() {
		var a AdminUser
		err := rows.Scan(&a.UserID, &a.Nama, &a.Email, &a.CreatedAt)
		if err != nil {
			return nil, err
		}
		admins = append(admins, a)
	}
	return admins, nil
}

// createAdmin — buat akun admin baru
func createAdmin(db *sql.DB, nama, email, password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	_, err = db.Exec(`
		INSERT INTO ngabengkel.users (user_id, nama, email, password, role, created_at)
		VALUES ($1, $2, $3, $4, 'admin', NOW())
	`, uuid.New().String(), nama, email, string(hash))
	return err
}

// resetPassword — reset password admin
func resetPassword(db *sql.DB, email, newPassword string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	result, err := db.Exec(`
		UPDATE ngabengkel.users
		SET password = $1
		WHERE email = $2 AND role = 'admin'
	`, string(hash), email)
	if err != nil {
		return err
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("admin dengan email %s tidak ditemukan", email)
	}
	return nil
}

// deleteAdmin — hapus akun admin
func deleteAdmin(db *sql.DB, email string) error {
	result, err := db.Exec(`
		DELETE FROM ngabengkel.users
		WHERE email = $1 AND role = 'admin'
	`, email)
	if err != nil {
		return err
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("admin dengan email %s tidak ditemukan", email)
	}
	return nil
}
