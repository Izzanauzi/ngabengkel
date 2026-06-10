import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Booking } from "../../@types/booking.types";

const STATUS_CONFIG: Record<string, {
  label: string; color: string; bgColor: string; icon: string;
}> = {
  menunggu_konfirmasi: {
    label: "Menunggu Konfirmasi",
    color: "#D97706", bgColor: "#FEF3C7", icon: "time-outline",
  },
  disetujui: {
    label: "Disetujui",
    color: "#059669", bgColor: "#D1FAE5", icon: "checkmark-circle-outline",
  },
  ditolak: {
    label: "Ditolak",
    color: "#DC2626", bgColor: "#FEE2E2", icon: "close-circle-outline",
  },
  dibatalkan: {
    label: "Dibatalkan",
    color: "#6B7280", bgColor: "#F3F4F6", icon: "ban-outline",
  },
};

function formatETA(iso: string) {
  try {
    const date = new Date(iso);
    const options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "short", year: "numeric" };
    const dateStr = date.toLocaleDateString("id-ID", options);
    const timeStr = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");
    return `${dateStr} · ${timeStr}`;
  } catch { return iso; }
}

interface BookingCardProps {
  booking: Booking;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onCreateWO?: (booking: Booking) => void;
  isAccepting: boolean;
  isRejecting: boolean;
}

export default function BookingCard({
  booking, onAccept, onReject, onCreateWO, isAccepting, isRejecting,
}: BookingCardProps) {
  const st = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG["menunggu_konfirmasi"];
  const isPending = booking.status === "menunggu_konfirmasi";
  const isApproved = booking.status === "disetujui";
  const shortId = `#BK-${booking.booking_id.replace(/-/g, "").slice(0, 4).toUpperCase()}`;

  return (
    <View style={styles.card}>
      {/* Top Accent Line */}
      <View style={styles.topAccent} />

      {/* Header ID & Status Badge */}
      <View style={styles.header}>
        <View style={styles.idBadge}>
          <Text style={styles.idText}>{shortId}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: st.bgColor }]}>
          <Ionicons name={st.icon as any} size={13} color={st.color} style={{ marginRight: 4 }} />
          <Text style={[styles.statusBadgeText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>

      {/* Profile Row */}
      {booking.user && (
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={18} color="#2266DD" />
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={styles.userName}>{booking.user.nama}</Text>
            {booking.kendaraan && (
              <View style={styles.vehicleRow}>
                <Ionicons name="bicycle-outline" size={14} color="#9CA3AF" style={{ marginRight: 2 }} />
                <Text style={styles.vehicleText}>
                  {booking.kendaraan.merek} {booking.kendaraan.model}
                </Text>
                <View style={styles.plat}>
                  <Text style={styles.platText}>{booking.kendaraan.nomor_polisi}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Detail Rows dengan Ikon Bundar Tipis */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <View style={styles.iconWrapper}>
            <Ionicons name="calendar" size={14} color="#9CA3AF" />
          </View>
          <Text style={styles.detailText}>{formatETA(booking.eta)}</Text>
        </View>

        {booking.user?.telepon && (
          <View style={styles.detailRow}>
            <View style={styles.iconWrapper}>
              <Ionicons name="call" size={14} color="#9CA3AF" />
            </View>
            <Text style={styles.detailText}>{booking.user.telepon}</Text>
          </View>
        )}

        {booking.keluhan_awal && (
          <View style={styles.detailRow}>
            <View style={styles.iconWrapper}>
              <Ionicons name="chatbox-ellipses" size={14} color="#9CA3AF" />
            </View>
            <Text style={styles.detailText} numberOfLines={2}>{booking.keluhan_awal}</Text>
          </View>
        )}

        {booking.alasan_tolak && (
          <View style={styles.detailRow}>
            <View style={[styles.iconWrapper, { backgroundColor: "#FEE2E2" }]}>
              <Ionicons name="alert-circle" size={14} color="#DC2626" />
            </View>
            <Text style={[styles.detailText, { color: "#DC2626" }]} numberOfLines={2}>
              {booking.alasan_tolak}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Action Buttons */}
      {isPending && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.acceptBtn]}
            onPress={() => onAccept(booking.booking_id)}
            disabled={isAccepting || isRejecting}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#059669" />
            <Text style={[styles.actionText, { color: "#059669" }]}>Setujui</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => onReject(booking.booking_id)}
            disabled={isAccepting || isRejecting}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
            <Text style={[styles.actionText, { color: "#DC2626" }]}>Tolak</Text>
          </TouchableOpacity>
        </View>
      )}

      {isApproved && onCreateWO && (
        <TouchableOpacity
          style={styles.createWOBtn}
          onPress={() => onCreateWO(booking)}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={16} color="#fff" />
          <Text style={styles.createWOText}>Buat Work Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20, 
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  topAccent: {
    height: 4,
    backgroundColor: "#E15B26",
    marginHorizontal: -16,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  idBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  idText: { fontSize: 11, fontWeight: "700", color: "#3B82F6" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: { fontSize: 11, fontWeight: "600" },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center", justifyContent: "center",
  },
  userName: { fontSize: 15, fontWeight: "700", color: "#0F172A", marginBottom: 2 },
  vehicleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  vehicleText: { fontSize: 12, color: "#64748B", fontWeight: "500" },
  plat: {
    backgroundColor: "#1E293B", 
    borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  platText: { fontSize: 10, fontWeight: "700", color: "#fff", letterSpacing: 0.5 },
  details: { gap: 10, marginBottom: 4 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrapper: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "#F1F5F9", 
    alignItems: "center", justifyContent: "center",
  },
  detailText: { fontSize: 13, color: "#334155", flex: 1, fontWeight: "400" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 14 },
  actions: { flexDirection: "row", gap: 12 },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6,
    paddingVertical: 10, borderRadius: 12, borderWidth: 1.5,
  },
  acceptBtn: { borderColor: "#059669", backgroundColor: "#fff" },
  rejectBtn: { borderColor: "#DC2626", backgroundColor: "#fff" },
  actionText: { fontSize: 14, fontWeight: "600" },
  createWOBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, borderRadius: 12,
    backgroundColor: "#2563EB",
  },
  createWOText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});