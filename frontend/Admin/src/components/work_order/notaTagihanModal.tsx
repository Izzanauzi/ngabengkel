import React, { useState } from "react";
import {
  Modal, View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Platform, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useGetWorkOrderById,
  useGetInvoice,
  useConfirmPaymentMutation,
} from "../../hooks/work_order.hooks";
import { useToast } from "../../contexts/toast.context";

interface NotaTagihanModalProps {
  visible: boolean;
  onClose: () => void;
  woId: string;
}

const formatRupiah = (amount: number | null | undefined) => {
  if (!amount) return "Rp 0";
  return "Rp " + amount.toLocaleString("id-ID");
};

const PAYMENT_METHODS = [
  { value: "tunai", label: "Tunai" },
  { value: "transfer", label: "Transfer" },
  { value: "qris", label: "QRIS" },
];

export function NotaTagihanModal({ visible, onClose, woId }: NotaTagihanModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("tunai");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const { workOrder } = useGetWorkOrderById(woId);
  const { invoice, isLoading: invoiceLoading } = useGetInvoice(visible ? woId : undefined);
  const { showSuccess } = useToast();

  const { confirmPaymentMutation } = useConfirmPaymentMutation({
    successAction: () => {
      showSuccess("Pembayaran berhasil dikonfirmasi");
      onClose();
    },
    onError: (msg) => setPayError(msg),
  });

  const nomorNota = workOrder?.nomor_wo ?? "-";
  const tanggal = workOrder?.created_at
    ? new Date(workOrder.created_at).toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "-";
  const isLunas = workOrder?.status === "lunas";
  const totalBiaya = invoice?.total_biaya ?? 0;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="#6B7280" />
          </TouchableOpacity>

          <Text style={styles.title}>Nota Tagihan</Text>
          <Text style={styles.subtitle}>
            {nomorNota} · {workOrder?.user?.nama ?? "Customer"}
          </Text>

          {/* Header bengkel */}
          <View style={styles.bengkelCard}>
            <View style={styles.bengkelIcon}>
              <Ionicons name="document-text-outline" size={22} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.bengkelName}>Bengkel Ngabengkel</Text>
              <Text style={styles.bengkelNota}>Nota #{nomorNota} · {tanggal}</Text>
            </View>
          </View>

          {/* Customer & kendaraan */}
          <View style={styles.customerInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={14} color="#6B7280" />
              <Text style={styles.infoText}>{workOrder?.user?.nama ?? "-"}</Text>
            </View>
            {workOrder?.kendaraan && (
              <View style={styles.infoRow}>
                <Ionicons name="car-outline" size={14} color="#6B7280" />
                <Text style={styles.infoText}>
                  {workOrder.kendaraan.merek} {workOrder.kendaraan.model}
                </Text>
                <View style={styles.platSmall}>
                  <Text style={styles.platSmallText}>{workOrder.kendaraan.nomor_polisi}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Rincian biaya dari invoice API */}
          <Text style={styles.sectionLabel}>RINCIAN</Text>
          {invoiceLoading ? (
            <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 12 }} />
          ) : (
            <ScrollView style={{ maxHeight: 160 }} showsVerticalScrollIndicator={false}>
              {(invoice?.items ?? []).length > 0 ? (
                invoice!.items.map((item, idx) => (
                  <View key={item.item_id ?? idx} style={styles.rincianRow}>
                    <Text style={[styles.rincianName, { flex: 1 }]}>
                      {item.nama_barang} × {item.jumlah}
                    </Text>
                    <Text style={styles.rincianHarga}>{formatRupiah(item.subtotal)}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noItemText}>Belum ada item material</Text>
              )}
              {(invoice?.biaya_jasa ?? 0) > 0 && (
                <View style={styles.rincianRow}>
                  <Text style={[styles.rincianName, { flex: 1 }]}>Biaya Jasa</Text>
                  <Text style={styles.rincianHarga}>{formatRupiah(invoice?.biaya_jasa)}</Text>
                </View>
              )}
            </ScrollView>
          )}

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{formatRupiah(totalBiaya)}</Text>
          </View>

          {/* Metode pembayaran — hanya jika belum lunas */}
          {!isLunas && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 14 }]}>METODE PEMBAYARAN</Text>
              <View style={styles.methodRow}>
                {PAYMENT_METHODS.map((m) => (
                  <TouchableOpacity
                    key={m.value}
                    style={[styles.methodBtn, paymentMethod === m.value && styles.methodBtnActive]}
                    onPress={() => setPaymentMethod(m.value)}
                  >
                    <Text style={[styles.methodText, paymentMethod === m.value && styles.methodTextActive]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {!!payError && (
                <Text style={styles.errorText}>{payError}</Text>
              )}
            </>
          )}

          {/* CTA buttons */}
          <View style={styles.ctaRow}>
            <TouchableOpacity style={styles.tutupBtn} onPress={onClose}>
              <Text style={styles.tutupText}>Tutup</Text>
            </TouchableOpacity>
            {!isLunas && (
              <TouchableOpacity
                style={[styles.bayarBtn, confirmPaymentMutation.isPending && { opacity: 0.6 }]}
                onPress={() => { setPayError(null); setConfirmVisible(true); }}
                disabled={confirmPaymentMutation.isPending || invoiceLoading}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                <Text style={styles.bayarText}>
                  {confirmPaymentMutation.isPending ? "Memproses..." : "Konfirmasi Bayar"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Confirm Payment Modal */}
      <Modal visible={confirmVisible} transparent animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Konfirmasi Pembayaran</Text>
            <Text style={styles.confirmMsg}>
              Total: {formatRupiah(totalBiaya)}{"\n"}
              Metode: {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label}
            </Text>
            <View style={styles.confirmBtnRow}>
              <TouchableOpacity
                style={styles.confirmBtnCancel}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.confirmBtnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtnOk}
                onPress={() => {
                  setConfirmVisible(false);
                  confirmPaymentMutation.mutate({
                    woId,
                    metode_pembayaran: paymentMethod,
                    total_biaya: totalBiaya,
                  });
                }}
              >
                <Text style={styles.confirmBtnOkText}>Ya, Konfirmasi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  closeBtn: { alignSelf: "flex-end", padding: 4, marginBottom: 4 },
  title: { fontSize: 18, fontWeight: "800", color: "#111827" },
  subtitle: { fontSize: 12, color: "#6B7280", marginBottom: 16 },
  bengkelCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#EFF6FF", borderRadius: 12,
    padding: 12, gap: 12, marginBottom: 12,
  },
  bengkelIcon: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: "#DBEAFE", justifyContent: "center", alignItems: "center",
  },
  bengkelName: { fontSize: 14, fontWeight: "700", color: "#1E40AF" },
  bengkelNota: { fontSize: 12, color: "#3B82F6", marginTop: 1 },
  customerInfo: { gap: 6, marginBottom: 14 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { fontSize: 13, color: "#374151" },
  platSmall: { backgroundColor: "#1E3A5F", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  platSmallText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: "#9CA3AF", letterSpacing: 1, marginBottom: 8,
  },
  rincianRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#F3F4F6", gap: 8,
  },
  rincianName: { fontSize: 13, color: "#374151" },
  rincianHarga: { fontSize: 13, fontWeight: "600", color: "#111827" },
  noItemText: { fontSize: 13, color: "#9CA3AF", textAlign: "center", paddingVertical: 10 },
  totalRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#1E3A5F", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, marginTop: 12,
  },
  totalLabel: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", letterSpacing: 1 },
  totalValue: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
  methodRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  methodBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 10,
    borderWidth: 1.5, borderColor: "#E5E7EB",
    alignItems: "center", backgroundColor: "#F9FAFB",
  },
  methodBtnActive: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  methodText: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  methodTextActive: { color: "#2563EB" },
  errorText: { fontSize: 12, color: "#DC2626", marginTop: 6 },
  ctaRow: { flexDirection: "row", gap: 12, marginTop: 14 },
  tutupBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: "#E5E7EB", alignItems: "center",
  },
  tutupText: { fontSize: 14, color: "#6B7280", fontWeight: "600" },
  bayarBtn: {
    flex: 2, flexDirection: "row", paddingVertical: 12, borderRadius: 12,
    backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", gap: 6,
  },
  bayarText: { fontSize: 14, color: "#fff", fontWeight: "700" },
  // Confirm modal
  confirmOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center", padding: 24,
  },
  confirmBox: {
    backgroundColor: "#fff", borderRadius: 16, padding: 20, width: "100%",
  },
  confirmTitle: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 10 },
  confirmMsg: { fontSize: 14, color: "#374151", lineHeight: 22, marginBottom: 20 },
  confirmBtnRow: { flexDirection: "row", gap: 12 },
  confirmBtnCancel: {
    flex: 1, padding: 12, borderRadius: 10,
    borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center",
  },
  confirmBtnCancelText: { color: "#6B7280", fontWeight: "600" },
  confirmBtnOk: {
    flex: 1, padding: 12, borderRadius: 10,
    backgroundColor: "#2563EB", alignItems: "center",
  },
  confirmBtnOkText: { color: "#fff", fontWeight: "700" },
});
