package service

import "github.com/ngabengkel/backend/internal/model"

// ── mockUserRepo ─────────────────────────────────────────────────────────────

type mockUserRepo struct {
	findByEmailFn   func(string) (*model.User, error)
	emailExistsFn   func(string) (bool, error)
	teleponExistsFn func(string) (bool, error)
	createFn        func(*model.User) error
}

func (m *mockUserRepo) FindByEmail(email string) (*model.User, error) {
	if m.findByEmailFn != nil {
		return m.findByEmailFn(email)
	}
	return nil, nil
}
func (m *mockUserRepo) EmailExists(email string) (bool, error) {
	if m.emailExistsFn != nil {
		return m.emailExistsFn(email)
	}
	return false, nil
}
func (m *mockUserRepo) TeleponExists(telepon string) (bool, error) {
	if m.teleponExistsFn != nil {
		return m.teleponExistsFn(telepon)
	}
	return false, nil
}
func (m *mockUserRepo) Create(user *model.User) error {
	if m.createFn != nil {
		return m.createFn(user)
	}
	return nil
}

// ── mockKendaraanRepo ────────────────────────────────────────────────────────

type mockKendaraanRepo struct {
	getByUserIDFn              func(string) ([]model.Kendaraan, error)
	findByIDFn                 func(string) (*model.Kendaraan, error)
	createFn                   func(*model.Kendaraan) error
	updateFn                   func(*model.Kendaraan) error
	hasActiveWOFn              func(string) (bool, error)
	deleteFn                   func(string, string) error
	nomorPolisiExistsFn        func(string) (bool, error)
	nomorRangkaExistsFn        func(string) (bool, error)
	nomorPolisiExistsExcludeFn func(string, string) (bool, error)
	nomorRangkaExistsExcludeFn func(string, string) (bool, error)
}

func (m *mockKendaraanRepo) GetByUserID(userID string) ([]model.Kendaraan, error) {
	if m.getByUserIDFn != nil {
		return m.getByUserIDFn(userID)
	}
	return nil, nil
}
func (m *mockKendaraanRepo) FindByID(id string) (*model.Kendaraan, error) {
	if m.findByIDFn != nil {
		return m.findByIDFn(id)
	}
	return nil, nil
}
func (m *mockKendaraanRepo) Create(k *model.Kendaraan) error {
	if m.createFn != nil {
		return m.createFn(k)
	}
	return nil
}
func (m *mockKendaraanRepo) Update(k *model.Kendaraan) error {
	if m.updateFn != nil {
		return m.updateFn(k)
	}
	return nil
}
func (m *mockKendaraanRepo) HasActiveWO(kendaraanID string) (bool, error) {
	if m.hasActiveWOFn != nil {
		return m.hasActiveWOFn(kendaraanID)
	}
	return false, nil
}
func (m *mockKendaraanRepo) Delete(kendaraanID, userID string) error {
	if m.deleteFn != nil {
		return m.deleteFn(kendaraanID, userID)
	}
	return nil
}
func (m *mockKendaraanRepo) NomorPolisiExists(nomorPolisi string) (bool, error) {
	if m.nomorPolisiExistsFn != nil {
		return m.nomorPolisiExistsFn(nomorPolisi)
	}
	return false, nil
}
func (m *mockKendaraanRepo) NomorRangkaExists(nomorRangka string) (bool, error) {
	if m.nomorRangkaExistsFn != nil {
		return m.nomorRangkaExistsFn(nomorRangka)
	}
	return false, nil
}
func (m *mockKendaraanRepo) NomorPolisiExistsExclude(nomorPolisi, kendaraanID string) (bool, error) {
	if m.nomorPolisiExistsExcludeFn != nil {
		return m.nomorPolisiExistsExcludeFn(nomorPolisi, kendaraanID)
	}
	return false, nil
}
func (m *mockKendaraanRepo) NomorRangkaExistsExclude(nomorRangka, kendaraanID string) (bool, error) {
	if m.nomorRangkaExistsExcludeFn != nil {
		return m.nomorRangkaExistsExcludeFn(nomorRangka, kendaraanID)
	}
	return false, nil
}

// ── mockWorkOrderRepo ────────────────────────────────────────────────────────

type mockWorkOrderRepo struct {
	getActiveByUserIDFn  func(string) ([]model.WorkOrder, error)
	getHistoriByUserIDFn func(string) ([]model.WorkOrder, error)
	findByIDFn           func(string) (*model.WorkOrderDetail, error)
	getProgressByWOIDFn  func(string) ([]model.Progress, error)
	updateStatusFn       func(string, string) error
	getAllFn             func() ([]model.WorkOrder, error)
	createFn            func(*model.WorkOrder) error
	addProgressFn       func(*model.Progress) error
	generateNomorWOFn   func() (string, error)
}

func (m *mockWorkOrderRepo) GetActiveByUserID(userID string) ([]model.WorkOrder, error) {
	if m.getActiveByUserIDFn != nil {
		return m.getActiveByUserIDFn(userID)
	}
	return nil, nil
}
func (m *mockWorkOrderRepo) GetHistoriByUserID(userID string) ([]model.WorkOrder, error) {
	if m.getHistoriByUserIDFn != nil {
		return m.getHistoriByUserIDFn(userID)
	}
	return nil, nil
}
func (m *mockWorkOrderRepo) FindByID(woID string) (*model.WorkOrderDetail, error) {
	if m.findByIDFn != nil {
		return m.findByIDFn(woID)
	}
	return nil, nil
}
func (m *mockWorkOrderRepo) GetProgressByWOID(woID string) ([]model.Progress, error) {
	if m.getProgressByWOIDFn != nil {
		return m.getProgressByWOIDFn(woID)
	}
	return nil, nil
}
func (m *mockWorkOrderRepo) UpdateStatus(woID, status string) error {
	if m.updateStatusFn != nil {
		return m.updateStatusFn(woID, status)
	}
	return nil
}
func (m *mockWorkOrderRepo) GetAll() ([]model.WorkOrder, error) {
	if m.getAllFn != nil {
		return m.getAllFn()
	}
	return []model.WorkOrder{}, nil
}
func (m *mockWorkOrderRepo) Create(wo *model.WorkOrder) error {
	if m.createFn != nil {
		return m.createFn(wo)
	}
	return nil
}
func (m *mockWorkOrderRepo) AddProgress(p *model.Progress) error {
	if m.addProgressFn != nil {
		return m.addProgressFn(p)
	}
	return nil
}
func (m *mockWorkOrderRepo) GenerateNomorWO() (string, error) {
	if m.generateNomorWOFn != nil {
		return m.generateNomorWOFn()
	}
	return "WO-20260101-001", nil
}

// ── mockBookingRepo ──────────────────────────────────────────────────────────

type mockBookingRepo struct {
	getByUserIDFn      func(string) ([]model.Booking, error)
	findByIDFn         func(string) (*model.Booking, error)
	createFn           func(*model.Booking) error
	updateStatusFn     func(string, string) error
	hasActiveBookingFn func(string) (bool, error)
	getPendingFn       func() ([]model.Booking, error)
	acceptFn           func(string) error
	rejectFn           func(string, string) error
}

func (m *mockBookingRepo) GetByUserID(userID string) ([]model.Booking, error) {
	if m.getByUserIDFn != nil {
		return m.getByUserIDFn(userID)
	}
	return nil, nil
}
func (m *mockBookingRepo) FindByID(bookingID string) (*model.Booking, error) {
	if m.findByIDFn != nil {
		return m.findByIDFn(bookingID)
	}
	return nil, nil
}
func (m *mockBookingRepo) Create(b *model.Booking) error {
	if m.createFn != nil {
		return m.createFn(b)
	}
	return nil
}
func (m *mockBookingRepo) UpdateStatus(bookingID, status string) error {
	if m.updateStatusFn != nil {
		return m.updateStatusFn(bookingID, status)
	}
	return nil
}
func (m *mockBookingRepo) HasActiveBooking(kendaraanID string) (bool, error) {
	if m.hasActiveBookingFn != nil {
		return m.hasActiveBookingFn(kendaraanID)
	}
	return false, nil
}
func (m *mockBookingRepo) GetPending() ([]model.Booking, error) {
	if m.getPendingFn != nil {
		return m.getPendingFn()
	}
	return []model.Booking{}, nil
}
func (m *mockBookingRepo) Accept(bookingID string) error {
	if m.acceptFn != nil {
		return m.acceptFn(bookingID)
	}
	return nil
}
func (m *mockBookingRepo) Reject(bookingID, alasanTolak string) error {
	if m.rejectFn != nil {
		return m.rejectFn(bookingID, alasanTolak)
	}
	return nil
}

// ── mockMekanikRepo ───────────────────────────────────────────────────────────

type mockMekanikRepo struct {
	getAllFn      func() ([]model.Mekanik, error)
	findByIDFn   func(string) (*model.Mekanik, error)
	createFn     func(*model.Mekanik) error
	updateFn     func(*model.Mekanik) error
	deleteFn     func(string) error
	hasActiveWOFn func(string) (bool, error)
}

func (m *mockMekanikRepo) GetAll() ([]model.Mekanik, error) {
	if m.getAllFn != nil {
		return m.getAllFn()
	}
	return []model.Mekanik{}, nil
}
func (m *mockMekanikRepo) FindByID(mekanikID string) (*model.Mekanik, error) {
	if m.findByIDFn != nil {
		return m.findByIDFn(mekanikID)
	}
	return nil, nil
}
func (m *mockMekanikRepo) Create(mekanik *model.Mekanik) error {
	if m.createFn != nil {
		return m.createFn(mekanik)
	}
	return nil
}
func (m *mockMekanikRepo) Update(mekanik *model.Mekanik) error {
	if m.updateFn != nil {
		return m.updateFn(mekanik)
	}
	return nil
}
func (m *mockMekanikRepo) Delete(mekanikID string) error {
	if m.deleteFn != nil {
		return m.deleteFn(mekanikID)
	}
	return nil
}
func (m *mockMekanikRepo) HasActiveWO(mekanikID string) (bool, error) {
	if m.hasActiveWOFn != nil {
		return m.hasActiveWOFn(mekanikID)
	}
	return false, nil
}

// ── mockInventoryRepo ─────────────────────────────────────────────────────────

type mockInventoryRepo struct {
	getAllFn        func() ([]model.InventoryItem, error)
	findByIDFn     func(string) (*model.InventoryItem, error)
	createFn       func(*model.InventoryItem) error
	updateFn       func(*model.InventoryItem) error
	deleteFn       func(string) error
	updateStokFn   func(string, int) error
	addItemToWOFn  func(*model.WOItem) error
	getWOItemsFn   func(string) ([]model.WOItem, error)
}

func (m *mockInventoryRepo) GetAll() ([]model.InventoryItem, error) {
	if m.getAllFn != nil {
		return m.getAllFn()
	}
	return []model.InventoryItem{}, nil
}
func (m *mockInventoryRepo) FindByID(inventoryID string) (*model.InventoryItem, error) {
	if m.findByIDFn != nil {
		return m.findByIDFn(inventoryID)
	}
	return nil, nil
}
func (m *mockInventoryRepo) Create(item *model.InventoryItem) error {
	if m.createFn != nil {
		return m.createFn(item)
	}
	return nil
}
func (m *mockInventoryRepo) Update(item *model.InventoryItem) error {
	if m.updateFn != nil {
		return m.updateFn(item)
	}
	return nil
}
func (m *mockInventoryRepo) Delete(inventoryID string) error {
	if m.deleteFn != nil {
		return m.deleteFn(inventoryID)
	}
	return nil
}
func (m *mockInventoryRepo) UpdateStok(inventoryID string, jumlah int) error {
	if m.updateStokFn != nil {
		return m.updateStokFn(inventoryID, jumlah)
	}
	return nil
}
func (m *mockInventoryRepo) AddItemToWO(woItem *model.WOItem) error {
	if m.addItemToWOFn != nil {
		return m.addItemToWOFn(woItem)
	}
	return nil
}
func (m *mockInventoryRepo) GetWOItems(woID string) ([]model.WOItem, error) {
	if m.getWOItemsFn != nil {
		return m.getWOItemsFn(woID)
	}
	return []model.WOItem{}, nil
}
