package middleware

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. Ambil header Authorization
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"code":401,"message":"Token tidak disertakan"}`, http.StatusUnauthorized)
			return
		}

		// 2. Cek formatnya "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, `{"code":401,"message":"Format token tidak valid"}`, http.StatusUnauthorized)
			return
		}
		tokenString := parts[1]

		// 3. Validasi token
		secret := os.Getenv("JWT_SECRET")
		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			http.Error(w, `{"code":401,"message":"Token tidak valid atau sudah kadaluarsa"}`, http.StatusUnauthorized)
			return
		}

		// 4. Simpan user_id dan role ke context
		claims := token.Claims.(jwt.MapClaims)
		ctx := context.WithValue(r.Context(), "user_id", claims["user_id"])
		ctx = context.WithValue(ctx, "role", claims["role"])

		// 5. Lanjut ke handler
		next(w, r.WithContext(ctx))
	}
}

func RequireRole(role string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userRole := r.Context().Value("role")
		if userRole == nil || userRole.(string) != role {
			http.Error(w, `{"code":403,"message":"Akses ditolak"}`, http.StatusForbidden)
			return
		}
		next(w, r)
	}
}
