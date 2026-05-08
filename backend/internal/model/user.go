package model

import "time"

// User — representasi baris di tabel users
type User struct {
	UserID    string    `json:"user_id"`
	Nama      string    `json:"nama"`
	Email     string    `json:"email"`
	Telepon   *string   `json:"telepon"`
	Password  string    `json:"-"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

// RegisterRequest — body yang dikirim frontend saat register
type RegisterRequest struct {
	Nama     string `json:"nama"`
	Email    string `json:"email"`
	Telepon  string `json:"telepon"`
	Password string `json:"password"`
}

// LoginRequest — body yang dikirim frontend saat login
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// AuthResponse — yang dikembalikan setelah login/register berhasil
type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// ErrorResponse — format error yang konsisten
type ErrorResponse struct {
	Code    int      `json:"code"`
	Message string   `json:"message"`
	Errors  []string `json:"errors,omitempty"`
}
