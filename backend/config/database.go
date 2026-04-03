package config

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func ConnectDB(cfg *Config) *sql.DB {
	// Buat connection string dari config
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBName,
		cfg.DBSSLMode,
	)

	// Buka koneksi
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal("Gagal membuka koneksi database:", err)
	}

	// Cek apakah koneksi benar-benar berhasil
	if err := db.Ping(); err != nil {
		log.Fatal("Gagal terhubung ke database:", err)
	}

	log.Println("Database terhubung!")
	return db
}
