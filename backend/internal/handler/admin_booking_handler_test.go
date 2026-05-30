package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/ngabengkel/backend/internal/model"
	"github.com/ngabengkel/backend/internal/repository"
)

// mockAdminBookingRepo implements repository.BookingRepositoryInterface
type mockAdminBookingRepo struct {
	getPendingFn       func() ([]model.Booking, error)
	findByIDFn         func(string) (*model.Booking, error)
	acceptFn           func(string) error
	rejectFn           func(string, string) error
	getByUserIDFn      func(string) ([]model.Booking, error)
	createFn           func(*model.Booking) error
	updateStatusFn     func(string, string) error
	hasActiveBookingFn func(string) (bool, error)
}

func (m *mockAdminBookingRepo) GetPending() ([]model.Booking, error) {
	if m.getPendingFn != nil {
		return m.getPendingFn()
	}
	return []model.Booking{}, nil
}
func (m *mockAdminBookingRepo) FindByID(id string) (*model.Booking, error) {
	if m.findByIDFn != nil {
		return m.findByIDFn(id)
	}
	return nil, nil
}
func (m *mockAdminBookingRepo) Accept(id string) error {
	if m.acceptFn != nil {
		return m.acceptFn(id)
	}
	return nil
}
func (m *mockAdminBookingRepo) Reject(id, alasan string) error {
	if m.rejectFn != nil {
		return m.rejectFn(id, alasan)
	}
	return nil
}
func (m *mockAdminBookingRepo) GetByUserID(userID string) ([]model.Booking, error) {
	if m.getByUserIDFn != nil {
		return m.getByUserIDFn(userID)
	}
	return nil, nil
}
func (m *mockAdminBookingRepo) Create(b *model.Booking) error {
	if m.createFn != nil {
		return m.createFn(b)
	}
	return nil
}
func (m *mockAdminBookingRepo) UpdateStatus(id, status string) error {
	if m.updateStatusFn != nil {
		return m.updateStatusFn(id, status)
	}
	return nil
}
func (m *mockAdminBookingRepo) HasActiveBooking(kendaraanID string) (bool, error) {
	if m.hasActiveBookingFn != nil {
		return m.hasActiveBookingFn(kendaraanID)
	}
	return false, nil
}

var _ repository.BookingRepositoryInterface = (*mockAdminBookingRepo)(nil)

func adminCtx(r *http.Request) *http.Request {
	ctx := context.WithValue(r.Context(), "user_id", "admin-uuid")
	ctx = context.WithValue(ctx, "role", "admin")
	return r.WithContext(ctx)
}

// ── GetPending ────────────────────────────────────────────────────────────────

func TestAdminBookingHandler_GetPending_HappyPath(t *testing.T) {
	want := []model.Booking{
		{BookingID: "b-1", Status: "menunggu_konfirmasi"},
		{BookingID: "b-2", Status: "menunggu_konfirmasi"},
	}
	h := &AdminBookingHandler{
		BookingRepo: &mockAdminBookingRepo{
			getPendingFn: func() ([]model.Booking, error) { return want, nil },
		},
	}

	req := adminCtx(httptest.NewRequest(http.MethodGet, "/api/v1/admin/bookings", nil))
	w := httptest.NewRecorder()
	h.GetPending(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expect 200, got %d", w.Code)
	}
	var got []model.Booking
	if err := json.NewDecoder(w.Body).Decode(&got); err != nil {
		t.Fatalf("gagal decode response: %v", err)
	}
	if len(got) != 2 {
		t.Errorf("expect 2 booking, got %d", len(got))
	}
}

func TestAdminBookingHandler_GetPending_RepoError(t *testing.T) {
	h := &AdminBookingHandler{
		BookingRepo: &mockAdminBookingRepo{
			getPendingFn: func() ([]model.Booking, error) { return nil, errors.New("db error") },
		},
	}

	req := adminCtx(httptest.NewRequest(http.MethodGet, "/api/v1/admin/bookings", nil))
	w := httptest.NewRecorder()
	h.GetPending(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expect 500, got %d", w.Code)
	}
}

// ── Accept ────────────────────────────────────────────────────────────────────

func TestAdminBookingHandler_Accept_HappyPath(t *testing.T) {
	h := &AdminBookingHandler{
		BookingRepo: &mockAdminBookingRepo{
			findByIDFn: func(_ string) (*model.Booking, error) {
				return &model.Booking{BookingID: "b-1", Status: "menunggu_konfirmasi"}, nil
			},
		},
	}

	req := adminCtx(httptest.NewRequest(http.MethodPost, "/api/v1/admin/bookings/b-1/accept", nil))
	req.SetPathValue("id", "b-1")
	w := httptest.NewRecorder()
	h.Accept(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expect 200, got %d", w.Code)
	}
}

func TestAdminBookingHandler_Accept_BookingTidakDitemukan(t *testing.T) {
	h := &AdminBookingHandler{
		BookingRepo: &mockAdminBookingRepo{
			findByIDFn: func(_ string) (*model.Booking, error) {
				return nil, errors.New("booking tidak ditemukan")
			},
		},
	}

	req := adminCtx(httptest.NewRequest(http.MethodPost, "/api/v1/admin/bookings/b-99/accept", nil))
	req.SetPathValue("id", "b-99")
	w := httptest.NewRecorder()
	h.Accept(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("expect 404, got %d", w.Code)
	}
}

func TestAdminBookingHandler_Accept_StatusSalah(t *testing.T) {
	h := &AdminBookingHandler{
		BookingRepo: &mockAdminBookingRepo{
			findByIDFn: func(_ string) (*model.Booking, error) {
				return &model.Booking{BookingID: "b-1", Status: "disetujui"}, nil
			},
		},
	}

	req := adminCtx(httptest.NewRequest(http.MethodPost, "/api/v1/admin/bookings/b-1/accept", nil))
	req.SetPathValue("id", "b-1")
	w := httptest.NewRecorder()
	h.Accept(w, req)

	if w.Code != http.StatusUnprocessableEntity {
		t.Errorf("expect 422, got %d", w.Code)
	}
}

// ── Reject ────────────────────────────────────────────────────────────────────

func TestAdminBookingHandler_Reject_HappyPath(t *testing.T) {
	h := &AdminBookingHandler{
		BookingRepo: &mockAdminBookingRepo{
			findByIDFn: func(_ string) (*model.Booking, error) {
				return &model.Booking{BookingID: "b-1", Status: "menunggu_konfirmasi"}, nil
			},
		},
	}

	body := bytes.NewBufferString(`{"alasan_tolak":"Slot penuh"}`)
	req := adminCtx(httptest.NewRequest(http.MethodPost, "/api/v1/admin/bookings/b-1/reject", body))
	req.SetPathValue("id", "b-1")
	w := httptest.NewRecorder()
	h.Reject(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expect 200, got %d", w.Code)
	}
}

func TestAdminBookingHandler_Reject_AlasanKosong(t *testing.T) {
	h := &AdminBookingHandler{BookingRepo: &mockAdminBookingRepo{}}

	body := bytes.NewBufferString(`{"alasan_tolak":""}`)
	req := adminCtx(httptest.NewRequest(http.MethodPost, "/api/v1/admin/bookings/b-1/reject", body))
	req.SetPathValue("id", "b-1")
	w := httptest.NewRecorder()
	h.Reject(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expect 400, got %d", w.Code)
	}
}

func TestAdminBookingHandler_Reject_BookingTidakDitemukan(t *testing.T) {
	h := &AdminBookingHandler{
		BookingRepo: &mockAdminBookingRepo{
			findByIDFn: func(_ string) (*model.Booking, error) {
				return nil, errors.New("booking tidak ditemukan")
			},
		},
	}

	body := bytes.NewBufferString(`{"alasan_tolak":"Penuh"}`)
	req := adminCtx(httptest.NewRequest(http.MethodPost, "/api/v1/admin/bookings/b-99/reject", body))
	req.SetPathValue("id", "b-99")
	w := httptest.NewRecorder()
	h.Reject(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("expect 404, got %d", w.Code)
	}
}

func TestAdminBookingHandler_Reject_StatusSalah(t *testing.T) {
	h := &AdminBookingHandler{
		BookingRepo: &mockAdminBookingRepo{
			findByIDFn: func(_ string) (*model.Booking, error) {
				return &model.Booking{BookingID: "b-1", Status: "ditolak"}, nil
			},
		},
	}

	body := bytes.NewBufferString(`{"alasan_tolak":"Penuh"}`)
	req := adminCtx(httptest.NewRequest(http.MethodPost, "/api/v1/admin/bookings/b-1/reject", body))
	req.SetPathValue("id", "b-1")
	w := httptest.NewRecorder()
	h.Reject(w, req)

	if w.Code != http.StatusUnprocessableEntity {
		t.Errorf("expect 422, got %d", w.Code)
	}
}
