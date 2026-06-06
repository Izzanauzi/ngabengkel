import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useGetBookingById, useCancelBooking } from "../../../src/hooks/booking.hooks";
import { useToast } from "../../../src/contexts/toast.context";

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  menunggu_konfirmasi: { bg: "#FFF9C4", text: "#F57F17", dot: "#F9A825", label: "Menunggu Konfirmasi" },
  disetujui: { bg: "#E8F5E9", text: "#2E7D32", dot: "#43A047", label: "Disetujui" },
  ditolak: { bg: "#FFEBEE", text: "#C62828", dot: "#E53935", label: "Ditolak" },
  dibatalkan: { bg: "#F5F5F5", text: "#616161", dot: "#9E9E9E", label: "Dibatalkan" },
};

const formatTanggal = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const formatJam = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "-";
  }
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { booking, isLoading, refetch } = useGetBookingById(id ?? "");
  const { showSuccess } = useToast();

  const { cancelBookingMutation } = useCancelBooking({
    successAction: () => {
      showSuccess("Booking berhasil dibatalkan.");
      refetch();
    },
  });

  const handleBatalkan = () => {
    Alert.alert(
      "Batalkan Booking",
      "Apakah kamu yakin ingin membatalkan booking ini?",
      [
        { text: "Tidak", style: "cancel" },
        {
          text: "Ya, Batalkan",
          style: "destructive",
          onPress: () => cancelBookingMutation.mutate(id ?? ""),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Booking</Text>
          <View style={{ width: 22 }} />
        </View>
        <ActivityIndicator color="#1565C0" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Booking</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color="#BDBDBD" />
          <Text style={styles.emptyText}>Data booking tidak ditemukan</Text>
        </View>
      </SafeAreaView>
    );
  }

  const st = STATUS_CONFIG[booking.status] ?? {
    bg: "#F5F5F5", text: "#616161", dot: "#9E9E9E", label: booking.status,
  };

  const kendaraanLabel = booking.kendaraan
    ? `${booking.kendaraan.merek} ${booking.kendaraan.model}`
    : "-";
  const platNomor = booking.kendaraan?.nomor_polisi ?? "-";
  const bookingIdShort = booking.booking_id.slice(0, 8).toUpperCase();
  const bisa_batalkan =
    booking.status === "menunggu_konfirmasi" && !cancelBookingMutation.isPending;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Booking</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>Booking ID</Text>
            <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: st.dot }]} />
              <Text style={[styles.statusText, { color: st.text }]}>{st.label}</Text>
            </View>
          </View>
          <Text style={styles.heroId}>#{bookingIdShort}</Text>

          <View style={styles.heroGrid}>
            <View style={styles.heroGridItem}>
              <Text style={styles.heroGridLabel}>Kendaraan</Text>
              <Text style={styles.heroGridValue}>{kendaraanLabel}</Text>
              <Text style={styles.heroGridSub}>{platNomor}</Text>
            </View>
            <View style={styles.heroGridItem}>
              <Text style={styles.heroGridLabel}>Dibuat</Text>
              <Text style={styles.heroGridValue}>{formatJam(booking.created_at)}</Text>
              <Text style={styles.heroGridSub}>{formatTanggal(booking.created_at)}</Text>
            </View>
          </View>
        </View>

        {/* Info card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Jadwal</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={16} color="#1565C0" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tanggal ETA</Text>
              <Text style={styles.infoValue}>{formatTanggal(booking.eta)}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <View style={styles.infoIcon}>
              <Ionicons name="time-outline" size={16} color="#1565C0" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Jam</Text>
              <Text style={styles.infoValue}>{formatJam(booking.eta)}</Text>
            </View>
          </View>

          {booking.keluhan_awal && (
            <View style={[styles.infoRow, styles.infoRowBorder]}>
              <View style={styles.infoIcon}>
                <Ionicons name="chatbox-outline" size={16} color="#1565C0" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Keluhan</Text>
                <Text style={styles.infoValue}>{booking.keluhan_awal}</Text>
              </View>
            </View>
          )}

          {booking.alasan_tolak && (
            <View style={[styles.infoRow, styles.infoRowBorder]}>
              <View style={styles.infoIcon}>
                <Ionicons name="close-circle-outline" size={16} color="#E53935" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Alasan Ditolak</Text>
                <Text style={[styles.infoValue, { color: "#E53935" }]}>{booking.alasan_tolak}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Status info */}
        {booking.status === "menunggu_konfirmasi" && (
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={16} color="#1565C0" />
            <Text style={styles.infoBoxText}>
              Booking kamu sedang menunggu konfirmasi dari bengkel. Kamu masih bisa membatalkan selama belum dikonfirmasi.
            </Text>
          </View>
        )}

        {booking.status === "disetujui" && (
          <View style={[styles.infoBox, styles.infoBoxGreen]}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#2E7D32" />
            <Text style={[styles.infoBoxText, { color: "#2E7D32" }]}>
              Booking kamu telah disetujui! Harap datang tepat waktu sesuai ETA.
            </Text>
          </View>
        )}

        {/* Batalkan button */}
        {booking.status === "menunggu_konfirmasi" && (
          <TouchableOpacity
            style={[styles.batalBtn, cancelBookingMutation.isPending && { opacity: 0.6 }]}
            onPress={handleBatalkan}
            disabled={!bisa_batalkan}
          >
            <Ionicons name="close-circle-outline" size={18} color="#E53935" />
            <Text style={styles.batalBtnText}>
              {cancelBookingMutation.isPending ? "Membatalkan..." : "Batalkan Booking"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F6FA" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1A1A2E" },

  scroll: { paddingHorizontal: 16, paddingBottom: 40 },

  emptyState: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { color: "#BDBDBD", fontSize: 14 },

  heroCard: {
    backgroundColor: "#1565C0",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  heroLabel: { fontSize: 12, color: "#90CAF9", fontWeight: "500" },
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
  heroId: { fontSize: 22, fontWeight: "800", color: "#FFF", marginBottom: 16 },
  heroGrid: { flexDirection: "row", gap: 24 },
  heroGridItem: { flex: 1, gap: 2 },
  heroGridLabel: { fontSize: 11, color: "#90CAF9" },
  heroGridValue: { fontSize: 14, fontWeight: "700", color: "#FFF" },
  heroGridSub: { fontSize: 11, color: "#BBDEFB" },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A2E", marginBottom: 14 },

  infoRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 10, gap: 12 },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: "#F5F5F5" },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: "#999", marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#1A1A2E" },

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#E3F2FD",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  infoBoxGreen: { backgroundColor: "#E8F5E9" },
  infoBoxText: { flex: 1, fontSize: 12, color: "#1565C0", lineHeight: 18 },

  batalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E53935",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  batalBtnText: { color: "#E53935", fontWeight: "700", fontSize: 15 },
});
