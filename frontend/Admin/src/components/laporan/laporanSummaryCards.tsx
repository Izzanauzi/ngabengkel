import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LaporanSummaryCardsProps {
  totalPendapatan: number;
  woSelesai: number;
  rataRata: number;
  periodeDari: string;
  periodeSampai: string;
}

function formatRupiah(v: number) {
  return "Rp " + v.toLocaleString("id-ID");
}

export default function LaporanSummaryCards({
  totalPendapatan, woSelesai, rataRata,
}: LaporanSummaryCardsProps) {
  return (
    <View style={styles.row}>
      {/* Total Pendapatan */}
      <View style={[styles.card, styles.cardLarge]}>
        <View style={styles.trendRow}>
          <View style={styles.iconBox}>
            <Ionicons name="trending-up-outline" size={18} color="#2563EB" />
          </View>
          <View style={styles.trendBadge}>
            <Ionicons name="arrow-up-outline" size={11} color="#16A34A" />
            <Text style={styles.trendText}>+12%</Text>
          </View>
        </View>
        <Text style={styles.cardLabel}>Total Pendapatan</Text>
        <Text style={styles.totalValue}>{formatRupiah(totalPendapatan)}</Text>
      </View>

      {/* Right column */}
      <View style={styles.colRight}>
        {/* WO Selesai */}
        <View style={[styles.card, styles.cardSmall]}>
          <View style={styles.smallHeader}>
            <Ionicons name="checkmark-circle-outline" size={14} color="#16A34A" />
            <Text style={styles.smallLabel}>WO Selesai</Text>
          </View>
          <Text style={styles.smallValue}>{woSelesai}</Text>
        </View>

        {/* Rata-rata */}
        <View style={[styles.card, styles.cardSmall]}>
          <View style={styles.smallHeader}>
            <Ionicons name="stats-chart-outline" size={14} color="#7C3AED" />
            <Text style={styles.smallLabel}>Rata-rata</Text>
          </View>
          <Text style={styles.smallValue}>{formatRupiah(rataRata)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardLarge: { flex: 1.4 },
  colRight: { flex: 1, gap: 10 },
  cardSmall: { flex: 1, justifyContent: "space-between" },
  trendRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  iconBox: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center",
  },
  trendBadge: {
    flexDirection: "row", alignItems: "center", gap: 2,
    backgroundColor: "#DCFCE7", borderRadius: 20, paddingHorizontal: 7, paddingVertical: 3,
  },
  trendText: { fontSize: 11, fontWeight: "700", color: "#16A34A" },
  cardLabel: { fontSize: 11, color: "#9CA3AF", marginBottom: 4 },
  totalValue: { fontSize: 20, fontWeight: "800", color: "#2563EB" },
  smallHeader: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 },
  smallLabel: { fontSize: 10, color: "#9CA3AF", fontWeight: "500" },
  smallValue: { fontSize: 15, fontWeight: "800", color: "#111827" },
});