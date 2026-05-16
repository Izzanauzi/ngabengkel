import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCreateBooking } from "../../../src/hooks/booking.hooks";
import { useGetAllKendaraan } from "../../../src/hooks/kendaraan.hooks";
import { Kendaraan } from "../../../src/@types/kendaraan.types";
import { useToast } from "../../../src/contexts/toast.context";

const STEP_LABELS = ["Kendaraan", "Jadwal", "Keluhan", "Konfirmasi"];
const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const DAYS = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
const ALL_JAM = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];

function getAvailableJam(selectedDate: Date | null): string[] {
  if (!selectedDate) return ALL_JAM;
  const now = new Date();
  const isToday =
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getDate() === now.getDate();
  if (!isToday) return ALL_JAM;
  const currentHour = now.getHours();
  return ALL_JAM.filter((t) => parseInt(t.split(":")[0], 10) > currentHour);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function BookingServis() {
  const today = new Date();

  // ── Data kendaraan dari API ───────────────────────────────────────────────
  const { kendaraanList: kendaraans, isLoading: isLoadingKendaraan } = useGetAllKendaraan();
  const { showSuccess } = useToast();

  const [selectedKendaraanId, setSelectedKendaraanId] = useState<string | null>(null);
  const [showKendaraanPicker, setShowKendaraanPicker] = useState(false);
  const [tanggal, setTanggal] = useState("");
  const [jam, setJam] = useState("09:00");
  const [keluhan, setKeluhan] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [showCalendar, setShowCalendar] = useState(false);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const { createBookingMutation } = useCreateBooking({
    successAction: () => {
      showSuccess("Booking berhasil dibuat! Tunggu konfirmasi bengkel.", () =>
        router.replace("/(beranda)/services")
      );
    },
  });

  const selectedKendaraan = kendaraans.find((k) => k.kendaraan_id === selectedKendaraanId) ?? null;
  const selectedKendaraanLabel = selectedKendaraan
    ? `${selectedKendaraan.merek} ${selectedKendaraan.model} · ${selectedKendaraan.nomor_polisi}`
    : null;

  const jamOptions = getAvailableJam(selectedDate);

  const activeStep = !selectedKendaraanId ? 0 : !tanggal ? 1 : keluhan.trim().length === 0 ? 2 : 3;
  const canSubmit = !!selectedKendaraanId && !!tanggal && keluhan.trim().length > 0;

  const handleSelectDay = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (d < todayStart) return;
    setSelectedDate(d);
    setTanggal(`${String(day).padStart(2, "0")} ${MONTHS[calMonth]} ${calYear}`);
    setShowCalendar(false);
    // Reset jam if it's no longer available for the selected date
    const available = getAvailableJam(d);
    if (available.length > 0 && !available.includes(jam)) {
      setJam(available[0]);
    }
  };

  const buildETARFC3339 = (): string => {
    if (!selectedDate) return "";
    const [h, m] = jam.split(":").map(Number);
    const dt = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), h, m, 0);
    return dt.toISOString();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    createBookingMutation.mutate({
      kendaraan_id: selectedKendaraanId!,
      eta: buildETARFC3339(),
      keluhan_awal: keluhan.trim() || undefined,
    });
  };

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Servis Baru</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Stepper */}
      <View style={styles.stepper}>
        {STEP_LABELS.map((label, i) => (
          <React.Fragment key={i}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, i <= activeStep && styles.stepCircleActive]}>
                {i < activeStep
                  ? <Ionicons name="checkmark" size={12} color="#FFF" />
                  : <Text style={[styles.stepNum, i === activeStep && styles.stepNumActive]}>{i + 1}</Text>
                }
              </View>
              <Text style={[styles.stepLabel, i === activeStep && styles.stepLabelActive]}>{label}</Text>
            </View>
            {i < STEP_LABELS.length - 1 && (
              <View style={[styles.stepLine, i < activeStep && styles.stepLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>
      {activeStep === 0 && <Text style={styles.stepHint}>Pilih kendaraan terlebih dahulu</Text>}

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── Step 1: Kendaraan ── */}
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumBig, !!selectedKendaraanId && styles.stepNumBigDone]}>
              {selectedKendaraanId
                ? <Ionicons name="checkmark" size={14} color="#FFF" />
                : <Text style={styles.stepNumBigText}>1</Text>}
            </View>
            <Text style={styles.stepTitle}>Pilih Kendaraan</Text>
          </View>

          <TouchableOpacity
            style={styles.picker}
            onPress={() => !isLoadingKendaraan && setShowKendaraanPicker(!showKendaraanPicker)}
          >
            {isLoadingKendaraan
              ? <ActivityIndicator size="small" color="#1565C0" />
              : <Ionicons name="bicycle-outline" size={16} color="#888" />
            }
            <Text style={selectedKendaraanLabel ? styles.pickerValue : styles.pickerPlaceholder}>
              {isLoadingKendaraan
                ? "Memuat kendaraan..."
                : selectedKendaraanLabel ?? "Pilih kendaraan terdaftar..."}
            </Text>
            {!isLoadingKendaraan && (
              <Ionicons name={showKendaraanPicker ? "chevron-up" : "chevron-down"} size={16} color="#888" />
            )}
          </TouchableOpacity>

          {showKendaraanPicker && (
            <View style={styles.dropdownList}>
              {kendaraans.length === 0 ? (
                <View style={styles.dropdownEmpty}>
                  <Text style={styles.dropdownEmptyText}>Tidak ada kendaraan terdaftar</Text>
                </View>
              ) : (
                kendaraans.map((k) => (
                  <TouchableOpacity
                    key={k.kendaraan_id}
                    style={[styles.dropdownItem, selectedKendaraanId === k.kendaraan_id && styles.dropdownItemActive]}
                    onPress={() => { setSelectedKendaraanId(k.kendaraan_id); setShowKendaraanPicker(false); }}
                  >
                    <Ionicons name="bicycle-outline" size={16} color="#1565C0" />
                    <Text style={styles.dropdownItemText}>
                      {k.merek} {k.model} · {k.nomor_polisi}
                    </Text>
                    {selectedKendaraanId === k.kendaraan_id && (
                      <Ionicons name="checkmark-circle" size={16} color="#1565C0" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        {/* ── Step 2: ETA ── */}
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumBig, !!tanggal && styles.stepNumBigDone]}>
              {tanggal ? <Ionicons name="checkmark" size={14} color="#FFF" /> : <Text style={styles.stepNumBigText}>2</Text>}
            </View>
            <Text style={styles.stepTitle}>Estimasi Waktu Kedatangan (ETA)</Text>
          </View>

          <View style={styles.jadwalRow}>
            <TouchableOpacity style={[styles.picker, { flex: 1 }]} onPress={() => setShowCalendar(true)}>
              <Ionicons name="calendar-outline" size={16} color="#888" />
              <Text style={tanggal ? styles.pickerValue : styles.pickerPlaceholder}>
                {tanggal || "Pilih tanggal"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.jamPicker} onPress={() => setShowTimePicker(true)}>
              <Ionicons name="time-outline" size={16} color="#1565C0" />
              <Text style={styles.jamText}>{jam}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Ketuk tanggal untuk membuka kalender</Text>
        </View>

        {/* ── Step 3: Keluhan ── */}
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumBig, keluhan.trim().length > 0 && styles.stepNumBigDone]}>
              {keluhan.trim().length > 0
                ? <Ionicons name="checkmark" size={14} color="#FFF" />
                : <Text style={styles.stepNumBigText}>3</Text>}
            </View>
            <Text style={styles.stepTitle}>Keluhan Awal</Text>
          </View>

          <TextInput
            style={styles.textarea}
            placeholder="Deskripsikan keluhan kendaraan Anda..."
            placeholderTextColor="#BDBDBD"
            multiline
            numberOfLines={5}
            value={keluhan}
            onChangeText={setKeluhan}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{keluhan.length} karakter</Text>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={16} color="#F57F17" />
          <Text style={styles.infoText}>
            Booking Anda akan dikonfirmasi oleh admin bengkel. Harap tiba tepat waktu sesuai ETA yang ditentukan.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, (!canSubmit || createBookingMutation.isPending) && styles.nextBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || createBookingMutation.isPending}
        >
          {createBookingMutation.isPending
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.nextBtnText}>Buat Booking Servis</Text>
          }
        </TouchableOpacity>
      </View>

      {/* ── Modal Kalender ── */}
      <Modal visible={showCalendar} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCalendar(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.calendarModal}>
            <View style={styles.calNav}>
              <TouchableOpacity onPress={prevMonth} style={styles.calNavBtn}>
                <Ionicons name="chevron-back" size={18} color="#1565C0" />
              </TouchableOpacity>
              <Text style={styles.calNavTitle}>{MONTHS[calMonth]} {calYear}</Text>
              <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn}>
                <Ionicons name="chevron-forward" size={18} color="#1565C0" />
              </TouchableOpacity>
            </View>
            <View style={styles.calDayHeader}>
              {DAYS.map((d) => <Text key={d} style={styles.calDayLabel}>{d}</Text>)}
            </View>
            <View style={styles.calGrid}>
              {Array.from({ length: firstDay }).map((_, i) => <View key={`e-${i}`} style={styles.calCell} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const isPast = new Date(calYear, calMonth, day) < todayStart;
                const isSelected =
                  selectedDate?.getDate() === day &&
                  selectedDate?.getMonth() === calMonth &&
                  selectedDate?.getFullYear() === calYear;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.calCell, isSelected && styles.calCellSelected, isPast && styles.calCellPast]}
                    onPress={() => !isPast && handleSelectDay(day)}
                    disabled={isPast}
                  >
                    <Text style={[styles.calCellText, isSelected && styles.calCellTextSelected, isPast && styles.calCellTextPast]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── Modal Jam ── */}
      <Modal visible={showTimePicker} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTimePicker(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.timeModal}>
            <Text style={styles.timeModalTitle}>Pilih Jam</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 280 }}>
              {jamOptions.length === 0 ? (
                <Text style={{ textAlign: "center", color: "#BDBDBD", padding: 16 }}>
                  Tidak ada jam tersedia untuk hari ini
                </Text>
              ) : null}
              {jamOptions.map((j) => (
                <TouchableOpacity
                  key={j}
                  style={[styles.timeOption, jam === j && styles.timeOptionActive]}
                  onPress={() => { setJam(j); setShowTimePicker(false); }}
                >
                  <Ionicons name="time-outline" size={16} color={jam === j ? "#FFF" : "#555"} />
                  <Text style={[styles.timeOptionText, jam === j && styles.timeOptionTextActive]}>{j}</Text>
                  {jam === j && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1A1A2E" },
  stepper: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 4 },
  stepItem: { alignItems: "center", gap: 4 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#E0E0E0", alignItems: "center", justifyContent: "center" },
  stepCircleActive: { backgroundColor: "#1565C0" },
  stepNum: { fontSize: 12, fontWeight: "700", color: "#999" },
  stepNumActive: { color: "#FFF" },
  stepLabel: { fontSize: 10, color: "#BBB", fontWeight: "500" },
  stepLabelActive: { color: "#1565C0", fontWeight: "700" },
  stepLine: { flex: 1, height: 2, backgroundColor: "#E0E0E0", marginBottom: 16 },
  stepLineActive: { backgroundColor: "#1565C0" },
  stepHint: { textAlign: "center", fontSize: 12, color: "#BDBDBD", marginBottom: 8 },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
  card: { backgroundColor: "#FFF", borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  stepHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  stepNumBig: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#E3F2FD", alignItems: "center", justifyContent: "center" },
  stepNumBigDone: { backgroundColor: "#1565C0" },
  stepNumBigText: { color: "#1565C0", fontWeight: "800", fontSize: 14 },
  stepTitle: { fontSize: 14, fontWeight: "700", color: "#1A1A2E" },
  picker: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: "#E0E0E0", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, gap: 8, backgroundColor: "#FAFAFA" },
  pickerPlaceholder: { flex: 1, color: "#BBB", fontSize: 14 },
  pickerValue: { flex: 1, color: "#1A1A2E", fontSize: 14, fontWeight: "500" },
  dropdownList: { borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 10, marginTop: 6, overflow: "hidden" },
  dropdownItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  dropdownItemActive: { backgroundColor: "#E3F2FD" },
  dropdownItemText: { flex: 1, fontSize: 13, color: "#1A1A2E" },
  dropdownEmpty: { padding: 16, alignItems: "center" },
  dropdownEmptyText: { color: "#BDBDBD", fontSize: 13 },
  jadwalRow: { flexDirection: "row", gap: 10 },
  jamPicker: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: "#1565C0", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, gap: 6, backgroundColor: "#E3F2FD" },
  jamText: { fontSize: 14, fontWeight: "700", color: "#1565C0" },
  hint: { marginTop: 8, fontSize: 12, color: "#BDBDBD" },
  textarea: { borderWidth: 1.5, borderColor: "#E0E0E0", borderRadius: 10, padding: 12, fontSize: 14, color: "#1A1A2E", minHeight: 120, backgroundColor: "#FAFAFA" },
  charCount: { textAlign: "right", fontSize: 11, color: "#BDBDBD", marginTop: 4 },
  infoBanner: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#FFF8E1", borderColor: "#FFD54F", borderWidth: 1, borderRadius: 10, padding: 12, gap: 8 },
  infoText: { flex: 1, fontSize: 12, color: "#F57F17", lineHeight: 18 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: "#F5F6FA" },
  nextBtn: { backgroundColor: "#1565C0", borderRadius: 12, alignItems: "center", justifyContent: "center", paddingVertical: 14 },
  nextBtnDisabled: { backgroundColor: "#BDBDBD" },
  nextBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 24 },
  calendarModal: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, width: "100%", maxWidth: 340 },
  calNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  calNavBtn: { padding: 6 },
  calNavTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A2E" },
  calDayHeader: { flexDirection: "row", marginBottom: 6 },
  calDayLabel: { flex: 1, textAlign: "center", fontSize: 11, fontWeight: "600", color: "#999" },
  calGrid: { flexDirection: "row", flexWrap: "wrap" },
  calCell: { width: "14.28%", aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  calCellSelected: { backgroundColor: "#1565C0", borderRadius: 20 },
  calCellPast: { opacity: 0.3 },
  calCellText: { fontSize: 13, color: "#1A1A2E", fontWeight: "500" },
  calCellTextSelected: { color: "#FFF", fontWeight: "700" },
  calCellTextPast: { color: "#BBB" },
  timeModal: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, width: "100%", maxWidth: 280 },
  timeModalTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A2E", marginBottom: 12, textAlign: "center" },
  timeOption: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, marginBottom: 4 },
  timeOptionActive: { backgroundColor: "#1565C0" },
  timeOptionText: { flex: 1, fontSize: 14, color: "#333" },
  timeOptionTextActive: { color: "#FFF", fontWeight: "600" },
});