package service

import (
	"errors"
	"os"
	"testing"

	"github.com/ngabengkel/backend/internal/model"
	"golang.org/x/crypto/bcrypt"
)

func TestMain(m *testing.M) {
	os.Setenv("JWT_SECRET", "test_secret_key_minimal_32_karakter_panjang")
	os.Exit(m.Run())
}

// ── Register ─────────────────────────────────────────────────────────────────

func TestAuthService_Register_HappyPath(t *testing.T) {
	svc := &AuthService{UserRepo: &mockUserRepo{}}

	resp, err := svc.Register(model.RegisterRequest{
		Nama: "Budi", Email: "budi@mail.com", Telepon: "081234567890", Password: "password123",
	})
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if resp.Token == "" {
		t.Error("expect token tidak kosong")
	}
	if resp.User.Email != "budi@mail.com" {
		t.Errorf("expect email budi@mail.com, got %s", resp.User.Email)
	}
	if resp.User.Role != "customer" {
		t.Errorf("expect role customer, got %s", resp.User.Role)
	}
}

func TestAuthService_Register_EmailSudahAda(t *testing.T) {
	svc := &AuthService{UserRepo: &mockUserRepo{
		emailExistsFn: func(_ string) (bool, error) { return true, nil },
	}}

	_, err := svc.Register(model.RegisterRequest{
		Nama: "Budi", Email: "budi@mail.com", Telepon: "081234567890", Password: "password123",
	})
	assertError(t, err, "email sudah digunakan")
}

func TestAuthService_Register_TeleponSudahAda(t *testing.T) {
	svc := &AuthService{UserRepo: &mockUserRepo{
		teleponExistsFn: func(_ string) (bool, error) { return true, nil },
	}}

	_, err := svc.Register(model.RegisterRequest{
		Nama: "Budi", Email: "budi@mail.com", Telepon: "081234567890", Password: "password123",
	})
	assertError(t, err, "nomor telepon sudah terdaftar")
}

func TestAuthService_Register_PasswordTerlalupendek(t *testing.T) {
	svc := &AuthService{UserRepo: &mockUserRepo{}}

	_, err := svc.Register(model.RegisterRequest{
		Nama: "Budi", Email: "budi@mail.com", Telepon: "081234567890", Password: "pass",
	})
	assertError(t, err, "password minimal 8 karakter")
}

func TestAuthService_Register_FieldKosong(t *testing.T) {
	svc := &AuthService{UserRepo: &mockUserRepo{}}

	cases := []model.RegisterRequest{
		{Nama: "", Email: "b@mail.com", Telepon: "081234567890", Password: "password123"},
		{Nama: "Budi", Email: "", Telepon: "081234567890", Password: "password123"},
		{Nama: "Budi", Email: "b@mail.com", Telepon: "", Password: "password123"},
		{Nama: "Budi", Email: "b@mail.com", Telepon: "081234567890", Password: ""},
	}
	for _, req := range cases {
		_, err := svc.Register(req)
		assertError(t, err, "semua field wajib diisi")
	}
}

// ── Login ─────────────────────────────────────────────────────────────────────

func TestAuthService_Login_HappyPath(t *testing.T) {
	hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	user := &model.User{UserID: "u-1", Email: "budi@mail.com", Password: string(hash), Role: "customer"}

	svc := &AuthService{UserRepo: &mockUserRepo{
		findByEmailFn: func(_ string) (*model.User, error) { return user, nil },
	}}

	resp, err := svc.Login(model.LoginRequest{Email: "budi@mail.com", Password: "password123"}, "customer")
	if err != nil {
		t.Fatalf("tidak expect error, got: %v", err)
	}
	if resp.Token == "" {
		t.Error("expect token tidak kosong")
	}
	if resp.User.UserID != "u-1" {
		t.Errorf("expect user_id u-1, got %s", resp.User.UserID)
	}
}

func TestAuthService_Login_EmailTidakDitemukan(t *testing.T) {
	svc := &AuthService{UserRepo: &mockUserRepo{
		findByEmailFn: func(_ string) (*model.User, error) {
			return nil, errors.New("user tidak ditemukan")
		},
	}}

	_, err := svc.Login(model.LoginRequest{Email: "x@mail.com", Password: "password123"}, "customer")
	assertError(t, err, "email atau password tidak valid")
}

func TestAuthService_Login_PasswordSalah(t *testing.T) {
	hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	user := &model.User{UserID: "u-1", Email: "budi@mail.com", Password: string(hash), Role: "customer"}

	svc := &AuthService{UserRepo: &mockUserRepo{
		findByEmailFn: func(_ string) (*model.User, error) { return user, nil },
	}}

	_, err := svc.Login(model.LoginRequest{Email: "budi@mail.com", Password: "salah"}, "customer")
	assertError(t, err, "email atau password tidak valid")
}

func TestAuthService_Login_RoleSalah(t *testing.T) {
	hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	user := &model.User{UserID: "u-1", Email: "budi@mail.com", Password: string(hash), Role: "customer"}

	svc := &AuthService{UserRepo: &mockUserRepo{
		findByEmailFn: func(_ string) (*model.User, error) { return user, nil },
	}}

	_, err := svc.Login(model.LoginRequest{Email: "budi@mail.com", Password: "password123"}, "admin")
	assertError(t, err, "akses ditolak")
}

// ── helper ────────────────────────────────────────────────────────────────────

func assertError(t *testing.T, err error, want string) {
	t.Helper()
	if err == nil {
		t.Fatalf("expect error %q, got nil", want)
	}
	if err.Error() != want {
		t.Errorf("expect error %q, got %q", want, err.Error())
	}
}
