package handler

import (
	"encoding/json"
	"net/http"

	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/service"
)

type AuthHandler struct {
	AuthService *service.AuthService
}

// helper — kirim response JSON
func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// helper — kirim response error
func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, model.ErrorResponse{
		Code:    status,
		Message: message,
	})
}

// POST /api/v1/auth/register
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	// 1. Decode JSON body dari frontend → struct RegisterRequest
	var req model.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}

	// 2. Serahkan ke service untuk diproses
	result, err := h.AuthService.Register(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	// 3. Kirim response sukses ke frontend
	writeJSON(w, http.StatusCreated, result)
}

// POST /api/v1/auth/login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req model.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Format request tidak valid")
		return
	}

	// Bedakan customer vs admin dari header X-App
	expectedRole := r.Header.Get("X-App")
	if expectedRole == "" {
		expectedRole = "customer" // default ke customer
	}

	result, err := h.AuthService.Login(req, expectedRole)
	if err != nil {
		if err.Error() == "akses ditolak" {
			writeError(w, http.StatusForbidden, "Akses ditolak")
			return
		}
		writeError(w, http.StatusUnauthorized, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// POST /api/v1/auth/logout
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// JWT stateless — logout cukup hapus token di sisi frontend
	// Handler ini tetap ada untuk konsistensi API
	writeJSON(w, http.StatusOK, map[string]string{
		"message": "Logout berhasil",
	})
}

// GET /api/v1/auth/me
func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	// Data user diambil dari context — di-set oleh middleware nanti
	userID := r.Context().Value("user_id")
	role := r.Context().Value("role")

	if userID == nil {
		writeError(w, http.StatusUnauthorized, "Token tidak valid")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"user_id": userID.(string),
		"role":    role.(string),
	})
}
