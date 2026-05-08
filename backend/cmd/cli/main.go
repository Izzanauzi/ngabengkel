package main

import (
	"fmt"
	"log"
	"os"
)

func main() {
	db := connectDB()
	defer db.Close()

	printHeader()

	// Cek apakah ada admin
	isFirstSetup, err := checkFirstSetup(db)
	if err != nil {
		log.Fatal("Gagal cek database:", err)
	}

	var currentAdmin *AdminUser

	if isFirstSetup {
		// Belum ada admin — langsung buat
		fmt.Println("⚠️  Belum ada akun admin. Buat akun admin pertama.")
		fmt.Println()

		nama := readInput("Nama     : ")
		email := readInput("Email    : ")
		password := readPassword("Password : ")

		if err := createAdmin(db, nama, email, password); err != nil {
			log.Fatal("Gagal membuat admin:", err)
		}

		fmt.Printf("\n✅ Akun admin '%s' berhasil dibuat! Silakan login.\n\n", nama)

		// Langsung set sebagai current admin
		currentAdmin, _ = findAdminByEmail(db, email)

	} else {
		// Sudah ada admin — minta login
		fmt.Println("Masukkan kredensial admin untuk melanjutkan.")
		fmt.Println()

		maxAttempt := 3
		for i := 0; i < maxAttempt; i++ {
			email := readInput("Email    : ")
			password := readPassword("Password : ")

			admin, err := verifyAdmin(db, email, password)
			if err != nil {
				sisa := maxAttempt - i - 1
				if sisa > 0 {
					fmt.Printf("❌ %s. Sisa percobaan: %d\n\n", err.Error(), sisa)
				} else {
					fmt.Println("❌ Akses ditolak.")
					os.Exit(1)
				}
				continue
			}

			currentAdmin = admin
			break
		}
	}

	// Menu utama
	for {
		printMenu(currentAdmin.Nama)
		pilihan := readInput("Pilih menu: ")

		switch pilihan {
		case "1":
			handleLihatAdmin(db)
		case "2":
			handleBuatAdmin(db)
		case "3":
			handleResetPassword(db)
		case "4":
			handleHapusAdmin(db)
		case "0":
			fmt.Println("Sampai jumpa!")
			os.Exit(0)
		default:
			fmt.Println("❌ Pilihan tidak valid.")
		}
	}
}
