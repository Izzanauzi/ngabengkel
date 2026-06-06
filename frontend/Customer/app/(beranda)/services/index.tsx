import RequireAuth from "../../../src/components/auth/requireAuth";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  useGetAllBookings,
  useCancelBooking,
} from "../../../src/hooks/booking.hooks";
import { useGetAllWorkOrders } from "../../../src/hooks/workorder.hooks";
import { useToast } from "../../../src/contexts/toast.context";

// ── Helpers ───────────────────────────────────────────────────────────────────
const getStatusStyle = (status: string) => {
  switch (status) {
    case "sedang_dikerjakan":
      return { bg: "#FFF3E0", text: "#E65100", dot: "#FF6D00" };
    case "menunggu_persetujuan":
      return { bg: "#FFF9C4", text: "#F57F17", dot: "#F9A825" };
    case "dibuat":
      return { bg: "#E3F2FD", text: "#1565C0", dot: "#1976D2" };
    case "menunggu_konfirmasi":
      return { bg: "#FFF9C4", text: "#F57F17", dot: "#F9A825" };
    case "disetujui":
      return { bg: "#E8F5E9", text: "#2E7D32", dot: "#43A047" };
    case "dibatalkan":
    case "ditolak":
      return { bg: "#FFEBEE", text: "#C62828", dot: "#E53935" };
    default:
      return { bg: "#F5F5F5", text: "#616161", dot: "#9E9E9E" };
  }
};

const getWOStatusLabel = (status: string) => {
  switch (status) {
    case "dibuat":
      return "Baru Dibuat";
    case "sedang_dikerjakan":
      return "Sedang Dikerjakan";
    case "menunggu_persetujuan":
      return "Menunggu Persetujuan";
    case "selesai":
      return "Selesai";
    case "lunas":
      return "Lunas";
    default:
      return status;
  }
};

const getBookingStatusLabel = (status: string) => {
  switch (status) {
    case "menunggu_konfirmasi":
      return "Menunggu Konfirmasi";
    case "disetujui":
      return "Disetujui";
    case "ditolak":
      return "Ditolak";
    case "dibatalkan":
      return "Dibatalkan";
    default:
      return status;
  }
};

const formatETA = (eta: string) => {
  try {
    const d = new Date(eta);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return eta;
  }
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function MenuServis() {
  const [activeTab, setActiveTab] = useState<"aktif" | "booking">("aktif");

  const {
    workOrders,
    isLoading: woLoading,
    refetch: refetchWO,
  } = useGetAllWorkOrders();
  const {
    bookings,
    isLoading: bookingLoading,
    refetch: refetchBooking,
  } = useGetAllBookings();
  const { showSuccess } = useToast();

  const { cancelBookingMutation } = useCancelBooking({
    successAction: () => {
      showSuccess("Booking berhasil dibatalkan.");
      refetchBooking();
    },
  });

  const isLoading = woLoading || bookingLoading;

  const bookingAktif = bookings.filter(
    (b) => b.status === "menunggu_konfirmasi" || b.status === "disetujui"
  );

  const handleRefresh = () => {
    refetchWO();
    refetchBooking();
  };

  const handleCancel = (bookingId: string) => {
    Alert.alert(
      "Batalkan Booking",
      "Apakah kamu yakin ingin membatalkan booking ini?",
      [
        { text: "Tidak", style: "cancel" },
        {
          text: "Ya, Batalkan",
          style: "destructive",
          onPress: () => cancelBookingMutation.mutate(bookingId),
        },
      ]
    );
  };

  return (
    <RequireAuth>
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
            <Text
              style={[
                styles.tabText,
                activeTab === "aktif" && styles.tabTextActive,
              ]}
            >
              Servis Aktif
            </Text>
            {workOrders.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{workOrders.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "booking" && styles.tabActive]}
            onPress={() => setActiveTab("booking")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "booking" && styles.tabTextActive,
              ]}
            >
              Booking
            </Text>
            {bookingAktif.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{bookingAktif.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={["#1565C0"]}
            />
          }
        >
          {/* ── Tab Servis Aktif ── */}
          {activeTab === "aktif" && (
            <>
              {woLoading ? (
                <ActivityIndicator color="#1565C0" style={{ marginTop: 40 }} />
              ) : workOrders.length === 0 ? (
                <View style={styles.empty}>
                  <Ionicons
                    name="construct-outline"
                    size={48}
                    color="#BDBDBD"
                  />
                  <Text style={styles.emptyText}>Tidak ada servis aktif</Text>
                </View>
              ) : (
                <>
                  {workOrders.map((item) => {
                    const st = getStatusStyle(item.status);
                    const kendaraanLabel = item.kendaraan
                      ? `${item.kendaraan.merek} ${item.kendaraan.model}`.trim()
                      : item.kendaraan_id;
                    return (
                      <View key={item.wo_id} style={styles.card}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.nomorWO}>{item.nomor_wo}</Text>
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: st.bg },
                            ]}
                          >
                            <View
                              style={[
                                styles.statusDot,
                                { backgroundColor: st.dot },
                              ]}
                            />
                            <Text
                              style={[styles.statusText, { color: st.text }]}
                            >
                              {getWOStatusLabel(item.status)}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.kendaraanRow}>
                          <View
                            style={[
                              styles.dotIndicator,
                              { backgroundColor: st.dot },
                            ]}
                          />
                          <Text style={styles.kendaraanText}>
                            {kendaraanLabel} ·{" "}
                            {item.kendaraan?.nomor_polisi ?? "-"}
                          </Text>
                        </View>

                        <View style={styles.infoRow}>
                          <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Mekanik</Text>
                            <Text style={styles.infoValue}>
                              {item.mekanik?.nama ??
                                (item.mekanik_id
                                  ? `ID: ${item.mekanik_id.slice(0, 8)}...`
                                  : "Belum ditugaskan")}
                            </Text>
                          </View>
                          <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Mulai Servis</Text>
                            <Text style={styles.infoValue}>
                              {formatETA(item.created_at)}
                            </Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          style={styles.detailBtn}
                          onPress={() =>
                            router.push(`/(beranda)/services/${item.wo_id}`)
                          }
                        >
                          <Text style={styles.detailBtnText}>Lihat Detail</Text>
                          <Ionicons
                            name="chevron-forward"
                            size={14}
                            color="#1565C0"
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                  <Text style={styles.footerNote}>
                    Menampilkan {workOrders.length} servis aktif
                  </Text>
                </>
              )}
            </>
          )}

          {/* ── Tab Booking ── */}
          {activeTab === "booking" && (
            <>
              {bookingLoading ? (
                <ActivityIndicator color="#1565C0" style={{ marginTop: 40 }} />
              ) : bookings.length === 0 ? (
                <View style={styles.empty}>
                  <Ionicons name="calendar-outline" size={48} color="#BDBDBD" />
                  <Text style={styles.emptyText}>Belum ada booking</Text>
                </View>
              ) : (
                bookings.map((item) => {
                  const st = getStatusStyle(item.status);
                  const kendaraanLabel = item.kendaraan
                    ? `${item.kendaraan.merek ?? ""} ${
                        item.kendaraan.model ?? ""
                      }`.trim() || item.kendaraan_id
                    : item.kendaraan_id;

                  return (
                    <View key={item.booking_id} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.nomorWO} numberOfLines={1}>
                          #{item.booking_id.slice(0, 8).toUpperCase()}
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: st.bg },
                          ]}
                        >
                          <View
                            style={[
                              styles.statusDot,
                              { backgroundColor: st.dot },
                            ]}
                          />
                          <Text style={[styles.statusText, { color: st.text }]}>
                            {getBookingStatusLabel(item.status)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.kendaraanRow}>
                        <Ionicons
                          name="bicycle-outline"
                          size={14}
                          color="#888"
                        />
                        <Text style={styles.kendaraanText}>
                          {kendaraanLabel}
                        </Text>
                      </View>

                      <View style={styles.etaRow}>
                        <Ionicons name="time-outline" size={13} color="#888" />
                        <Text style={styles.etaText}>
                          ETA: {formatETA(item.eta)}
                        </Text>
                      </View>

                      {item.keluhan_awal && (
                        <Text style={styles.keluhanText} numberOfLines={2}>
                          {item.keluhan_awal}
                        </Text>
                      )}

                      <View style={styles.bookingActions}>
                        <TouchableOpacity
                          style={styles.detailBtn}
                          onPress={() =>
                            router.push(`/(beranda)/booking/${item.booking_id}`)
                          }
                        >
                          <Text style={styles.detailBtnText}>Lihat Detail</Text>
                          <Ionicons
                            name="chevron-forward"
                            size={14}
                            color="#1565C0"
                          />
                        </TouchableOpacity>
                        {item.status === "menunggu_konfirmasi" && (
                          <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => handleCancel(item.booking_id)}
                          >
                            <Ionicons
                              name="close-circle-outline"
                              size={14}
                              color="#E53935"
                            />
                            <Text style={styles.cancelBtnText}>Batalkan</Text>
                          </TouchableOpacity>
                        )}
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
    </RequireAuth>
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
  tabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
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
  nomorWO: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A2E",
    flex: 1,
    marginRight: 8,
  },
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
    marginBottom: 8,
  },
  dotIndicator: { width: 8, height: 8, borderRadius: 4 },
  kendaraanText: { fontSize: 13, color: "#555" },

  infoRow: { flexDirection: "row", gap: 24, marginBottom: 12 },
  infoItem: { gap: 2 },
  infoLabel: { fontSize: 11, color: "#999", fontWeight: "500" },
  infoValue: { fontSize: 13, color: "#1A1A2E", fontWeight: "600" },

  detailBtn: {
    flex: 1,
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

  etaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  etaText: { fontSize: 12, color: "#888" },

  keluhanText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
    marginBottom: 8,
  },

  bookingActions: { flexDirection: "row", gap: 8, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E53935",
    borderRadius: 8,
    paddingVertical: 8,
    gap: 4,
  },
  cancelBtnText: { color: "#E53935", fontWeight: "600", fontSize: 13 },

  footerNote: {
    textAlign: "center",
    color: "#BDBDBD",
    fontSize: 12,
    marginTop: 4,
  },
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
