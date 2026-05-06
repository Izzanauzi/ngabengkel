import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { baseFetch } from "../../../src/utils/baseFetch";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Slot {
  id: string | number;
  name?: string;
  label?: string;
  status: "tersedia" | "tidak_tersedia" | "diservis" | "ditutup" | string;
}

interface ScheduleResponse {
  slots: Slot[];
  jumlah_antrian: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const ESTIMASI_PER_KENDARAAN = 9; // menit

const getSlotColor = (status: string) => {
  switch (status) {
    case "tersedia":
      return { bg: "#E8F5E9", border: "#43A047", text: "#2E7D32" };
    case "diservis":
      return { bg: "#FFEBEE", border: "#E53935", text: "#C62828" };
    case "ditutup":
    case "tidak_tersedia":
      return { bg: "#F5F5F5", border: "#BDBDBD", text: "#757575" };
    default:
      return { bg: "#F5F5F5", border: "#BDBDBD", text: "#757575" };
  }
};

const getSlotLabel = (status: string) => {
  switch (status) {
    case "tersedia":
      return "Tersedia";
    case "diservis":
      return "Diservis";
    case "ditutup":
      return "Ditutup";
    case "tidak_tersedia":
      return "Tidak Tersedia";
    default:
      return status;
  }
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function JadwalAntrian() {
  const [data, setData] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const fetchSchedule = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      setIsOffline(false);

      const result = await baseFetch<ScheduleResponse>({
        url: "/schedule",
        method: "GET",
        options: { showError: false },
      });

      if (result) setData(result);
    } catch (err: any) {
      const isNetwork =
        err?.message?.includes("Network") || err?.code === "ECONNABORTED";
      if (isNetwork) {
        setIsOffline(true);
      } else {
        setError("Gagal memuat data. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const estimasi = data ? data.jumlah_antrian * ESTIMASI_PER_KENDARAAN : 0;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#1565C0" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </SafeAreaView>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error && !data) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={48} color="#BDBDBD" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchSchedule()}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Main ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchSchedule(true)}
            colors={["#1565C0"]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Jadwal & Antrian</Text>
        </View>

        {/* Offline Banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="warning-outline" size={16} color="#F57F17" />
            <Text style={styles.offlineText}>
              Data mungkin tidak terkini. Anda sedang menggunakan data cache
              karena koneksi tidak tersedia.
            </Text>
          </View>
        )}

        {/* Slot Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status Slot Bengkel</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.slotRow}
          >
            {data?.slots && data.slots.length > 0 ? (
              data.slots.map((slot, index) => {
                const colors = getSlotColor(slot.status);
                return (
                  <View
                    key={slot.id ?? index}
                    style={[
                      styles.slotCard,
                      { backgroundColor: colors.bg, borderColor: colors.border },
                    ]}
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

        {/* Antrian Section */}
        <View style={[styles.card, styles.antrianCard]}>
          <Text style={styles.cardTitle}>Antrian Saat Ini</Text>
          <Text style={styles.antrianNumber}>{data?.jumlah_antrian ?? 0}</Text>
          <Text style={styles.antrianLabel}>kendaraan Mengantre</Text>
          <Text style={styles.estimasiText}>
            Estimasi waktu tunggu: ±{estimasi} Menit
          </Text>

          {/* Antrian dots */}
          {data && data.jumlah_antrian > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dotsRow}
            >
              {Array.from({ length: Math.min(data.jumlah_antrian, 20) }).map(
                (_, i) => (
                  <View key={i} style={styles.dot}>
                    <Text style={styles.dotText}>{i + 1}</Text>
                  </View>
                )
              )}
              {data.jumlah_antrian > 20 && (
                <Text style={styles.moreDots}>+{data.jumlah_antrian - 20}</Text>
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
  scroll: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },

  header: { marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#1A1A2E" },

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
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },

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
  antrianNumber: {
    fontSize: 64,
    fontWeight: "800",
    color: "#1565C0",
    lineHeight: 72,
  },
  antrianLabel: { fontSize: 14, color: "#555", marginBottom: 4 },
  estimasiText: { fontSize: 13, color: "#888", marginBottom: 12 },
  dotsRow: { gap: 8, paddingVertical: 4 },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1565C0",
    alignItems: "center",
    justifyContent: "center",
  },
  dotText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  moreDots: { color: "#888", fontSize: 13, alignSelf: "center" },

  legendRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 13, color: "#444" },

  loadingText: { color: "#888", marginTop: 8 },
  errorText: { color: "#888", textAlign: "center", marginHorizontal: 32 },
  retryBtn: {
    backgroundColor: "#1565C0",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: "#FFF", fontWeight: "600" },
});