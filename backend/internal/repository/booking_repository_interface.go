package repository

import "github.com/ngabengkel/backend/internal/model"

type BookingRepositoryInterface interface {
	GetByUserID(userID string) ([]model.Booking, error)
	FindByID(bookingID string) (*model.Booking, error)
	Create(b *model.Booking) error
	UpdateStatus(bookingID, status string) error
	HasActiveBooking(kendaraanID string) (bool, error)
	GetPending() ([]model.Booking, error)
	Accept(bookingID string) error
	Reject(bookingID, alasanTolak string) error
}
