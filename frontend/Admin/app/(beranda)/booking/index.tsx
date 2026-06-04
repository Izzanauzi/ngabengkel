import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BookingCard from "../../../src/components/booking/bookingCard";
import {
  useGetPendingBookings,
  useAcceptBookingMutation,
  useRejectBookingMutation,
} from "../../../src/hooks/booking.hooks";
import type { Booking } from "../../../src/@types/booking.types";

// ============================================================
// TAB CONFIG
// ============================================================

type TabKey = "semua" | "menunggu_konfirmasi" | "disetujui" | "ditolak";

const TABS: { key: TabKey; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "menunggu_konfirmasi", label: "Menunggu" },
  { key: "disetujui", label: "Disetujui" },
  { key: "ditolak", label: "Ditolak" },
];

// ============================================================
// MODAL REJECT
// ============================================================

interface RejectModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (alasan: string) => void;
  isLoading: boolean;
}

function RejectModal({
  visible,
  onClose,
  onSubmit,
  isLoading,
}: RejectModalProps) {
  const [alasan, setAlasan] = useState("");

  const handleSubmit = () => {
    if (!alasan.trim()) {
      Alert.alert("Error", "Alasan penolakan wajib diisi");
      return;
    }
    onSubmit(alasan.trim());
    setAlasan("");
  };

  const handleClose = () => {
    setAlasan("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tolak Booking</Text>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalLabel}>Alasan Penolakan</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Contoh: Slot penuh, jadwal tidak tersedia..."
            placeholderTextColor="#9CA3AF"
            value={alasan}
            onChangeText={setAlasan}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, isLoading && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Tolak Booking</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function AdminBookingPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("semua");
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const { bookings, isLoading, refetch } = useGetPendingBookings();
  const [refreshing, setRefreshing] = useState(false);

  const { acceptMutation } = useAcceptBookingMutation({
    successAction: () => Alert.alert("Berhasil", "Booking berhasil disetujui"),
  });

  const { rejectMutation } = useRejectBookingMutation({
    successAction: () => {
      setRejectTarget(null);
      Alert.alert("Berhasil", "Booking berhasil ditolak");
    },
  });

  // Hitung badge tiap tab
  const counts = useMemo(() => {
    const semua = bookings.length;
    const menunggu = bookings.filter(
      (b) => b.status === "menunggu_konfirmasi"
    ).length;
    const disetujui = bookings.filter((b) => b.status === "disetujui").length;
    const ditolak = bookings.filter((b) => b.status === "ditolak").length;
    return { semua, menunggu_konfirmasi: menunggu, disetujui, ditolak };
  }, [bookings]);

  // Filter berdasarkan tab aktif
  const filteredBookings = useMemo<Booking[]>(() => {
    if (activeTab === "semua") return bookings;
    return bookings.filter((b) => b.status === activeTab);
  }, [bookings, activeTab]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleAccept = useCallback(
    (bookingId: string) => {
      acceptMutation.mutate(bookingId);
    },
    [acceptMutation]
  );

  const handleRejectOpen = useCallback((bookingId: string) => {
    setRejectTarget(bookingId);
  }, []);

  const handleRejectSubmit = useCallback(
    (alasan: string) => {
      if (!rejectTarget) return;
      rejectMutation.mutate({
        bookingId: rejectTarget,
        payload: { alasan_tolak: alasan },
      });
    },
    [rejectTarget, rejectMutation]
  );

  // ── Render ──────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item }: { item: Booking }) => (
      <BookingCard
        booking={item}
        onAccept={handleAccept}
        onReject={handleRejectOpen}
        isAccepting={acceptMutation.isPending}
        isRejecting={rejectMutation.isPending}
      />
    ),
    [
      handleAccept,
      handleRejectOpen,
      acceptMutation.isPending,
      rejectMutation.isPending,
    ]
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>Tidak ada booking</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Summary cards ──────────────────────────── */}
      <View style={styles.summaryRow}>
        <SummaryCard label="Total" value={counts.semua} color="#3B82F6" />
        <SummaryCard
          label="Menunggu"
          value={counts.menunggu_konfirmasi}
          color="#D97706"
        />
        <SummaryCard
          label="Disetujui"
          value={counts.disetujui}
          color="#059669"
        />
        <SummaryCard label="Ditolak" value={counts.ditolak} color="#DC2626" />
      </View>

      {/* ── Filter tabs ────────────────────────────── */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => {
          const count =
            tab.key === "semua"
              ? counts.semua
              : tab.key === "menunggu_konfirmasi"
              ? counts.menunggu_konfirmasi
              : tab.key === "disetujui"
              ? counts.disetujui
              : counts.ditolak;

          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
              <View
                style={[
                  styles.tabBadge,
                  isActive ? styles.tabBadgeActive : styles.tabBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    isActive && styles.tabBadgeTextActive,
                  ]}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── List ───────────────────────────────────── */}
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#3B82F6"
          style={{ marginTop: 48 }}
        />
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.booking_id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── Reject Modal ────────────────────────────── */}
      <RejectModal
        visible={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onSubmit={handleRejectSubmit}
        isLoading={rejectMutation.isPending}
      />
    </View>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={[styles.summaryCard, { borderTopColor: color }]}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  // Summary
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderTopWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "800",
  },
  summaryLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
    fontWeight: "500",
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 10,
    padding: 4,
    gap: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 7,
  },
  tabActive: {
    backgroundColor: "#3B82F6",
  },
  tabText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  tabBadge: {
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: "center",
  },
  tabBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  tabBadgeInactive: {
    backgroundColor: "#F3F4F6",
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
  },
  tabBadgeTextActive: {
    color: "#FFFFFF",
  },

  // List
  listContent: {
    paddingTop: 4,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    minHeight: 80,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#DC2626",
    alignItems: "center",
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
