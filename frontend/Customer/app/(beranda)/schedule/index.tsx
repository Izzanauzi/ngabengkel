import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useGetSchedule } from "../../../src/hooks/schedule.hooks";

// ── Helpers ───────────────────────────────────────────────────────────────────
const ESTIMASI_PER_KENDARAAN = 9;

const getSlotColor = (status: string) => {
  switch (status) {
    case "tersedia":
      return { bg: "#E8F5E9", border: "#43A047", text: "#2E7D32" };
    case "diservis":
      return { bg: "#FFEBEE", border: "#E53935", text: "#C62828" };
    case "ditutup":
    case "tidak_tersedia":
    default:
      return { bg: "#F5F5F5", border: "#BDBDBD", text: "#757575" };
  }
};

const getSlotLabel = (status: string) => {
  switch (status) {
    case "tersedia": return "Tersedia";
    case "diservis": return "Diservis";
    case "ditutup": return "Ditutup";
    case "tidak_tersedia": return "Tidak Tersedia";
    default: return status;
  }
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function JadwalAntrian() {
  const { slots, jumlahAntrian, isLoading, isError, refetch } = useGetSchedule();

  const estimasi = jumlahAntrian * ESTIMASI_PER_KENDARAAN;



  // ── Main ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={["#1565C0"]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          {/* <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#1A1A2E" />
          </TouchableOpacity> */}
          <Text style={styles.headerTitle}>Jadwal & Antrian</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Offline Banner - hanya muncul saat error koneksi */}
        {isError && (
          <View style={styles.offlineBanner}>
            <Ionicons name="warning-outline" size={16} color="#F57F17" />
            <Text style={styles.offlineText}>
              Data mungkin tidak terkini. Anda sedang menggunakan data cache karena koneksi tidak tersedia.
            </Text>
          </View>
        )}

        {/* Loading overlay tipis */}
        {isLoading && (
          <View style={styles.loadingBar}>
            <ActivityIndicator size="small" color="#1565C0" />
            <Text style={styles.loadingText}>Memperbarui data...</Text>
          </View>
        )}

        {/* Status Slot Bengkel */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status Slot Bengkel</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.slotRow}
          >
            {slots.length > 0 ? (
              slots.map((slot, index) => {
                const colors = getSlotColor(slot.status);
                return (
                  <View
                    key={slot.id ?? index}
                    style={[styles.slotCard, { backgroundColor: colors.bg, borderColor: colors.border }]}
                  >
                    <Text style={[styles.slotName, { color: colors.text }]}>
                      {slot.name ?? slot.label ?? `S${String(index + 1).padStart(2, "0")}`}
                    </Text>
                    <Text style={[styles.slotStatus, { color: colors.text }]}>
                      {getSlotLabel(slot.status)}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptySlot}>Belum ada data slot</Text>
            )}
          </ScrollView>
        </View>

        {/* Antrian Saat Ini */}
        <View style={[styles.card, styles.antrianCard]}>
          <Text style={styles.cardTitle}>Antrian Saat Ini</Text>
          <Text style={styles.antrianNumber}>{jumlahAntrian}</Text>
          <Text style={styles.antrianLabel}>kendaraan Mengantre</Text>
          <Text style={styles.estimasiText}>Estimasi waktu tunggu: ±{estimasi} Menit</Text>

          {jumlahAntrian > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dotsRow}
            >
              {Array.from({ length: Math.min(jumlahAntrian, 20) }).map((_, i) => (
                <View key={i} style={styles.dot}>
                  <Text style={styles.dotText}>{i + 1}</Text>
                </View>
              ))}
              {jumlahAntrian > 20 && (
                <Text style={styles.moreDots}>+{jumlahAntrian - 20}</Text>
              )}
            </ScrollView>
          )}
        </View>

        {/* Keterangan */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Keterangan</Text>
          {[
            { color: "#43A047", label: "Hijau = Slot kosong, siap menerima kendaraan" },
            { color: "#E53935", label: "Merah = Kendaraan sedang diservis" },
            { color: "#BDBDBD", label: "Abu = Slot ditutup sementara" },
          ].map((item, i) => (
            <View key={i} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F6FA" },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1A1A2E" },

  offlineBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF8E1",
    borderColor: "#FFD54F",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  offlineText: { flex: 1, fontSize: 13, color: "#F57F17", lineHeight: 18 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#333", marginBottom: 12 },

  slotRow: { gap: 10, paddingBottom: 4 },
  slotCard: {
    width: 80,
    height: 70,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  slotName: { fontSize: 14, fontWeight: "700" },
  slotStatus: { fontSize: 10, fontWeight: "500", textAlign: "center" },
  emptySlot: { color: "#BDBDBD", fontSize: 13 },

  antrianCard: { alignItems: "center" },
  antrianNumber: { fontSize: 64, fontWeight: "800", color: "#1565C0", lineHeight: 72 },
  antrianLabel: { fontSize: 14, color: "#555", marginBottom: 4 },
  estimasiText: { fontSize: 13, color: "#888", marginBottom: 12 },
  dotsRow: { gap: 8, paddingVertical: 4 },
  dot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#1565C0",
    alignItems: "center", justifyContent: "center",
  },
  dotText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  moreDots: { color: "#888", fontSize: 13, alignSelf: "center" },

  legendRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 13, color: "#444" },

  loadingBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
    marginBottom: 8,
  },
  loadingText: { color: "#888", fontSize: 12 },
});