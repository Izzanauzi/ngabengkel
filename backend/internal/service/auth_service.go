package service

import (
	"errors"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	UserRepo *repository.UserRepository
}

// Register — validasi + simpan user baru
func (s *AuthService) Register(req model.RegisterRequest) (*model.AuthResponse, error) {
	// 1. Bersihkan spasi di awal/akhir
	req.Nama = strings.TrimSpace(req.Nama)
	req.Email = strings.TrimSpace(req.Email)
	req.Telepon = strings.TrimSpace(req.Telepon)

	// 2. Validasi field tidak kosong
	if req.Nama == "" || req.Email == "" || req.Telepon == "" || req.Password == "" {
		return nil, errors.New("semua field wajib diisi")
	}

	// 3. Validasi panjang password
	if len(req.Password) < 8 {
		return nil, errors.New("password minimal 8 karakter")
	}

	// 4. Cek email sudah dipakai
	emailExists, err := s.UserRepo.EmailExists(req.Email)
	if err != nil {
		return nil, err
	}
	if emailExists {
		return nil, errors.New("email sudah digunakan")
	}

	// 5. Cek telepon sudah dipakai
	teleponExists, err := s.UserRepo.TeleponExists(req.Telepon)
	if err != nil {
		return nil, err
	}
	if teleponExists {
		return nil, errors.New("nomor telepon sudah terdaftar")
	}

	// 6. Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(req.Password), bcrypt.DefaultCost,
	)
	if err != nil {
		return nil, err
	}

	// 7. Buat user baru
	user := &model.User{
		UserID:   uuid.New().String(),
		Nama:     req.Nama,
		Email:    req.Email,
		Telepon:  &req.Telepon,
		Password: string(hashedPassword),
		Role:     "customer",
	}

	// 8. Simpan ke database
	if err := s.UserRepo.Create(user); err != nil {
		return nil, err
	}

	// 9. Generate JWT token
	token, err := generateToken(user.UserID, user.Role)
	if err != nil {
		return nil, err
	}

	return &model.AuthResponse{Token: token, User: *user}, nil
}

// Login — cek kredensial + return token
func (s *AuthService) Login(req model.LoginRequest, expectedRole string) (*model.AuthResponse, error) {
	// 1. Cari user by email
	user, err := s.UserRepo.FindByEmail(req.Email)
	if err != nil {
		// Pakai pesan generic — jangan kasih tahu apakah email ada atau tidak
		return nil, errors.New("email atau password tidak valid")
	}

	// 2. Cek role
	if user.Role != expectedRole {
		return nil, errors.New("akses ditolak")
	}

	// 3. Bandingkan password dengan hash di database
	err = bcrypt.CompareHashAndPassword(
		[]byte(user.Password), []byte(req.Password),
	)
	if err != nil {
		return nil, errors.New("email atau password tidak valid")
	}

	// 4. Generate token
	token, err := generateToken(user.UserID, user.Role)
	if err != nil {
		return nil, err
	}

	return &model.AuthResponse{Token: token, User: *user}, nil
}

// generateToken — buat JWT token
func generateToken(userID, role string) (string, error) {
	secret := os.Getenv("JWT_SECRET")

	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(168 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
