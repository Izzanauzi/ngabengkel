package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/ngabengkel/backend/config"
	"github.com/ngabengkel/backend/internal/handler"
	"github.com/ngabengkel/backend/internal/middleware"
	"github.com/ngabengkel/backend/internal/repository"
	"github.com/ngabengkel/backend/internal/service"
)

func main() {
	// 1. Load config dari .env
	cfg := config.Load()

	// 2. Koneksi ke database
	db := config.ConnectDB(cfg)
	defer db.Close()

	// 3. Inisialisasi repository
	userRepo := &repository.UserRepository{DB: db}

	// 4. Inisialisasi service
	authService := &service.AuthService{UserRepo: userRepo}

	// 5. Inisialisasi handler
	authHandler := &handler.AuthHandler{AuthService: authService}

	// 6. Daftarkan semua route
	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("GET /ping", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"message":"pong"}`))
	})

	// Auth routes — tidak butuh token
	mux.HandleFunc("POST /api/v1/auth/register", authHandler.Register)
	mux.HandleFunc("POST /api/v1/auth/login", authHandler.Login)
	mux.HandleFunc("POST /api/v1/auth/logout", authHandler.Logout)

	// Auth routes — butuh token (pakai middleware)
	mux.HandleFunc("GET /api/v1/auth/me", middleware.RequireAuth(authHandler.Me))

	// 7. Nyalakan server
	addr := ":" + cfg.AppPort
	fmt.Printf("Server running on port %s\n", cfg.AppPort)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
