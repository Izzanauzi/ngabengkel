import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// ── Dummy Data ────────────────────────────────────────────────────────────────
const KENDARAAN_LIST = [
  { id: "1", label: "Honda Vario 150 · D 1234 ABC" },
  { id: "2", label: "Yamaha NMAX · D 5678 XYZ" },
  { id: "3", label: "Honda Beat · D 9999 ZZZ" },
];

const STEP_LABELS = ["Kendaraan", "Jadwal", "Keluhan", "Konfirmasi"];
const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const DAYS = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
const JAM_OPTIONS = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BookingServis() {
  const today = new Date();

  const [selectedKendaraan, setSelectedKendaraan] = useState<string | null>(null);
  const [showKendaraanPicker, setShowKendaraanPicker] = useState(false);
  const [tanggal, setTanggal] = useState("");
  const [jam, setJam] = useState("09:00");
  const [keluhan, setKeluhan] = useState("");

  // Calendar state
  const [showCalendar, setShowCalendar] = useState(false);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Time picker state
  const [showTimePicker, setShowTimePicker] = useState(false);

  const selectedKendaraanLabel =
    KENDARAAN_LIST.find((k) => k.id === selectedKendaraan)?.label ?? null;

  const activeStep = !selectedKendaraan ? 0 : !tanggal ? 1 : keluhan.trim().length === 0 ? 2 : 3;
  const canSubmit = !!selectedKendaraan && !!tanggal && keluhan.trim().length > 0;

  const handleSelectDay = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return;
    setSelectedDay(day);
    setTanggal(`${String(day).padStart(2, "0")} ${MONTHS[calMonth]} ${calYear}`);
    setShowCalendar(false);
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };

  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

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
            <View style={[styles.stepNumBig, !!selectedKendaraan && styles.stepNumBigDone]}>
              {selectedKendaraan
                ? <Ionicons name="checkmark" size={14} color="#FFF" />
                : <Text style={styles.stepNumBigText}>1</Text>}
            </View>
            <Text style={styles.stepTitle}>Pilih Kendaraan</Text>
          </View>

          <TouchableOpacity style={styles.picker} onPress={() => setShowKendaraanPicker(!showKendaraanPicker)}>
            <Text style={selectedKendaraanLabel ? styles.pickerValue : styles.pickerPlaceholder}>
              {selectedKendaraanLabel ?? "Pilih kendaraan terdaftar..."}
            </Text>
            <Ionicons name={showKendaraanPicker ? "chevron-up" : "chevron-down"} size={16} color="#888" />
          </TouchableOpacity>

          {showKendaraanPicker && (
            <View style={styles.dropdownList}>
              {KENDARAAN_LIST.map((k) => (
                <TouchableOpacity
                  key={k.id}
                  style={[styles.dropdownItem, selectedKendaraan === k.id && styles.dropdownItemActive]}
                  onPress={() => { setSelectedKendaraan(k.id); setShowKendaraanPicker(false); }}
                >
                  <Ionicons name="bicycle-outline" size={16} color="#1565C0" />
                  <Text style={styles.dropdownItemText}>{k.label}</Text>
                  {selectedKendaraan === k.id && <Ionicons name="checkmark-circle" size={16} color="#1565C0" />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ── Step 2: ETA ── */}
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumBig, !!tanggal && styles.stepNumBigDone]}>
              {tanggal
                ? <Ionicons name="checkmark" size={14} color="#FFF" />
                : <Text style={styles.stepNumBigText}>2</Text>}
            </View>
            <Text style={styles.stepTitle}>Estimasi Waktu Kedatangan (ETA)</Text>
          </View>

          <View style={styles.jadwalRow}>
            {/* Tombol pilih tanggal */}
            <TouchableOpacity style={[styles.picker, { flex: 1 }]} onPress={() => setShowCalendar(true)}>
              <Ionicons name="calendar-outline" size={16} color="#888" />
              <Text style={tanggal ? styles.pickerValue : styles.pickerPlaceholder}>
                {tanggal || "Pilih tanggal"}
              </Text>
            </TouchableOpacity>

            {/* Tombol pilih jam */}
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
          style={[styles.nextBtn, !canSubmit && styles.nextBtnDisabled]}
          onPress={() => canSubmit && router.back()}
          disabled={!canSubmit}
        >
          <Text style={styles.nextBtnText}>Lengkapi Data Booking</Text>
        </TouchableOpacity>
      </View>

      {/* ── Modal Kalender ── */}
      <Modal visible={showCalendar} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCalendar(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.calendarModal}>
            {/* Nav bulan */}
            <View style={styles.calNav}>
              <TouchableOpacity onPress={prevMonth} style={styles.calNavBtn}>
                <Ionicons name="chevron-back" size={18} color="#1565C0" />
              </TouchableOpacity>
              <Text style={styles.calNavTitle}>{MONTHS[calMonth]} {calYear}</Text>
              <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn}>
                <Ionicons name="chevron-forward" size={18} color="#1565C0" />
              </TouchableOpacity>
            </View>

            {/* Header hari */}
            <View style={styles.calDayHeader}>
              {DAYS.map((d) => (
                <Text key={d} style={styles.calDayLabel}>{d}</Text>
              ))}
            </View>

            {/* Grid tanggal */}
            <View style={styles.calGrid}>
              {Array.from({ length: firstDay }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.calCell} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isPast = new Date(calYear, calMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const isSelected = selectedDay === day && calMonth === today.getMonth();
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

      {/* ── Modal Pilih Jam ── */}
      <Modal visible={showTimePicker} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTimePicker(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.timeModal}>
            <Text style={styles.timeModalTitle}>Pilih Jam</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 280 }}>
              {JAM_OPTIONS.map((j) => (
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

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 24 },

  // Calendar
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

  // Time picker
  timeModal: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, width: "100%", maxWidth: 280 },
  timeModalTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A2E", marginBottom: 12, textAlign: "center" },
  timeOption: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, marginBottom: 4 },
  timeOptionActive: { backgroundColor: "#1565C0" },
  timeOptionText: { flex: 1, fontSize: 14, color: "#333" },
  timeOptionTextActive: { color: "#FFF", fontWeight: "600" },
});