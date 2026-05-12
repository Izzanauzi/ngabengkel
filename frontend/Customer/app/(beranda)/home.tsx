import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useGetSchedule } from "../../src/hooks/schedule.hooks";
import { useAuth } from "@/src/contexts/auth.context";
import { useGetAllKendaraan } from "../../src/hooks/kendaraan.hooks";

// ── Dummy Data (ganti dengan API nanti) ───────────────────────────────────────
const DUMMY_USER_NAME = "Budi";
const DUMMY_SERVIS_AKTIF = {
  nomorWO: "WO-20250801-003",
  status: "Sedang Dikerjakan",
  kendaraan: "Honda Vario 150",
  platNomor: "D 1234 ABC",
};
const DUMMY_SERVIS_TERAKHIR = [
  { id: "1", kendaraan: "Honda Vario 150", tanggal: "20 Jul 2025", biaya: "Rp 250.000", status: "Lunas" },
  { id: "2", kendaraan: "Honda Beat 2020", tanggal: "15 Jul 2025", biaya: "Rp 250.000", status: "Lunas" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Beranda() {
  const { slots, jumlahAntrian, isLoading, refetch } = useGetSchedule();

  const slotTersedia = slots.filter((s) => s.status === "tersedia").length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={["#1565C0"]} />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Halo, {DUMMY_USER_NAME} 👋</Text>
            <Text style={styles.subGreeting}>Selamat datang kembali di Ngabengkel</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color="#1A1A2E" />
          </TouchableOpacity>
        </View>

        {/* ── Kondisi Bengkel ── */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Kondisi Bengkel Sekarang</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator color="#1565C0" style={{ marginVertical: 16 }} />
          ) : (
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { borderColor: "#43A047" }]}>
                <Text style={[styles.statNumber, { color: "#43A047" }]}>{slotTersedia}</Text>
                <Text style={styles.statLabel}>✓ Slot Tersedia</Text>
              </View>
              <View style={[styles.statBox, { borderColor: "#1565C0" }]}>
                <Text style={[styles.statNumber, { color: "#1565C0" }]}>{jumlahAntrian}</Text>
                <Text style={styles.statLabel}>⏳ Antrian</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Servis Aktif ── */}
        {DUMMY_SERVIS_AKTIF && (
          <View style={[styles.card, styles.servisAktifCard]}>
            <View style={styles.servisAktifHeader}>
              <Text style={styles.servisAktifWO}>{DUMMY_SERVIS_AKTIF.nomorWO}</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{DUMMY_SERVIS_AKTIF.status}</Text>
              </View>
            </View>
            <Text style={styles.servisAktifKendaraan}>{DUMMY_SERVIS_AKTIF.kendaraan}</Text>
            <Text style={styles.servisAktifPlat}>{DUMMY_SERVIS_AKTIF.platNomor}</Text>
            <TouchableOpacity
              style={styles.detailBtn}
              onPress={() => router.push("/(beranda)/services/1")}
            >
              <Text style={styles.detailBtnText}>Lihat Detail</Text>
              <Ionicons name="chevron-forward" size={14} color="#1565C0" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Booking Servis ── */}
        <TouchableOpacity
          style={styles.bookingBtn}
          onPress={() => router.push("/(beranda)/booking")}
        >
          <Ionicons name="construct-outline" size={18} color="#FFF" />
          <Text style={styles.bookingBtnText}>Booking Servis</Text>
        </TouchableOpacity>

        {/* ── Servis Terakhir ── */}
        <Text style={styles.sectionTitle}>Servis Terakhir</Text>
        <View style={styles.servisGrid}>
          {DUMMY_SERVIS_TERAKHIR.map((item) => (
            <View key={item.id} style={styles.servisCard}>
              <Text style={styles.servisKendaraan} numberOfLines={1}>{item.kendaraan}</Text>
              <Text style={styles.servisTanggal}>{item.tanggal}</Text>
              <Text style={styles.servisBiaya}>{item.biaya}</Text>
              <View style={styles.servisStatusRow}>
                <Ionicons name="checkmark-circle" size={13} color="#43A047" />
                <Text style={styles.servisStatusText}>{item.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Jadwal & Antrian Banner ── */}
        <TouchableOpacity
          style={styles.jadwalBanner}
          onPress={() => router.push("/(beranda)/schedule/")}
        >
          <View style={styles.jadwalBannerLeft}>
            <Ionicons name="calendar-outline" size={20} color="#1565C0" />
            <View>
              <Text style={styles.jadwalBannerTitle}>Jadwal & Antrian</Text>
              <Text style={styles.jadwalBannerSub}>Lihat status slot bengkel secara live</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#1565C0" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F6FA" },
  scroll: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  greeting: { fontSize: 20, fontWeight: "800", color: "#1A1A2E" },
  subGreeting: { fontSize: 12, color: "#888", marginTop: 2 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#1A1A2E" },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#E8F5E9", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#43A047" },
  liveText: { fontSize: 11, fontWeight: "600", color: "#2E7D32" },

  statsRow: { flexDirection: "row", gap: 12 },
  statBox: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  statNumber: { fontSize: 32, fontWeight: "800" },
  statLabel: { fontSize: 12, color: "#666" },

  servisAktifCard: { borderLeftWidth: 4, borderLeftColor: "#FF6D00" },
  servisAktifHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  servisAktifWO: { fontSize: 12, color: "#888", fontWeight: "500" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#FFF3E0", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FF6D00" },
  statusText: { fontSize: 11, fontWeight: "600", color: "#E65100" },
  servisAktifKendaraan: { fontSize: 16, fontWeight: "700", color: "#1A1A2E", marginBottom: 2 },
  servisAktifPlat: { fontSize: 13, color: "#888", marginBottom: 12 },
  detailBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#1565C0", borderRadius: 8, paddingVertical: 8, gap: 4 },
  detailBtnText: { color: "#1565C0", fontWeight: "600", fontSize: 13 },

  bookingBtn: {
    backgroundColor: "#1565C0",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
    marginBottom: 20,
    shadowColor: "#1565C0",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  bookingBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },

  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A2E", marginBottom: 10 },

  servisGrid: { flexDirection: "row", gap: 10, marginBottom: 14 },
  servisCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 3,
  },
  servisKendaraan: { fontSize: 13, fontWeight: "700", color: "#1A1A2E" },
  servisTanggal: { fontSize: 11, color: "#999" },
  servisBiaya: { fontSize: 13, fontWeight: "600", color: "#1A1A2E", marginTop: 4 },
  servisStatusRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  servisStatusText: { fontSize: 11, color: "#43A047", fontWeight: "600" },

  jadwalBanner: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#90CAF9",
  },
  jadwalBannerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  jadwalBannerTitle: { fontSize: 14, fontWeight: "700", color: "#1565C0" },
  jadwalBannerSub: { fontSize: 11, color: "#1976D2", marginTop: 1 },
});