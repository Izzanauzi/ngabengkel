import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useGetSchedule } from "../../src/hooks/schedule.hooks";
import { useAuth } from "../../src/contexts/auth.context";
import { useGetAllKendaraan } from "../../src/hooks/kendaraan.hooks";
import { useGetAllWorkOrders, useGetHistory } from "../../src/hooks/workorder.hooks";
import { useGetAllBookings } from "../../src/hooks/booking.hooks";
import { formatRupiah } from "../../src/utils/helper";
import { Kendaraan } from "../../src/@types/kendaraan.types";

const WO_STATUS_LABEL: Record<string, string> = {
  dibuat: "Baru Dibuat",
  sedang_dikerjakan: "Sedang Dikerjakan",
  menunggu_persetujuan: "Menunggu Persetujuan",
  selesai: "Selesai",
  lunas: "Lunas",
};

const BOOKING_STATUS_LABEL: Record<string, string> = {
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  disetujui: "Disetujui",
};

const formatTanggal = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

// ── Kendaraan mini card ───────────────────────────────────────────────────────
function KendaraanCard({ item }: { item: Kendaraan }) {
  return (
    <TouchableOpacity
      style={styles.kendaraanCard}
      onPress={() => router.push(`/(beranda)/kendaraan/${item.kendaraan_id}`)}
      activeOpacity={0.75}
    >
      <View style={styles.kendaraanIconWrap}>
        <Ionicons name="bicycle" size={22} color="#1565C0" />
      </View>
      <View style={styles.kendaraanInfo}>
        <Text style={styles.kendaraanNama} numberOfLines={1}>
          {item.merek} {item.model}
        </Text>
        <Text style={styles.kendaraanPlat}>{item.nomor_polisi}</Text>
        <Text style={styles.kendaraanTahun}>{item.tahun}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#BDBDBD" />
    </TouchableOpacity>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Beranda() {
  const { token, user } = useAuth();
  const isLogin = !!token;

  const { slots, jumlahAntrian, isLoading: scheduleLoading, refetch: refetchSchedule } = useGetSchedule();
  const { kendaraanList, isLoading: kendaraanLoading, refetch: refetchKendaraan } = useGetAllKendaraan(user?.user_id ?? '');
  const { workOrders, isLoading: woLoading, refetch: refetchWO } = useGetAllWorkOrders();
  const { bookings, isLoading: bookingLoading, refetch: refetchBooking } = useGetAllBookings();
  const { history, isLoading: historyLoading, refetch: refetchHistory } = useGetHistory();

  const slotTersedia = slots.filter((s) => s.status === "tersedia").length;
  const isLoading = scheduleLoading || (isLogin && (kendaraanLoading || woLoading || bookingLoading || historyLoading));

  const activeWO = workOrders[0] ?? null;
  const activeBooking = bookings.find(
    (b) => b.status === "menunggu_konfirmasi" || b.status === "disetujui"
  ) ?? null;
  const servisTerakhir = history.slice(0, 2);

  const handleRefresh = () => {
    refetchSchedule();
    if (isLogin) {
      refetchKendaraan();
      refetchWO();
      refetchBooking();
      refetchHistory();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} colors={["#1565C0"]} />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Halo, {isLogin ? (user?.nama ?? "Pelanggan") : "Tamu"} 👋
            </Text>
            <Text style={styles.subGreeting}>Selamat datang kembali di Ngabengkel</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color="#1A1A2E" />
          </TouchableOpacity>
        </View>

        {/* ── Kondisi Bengkel (publik) ── */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Kondisi Bengkel Sekarang</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>

          {scheduleLoading ? (
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

        {/* ── Belum Login ── */}
        {!isLogin && (
          <View style={styles.loginPromptCard}>
            <Ionicons name="lock-closed-outline" size={32} color="#1565C0" />
            <Text style={styles.loginPromptTitle}>Belum Masuk</Text>
            <Text style={styles.loginPromptSub}>
              Login untuk melihat kendaraan, riwayat servis, dan melakukan booking.
            </Text>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.loginBtnText}>Masuk Sekarang</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.registerText}>
                Belum punya akun? <Text style={styles.registerLink}>Daftar</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Sudah Login ── */}
        {isLogin && (
          <>
            {/* Kendaraan Saya */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Kendaraan Saya</Text>
              <TouchableOpacity
                style={styles.sectionLink}
                onPress={() => router.push("/(beranda)/kendaraan")}
              >
                <Text style={styles.sectionLinkText}>Lihat semua</Text>
                <Ionicons name="chevron-forward" size={13} color="#1565C0" />
              </TouchableOpacity>
            </View>

            {kendaraanLoading ? (
              <ActivityIndicator color="#1565C0" style={{ marginBottom: 12 }} />
            ) : kendaraanList.length === 0 ? (
              <TouchableOpacity
                style={styles.tambahKendaraanCard}
                onPress={() => router.push("/(beranda)/kendaraan/create")}
              >
                <Ionicons name="add-circle-outline" size={24} color="#1565C0" />
                <Text style={styles.tambahKendaraanText}>Tambah Kendaraan</Text>
              </TouchableOpacity>
            ) : (
              <FlatList
                data={kendaraanList}
                keyExtractor={(item) => item.kendaraan_id}
                renderItem={({ item }) => <KendaraanCard item={item} />}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.kendaraanScroll}
                scrollEnabled={kendaraanList.length > 1}
              />
            )}

            {/* Servis Aktif */}
            {woLoading ? (
              <ActivityIndicator color="#1565C0" style={{ marginVertical: 8 }} />
            ) : activeWO ? (
              <>
                <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Servis Aktif</Text>
                <TouchableOpacity
                  style={[styles.card, styles.aktifCard]}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/(beranda)/services/${activeWO.wo_id}`)}
                >
                  <View style={styles.aktifHeader}>
                    <Text style={styles.aktifWONo}>{activeWO.nomor_wo}</Text>
                    <View style={styles.statusBadge}>
                      <View style={[styles.statusDot, { backgroundColor: "#FF6D00" }]} />
                      <Text style={styles.statusText}>
                        {WO_STATUS_LABEL[activeWO.status] ?? activeWO.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.aktifKendaraan}>
                    {activeWO.kendaraan
                      ? `${activeWO.kendaraan.merek} ${activeWO.kendaraan.model}`
                      : "Kendaraan"}
                  </Text>
                  <Text style={styles.aktifPlat}>
                    {activeWO.kendaraan?.nomor_polisi ?? "-"}
                  </Text>
                  <View style={styles.aktifFooter}>
                    <Text style={styles.aktifMekanik}>
                      Mekanik: {activeWO.mekanik?.nama ?? "Belum ditugaskan"}
                    </Text>
                    <View style={styles.detailChip}>
                      <Text style={styles.detailChipText}>Lihat Detail</Text>
                      <Ionicons name="chevron-forward" size={12} color="#1565C0" />
                    </View>
                  </View>
                </TouchableOpacity>
              </>
            ) : activeBooking ? (
              <>
                <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Booking Aktif</Text>
                <TouchableOpacity
                  style={[styles.card, styles.bookingAktifCard]}
                  activeOpacity={0.8}
                  onPress={() => router.push("/(beranda)/services")}
                >
                  <View style={styles.aktifHeader}>
                    <Text style={styles.aktifWONo}>
                      #{activeBooking.booking_id.slice(0, 8).toUpperCase()}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: "#FFF9C4" }]}>
                      <View style={[styles.statusDot, { backgroundColor: "#F9A825" }]} />
                      <Text style={[styles.statusText, { color: "#F57F17" }]}>
                        {BOOKING_STATUS_LABEL[activeBooking.status] ?? activeBooking.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.aktifKendaraan}>
                    {activeBooking.kendaraan
                      ? `${activeBooking.kendaraan.merek} ${activeBooking.kendaraan.model}`
                      : "Kendaraan"}
                  </Text>
                  <Text style={styles.aktifPlat}>
                    ETA: {formatTanggal(activeBooking.eta)}
                  </Text>
                  <View style={styles.aktifFooter}>
                    <Text style={styles.aktifMekanik}>
                      {activeBooking.keluhan_awal ?? "Tidak ada keluhan"}
                    </Text>
                    <View style={styles.detailChip}>
                      <Text style={styles.detailChipText}>Lihat Detail</Text>
                      <Ionicons name="chevron-forward" size={12} color="#1565C0" />
                    </View>
                  </View>
                </TouchableOpacity>
              </>
            ) : null}
          </>
        )}

        {/* ── Booking Servis Button ── */}
        <TouchableOpacity
          style={styles.bookingBtn}
          onPress={() =>
            isLogin
              ? router.push("/(beranda)/booking")
              : router.push("/(auth)/login")
          }
        >
          <Ionicons name="construct-outline" size={18} color="#FFF" />
          <Text style={styles.bookingBtnText}>Booking Servis</Text>
        </TouchableOpacity>

        {/* ── Servis Terakhir ── */}
        {isLogin && servisTerakhir.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Servis Terakhir</Text>
            <View style={styles.servisGrid}>
              {servisTerakhir.map((item) => (
                <TouchableOpacity
                  key={item.wo_id}
                  style={styles.servisCard}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/(beranda)/services/${item.wo_id}`)}
                >
                  <Text style={styles.servisKendaraan} numberOfLines={1}>
                    {item.kendaraan
                      ? `${item.kendaraan.merek} ${item.kendaraan.model}`
                      : "Kendaraan"}
                  </Text>
                  <Text style={styles.servisTanggal}>{formatTanggal(item.created_at)}</Text>
                  <Text style={styles.servisBiaya}>
                    {formatRupiah(
                      item.biaya_jasa + (item.items ?? []).reduce((s, i) => s + i.subtotal, 0)
                    )}
                  </Text>
                  <View style={styles.servisStatusRow}>
                    <Ionicons name="checkmark-circle" size={13} color="#43A047" />
                    <Text style={styles.servisStatusText}>
                      {WO_STATUS_LABEL[item.status] ?? item.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

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

  // ── Login prompt
  loginPromptCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 12,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loginPromptTitle: { fontSize: 17, fontWeight: "800", color: "#1A1A2E" },
  loginPromptSub: { fontSize: 13, color: "#888", textAlign: "center", lineHeight: 20 },
  loginBtn: {
    marginTop: 8,
    backgroundColor: "#1565C0",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  loginBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  registerText: { fontSize: 12, color: "#888", marginTop: 4 },
  registerLink: { color: "#1565C0", fontWeight: "600" },

  // ── Section header
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A2E", marginBottom: 10 },
  sectionLink: { flexDirection: "row", alignItems: "center", gap: 2 },
  sectionLinkText: { fontSize: 12, color: "#1565C0", fontWeight: "600" },

  // ── Kendaraan horizontal list
  kendaraanScroll: { paddingBottom: 12, gap: 10 },
  kendaraanCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    width: 180,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  kendaraanIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  kendaraanInfo: { flex: 1 },
  kendaraanNama: { fontSize: 13, fontWeight: "700", color: "#1A1A2E" },
  kendaraanPlat: { fontSize: 11, color: "#888", marginTop: 2 },
  kendaraanTahun: { fontSize: 11, color: "#BDBDBD" },

  tambahKendaraanCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#90CAF9",
  },
  tambahKendaraanText: { color: "#1565C0", fontWeight: "600", fontSize: 14 },

  // ── Servis Aktif / Booking Aktif
  aktifCard: { borderLeftWidth: 4, borderLeftColor: "#FF6D00" },
  bookingAktifCard: { borderLeftWidth: 4, borderLeftColor: "#F9A825" },
  aktifHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  aktifWONo: { fontSize: 12, color: "#888", fontWeight: "500" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#FFF3E0", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "600", color: "#E65100" },
  aktifKendaraan: { fontSize: 16, fontWeight: "700", color: "#1A1A2E", marginBottom: 2 },
  aktifPlat: { fontSize: 13, color: "#888", marginBottom: 10 },
  aktifFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  aktifMekanik: { fontSize: 12, color: "#999", flex: 1, marginRight: 8 },
  detailChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#1565C0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 2,
  },
  detailChipText: { color: "#1565C0", fontWeight: "600", fontSize: 12 },

  // ── Booking button
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

  // ── Servis Terakhir
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

  // ── Jadwal banner
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
