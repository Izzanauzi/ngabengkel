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
	slotRepo := &repository.SlotRepository{DB: db}
	kendaraanRepo := &repository.KendaraanRepository{DB: db}
	bookingRepo := &repository.BookingRepository{DB: db}
	workOrderRepo := &repository.WorkOrderRepository{DB: db}
	mekanikRepo := &repository.MekanikRepository{DB: db}
	inventoryRepo := &repository.InventoryRepository{DB: db}
	transactionRepo := &repository.TransactionRepository{DB: db}

	// 4. Inisialisasi service
	authService := &service.AuthService{UserRepo: userRepo}
	kendaraanService := &service.KendaraanService{KendaraanRepo: kendaraanRepo}
	bookingService := &service.BookingService{
		BookingRepo:   bookingRepo,
		KendaraanRepo: kendaraanRepo,
	}
	workOrderService := &service.WorkOrderService{WorkOrderRepo: workOrderRepo}
	mekanikService := &service.MekanikService{MekanikRepo: mekanikRepo}
	inventoryService := &service.InventoryService{InventoryRepo: inventoryRepo}
	slotService := &service.SlotService{SlotRepo: slotRepo, WorkOrderRepo: workOrderRepo}
	paymentService := &service.PaymentService{
		TransactionRepo: transactionRepo,
		WorkOrderRepo:   workOrderRepo,
		InventoryRepo:   inventoryRepo,
	}
	adminWOService := &service.AdminWorkOrderService{
		WorkOrderRepo: workOrderRepo,
		BookingRepo:   bookingRepo,
	}
	adminCustomerService := &service.AdminCustomerService{
		UserRepo:      userRepo,
		KendaraanRepo: kendaraanRepo,
	}

	// 5. Inisialisasi handler
	authHandler := &handler.AuthHandler{AuthService: authService}
	scheduleHandler := &handler.ScheduleHandler{SlotRepo: slotRepo}
	kendaraanHandler := &handler.KendaraanHandler{KendaraanService: kendaraanService}
	bookingHandler := &handler.BookingHandler{BookingService: bookingService}
	workOrderHandler := &handler.WorkOrderHandler{WorkOrderService: workOrderService}
	adminBookingHandler := &handler.AdminBookingHandler{BookingRepo: bookingRepo}
	mekanikHandler := &handler.MekanikHandler{MekanikService: mekanikService}
	inventoryHandler := &handler.InventoryHandler{InventoryService: inventoryService}
	adminWOHandler := &handler.AdminWorkOrderHandler{AdminWOService: adminWOService}
	slotHandler := &handler.SlotHandler{SlotService: slotService}
	paymentHandler := &handler.PaymentHandler{PaymentService: paymentService}
	adminCustomerHandler := &handler.AdminCustomerHandler{AdminCustomerService: adminCustomerService}

	// Booking routes

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

	// Schedule routes — tidak butuh token
	mux.HandleFunc("GET /api/v1/schedule", scheduleHandler.GetSchedule)

	// Auth routes — butuh token (pakai middleware)
	mux.HandleFunc("GET /api/v1/auth/me", middleware.RequireAuth(authHandler.Me))

	// Kendaraan routes — butuh token
	mux.HandleFunc("GET /api/v1/kendaraan", middleware.RequireAuth(kendaraanHandler.GetAll))
	mux.HandleFunc("GET /api/v1/kendaraan/{id}", middleware.RequireAuth(kendaraanHandler.GetByID))
	mux.HandleFunc("POST /api/v1/kendaraan", middleware.RequireAuth(kendaraanHandler.Create))
	mux.HandleFunc("PUT /api/v1/kendaraan/{id}", middleware.RequireAuth(kendaraanHandler.Update))
	mux.HandleFunc("DELETE /api/v1/kendaraan/{id}", middleware.RequireAuth(kendaraanHandler.Delete))

	// Booking routes — butuh token
	mux.HandleFunc("GET /api/v1/bookings", middleware.RequireAuth(bookingHandler.GetAll))
	mux.HandleFunc("POST /api/v1/bookings", middleware.RequireAuth(bookingHandler.Create))
	mux.HandleFunc("DELETE /api/v1/bookings/{id}", middleware.RequireAuth(bookingHandler.Cancel))

	// Work Order routes — butuh token
	mux.HandleFunc("GET /api/v1/work-orders", middleware.RequireAuth(workOrderHandler.GetAll))
	mux.HandleFunc("GET /api/v1/work-orders/{id}", middleware.RequireAuth(workOrderHandler.GetByID))
	mux.HandleFunc("POST /api/v1/work-orders/{id}/approve-action", middleware.RequireAuth(workOrderHandler.ApproveAction))
	mux.HandleFunc("POST /api/v1/work-orders/{id}/reject-action", middleware.RequireAuth(workOrderHandler.RejectAction))

	// Admin Booking routes — butuh token + role admin
	mux.HandleFunc("GET /api/v1/admin/bookings", middleware.RequireAuth(middleware.RequireRole("admin", adminBookingHandler.GetPending)))
	mux.HandleFunc("POST /api/v1/admin/bookings/{id}/accept", middleware.RequireAuth(middleware.RequireRole("admin", adminBookingHandler.Accept)))
	mux.HandleFunc("POST /api/v1/admin/bookings/{id}/reject", middleware.RequireAuth(middleware.RequireRole("admin", adminBookingHandler.Reject)))

	// Admin Work Order routes — butuh token + role admin
	mux.HandleFunc("GET /api/v1/admin/work-orders", middleware.RequireAuth(middleware.RequireRole("admin", adminWOHandler.GetAll)))
	mux.HandleFunc("POST /api/v1/admin/work-orders", middleware.RequireAuth(middleware.RequireRole("admin", adminWOHandler.Create)))
	mux.HandleFunc("GET /api/v1/admin/work-orders/{id}", middleware.RequireAuth(middleware.RequireRole("admin", adminWOHandler.GetByID)))
	mux.HandleFunc("POST /api/v1/admin/work-orders/{id}/start", middleware.RequireAuth(middleware.RequireRole("admin", adminWOHandler.Start)))
	mux.HandleFunc("POST /api/v1/admin/work-orders/{id}/progress", middleware.RequireAuth(middleware.RequireRole("admin", adminWOHandler.UploadProgress)))
	mux.HandleFunc("POST /api/v1/admin/work-orders/{id}/suspend", middleware.RequireAuth(middleware.RequireRole("admin", adminWOHandler.Suspend)))
	mux.HandleFunc("POST /api/v1/admin/work-orders/{id}/finish", middleware.RequireAuth(middleware.RequireRole("admin", adminWOHandler.Finish)))
	mux.HandleFunc("PUT /api/v1/admin/work-orders/{id}/biaya", middleware.RequireAuth(middleware.RequireRole("admin", adminWOHandler.UpdateBiaya)))

	// Admin Inventory routes — butuh token + role admin
	mux.HandleFunc("GET /api/v1/admin/inventory", middleware.RequireAuth(middleware.RequireRole("admin", inventoryHandler.GetAll)))
	mux.HandleFunc("POST /api/v1/admin/inventory", middleware.RequireAuth(middleware.RequireRole("admin", inventoryHandler.Create)))
	mux.HandleFunc("GET /api/v1/admin/inventory/{id}", middleware.RequireAuth(middleware.RequireRole("admin", inventoryHandler.GetByID)))
	mux.HandleFunc("PUT /api/v1/admin/inventory/{id}", middleware.RequireAuth(middleware.RequireRole("admin", inventoryHandler.Update)))
	mux.HandleFunc("DELETE /api/v1/admin/inventory/{id}", middleware.RequireAuth(middleware.RequireRole("admin", inventoryHandler.Delete)))
	mux.HandleFunc("POST /api/v1/admin/work-orders/{id}/items", middleware.RequireAuth(middleware.RequireRole("admin", inventoryHandler.AddToWO)))

	// Admin Customer routes — butuh token + role admin
	mux.HandleFunc("GET /api/v1/admin/customers", middleware.RequireAuth(middleware.RequireRole("admin", adminCustomerHandler.GetAll)))
	mux.HandleFunc("POST /api/v1/admin/customers", middleware.RequireAuth(middleware.RequireRole("admin", adminCustomerHandler.CreateWalkIn)))
	mux.HandleFunc("GET /api/v1/admin/customers/{id}", middleware.RequireAuth(middleware.RequireRole("admin", adminCustomerHandler.GetByID)))
	mux.HandleFunc("PUT /api/v1/admin/customers/{id}", middleware.RequireAuth(middleware.RequireRole("admin", adminCustomerHandler.Update)))
	mux.HandleFunc("DELETE /api/v1/admin/customers/{id}", middleware.RequireAuth(middleware.RequireRole("admin", adminCustomerHandler.Delete)))
	mux.HandleFunc("POST /api/v1/admin/customers/{id}/kendaraan", middleware.RequireAuth(middleware.RequireRole("admin", adminCustomerHandler.AddKendaraan)))

	// Admin Kendaraan routes — butuh token + role admin
	mux.HandleFunc("GET /api/v1/admin/kendaraan", middleware.RequireAuth(middleware.RequireRole("admin", adminCustomerHandler.GetAllKendaraan)))

	// Admin Payment & Report routes — butuh token + role admin
	mux.HandleFunc("GET /api/v1/admin/work-orders/{id}/invoice", middleware.RequireAuth(middleware.RequireRole("admin", paymentHandler.GetInvoice)))
	mux.HandleFunc("POST /api/v1/admin/work-orders/{id}/payment", middleware.RequireAuth(middleware.RequireRole("admin", paymentHandler.ConfirmPayment)))
	mux.HandleFunc("GET /api/v1/admin/reports/transactions", middleware.RequireAuth(middleware.RequireRole("admin", paymentHandler.GetReport)))
	mux.HandleFunc("GET /api/v1/admin/reports/customers/{id}/history", middleware.RequireAuth(middleware.RequireRole("admin", paymentHandler.GetCustomerHistory)))

	// Admin Slot & Queue routes — butuh token + role admin
	mux.HandleFunc("GET /api/v1/admin/slots", middleware.RequireAuth(middleware.RequireRole("admin", slotHandler.GetAll)))
	mux.HandleFunc("PUT /api/v1/admin/slots/{id}", middleware.RequireAuth(middleware.RequireRole("admin", slotHandler.UpdateStatus)))
	mux.HandleFunc("POST /api/v1/admin/slots/{id}/assign", middleware.RequireAuth(middleware.RequireRole("admin", slotHandler.AssignWO)))
	mux.HandleFunc("GET /api/v1/admin/queue", middleware.RequireAuth(middleware.RequireRole("admin", slotHandler.GetQueue)))

	// Admin Mekanik routes — butuh token + role admin
	mux.HandleFunc("GET /api/v1/admin/mekaniks", middleware.RequireAuth(middleware.RequireRole("admin", mekanikHandler.GetAll)))
	mux.HandleFunc("POST /api/v1/admin/mekaniks", middleware.RequireAuth(middleware.RequireRole("admin", mekanikHandler.Create)))
	mux.HandleFunc("GET /api/v1/admin/mekaniks/{id}", middleware.RequireAuth(middleware.RequireRole("admin", mekanikHandler.GetByID)))
	mux.HandleFunc("PUT /api/v1/admin/mekaniks/{id}", middleware.RequireAuth(middleware.RequireRole("admin", mekanikHandler.Update)))
	mux.HandleFunc("DELETE /api/v1/admin/mekaniks/{id}", middleware.RequireAuth(middleware.RequireRole("admin", mekanikHandler.Delete)))

	// 7. Nyalakan server
	addr := ":" + cfg.AppPort
	fmt.Printf("Server running on port %s\n", cfg.AppPort)
	if err := http.ListenAndServe(addr, middleware.EnableCORS(mux)); err != nil {
		log.Fatal(err)
	}
}
