import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// ── Dummy Data ────────────────────────────────────────────────────────────────
const DETAIL_WO = {
  nomorWO: "WO-20250801-003",
  status: "Sedang Dikerjakan",
  kendaraan: "Honda Vario 150",
  platNomor: "D 1234 ABC",
  mekanik: "Ahmad Fauzi",
  perluPersetujuan: true,
  persetujuanNote: "Ditemukan keretakan pada blok mesin.",
  estimasiBiayaTambahan: "Rp 500.000",
  histori: [
    { jam: "10:00", keterangan: "Kendaraan diterima dan diperiksa awal", done: true },
    { jam: "11:30", keterangan: "Penggantian kampas rem depan", done: true },
    { jam: "13:00", keterangan: "Pemeriksaan kelistrikan", current: true },
    { jam: "14:30", keterangan: "Pengecekan akhir & uji jalan", done: false },
  ],
  estimasiBiaya: [
    { item: "Jasa servis", harga: "Rp 75.000" },
    { item: "Kampas rem depan", harga: "Rp 85.000" },
    { item: "Oli mesin", harga: "Rp 65.000" },
  ],
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function DetailWO() {
  const [persetujuan, setPersetujuan] = useState<"pending" | "setuju" | "tolak">("pending");
  const wo = DETAIL_WO;

  const handleSetuju = () => {
    Alert.alert("Konfirmasi", "Apakah Anda menyetujui biaya tambahan ini?", [
      { text: "Batal", style: "cancel" },
      { text: "Setuju", onPress: () => setPersetujuan("setuju") },
    ]);
  };

  const handleTolak = () => {
    Alert.alert("Konfirmasi", "Apakah Anda menolak biaya tambahan ini?", [
      { text: "Batal", style: "cancel" },
      { text: "Tolak", style: "destructive", onPress: () => setPersetujuan("tolak") },
    ]);
  };

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
              <Text style={styles.statusText}>{wo.status}</Text>
            </View>
          </View>
          <Text style={styles.woNumber}>{wo.nomorWO}</Text>

          <View style={styles.woGrid}>
            <View style={styles.woGridItem}>
              <Text style={styles.woGridLabel}>Kendaraan</Text>
              <Text style={styles.woGridValue}>{wo.kendaraan}</Text>
              <Text style={styles.woGridSub}>{wo.platNomor}</Text>
            </View>
            <View style={styles.woGridItem}>
              <Text style={styles.woGridLabel}>Mekanik</Text>
              <Text style={styles.woGridValue}>{wo.mekanik}</Text>
            </View>
          </View>
        </View>

        {/* Persetujuan Banner */}
        {wo.perluPersetujuan && persetujuan === "pending" && (
          <View style={styles.persetujuanCard}>
            <View style={styles.persetujuanHeader}>
              <Ionicons name="warning-outline" size={18} color="#E65100" />
              <Text style={styles.persetujuanTitle}>Diperlukan Persetujuan Anda</Text>
            </View>
            <Text style={styles.persetujuanNote}>{wo.persetujuanNote}</Text>
            <Text style={styles.persetujuanBiaya}>
              Estimasi biaya tambahan:{" "}
              <Text style={styles.persetujuanBiayaBold}>{wo.estimasiBiayaTambahan}</Text>
            </Text>
            <View style={styles.persetujuanBtns}>
              <TouchableOpacity style={styles.setujuBtn} onPress={handleSetuju}>
                <Ionicons name="checkmark" size={14} color="#FFF" />
                <Text style={styles.setujuBtnText}>Setujui</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tolakBtn} onPress={handleTolak}>
                <Ionicons name="close" size={14} color="#FFF" />
                <Text style={styles.tolakBtnText}>Tolak</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {persetujuan === "setuju" && (
          <View style={[styles.persetujuanCard, { backgroundColor: "#E8F5E9", borderColor: "#A5D6A7" }]}>
            <View style={styles.persetujuanHeader}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#2E7D32" />
              <Text style={[styles.persetujuanTitle, { color: "#2E7D32" }]}>
                Anda telah menyetujui biaya tambahan
              </Text>
            </View>
          </View>
        )}

        {persetujuan === "tolak" && (
          <View style={[styles.persetujuanCard, { backgroundColor: "#FFEBEE", borderColor: "#EF9A9A" }]}>
            <View style={styles.persetujuanHeader}>
              <Ionicons name="close-circle-outline" size={18} color="#C62828" />
              <Text style={[styles.persetujuanTitle, { color: "#C62828" }]}>
                Anda telah menolak biaya tambahan
              </Text>
            </View>
          </View>
        )}

        {/* Histori Progres */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Histori Progres</Text>
          {wo.histori.map((h, i) => (
            <View key={i} style={styles.historiItem}>
              <View style={styles.historiLeft}>
                <View
                  style={[
                    styles.historiDot,
                    h.current && styles.historiDotCurrent,
                    h.done && styles.historiDotDone,
                  ]}
                />
                {i < wo.histori.length - 1 && (
                  <View style={[styles.historiLine, h.done && styles.historiLineDone]} />
                )}
              </View>
              <View style={styles.historiRight}>
                <Text
                  style={[
                    styles.historiJam,
                    h.current && styles.historiJamCurrent,
                    !h.done && !h.current && styles.historiJamFuture,
                  ]}
                >
                  {h.jam} {h.current && <Text style={styles.saatIni}>Saat ini</Text>}
                </Text>
                <Text
                  style={[
                    styles.historiKet,
                    !h.done && !h.current && styles.historiKetFuture,
                  ]}
                >
                  {h.keterangan}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Estimasi Biaya */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estimasi Biaya</Text>
          {wo.estimasiBiaya.map((b, i) => (
            <View key={i} style={[styles.biayaRow, i < wo.estimasiBiaya.length - 1 && styles.biayaBorder]}>
              <Text style={styles.biayaItem}>{b.item}</Text>
              <Text style={styles.biayaHarga}>{b.harga}</Text>
            </View>
          ))}
          {wo.perluPersetujuan && (
            <View style={[styles.biayaRow, { marginTop: 4, paddingTop: 10, borderTopWidth: 1.5, borderTopColor: "#FFE0B2" }]}>
              <Text style={[styles.biayaItem, { color: "#E65100" }]}>Biaya tambahan</Text>
              <Text style={[styles.biayaHarga, { color: "#E65100" }]}>
                {wo.estimasiBiayaTambahan}
              </Text>
            </View>
          )}
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
  statusText: { fontSize: 11, fontWeight: "600", color: "#E65100" },
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
  historiLine: { flex: 1, width: 2, backgroundColor: "#E0E0E0", marginVertical: 2 },
  historiLineDone: { backgroundColor: "#1565C0" },
  historiRight: { flex: 1, paddingBottom: 16 },
  historiJam: { fontSize: 13, fontWeight: "700", color: "#1A1A2E", flexDirection: "row", alignItems: "center" },
  historiJamCurrent: { color: "#1565C0" },
  historiJamFuture: { color: "#BDBDBD" },
  saatIni: { fontSize: 11, color: "#1565C0", fontWeight: "500" },
  historiKet: { fontSize: 13, color: "#555", marginTop: 2 },
  historiKetFuture: { color: "#BDBDBD" },

  biayaRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  biayaBorder: { borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  biayaItem: { fontSize: 13, color: "#555" },
  biayaHarga: { fontSize: 13, fontWeight: "700", color: "#1A1A2E" },
});