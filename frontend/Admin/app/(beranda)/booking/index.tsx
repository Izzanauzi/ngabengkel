import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import BookingCard from "../../../src/components/booking/bookingCard";
import BookingSummary from "../../../src/components/booking/bookingSummary";
import BookingTabs, {
  TabKey,
} from "../../../src/components/booking/bookingTabs";
import RejectModal from "../../../src/components/booking/rejectModal";
import {
  useGetAllBookings,
  useAcceptBookingMutation,
  useRejectBookingMutation,
} from "../../../src/hooks/booking.hooks";
import type { Booking } from "../../../src/@types/booking.types";
import { useToast } from "../../../src/contexts/toast.context";

export default function AdminBookingPage() {
  const router = useRouter();
  const { showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("semua");
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { bookings, isLoading, refetch } = useGetAllBookings();

  const { acceptMutation } = useAcceptBookingMutation({
    successAction: () => showSuccess("Booking berhasil disetujui"),
  });

  const { rejectMutation } = useRejectBookingMutation({
    successAction: () => {
      setRejectTarget(null);
      showSuccess("Booking berhasil ditolak");
    },
  });

  const counts = useMemo(
    () => ({
      semua: bookings.length,
      menunggu_konfirmasi: bookings.filter(
        (b) => b.status === "menunggu_konfirmasi"
      ).length,
    }),
    [bookings]
  );

  const filtered = useMemo<Booking[]>(
    () =>
      activeTab === "semua"
        ? bookings
        : bookings.filter((b) => b.status === activeTab),
    [bookings, activeTab]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleRejectSubmit = useCallback(
    (alasan_tolak: string) => {
      if (!rejectTarget) return;
      rejectMutation.mutate({
        bookingId: rejectTarget,
        alasan_tolak: alasan_tolak, // Langsung kirim key 'alasan' tanpa dibungkus objek payload tambahan
      });
    },
    [rejectTarget, rejectMutation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Booking }) => (
      <BookingCard
        booking={item}
        onAccept={(id) => acceptMutation.mutate(id)}
        onReject={(id) => setRejectTarget(id)}
        onCreateWO={(booking) =>
          router.push({
            pathname: "/(beranda)/work_order/create_work_order" as any,
            params: {
              booking_id: booking.booking_id,
              user_id: booking.user_id,
              kendaraan_id: booking.kendaraan_id,
              keluhan: booking.keluhan_awal ?? "",
            },
          })
        }
        isAccepting={acceptMutation.isPending}
        isRejecting={rejectMutation.isPending}
      />
    ),
    [acceptMutation, rejectMutation, router]
  );

  return (
    <View style={styles.container}>
      <BookingSummary
        total={counts.semua}
        menunggu={counts.menunggu_konfirmasi}
      />

      <BookingTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
      />

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#3B82F6"
          style={{ marginTop: 48 }}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.booking_id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Tidak ada booking</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <RejectModal
        visible={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onSubmit={handleRejectSubmit}
        isLoading={rejectMutation.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", gap: 10 },
  list: { paddingTop: 4, paddingBottom: 24 },
  empty: { alignItems: "center", marginTop: 80, gap: 12 },
  emptyText: { fontSize: 14, color: "#9CA3AF" },
});
