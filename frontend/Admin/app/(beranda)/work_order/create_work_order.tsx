import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
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

// ── Generic Dropdown ──────────────────────────────────────────────────────────

interface DropdownItem {
  value: string;
  label: string;
  sublabel?: string;
}

function Dropdown({
  label,
  required,
  placeholder,
  selected,
  items,
  isLoading,
  disabled,
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
  disabled?: boolean;
  onSelect: (item: DropdownItem) => void;
  onClear?: () => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? items.filter(
          (i) =>
            i.label.toLowerCase().includes(q) ||
            (i.sublabel ?? "").toLowerCase().includes(q)
        )
      : items;
  }, [items, search]);

  return (
    <View style={dd.wrapper}>
      <Text style={dd.label}>
        {label}
        {required && <Text style={{ color: "#EF4444" }}> *</Text>}
      </Text>

      <TouchableOpacity
        style={[
          dd.trigger,
          error && dd.triggerError,
          disabled && dd.triggerDisabled,
        ]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#9CA3AF" style={{ flex: 1 }} />
        ) : selected ? (
          <View style={{ flex: 1 }}>
            <Text style={dd.selectedLabel} numberOfLines={1}>
              {selected.label}
            </Text>
            {selected.sublabel && (
              <Text style={dd.selectedSub}>{selected.sublabel}</Text>
            )}
          </View>
        ) : (
          <Text style={dd.placeholder}>{placeholder}</Text>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {selected && onClear && (
            <TouchableOpacity
              onPress={onClear}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={17} color="#9CA3AF" />
            </TouchableOpacity>
          )}
          <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
        </View>
      </TouchableOpacity>

      {error && <Text style={dd.errorText}>{error}</Text>}
      <Modal visible={open} transparent animationType="none">
        <View style={dd.overlay} />
      </Modal>
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <View style={dd.sheet}>
            <View style={dd.handle} />
            <Text style={dd.sheetTitle}>Pilih {label}</Text>
            <View style={dd.searchBox}>
              <Ionicons name="search-outline" size={15} color="#9CA3AF" />
              <TextInput
                style={dd.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder={`Cari ${label.toLowerCase()}...`}
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={15} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
            {filtered.length === 0 ? (
              <View style={dd.empty}>
                <Ionicons name="search-outline" size={32} color="#D1D5DB" />
                <Text style={dd.emptyText}>Tidak ada hasil</Text>
              </View>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(i) => i.value}
                style={{ maxHeight: 340 }}
                keyboardShouldPersistTaps="handled"
                ItemSeparatorComponent={() => (
                  <View style={{ height: 1, backgroundColor: "#F3F4F6" }} />
                )}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      dd.option,
                      selected?.value === item.value && dd.optionActive,
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
                          dd.optionLabel,
                          selected?.value === item.value && {
                            color: "#2563EB",
                            fontWeight: "600",
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.sublabel && (
                        <Text style={dd.optionSub}>{item.sublabel}</Text>
                      )}
                    </View>
                    {selected?.value === item.value && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#2563EB"
                      />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity
              style={dd.closeBtn}
              onPress={() => {
                setSearch("");
                setOpen(false);
              }}
            >
              <Text style={dd.closeBtnText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const dd = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    minHeight: 46,
    gap: 8,
  },
  triggerError: { borderColor: "#EF4444", backgroundColor: "#FFF5F5" },
  triggerDisabled: { backgroundColor: "#F9FAFB", opacity: 0.6 },
  selectedLabel: { fontSize: 14, color: "#111827", fontWeight: "500" },
  selectedSub: { fontSize: 11, color: "#6B7280", marginTop: 1 },
  placeholder: { flex: 1, fontSize: 14, color: "#9CA3AF" },
  errorText: { fontSize: 11, color: "#EF4444", marginTop: 4 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 36 : 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 14,
  },
  sheetTitle: {
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
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 4,
  },
  optionActive: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  optionLabel: { fontSize: 14, color: "#1F2937" },
  optionSub: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  empty: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 13, color: "#9CA3AF" },
  closeBtn: {
    marginTop: 12,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  closeBtnText: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
});

// ── Main Screen ───────────────────────────────────────────────────────────────

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
  const [estimasi, setEstimasi] = useState("");
  const [errors, setErrors] = useState<{ kendaraan_id?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

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
        sublabel: c.telepon ?? c.email,
      })),
    [customers]
  );

  const kendaraanItems = useMemo<DropdownItem[]>(
    () =>
      filteredKendaraan.map((k) => ({
        value: k.kendaraan_id,
        label: `${k.merek} ${k.model} (${k.tahun})`,
        sublabel: k.nomor_polisi,
      })),
    [filteredKendaraan]
  );

  const mekanikItems = useMemo<DropdownItem[]>(
    () =>
      mekanikList.map((m) => ({
        value: m.mekanik_id,
        label: m.nama,
        sublabel: m.keahlian ?? undefined,
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

  const handleSubmit = () => {
    setSubmitError(null);
    if (!selectedKendaraan) {
      setErrors({ kendaraan_id: "Kendaraan wajib dipilih" });
      return;
    }
    setErrors({});

    const payload: CreateWorkOrderPayload = {
      kendaraan_id: selectedKendaraan!.kendaraan_id,
    };

    if (selectedCustomer) payload.user_id = selectedCustomer.user_id;
    if (selectedMekanik) payload.mekanik_id = selectedMekanik.mekanik_id;
    if (catatanAwal.trim()) payload.deskripsi_kerusakan = catatanAwal.trim();
    if (estimasiBiaya.trim())
      payload.estimasi_biaya = parseInt(estimasiBiaya, 10);
    if (booking_id) payload.booking_id = booking_id;

    console.log("[CreateWO] payload:", JSON.stringify(payload, null, 2));
    createWorkOrderMutation.mutate(payload);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={s.container}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Booking badge */}
          {booking_id && (
            <View style={styles.bookingBadge}>
              <Ionicons
                name="calendar-check-outline"
                size={14}
                color="#2563EB"
              />
              <Text style={styles.bookingBadgeText}>
                Dari Booking #
                {booking_id.replace(/-/g, "").slice(0, 6).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Error Banner */}
          {submitError && (
            <View style={s.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
              <Text style={s.errorBannerText}>{submitError}</Text>
              <TouchableOpacity onPress={() => setSubmitError(null)}>
                <Ionicons name="close" size={16} color="#DC2626" />
              </TouchableOpacity>
            </View>
          )}

          {/* Section Kendaraan */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>🚗 KENDARAAN</Text>

            <Dropdown
              label="Customer"
              placeholder="Pilih customer (opsional)"
              items={customerItems}
              isLoading={loadingCustomers}
              selected={
                selectedCustomer
                  ? {
                      value: selectedCustomer.user_id,
                      label: selectedCustomer.nama,
                      sublabel:
                        selectedCustomer.telepon ?? selectedCustomer.email,
                    }
                  : null
              }
              onSelect={(item) => {
                const c =
                  customers.find((c) => c.user_id === item.value) ?? null;
                setSelectedCustomer(c);
                setSelectedKendaraan(null); // reset kendaraan saat ganti customer
              }}
              onClear={() => {
                setSelectedCustomer(null);
                setSelectedKendaraan(null);
              }}
            />

            <Dropdown
              label="Kendaraan"
              required
              placeholder={
                selectedCustomer
                  ? "Pilih kendaraan customer..."
                  : "Pilih kendaraan"
              }
              items={kendaraanItems}
              isLoading={loadingKendaraan}
              selected={
                selectedKendaraan
                  ? {
                      value: selectedKendaraan.kendaraan_id,
                      label: `${selectedKendaraan.merek} ${selectedKendaraan.model}`,
                      sublabel: selectedKendaraan.nomor_polisi,
                    }
                  : null
              }
              onSelect={(item) => {
                setSelectedKendaraan(
                  kendaraanList.find((k) => k.kendaraan_id === item.value) ??
                    null
                );
                setErrors({});
              }}
              onClear={() => setSelectedKendaraan(null)}
              error={errors.kendaraan_id}
            />
          </View>

          {/* Section Pengerjaan */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>🔧 PENGERJAAN</Text>

            <Dropdown
              label="Mekanik"
              placeholder="Pilih mekanik (opsional)"
              items={mekanikItems}
              isLoading={loadingMekanik}
              selected={
                selectedMekanik
                  ? {
                      value: selectedMekanik.mekanik_id,
                      label: selectedMekanik.nama,
                    }
                  : null
              }
              onSelect={(item) =>
                setSelectedMekanik(
                  mekanikList.find((m) => m.mekanik_id === item.value) ?? null
                )
              }
              onClear={() => setSelectedMekanik(null)}
            />

            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>Deskripsi Kerusakan</Text>
              <TextInput
                style={[s.input, s.textarea]}
                value={catatanAwal}
                onChangeText={setCatatanAwal}
                placeholder="Jelaskan keluhan atau kerusakan kendaraan..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={s.field}>
              <Text style={s.fieldLabel}>Estimasi Biaya</Text>
              <View style={s.currencyRow}>
                <Text style={s.currencyPrefix}>Rp</Text>
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  value={estimasi}
                  onChangeText={(v) => setEstimasi(v.replace(/\D/g, ""))}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>
              <Text style={s.hint}>Dalam Rupiah, tanpa titik/koma</Text>
            </View>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Footer */}
        <View style={s.footer}>
          <TouchableOpacity
            style={s.cancelBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={s.cancelText}>Batal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.submitBtn, createMutation.isPending && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
            activeOpacity={0.85}
          >
            {createMutation.isPending ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#FFF"
                />
                <Text style={s.submitText}>Buat Work Order</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2563EB",
    paddingTop: Platform.OS === "ios" ? 52 : 40,
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
    backgroundColor: "#FFF",
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
  field: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  hint: { fontSize: 11, color: "#9CA3AF", marginTop: 4 },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#111827",
  },
  textarea: { minHeight: 90, paddingTop: 11, textAlignVertical: "top" },
  currencyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  currencyPrefix: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: "#F3F4F6",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: Platform.OS === "ios" ? 28 : 14,
    backgroundColor: "#FFF",
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
  submitText: { fontSize: 15, fontWeight: "700", color: "#FFF" },
});
