import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useMemo, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  useCreateWorkOrderMutation,
  useGetAllCustomers,
  useGetAllKendaraan,
  useGetAllMekanik,
  CreateWorkOrderPayload,
  CustomerOption,
  KendaraanOption,
  MekanikOption,
} from "../../../src/hooks/work_order.hooks";

// ============================================================
// KOMPONEN DROPDOWN GENERIC
// ============================================================

interface DropdownItem {
  value: string;
  label: string;
  sublabel?: string;
}

function DropdownField({
  label,
  required,
  placeholder,
  selected,
  items,
  isLoading,
  onSelect,
  onClear,
  error,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  selected: DropdownItem | null;
  items: DropdownItem[];
  isLoading?: boolean;
  onSelect: (item: DropdownItem) => void;
  onClear?: () => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        i.sublabel?.toLowerCase().includes(q)
    );
  }, [items, search]);

  return (
    <View style={ddStyles.wrapper}>
      <Text style={ddStyles.label}>
        {label}
        {required && <Text style={ddStyles.required}> *</Text>}
      </Text>

      <TouchableOpacity
        style={[ddStyles.trigger, error ? ddStyles.triggerError : null]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#9CA3AF" />
        ) : selected ? (
          <View style={ddStyles.selectedContent}>
            <View style={{ flex: 1 }}>
              <Text style={ddStyles.selectedLabel}>{selected.label}</Text>
              {selected.sublabel ? (
                <Text style={ddStyles.selectedSublabel}>
                  {selected.sublabel}
                </Text>
              ) : null}
            </View>
            {onClear && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Text style={ddStyles.placeholder}>{placeholder}</Text>
        )}
        {!selected && (
          <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
        )}
      </TouchableOpacity>

      {error ? <Text style={ddStyles.errorText}>{error}</Text> : null}

      {/* Modal Picker */}
      <Modal visible={open} transparent animationType="slide">
        <View style={ddStyles.modalOverlay}>
          <View style={ddStyles.modalSheet}>
            <View style={ddStyles.modalHandle} />
            <Text style={ddStyles.modalTitle}>Pilih {label}</Text>

            <View style={ddStyles.searchBox}>
              <Ionicons name="search-outline" size={15} color="#9CA3AF" />
              <TextInput
                style={ddStyles.searchInput}
                placeholder={`Cari ${label.toLowerCase()}...`}
                placeholderTextColor="#9CA3AF"
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
            </View>

            {filtered.length === 0 ? (
              <View style={ddStyles.emptyBox}>
                <Ionicons name="search-outline" size={32} color="#D1D5DB" />
                <Text style={ddStyles.emptyText}>Tidak ada hasil</Text>
              </View>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(i) => i.value}
                style={{ maxHeight: 340 }}
                renderItem={({ item }) => {
                  const isSelected = selected?.value === item.value;
                  return (
                    <TouchableOpacity
                      style={[
                        ddStyles.optionItem,
                        isSelected && ddStyles.optionItemSelected,
                      ]}
                      onPress={() => {
                        onSelect(item);
                        setSearch("");
                        setOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            ddStyles.optionLabel,
                            isSelected && ddStyles.optionLabelSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {item.sublabel ? (
                          <Text style={ddStyles.optionSublabel}>
                            {item.sublabel}
                          </Text>
                        ) : null}
                      </View>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#2563EB"
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            <TouchableOpacity
              style={ddStyles.cancelBtn}
              onPress={() => {
                setSearch("");
                setOpen(false);
              }}
            >
              <Text style={ddStyles.cancelText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const ddStyles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  required: { color: "#EF4444" },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    minHeight: 46,
    gap: 8,
  },
  triggerError: { borderColor: "#EF4444", backgroundColor: "#FFF5F5" },
  selectedContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectedLabel: { fontSize: 14, color: "#111827", fontWeight: "500" },
  selectedSublabel: { fontSize: 11, color: "#6B7280", marginTop: 1 },
  placeholder: { flex: 1, fontSize: 14, color: "#9CA3AF" },
  errorText: { fontSize: 11, color: "#EF4444", marginTop: 4 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 36 : 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  optionItemSelected: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  optionLabel: { fontSize: 14, color: "#1F2937" },
  optionLabelSelected: { color: "#2563EB", fontWeight: "600" },
  optionSublabel: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  emptyBox: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 13, color: "#9CA3AF" },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  cancelText: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
});

// ============================================================
// KOMPONEN INLINE ERROR BANNER
// ============================================================

function ErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <View style={errorBannerStyles.container}>
      <Ionicons name="alert-circle" size={18} color="#DC2626" />
      <Text style={errorBannerStyles.text} numberOfLines={3}>
        {message}
      </Text>
      <TouchableOpacity
        onPress={onDismiss}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={16} color="#DC2626" />
      </TouchableOpacity>
    </View>
  );
}

const errorBannerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginBottom: 16,
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: "#DC2626",
    lineHeight: 18,
  },
});

// ============================================================
// SCREEN UTAMA
// ============================================================

interface FormErrors {
  kendaraan_id?: string;
}

export default function CreateWorkOrderScreen() {
  const {
    booking_id,
    user_id: prefilledUserId,
    kendaraan_id: prefilledKendaraanId,
    keluhan,
  } = useLocalSearchParams<{
    booking_id?: string;
    user_id?: string;
    kendaraan_id?: string;
    keluhan?: string;
  }>();

  // State selections
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerOption | null>(null);
  const [selectedKendaraan, setSelectedKendaraan] =
    useState<KendaraanOption | null>(null);
  const [selectedMekanik, setSelectedMekanik] = useState<MekanikOption | null>(
    null
  );
  const [catatanAwal, setCatatanAwal] = useState("");
  const [estimasiBiaya, setEstimasiBiaya] = useState("");

  // Error state
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Data dropdown
  const { customers, isLoading: loadingCustomers } = useGetAllCustomers();
  const { kendaraanList, isLoading: loadingKendaraan } = useGetAllKendaraan();
  const { mekanikList, isLoading: loadingMekanik } = useGetAllMekanik();

  // Pre-fill from booking params (run once when data is ready)
  const prefillDone = useRef(false);
  useEffect(() => {
    if (prefillDone.current) return;
    if (!prefilledKendaraanId && !prefilledUserId) return;
    if (loadingCustomers || loadingKendaraan) return;

    if (prefilledUserId) {
      const customer = customers.find((c) => c.user_id === prefilledUserId);
      if (customer) setSelectedCustomer(customer);
    }
    if (prefilledKendaraanId) {
      const kendaraan = kendaraanList.find(
        (k) => k.kendaraan_id === prefilledKendaraanId
      );
      if (kendaraan) setSelectedKendaraan(kendaraan);
    }
    if (keluhan) setCatatanAwal(keluhan);

    prefillDone.current = true;
  }, [customers, kendaraanList, loadingCustomers, loadingKendaraan]);

  // Mapping ke DropdownItem
  const customerItems = useMemo<DropdownItem[]>(
    () =>
      customers.map((c) => ({
        value: c.user_id,
        label: c.nama,
        sublabel: c.email,
      })),
    [customers]
  );

  // Kendaraan: kalau customer sudah dipilih, filter by user_id
  const kendaraanItems = useMemo<DropdownItem[]>(() => {
    const list = selectedCustomer
      ? kendaraanList.filter((k: any) => k.user_id === selectedCustomer.user_id)
      : kendaraanList;
    return list.map((k) => ({
      value: k.kendaraan_id,
      label: `${k.merek} ${k.model}`,
      sublabel: k.nomor_polisi,
    }));
  }, [kendaraanList, selectedCustomer]);

  const mekanikItems = useMemo<DropdownItem[]>(
    () =>
      mekanikList.map((m) => ({
        value: m.mekanik_id,
        label: m.nama,
      })),
    [mekanikList]
  );

  const { createWorkOrderMutation } = useCreateWorkOrderMutation({
    onSuccess: (woId) => {
      router.replace(
        `/(beranda)/work_order/work_order_detail?id=${woId}` as any
      );
    },
    onError: (msg) => setSubmitError(msg),
  });

  const validate = (): boolean => {
    const errors: FormErrors = {};
    if (!selectedKendaraan) {
      errors.kendaraan_id = "Kendaraan wajib dipilih";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    setSubmitError(null);
    if (!validate()) return;

    const payload: CreateWorkOrderPayload = {
      kendaraan_id: selectedKendaraan!.kendaraan_id,
    };

    if (selectedCustomer) payload.user_id = selectedCustomer.user_id;
    if (selectedMekanik) payload.mekanik_id = selectedMekanik.mekanik_id;
    if (catatanAwal.trim()) payload.deskripsi_kerusakan = catatanAwal.trim();
    if (estimasiBiaya.trim())
      payload.estimasi_biaya = parseInt(estimasiBiaya, 10);
    if (booking_id) payload.booking_id = booking_id;

    console.log('[CreateWO] payload:', JSON.stringify(payload, null, 2));
    createWorkOrderMutation.mutate(payload);
  };

  const isLoading = createWorkOrderMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buat Work Order</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Booking badge */}
          {booking_id && (
            <View style={styles.bookingBadge}>
              <Ionicons name="calendar-check-outline" size={14} color="#2563EB" />
              <Text style={styles.bookingBadgeText}>
                Dari Booking #{booking_id.replace(/-/g, '').slice(0, 6).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Error Banner */}
          {submitError && (
            <ErrorBanner
              message={submitError}
              onDismiss={() => setSubmitError(null)}
            />
          )}

          {/* Section: Kendaraan & Customer */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="car-outline" size={13} color="#2563EB" />{" "}
              KENDARAAN
            </Text>

            <DropdownField
              label="Customer"
              placeholder="Pilih customer (opsional)"
              selected={
                selectedCustomer
                  ? {
                      value: selectedCustomer.user_id,
                      label: selectedCustomer.nama,
                      sublabel: selectedCustomer.email,
                    }
                  : null
              }
              items={customerItems}
              isLoading={loadingCustomers}
              onSelect={(item) => {
                const found = customers.find((c) => c.user_id === item.value);
                setSelectedCustomer(found ?? null);
                // Reset kendaraan kalau customer berganti
                setSelectedKendaraan(null);
              }}
              onClear={() => {
                setSelectedCustomer(null);
                setSelectedKendaraan(null);
              }}
            />

            <DropdownField
              label="Kendaraan"
              required
              placeholder="Pilih kendaraan"
              selected={
                selectedKendaraan
                  ? {
                      value: selectedKendaraan.kendaraan_id,
                      label: `${selectedKendaraan.merek} ${selectedKendaraan.model}`,
                      sublabel: selectedKendaraan.nomor_polisi,
                    }
                  : null
              }
              items={kendaraanItems}
              isLoading={loadingKendaraan}
              onSelect={(item) => {
                const found = kendaraanList.find(
                  (k) => k.kendaraan_id === item.value
                );
                setSelectedKendaraan(found ?? null);
                setFormErrors((prev) => ({ ...prev, kendaraan_id: undefined }));
              }}
              onClear={() => setSelectedKendaraan(null)}
              error={formErrors.kendaraan_id}
            />
          </View>

          {/* Section: Mekanik & Deskripsi */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="build-outline" size={13} color="#2563EB" />{" "}
              PENGERJAAN
            </Text>

            <DropdownField
              label="Mekanik"
              placeholder="Pilih mekanik (opsional)"
              selected={
                selectedMekanik
                  ? {
                      value: selectedMekanik.mekanik_id,
                      label: selectedMekanik.nama,
                    }
                  : null
              }
              items={mekanikItems}
              isLoading={loadingMekanik}
              onSelect={(item) => {
                const found = mekanikList.find(
                  (m) => m.mekanik_id === item.value
                );
                setSelectedMekanik(found ?? null);
              }}
              onClear={() => setSelectedMekanik(null)}
            />

            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>Deskripsi Kerusakan</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={catatanAwal}
                onChangeText={setCatatanAwal}
                placeholder="Jelaskan keluhan / kerusakan kendaraan..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>Estimasi Biaya</Text>
              <TextInput
                style={styles.input}
                value={estimasiBiaya}
                onChangeText={setEstimasiBiaya}
                placeholder="Contoh: 150000"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
              <Text style={styles.fieldHint}>
                Dalam Rupiah, tanpa titik/koma
              </Text>
            </View>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelText}>Batal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.submitText}>Buat Work Order</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2563EB",
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
  scrollContent: { padding: 16 },
  bookingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  bookingBadgeText: { fontSize: 13, fontWeight: "600", color: "#2563EB" },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 14,
    letterSpacing: 0.6,
  },
  fieldWrapper: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  fieldHint: { fontSize: 11, color: "#9CA3AF", marginTop: 4 },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#111827",
  },
  inputMultiline: { minHeight: 88, paddingTop: 11 },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: Platform.OS === "ios" ? 28 : 14,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  cancelText: { fontSize: 15, fontWeight: "600", color: "#6B7280" },
  submitBtn: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});
