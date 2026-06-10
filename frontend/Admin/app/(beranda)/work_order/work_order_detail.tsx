import React, { useState } from "react";
import { useToast } from "../../../src/contexts/toast.context";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useGetWorkOrderById,
  useStartWorkOrderMutation,
  useFinishWorkOrderMutation,
} from "../../../src/hooks/work_order.hooks";
import type { WorkOrderStatus } from "../../../src/@types/work_order.types";

import { ProgressItem } from "../../../src/components/work_order/progressItem";
import { AddProgressModal } from "../../../src/components/work_order/addProgressModal";
import { NotaTagihanModal } from "../../../src/components/work_order/notaTagihanModal";
import { AddMaterialModal } from "../../../src/components/work_order/addMaterialModal";

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  dibuat: { bg: "#EFF6FF", text: "#2563EB" },
  sedang_dikerjakan: { bg: "#FFF7ED", text: "#EA580C" },
  suspend: { bg: "#FEF9C3", text: "#CA8A04" },
  menunggu_persetujuan: { bg: "#F5F3FF", text: "#7C3AED" },
  tindakan_ditolak: { bg: "#FEF2F2", text: "#DC2626" },
  selesai: { bg: "#F0FDF4", text: "#16A34A" },
  lunas: { bg: "#F0FDF4", text: "#15803D" },
};

const STATUS_LABEL: Record<string, string> = {
  dibuat: "Dibuat",
  sedang_dikerjakan: "Sedang Dikerjakan",
  suspend: "Suspend",
  menunggu_persetujuan: "Menunggu Persetujuan",
  tindakan_ditolak: "Tindakan Ditolak",
  selesai: "Selesai",
  lunas: "Lunas",
};

const formatRupiah = (amount: number | null | undefined) => {
  if (!amount) return "Rp 0";
  return "Rp " + amount.toLocaleString("id-ID");
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLOR[status] ?? { bg: "#F3F4F6", text: "#6B7280" };
  return (
    <View style={[badgeStyles.container, { backgroundColor: s.bg }]}>
      <View style={[badgeStyles.dot, { backgroundColor: s.text }]} />
      <Text style={[badgeStyles.label, { color: s.text }]}>
        {STATUS_LABEL[status] ?? status}
      </Text>
    </View>
  );
}

export default function WorkOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workOrder, isLoading } = useGetWorkOrderById(id);

  const [showProgress, setShowProgress] = useState(false);
  const [showNota, setShowNota] = useState(false);
  const [showMaterial, setShowMaterial] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [biayaJasaInput, setBiayaJasaInput] = useState("0");
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ visible: false, title: '', message: '', onConfirm: () => {} });

  const { showSuccess, showError } = useToast();

  const { startWorkOrderMutation } = useStartWorkOrderMutation({
    onSuccess: () => showSuccess("WO berhasil dimulai"),
    onError: (msg) => showError(msg),
  });
  const { finishWorkOrderMutation } = useFinishWorkOrderMutation({
    onSuccess: () => showSuccess("WO berhasil diselesaikan"),
    onError: (msg) => showError(msg),
  });

  const totalMaterial = (workOrder?.items ?? []).reduce(
    (sum, i) => sum + i.subtotal,
    0
  );

  const handleStart = () => {
    setConfirmModal({
      visible: true,
      title: 'Mulai WO',
      message: 'Yakin ingin memulai work order ini?',
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, visible: false }));
        startWorkOrderMutation.mutate(id!);
      },
    });
  };

  const handleFinish = () => {
    setBiayaJasaInput("0");
    setShowFinishModal(true);
  };

  const handleConfirmFinish = () => {
    setShowFinishModal(false);
    finishWorkOrderMutation.mutate({
      woId: id!,
      biaya_jasa: parseFloat(biayaJasaInput) || 0,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!workOrder) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Work order tidak ditemukan</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = workOrder.status as WorkOrderStatus;
  const tanggal = new Date(workOrder.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSubtitle}>Work Order</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.woNumberBadge}>
            <Text style={styles.woNumberText}>{workOrder.nomor_wo}</Text>
          </View>
          <StatusBadge status={status} />
        </View>
        <Text style={styles.customerName}>
          {workOrder.user?.nama ?? "Walk-in"}
        </Text>
        <Text style={styles.tanggal}>{tanggal}</Text>

        {workOrder.kendaraan && (
          <View style={styles.kendaraanRow}>
            <View style={styles.kendaraanInfo}>
              <Ionicons
                name="car-outline"
                size={13}
                color="rgba(255,255,255,0.8)"
              />
              <Text style={styles.kendaraanText}>
                {workOrder.kendaraan.merek} {workOrder.kendaraan.model}
              </Text>
            </View>
            <View style={styles.platBadge}>
              <Text style={styles.platText}>
                {workOrder.kendaraan.nomor_polisi}
              </Text>
            </View>
          </View>
        )}

        {/* PERBAIKAN POIN 2: Menggunakan nama mekanik, bukan ID */}
        {workOrder.mekanik?.nama && (
          <View style={styles.mekanikRow}>
            <Ionicons
              name="build-outline"
              size={13}
              color="rgba(255,255,255,0.7)"
            />
            <Text style={styles.mekanikText}>{workOrder.mekanik.nama}</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Keluhan Customer */}
        {workOrder.deskripsi_kerusakan && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>KELUHAN CUSTOMER</Text>
            <Text style={styles.deskripsiText}>
              {workOrder.deskripsi_kerusakan}
            </Text>
          </View>
        )}

        {/* CTA Nota */}
        {(status === "selesai" || status === "lunas") && (
          <TouchableOpacity
            style={styles.notaBtn}
            onPress={() => setShowNota(true)}
          >
            <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
            <Text style={styles.notaBtnText}>Buat Nota Tagihan</Text>
          </TouchableOpacity>
        )}

        {/* Progress Timeline */}
        <View style={styles.section}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionLabel}>PROGRES PENGERJAAN</Text>
            <Text style={styles.progressCount}>
              {workOrder.progress?.length ?? 0} catatan
            </Text>
          </View>

          {workOrder.progress?.length > 0 ? (
            workOrder.progress.map((item) => (
              <ProgressItem key={item.progress_id} item={item} />
            ))
          ) : (
            <Text style={styles.noProgressText}>
              Belum ada catatan progress
            </Text>
          )}
        </View>

        {/* Material Summary */}
        {(totalMaterial > 0 || (workOrder.biaya_jasa ?? 0) > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>MATERIAL DIGUNAKAN</Text>
            {(workOrder.items ?? []).map((item) => (
              <View key={item.wo_item_id} style={styles.materialRow}>
                <View style={styles.materialIcon}>
                  <Ionicons name="cube-outline" size={14} color="#7C3AED" />
                </View>
                <Text style={styles.materialName} numberOfLines={1}>
                  {item.nama_item}
                </Text>
                <Text style={styles.materialHarga}>
                  {item.jumlah}x · {formatRupiah(item.subtotal)}
                </Text>
              </View>
            ))}

            <View style={styles.divider} />
            {totalMaterial > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Material</Text>
                <Text style={styles.summaryValue}>
                  {formatRupiah(totalMaterial)}
                </Text>
              </View>
            )}
            {(workOrder.biaya_jasa ?? 0) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Biaya Jasa</Text>
                <Text style={styles.summaryValue}>
                  {formatRupiah(workOrder.biaya_jasa)}
                </Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalEstRow]}>
              <Text style={styles.totalEstLabel}>Total Estimasi</Text>
              <Text style={styles.totalEstValue}>
                {formatRupiah(totalMaterial + (workOrder.biaya_jasa ?? 0))}
              </Text>
            </View>
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Action Buttons Footer */}
      <View style={styles.actionBar}>
        {status === "dibuat" && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.startBtn]}
            onPress={handleStart}
            disabled={startWorkOrderMutation.isPending}
          >
            {startWorkOrderMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="play-circle-outline" size={18} color="#FFF" />
                <Text style={styles.actionBtnText}>Mulai Pengerjaan</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {status === "sedang_dikerjakan" && (
          <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.progressBtn, { flex: 1 }]}
              onPress={() => setShowProgress(true)}
            >
              <Ionicons name="add-circle-outline" size={18} color="#FFF" />
              <Text style={styles.actionBtnText}>Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.materialBtn, { flex: 1 }]}
              onPress={() => setShowMaterial(true)}
            >
              <Ionicons name="cube-outline" size={18} color="#FFF" />
              <Text style={styles.actionBtnText}>Material</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.finishBtn, { flex: 1 }]}
              onPress={handleFinish}
              disabled={finishWorkOrderMutation.isPending}
            >
              {finishWorkOrderMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#FFF"
                  />
                  <Text style={styles.actionBtnText}>Selesai</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <AddProgressModal
        visible={showProgress}
        woId={id!}
        onClose={() => setShowProgress(false)}
      />
      <NotaTagihanModal
        visible={showNota}
        onClose={() => setShowNota(false)}
        woId={id!}
      />
      <AddMaterialModal
        visible={showMaterial}
        woId={id!}
        onClose={() => setShowMaterial(false)}
      />

      {/* Modal biaya jasa saat finish WO */}
      <Modal visible={showFinishModal} transparent animationType="fade">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 }}>
            <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 20, width: "100%" }}>
              <Text style={{ fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 4 }}>
                Selesaikan WO
              </Text>
              <Text style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
                Masukkan biaya jasa pengerjaan (isi 0 jika tidak ada).
              </Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>
                Biaya Jasa (Rp)
              </Text>
              <TextInput
                style={{ backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#111827", marginBottom: 20 }}
                value={biayaJasaInput}
                onChangeText={setBiayaJasaInput}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  style={{ flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center" }}
                  onPress={() => setShowFinishModal(false)}
                >
                  <Text style={{ color: "#6B7280", fontWeight: "600" }}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#16A34A", alignItems: "center" }}
                  onPress={handleConfirmFinish}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Selesaikan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={confirmModal.visible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', marginBottom: 8 }}>
              {confirmModal.title}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>
              {confirmModal.message}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' }}
                onPress={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
              >
                <Text style={{ color: '#6B7280', fontWeight: '600' }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#2563EB', alignItems: 'center' }}
                onPress={confirmModal.onConfirm}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Ya, Lanjutkan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  label: { fontSize: 12, fontWeight: "600" },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1E3A5F" },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  errorText: { fontSize: 14, color: "#4B5563", fontWeight: "500" },
  backLink: { fontSize: 14, color: "#2563EB", fontWeight: "600" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 48,
    pb: 12,
  },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  headerCenter: { alignItems: "center" },
  headerSubtitle: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  heroCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  woNumberBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  woNumberText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  customerName: { color: "#FFF", fontSize: 20, fontWeight: "800" },
  tanggal: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 14,
  },
  kendaraanRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
    padding: 10,
    borderRadius: 10,
  },
  kendaraanInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
  kendaraanText: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  platBadge: {
    backgroundColor: "#FFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  platText: { color: "#1E3A5F", fontSize: 11, fontWeight: "700" },
  mekanikRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingLeft: 4,
  },
  mekanikText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "500",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: { padding: 20 },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 10,
  },
  deskripsiText: { fontSize: 14, color: "#374151", lineHeight: 20 },
  notaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  notaBtnText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  progressCount: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  noProgressText: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 12,
  },
  materialRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 10,
  },
  materialIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  materialName: { flex: 1, fontSize: 13, color: "#374151" },
  materialHarga: { fontSize: 13, fontWeight: "600", color: "#111827" },
  divider: { height: 1, backgroundColor: "#F3F4F6", my: 12 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  summaryLabel: { fontSize: 13, color: "#6B7280" },
  summaryValue: { fontSize: 13, fontWeight: "600", color: "#111827" },
  totalEstRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  totalEstLabel: { fontSize: 14, fontWeight: "700", color: "#111827" },
  totalEstValue: { fontSize: 16, fontWeight: "800", color: "#2563EB" },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionBtnText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  startBtn: { backgroundColor: "#2563EB" },
  progressBtn: { backgroundColor: "#0284C7" },
  materialBtn: { backgroundColor: "#7C3AED" },
  finishBtn: { backgroundColor: "#16A34A" },
});
