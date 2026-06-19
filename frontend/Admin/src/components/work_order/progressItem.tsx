import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Progress } from "../../../src/@types/work_order.types";

const formatRupiah = (amount: number | null | undefined) => {
  if (!amount) return "Rp 0";
  return "Rp " + amount.toLocaleString("id-ID");
};

const formatTime = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
};

export function ProgressItem({ item }: { item: Progress }) {
  return (
    <View style={styles.container}>
      <View style={styles.timeline}>
        <View style={styles.dot} />
        <View style={styles.line} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.time}>{formatTime(item.created_at)}</Text>
          {item.foto_url && (
            <View style={styles.fotoBadge}>
              <Ionicons name="image-outline" size={11} color="#2563EB" />
              <Text style={styles.fotoText}>Foto</Text>
            </View>
          )}
        </View>
        <Text style={styles.deskripsi}>{item.deskripsi}</Text>
        {item.est_biaya_tambahan ? (
          <Text style={styles.biaya}>
            +{formatRupiah(item.est_biaya_tambahan)}
          </Text>
        ) : null}
        {item.foto_url && (
          <View style={styles.fotoPlaceholderRow}>
            <View style={styles.fotoPlaceholder}>
              <Ionicons name="image-outline" size={24} color="#9CA3AF" />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: 12, marginBottom: 4 },
  timeline: { alignItems: "center", width: 20 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#2563EB", marginTop: 3 },
  line: { flex: 1, width: 2, backgroundColor: "#E5E7EB", marginTop: 4 },
  content: { flex: 1, backgroundColor: "#F9FAFB", borderRadius: 10, padding: 12, marginBottom: 12 },
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  time: { fontSize: 12, color: "#6B7280" },
  fotoBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#EFF6FF", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  fotoText: { fontSize: 10, color: "#2563EB", fontWeight: "600" },
  deskripsi: { fontSize: 13, color: "#374151", lineHeight: 18 },
  biaya: { fontSize: 12, color: "#EA580C", fontWeight: "600", marginTop: 4 },
  fotoPlaceholderRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  fotoPlaceholder: { width: 64, height: 64, borderRadius: 8, backgroundColor: "#E5E7EB", justifyContent: "center", alignItems: "center" },
});