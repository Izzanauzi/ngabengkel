import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Progress } from "../../../src/@types/work_order.types";

interface NotaTagihanModalProps {
  visible: boolean;
  onClose: () => void;
  workOrder: any;
  totalMaterial: number;
}

const formatRupiah = (amount: number | null | undefined) => {
  if (!amount) return "Rp 0";
  return "Rp " + amount.toLocaleString("id-ID");
};

export function NotaTagihanModal({ visible, onClose, workOrder, totalMaterial }: NotaTagihanModalProps) {
  const totalEstimasi = totalMaterial + (workOrder?.biaya_jasa ?? 0);
  const nomorNota = workOrder?.nomor_wo ?? "-";
  const tanggal = workOrder?.created_at
    ? new Date(workOrder.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "-";

  const materialItems = (workOrder?.progress ?? []).filter(
    (p: Progress) => p.est_biaya_tambahan && p.est_biaya_tambahan > 0
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="#6B7280" />
          </TouchableOpacity>

          <Text style={styles.title}>Nota Tagihan</Text>
          <Text style={styles.subtitle}>{nomorNota} · {workOrder?.user?.nama ?? "Customer"}</Text>

          <View style={styles.bengkelCard}>
            <View style={styles.bengkelIcon}>
              <Ionicons name="document-text-outline" size={22} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.bengkelName}>Bengkel Ngabengkel</Text>
              <Text style={styles.bengkelNota}>Nota #{nomorNota} · {tanggal}</Text>
            </View>
          </View>

          <View style={styles.customerInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={14} color="#6B7280" />
              <Text style={styles.infoText}>{workOrder?.user?.nama ?? "-"}</Text>
            </View>
            {workOrder?.kendaraan && (
              <View style={styles.infoRow}>
                <Ionicons name="car-outline" size={14} color="#6B7280" />
                <Text style={styles.infoText}>{workOrder.kendaraan.merek} {workOrder.kendaraan.model}</Text>
                <View style={styles.platSmall}>
                  <Text style={styles.platSmallText}>{workOrder.kendaraan.nomor_polisi}</Text>
                </View>
              </View>
            )}
          </View>

          <Text style={styles.rincianLabel}>RINCIAN</Text>
          <ScrollView style={{ maxHeight: 200 }}>
            {materialItems.length > 0 ? (
              materialItems.map((item: Progress, idx: number) => (
                <View key={item.progress_id ?? idx} style={styles.rincianRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rincianName}>{item.deskripsi}</Text>
                  </View>
                  <Text style={styles.rincianHarga}>{formatRupiah(item.est_biaya_tambahan)}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noItemText}>Belum ada item material</Text>
            )}

            {workOrder?.biaya_jasa ? (
              <View style={styles.rincianRow}>
                <Text style={styles.rincianName}>Biaya Jasa</Text>
                <Text style={styles.rincianHarga}>{formatRupiah(workOrder.biaya_jasa)}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{formatRupiah(totalEstimasi)}</Text>
          </View>

          <View style={styles.ctaRow}>
            <TouchableOpacity style={styles.tutupBtn} onPress={onClose}>
              <Text style={styles.tutupText}>Tutup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cetakBtn}>
              <Ionicons name="print-outline" size={16} color="#2563EB" />
              <Text style={styles.cetakText}>Cetak / Kirim</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === "ios" ? 36 : 24 },
  closeBtn: { alignSelf: "flex-end", padding: 4, marginBottom: 4 },
  title: { fontSize: 18, fontWeight: "800", color: "#111827" },
  subtitle: { fontSize: 12, color: "#6B7280", marginBottom: 16 },
  bengkelCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#EFF6FF", borderRadius: 12, padding: 12, gap: 12, marginBottom: 12 },
  bengkelIcon: { width: 42, height: 42, borderRadius: 10, backgroundColor: "#DBEAFE", justifyContent: "center", alignItems: "center" },
  bengkelName: { fontSize: 14, fontWeight: "700", color: "#1E40AF" },
  bengkelNota: { fontSize: 12, color: "#3B82F6", marginTop: 1 },
  customerInfo: { gap: 6, marginBottom: 14 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { fontSize: 13, color: "#374151" },
  platSmall: { backgroundColor: "#1E3A5F", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  platSmallText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  rincianLabel: { fontSize: 11, fontWeight: "700", color: "#9CA3AF", letterSpacing: 1, marginBottom: 8 },
  rincianRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#F3F4F6", gap: 8 },
  rincianName: { fontSize: 13, color: "#374151" },
  rincianHarga: { fontSize: 13, fontWeight: "600", color: "#111827" },
  noItemText: { fontSize: 13, color: "#9CA3AF", textAlign: "center", paddingVertical: 10 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#1E3A5F", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginTop: 12 },
  totalLabel: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", letterSpacing: 1 },
  totalValue: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
  ctaRow: { flexDirection: "row", gap: 12, marginTop: 14 },
  tutupBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: "#E5E7EB", alignItems: "center" },
  tutupText: { fontSize: 14, color: "#6B7280", fontWeight: "600" },
  cetakBtn: { flex: 2, flexDirection: "row", paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: "#2563EB", alignItems: "center", justifyContent: "center", gap: 6 },
  cetakText: { fontSize: 14, color: "#2563EB", fontWeight: "600" },
});