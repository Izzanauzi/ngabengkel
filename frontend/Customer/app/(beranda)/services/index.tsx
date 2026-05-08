import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// ── Dummy Data ────────────────────────────────────────────────────────────────
const SERVIS_AKTIF = [
  {
    id: "1",
    nomorWO: "WO-20250801-003",
    status: "Sedang Dikerjakan",
    kendaraan: "Honda Vario 150",
    platNomor: "D 1234 ABC",
    mekanik: "Ahmad Fauzi",
    mulaiServis: "01 Aug 2025, 10:00",
  },
];

const BOOKING_LIST = [
  {
    id: "b1",
    nomorBooking: "BK-20250805-001",
    status: "Menunggu Konfirmasi",
    kendaraan: "Honda Vario 150",
    platNomor: "D 1234 ABC",
    eta: "05 Aug 2025, 09:00",
  },
  {
    id: "b2",
    nomorBooking: "BK-20250810-002",
    status: "Dikonfirmasi",
    kendaraan: "Yamaha NMAX",
    platNomor: "D 5678 XYZ",
    eta: "10 Aug 2025, 14:00",
  },
  {
    id: "b3",
    nomorBooking: "BK-20250812-003",
    status: "Dibatalkan",
    kendaraan: "Honda Beat",
    platNomor: "D 9999 ZZZ",
    eta: "12 Aug 2025, 11:00",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const getStatusStyle = (status: string) => {
  switch (status) {
    case "Sedang Dikerjakan":
      return { bg: "#FFF3E0", text: "#E65100", dot: "#FF6D00" };
    case "Menunggu Konfirmasi":
      return { bg: "#FFF9C4", text: "#F57F17", dot: "#F9A825" };
    case "Dikonfirmasi":
      return { bg: "#E8F5E9", text: "#2E7D32", dot: "#43A047" };
    case "Dibatalkan":
      return { bg: "#FFEBEE", text: "#C62828", dot: "#E53935" };
    default:
      return { bg: "#F5F5F5", text: "#616161", dot: "#9E9E9E" };
  }
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function MenuServis() {
  const [activeTab, setActiveTab] = useState<"aktif" | "booking">("aktif");

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Servis</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "aktif" && styles.tabActive]}
          onPress={() => setActiveTab("aktif")}
        >
          <Text style={[styles.tabText, activeTab === "aktif" && styles.tabTextActive]}>
            Servis Aktif
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "booking" && styles.tabActive]}
          onPress={() => setActiveTab("booking")}
        >
          <Text style={[styles.tabText, activeTab === "booking" && styles.tabTextActive]}>
            Booking
          </Text>
          {BOOKING_LIST.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{BOOKING_LIST.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {activeTab === "aktif" ? (
          <>
            {SERVIS_AKTIF.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="construct-outline" size={48} color="#BDBDBD" />
                <Text style={styles.emptyText}>Tidak ada servis aktif</Text>
              </View>
            ) : (
              <>
                {SERVIS_AKTIF.map((item) => {
                  const st = getStatusStyle(item.status);
                  return (
                    <View key={item.id} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.nomorWO}>{item.nomorWO}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                          <View style={[styles.statusDot, { backgroundColor: st.dot }]} />
                          <Text style={[styles.statusText, { color: st.text }]}>
                            {item.status}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.kendaraanRow}>
                        <View style={[styles.dotIndicator, { backgroundColor: st.dot }]} />
                        <Text style={styles.kendaraanText}>
                          {item.kendaraan} · {item.platNomor}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel}>Mekanik</Text>
                          <Text style={styles.infoValue}>{item.mekanik}</Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel}>Mulai Servis</Text>
                          <Text style={styles.infoValue}>{item.mulaiServis}</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.detailBtn}
                        onPress={() => router.push(`/(beranda)/services/${item.id}`)}
                      >
                        <Text style={styles.detailBtnText}>Lihat Detail</Text>
                        <Ionicons name="chevron-forward" size={14} color="#1565C0" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
                <Text style={styles.footerNote}>
                  Menampilkan {SERVIS_AKTIF.length} dari {SERVIS_AKTIF.length} servis aktif
                </Text>
              </>
            )}
          </>
        ) : (
          <>
            {BOOKING_LIST.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="calendar-outline" size={48} color="#BDBDBD" />
                <Text style={styles.emptyText}>Belum ada booking</Text>
              </View>
            ) : (
              BOOKING_LIST.map((item) => {
                const st = getStatusStyle(item.status);
                return (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.nomorWO}>{item.nomorBooking}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                        <View style={[styles.statusDot, { backgroundColor: st.dot }]} />
                        <Text style={[styles.statusText, { color: st.text }]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.kendaraanRow}>
                      <Ionicons name="bicycle-outline" size={14} color="#888" />
                      <Text style={styles.kendaraanText}>
                        {item.kendaraan} · {item.platNomor}
                      </Text>
                    </View>

                    <View style={styles.etaRow}>
                      <Ionicons name="time-outline" size={13} color="#888" />
                      <Text style={styles.etaText}>ETA: {item.eta}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(beranda)/booking")}
      >
        <Ionicons name="add" size={20} color="#FFF" />
        <Text style={styles.fabText}>Booking Servis Baru</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F6FA" },

  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#1A1A2E" },

  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#EBEBEB",
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: { backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: "500", color: "#888" },
  tabTextActive: { color: "#1565C0", fontWeight: "700" },
  badge: {
    backgroundColor: "#1565C0",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: { color: "#FFF", fontSize: 11, fontWeight: "700" },

  scroll: { paddingHorizontal: 16, paddingBottom: 100 },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  nomorWO: { fontSize: 15, fontWeight: "700", color: "#1A1A2E" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "600" },

  kendaraanRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  dotIndicator: { width: 8, height: 8, borderRadius: 4 },
  kendaraanText: { fontSize: 13, color: "#555" },

  infoRow: { flexDirection: "row", gap: 24, marginBottom: 12 },
  infoItem: { gap: 2 },
  infoLabel: { fontSize: 11, color: "#999", fontWeight: "500" },
  infoValue: { fontSize: 13, color: "#1A1A2E", fontWeight: "600" },

  detailBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#1565C0",
    borderRadius: 8,
    paddingVertical: 8,
    gap: 4,
  },
  detailBtnText: { color: "#1565C0", fontWeight: "600", fontSize: 13 },

  etaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  etaText: { fontSize: 12, color: "#888" },

  footerNote: { textAlign: "center", color: "#BDBDBD", fontSize: 12, marginTop: 4 },

  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { color: "#BDBDBD", fontSize: 14 },

  fab: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: "#1565C0",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
    shadowColor: "#1565C0",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  fabText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});