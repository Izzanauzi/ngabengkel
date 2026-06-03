import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Booking } from "@/src/@types/booking.types";

// ============================================================
// HELPERS
// ============================================================

function formatETA(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  menunggu_konfirmasi: {
    label: "Menunggu Konfirmasi",
    color: "#D97706",
    bgColor: "#FEF3C7",
    icon: "time-outline",
  },
  disetujui: {
    label: "Disetujui",
    color: "#059669",
    bgColor: "#D1FAE5",
    icon: "checkmark-circle-outline",
  },
  ditolak: {
    label: "Ditolak",
    color: "#DC2626",
    bgColor: "#FEE2E2",
    icon: "close-circle-outline",
  },
  dibatalkan: {
    label: "Dibatalkan",
    color: "#6B7280",
    bgColor: "#F3F4F6",
    icon: "ban-outline",
  },
};

// ============================================================
// PROPS
// ============================================================

interface BookingCardProps {
  booking: Booking;
  onAccept?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
}

// ============================================================
// COMPONENT
// ============================================================

export default function BookingCard({
  booking,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
}: BookingCardProps) {
  const statusCfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG["menunggu_konfirmasi"];
  const isPending = booking.status === "menunggu_konfirmasi";

  const handleAccept = () => {
    Alert.alert(
      "Setujui Booking",
      `Setujui booking #${booking.booking_id.slice(0, 8).toUpperCase()}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Setujui",
          onPress: () => onAccept?.(booking.booking_id),
        },
      ]
    );
  };

  const handleReject = () => {
    Alert.prompt(
      "Tolak Booking",
      "Masukkan alasan penolakan:",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Tolak",
          style: "destructive",
          onPress: (alasan) => {
            if (!alasan?.trim()) {
              Alert.alert("Error", "Alasan penolakan wajib diisi");
              return;
            }
            onReject?.(booking.booking_id);
          },
        },
      ],
      "plain-text"
    );
  };

  return (
    <View style={styles.card}>
      {/* Header: booking ID + status */}
      <View style={styles.cardHeader}>
        <Text style={styles.bookingId}>
          #{booking.booking_id.slice(0, 8).toUpperCase()}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bgColor }]}>
          <Ionicons
            name={statusCfg.icon as any}
            size={12}
            color={statusCfg.color}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.statusText, { color: statusCfg.color }]}>
            {statusCfg.label}
          </Text>
        </View>
      </View>

      {/* Info pengguna */}
      {booking.user && (
        <View style={styles.userRow}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-outline" size={16} color="#6B7280" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{booking.user.nama}</Text>
            {booking.kendaraan && (
              <View style={styles.vehicleRow}>
                <Text style={styles.vehicleText}>
                  {booking.kendaraan.merek} {booking.kendaraan.model}{" "}
                </Text>
                <View style={styles.platBadge}>
                  <Text style={styles.platText}>{booking.kendaraan.nomor_polisi}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.divider} />

      {/* Detail info */}
      <View style={styles.infoGroup}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
          <Text style={styles.infoText}>{formatETA(booking.eta)}</Text>
        </View>

        {booking.user?.telepon && (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={14} color="#9CA3AF" />
            <Text style={styles.infoText}>{booking.user.telepon}</Text>
          </View>
        )}

        {booking.keluhan_awal && (
          <View style={styles.infoRow}>
            <Ionicons name="chatbox-ellipses-outline" size={14} color="#9CA3AF" />
            <Text style={styles.infoText} numberOfLines={2}>
              {booking.keluhan_awal}
            </Text>
          </View>
        )}

        {booking.alasan_tolak && (
          <View style={styles.infoRow}>
            <Ionicons name="alert-circle-outline" size={14} color="#DC2626" />
            <Text style={[styles.infoText, { color: "#DC2626" }]} numberOfLines={2}>
              {booking.alasan_tolak}
            </Text>
          </View>
        )}
      </View>

      {/* Tombol aksi — hanya tampil kalau pending */}
      {isPending && (onAccept || onReject) && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.acceptBtn]}
            onPress={handleAccept}
            disabled={isAccepting || isRejecting}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#059669" />
            <Text style={[styles.actionBtnText, { color: "#059669" }]}>Setujui</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={handleReject}
            disabled={isAccepting || isRejecting}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
            <Text style={[styles.actionBtnText, { color: "#DC2626" }]}>Tolak</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bookingId: {
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 3,
  },
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  vehicleText: {
    fontSize: 12,
    color: "#6B7280",
  },
  platBadge: {
    backgroundColor: "#1D4ED8",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  platText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 12,
  },
  infoGroup: {
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#374151",
    flex: 1,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  acceptBtn: {
    borderColor: "#059669",
    backgroundColor: "#F0FDF4",
  },
  rejectBtn: {
    borderColor: "#DC2626",
    backgroundColor: "#FFF5F5",
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
});