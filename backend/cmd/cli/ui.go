package main

import (
	"bufio"
	"database/sql"
	"fmt"
	"os"
	"strings"

	"golang.org/x/term"
)

var reader = bufio.NewReader(os.Stdin)

func readInput(prompt string) string {
	fmt.Print(prompt)
	text, _ := reader.ReadString('\n')
	return strings.TrimSpace(text)
}

func readPassword(prompt string) string {
	fmt.Print(prompt)
	password, err := term.ReadPassword(int(os.Stdin.Fd()))
	if err != nil {
		return ""
	}
	fmt.Println() // pindah baris setelah enter
	return strings.TrimSpace(string(password))
}

func printHeader() {
	header := `
╔══════════════════════════════════╗
║    Ngabengkel — Admin CLI Tool   ║
╚══════════════════════════════════╝

`
	fmt.Printf("%s", header)
}

func printMenu(adminNama string) {
	menu := `
Halo, %s

Menu Admin Tools:
	1. Lihat semua akun admin
	2. Buat akun admin baru
	3. Reset password admin
	4. Hapus akun admin
	0. Keluar

`
	fmt.Printf(menu, adminNama)
}

func handleLihatAdmin(db *sql.DB) {
	admins, err := getAllAdmins(db)
	if err != nil {
		fmt.Println("❌ Gagal mengambil data:", err)
		return
	}

	if len(admins) == 0 {
		fmt.Println("Tidak ada akun admin.")
		return
	}

	fmt.Printf("\n%-36s  %-20s  %-30s  %s\n", "User ID", "Nama", "Email", "Dibuat")
	fmt.Println(strings.Repeat("-", 100))
	for _, a := range admins {
		fmt.Printf("%-36s  %-20s  %-30s  %s\n", a.UserID, a.Nama, a.Email, a.CreatedAt)
	}
	fmt.Println()
}

func handleBuatAdmin(db *sql.DB) {
	fmt.Println("\n--- Buat Akun Admin Baru ---")
	nama := readInput("Nama     : ")
	email := readInput("Email    : ")
	password := readInput("Password : ")

	if nama == "" || email == "" || password == "" {
		fmt.Println("❌ Semua field wajib diisi.")
		return
	}
	if len(password) < 8 {
		fmt.Println("❌ Password minimal 8 karakter.")
		return
	}

	// Cek email sudah ada
	existing, err := findAdminByEmail(db, email)
	if err != nil {
		fmt.Println("❌ Gagal cek email:", err)
		return
	}
	if existing != nil {
		fmt.Println("❌ Email sudah digunakan.")
		return
	}

	if err := createAdmin(db, nama, email, password); err != nil {
		fmt.Println("❌ Gagal membuat admin:", err)
		return
	}

	fmt.Printf("✅ Akun admin '%s' berhasil dibuat!\n\n", nama)
}

func handleResetPassword(db *sql.DB) {
	fmt.Println("\n--- Reset Password Admin ---")
	email := readInput("Email admin    : ")
	newPassword := readInput("Password baru  : ")
	confirm := readInput("Konfirmasi     : ")

	if newPassword != confirm {
		fmt.Println("❌ Password tidak cocok.")
		return
	}
	if len(newPassword) < 8 {
		fmt.Println("❌ Password minimal 8 karakter.")
		return
	}

	if err := resetPassword(db, email, newPassword); err != nil {
		fmt.Println("❌", err)
		return
	}

	fmt.Println("✅ Password berhasil direset!")
}

func handleHapusAdmin(db *sql.DB) {
	fmt.Println("\n--- Hapus Akun Admin ---")
	email := readInput("Email admin yang akan dihapus : ")
	konfirm := readInput("Ketik 'HAPUS' untuk konfirmasi: ")

	if konfirm != "HAPUS" {
		fmt.Println("❌ Dibatalkan.")
		return
	}

	if err := deleteAdmin(db, email); err != nil {
		fmt.Println("❌", err)
		return
	}

	fmt.Println("✅ Akun admin berhasil dihapus!")
}
