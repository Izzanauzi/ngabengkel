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
import { useGetWorkOrderById, useApproveAction, useRejectAction } from "../../../src/hooks/workorder.hooks";
import { formatRupiah } from "../../../src/utils/helper";
import { useToast } from "../../../src/contexts/toast.context";

const formatJam = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "-";
  }
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function DetailWO() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workOrder: wo, isLoading, refetch } = useGetWorkOrderById(id ?? "");
  const { showSuccess } = useToast();

  const { approveActionMutation } = useApproveAction(id ?? "", {
    successAction: () => {
      showSuccess("Tindakan tambahan disetujui. Servis dilanjutkan.");
      refetch();
    },
  });

  const { rejectActionMutation } = useRejectAction(id ?? "", {
    successAction: () => {
      showSuccess("Tindakan tambahan ditolak.");
      refetch();
    },
  });

  const handleSetuju = () => {
    Alert.alert("Konfirmasi", "Apakah Anda menyetujui biaya tambahan ini?", [
      { text: "Batal", style: "cancel" },
      { text: "Setuju", onPress: () => approveActionMutation.mutate() },
    ]);
  };

  const handleTolak = () => {
    Alert.alert("Konfirmasi", "Apakah Anda menolak biaya tambahan ini?", [
      { text: "Batal", style: "cancel" },
      { text: "Tolak", style: "destructive", onPress: () => rejectActionMutation.mutate() },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Servis</Text>
          <View style={{ width: 22 }} />
        </View>
        <ActivityIndicator color="#1565C0" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (!wo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Servis</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color="#BDBDBD" />
          <Text style={styles.emptyText}>Data servis tidak ditemukan</Text>
        </View>
      </SafeAreaView>
    );
  }

  const kendaraanLabel = wo.kendaraan
    ? `${wo.kendaraan.merek} ${wo.kendaraan.model}`
    : "-";
  const platNomor = wo.kendaraan?.nomor_polisi ?? "-";
  const mekanikNama = wo.mekanik?.nama ?? "Belum ditugaskan";

  const perluPersetujuan = wo.status === "menunggu_persetujuan";
  const suspendProgress = [...(wo.progress ?? [])]
    .reverse()
    .find((p) => p.tipe === "suspend");

  const totalMaterial = (wo.items ?? []).reduce((sum, i) => sum + i.subtotal, 0);
  const totalBiaya = wo.biaya_jasa + totalMaterial;

  const isActionLoading = approveActionMutation.isPending || rejectActionMutation.isPending;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Servis</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* WO Info Card */}
        <View style={styles.woCard}>
          <View style={styles.woCardTop}>
            <Text style={styles.woLabel}>Work Order</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{wo.status.replace(/_/g, " ")}</Text>
            </View>
          </View>
          <Text style={styles.woNumber}>{wo.nomor_wo}</Text>

          <View style={styles.woGrid}>
            <View style={styles.woGridItem}>
              <Text style={styles.woGridLabel}>Kendaraan</Text>
              <Text style={styles.woGridValue}>{kendaraanLabel}</Text>
              <Text style={styles.woGridSub}>{platNomor}</Text>
            </View>
            <View style={styles.woGridItem}>
              <Text style={styles.woGridLabel}>Mekanik</Text>
              <Text style={styles.woGridValue}>{mekanikNama}</Text>
            </View>
          </View>
        </View>

        {/* Persetujuan Banner */}
        {perluPersetujuan && suspendProgress && (
          <View style={styles.persetujuanCard}>
            <View style={styles.persetujuanHeader}>
              <Ionicons name="warning-outline" size={18} color="#E65100" />
              <Text style={styles.persetujuanTitle}>Diperlukan Persetujuan Anda</Text>
            </View>
            <Text style={styles.persetujuanNote}>{suspendProgress.deskripsi}</Text>
            {suspendProgress.est_biaya_tambahan != null && (
              <Text style={styles.persetujuanBiaya}>
                Estimasi biaya tambahan:{" "}
                <Text style={styles.persetujuanBiayaBold}>
                  {formatRupiah(suspendProgress.est_biaya_tambahan)}
                </Text>
              </Text>
            )}
            <View style={styles.persetujuanBtns}>
              <TouchableOpacity
                style={[styles.setujuBtn, isActionLoading && { opacity: 0.6 }]}
                onPress={handleSetuju}
                disabled={isActionLoading}
              >
                <Ionicons name="checkmark" size={14} color="#FFF" />
                <Text style={styles.setujuBtnText}>Setujui</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tolakBtn, isActionLoading && { opacity: 0.6 }]}
                onPress={handleTolak}
                disabled={isActionLoading}
              >
                <Ionicons name="close" size={14} color="#FFF" />
                <Text style={styles.tolakBtnText}>Tolak</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Histori Progres */}
        {(wo.progress ?? []).length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Histori Progres</Text>
            {wo.progress.map((p, i) => (
              <View key={p.progress_id} style={styles.historiItem}>
                <View style={styles.historiLeft}>
                  <View
                    style={[
                      styles.historiDot,
                      i === wo.progress.length - 1 && styles.historiDotCurrent,
                      i < wo.progress.length - 1 && styles.historiDotDone,
                    ]}
                  />
                  {i < wo.progress.length - 1 && (
                    <View style={styles.historiLineDone} />
                  )}
                </View>
                <View style={styles.historiRight}>
                  <Text
                    style={[
                      styles.historiJam,
                      i === wo.progress.length - 1 && styles.historiJamCurrent,
                    ]}
                  >
                    {formatJam(p.created_at)}{" "}
                    {i === wo.progress.length - 1 && (
                      <Text style={styles.saatIni}>Terbaru</Text>
                    )}
                  </Text>
                  <Text style={styles.historiKet}>{p.deskripsi}</Text>
                  {p.tipe === "suspend" && p.est_biaya_tambahan != null && (
                    <Text style={styles.biayaTambahan}>
                      + {formatRupiah(p.est_biaya_tambahan)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Estimasi Biaya */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rincian Biaya</Text>
          <View style={[styles.biayaRow, styles.biayaBorder]}>
            <Text style={styles.biayaItem}>Biaya Jasa</Text>
            <Text style={styles.biayaHarga}>{formatRupiah(wo.biaya_jasa)}</Text>
          </View>
          {(wo.items ?? []).map((item, i) => (
            <View
              key={item.wo_item_id}
              style={[styles.biayaRow, i < wo.items.length - 1 && styles.biayaBorder]}
            >
              <Text style={styles.biayaItem}>
                {item.nama_item} x{item.jumlah}
              </Text>
              <Text style={styles.biayaHarga}>{formatRupiah(item.subtotal)}</Text>
            </View>
          ))}
          <View style={[styles.biayaRow, { marginTop: 4, paddingTop: 10, borderTopWidth: 1.5, borderTopColor: "#E0E0E0" }]}>
            <Text style={[styles.biayaItem, { fontWeight: "700", color: "#1A1A2E" }]}>Total</Text>
            <Text style={[styles.biayaHarga, { color: "#1565C0" }]}>{formatRupiah(totalBiaya)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
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

  scroll: { paddingHorizontal: 16, paddingBottom: 32 },

  emptyState: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { color: "#BDBDBD", fontSize: 14 },

  woCard: {
    backgroundColor: "#1565C0",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  woCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  woLabel: { fontSize: 12, color: "#90CAF9", fontWeight: "500" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FF6D00" },
  statusText: { fontSize: 11, fontWeight: "600", color: "#E65100", textTransform: "capitalize" },
  woNumber: { fontSize: 22, fontWeight: "800", color: "#FFF", marginBottom: 16 },
  woGrid: { flexDirection: "row", gap: 24 },
  woGridItem: { gap: 2 },
  woGridLabel: { fontSize: 11, color: "#90CAF9" },
  woGridValue: { fontSize: 14, fontWeight: "700", color: "#FFF" },
  woGridSub: { fontSize: 12, color: "#BBDEFB" },

  persetujuanCard: {
    backgroundColor: "#FFF8F0",
    borderColor: "#FFCC80",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  persetujuanHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  persetujuanTitle: { fontSize: 14, fontWeight: "700", color: "#E65100" },
  persetujuanNote: { fontSize: 13, color: "#555", marginBottom: 4, lineHeight: 18 },
  persetujuanBiaya: { fontSize: 13, color: "#555", marginBottom: 12 },
  persetujuanBiayaBold: { fontWeight: "700", color: "#E65100" },
  persetujuanBtns: { flexDirection: "row", gap: 10 },
  setujuBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#43A047",
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  setujuBtnText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
  tolakBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E53935",
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  tolakBtnText: { color: "#FFF", fontWeight: "700", fontSize: 13 },

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
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A2E", marginBottom: 16 },

  historiItem: { flexDirection: "row", gap: 12, minHeight: 48 },
  historiLeft: { alignItems: "center", width: 16 },
  historiDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#E0E0E0",
    borderWidth: 2,
    borderColor: "#BDBDBD",
    marginTop: 2,
  },
  historiDotDone: { backgroundColor: "#1565C0", borderColor: "#1565C0" },
  historiDotCurrent: { backgroundColor: "#1565C0", borderColor: "#90CAF9", width: 16, height: 16, borderRadius: 8 },
  historiLineDone: { flex: 1, width: 2, backgroundColor: "#1565C0", marginVertical: 2 },
  historiRight: { flex: 1, paddingBottom: 16 },
  historiJam: { fontSize: 13, fontWeight: "700", color: "#1A1A2E" },
  historiJamCurrent: { color: "#1565C0" },
  saatIni: { fontSize: 11, color: "#1565C0", fontWeight: "500" },
  historiKet: { fontSize: 13, color: "#555", marginTop: 2 },
  biayaTambahan: { fontSize: 12, color: "#E65100", fontWeight: "600", marginTop: 2 },

  biayaRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  biayaBorder: { borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  biayaItem: { fontSize: 13, color: "#555" },
  biayaHarga: { fontSize: 13, fontWeight: "700", color: "#1A1A2E" },
});
