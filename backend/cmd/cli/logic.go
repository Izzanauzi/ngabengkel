package main

import (
	"database/sql"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

// verifyAdmin — cek email + password admin
func verifyAdmin(db *sql.DB, email, password string) (*AdminUser, error) {
	user, err := findAdminByEmail(db, email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, fmt.Errorf("email tidak ditemukan")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, fmt.Errorf("password salah")
	}

	return user, nil
}

// checkFirstSetup — cek apakah perlu setup pertama kali
func checkFirstSetup(db *sql.DB) (bool, error) {
	count, err := countAdmin(db)
	if err != nil {
		return false, err
	}
	return count == 0, nil
}
