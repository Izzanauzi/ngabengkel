package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort        string
	DBHost         string
	DBPort         string
	DBUser         string
	DBPassword     string
	DBName         string
	DBSSLMode      string
	JWTSecret      string
	JWTExpiryHours string
}

func Load() *Config {
	// Baca file .env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment")
	}

	return &Config{
		AppPort:        os.Getenv("APP_PORT"),
		DBHost:         os.Getenv("DB_HOST"),
		DBPort:         os.Getenv("DB_PORT"),
		DBUser:         os.Getenv("DB_USER"),
		DBPassword:     os.Getenv("DB_PASSWORD"),
		DBName:         os.Getenv("DB_NAME"),
		DBSSLMode:      os.Getenv("DB_SSLMODE"),
		JWTSecret:      os.Getenv("JWT_SECRET"),
		JWTExpiryHours: os.Getenv("JWT_EXPIRY_HOURS"),
	}
}
