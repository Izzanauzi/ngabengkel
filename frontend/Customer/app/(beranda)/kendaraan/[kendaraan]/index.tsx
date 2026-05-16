import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useGetKendaraanById, useDeleteKendaraanMutation } from "../../../../src/hooks/kendaraan.hooks";
import { useToast } from "../../../../src/contexts/toast.context";

export default function KendaraanDetailScreen() {
  const { kendaraan: kendaraanId } = useLocalSearchParams<{ kendaraan: string }>();
  const { kendaraan, isLoading } = useGetKendaraanById(kendaraanId);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { showSuccess } = useToast();

  const { deleteKendaraanMutation } = useDeleteKendaraanMutation({
    successAction: () => {
      setShowDeleteModal(false);
      showSuccess("Kendaraan berhasil dihapus!", () => router.back());
    },
    onError: (message) => {
      setShowDeleteModal(false);
      Alert.alert("Gagal", message);
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Kendaraan</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1565C0" />
        </View>
      </SafeAreaView>
    );
  }

  if (!kendaraan) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Kendaraan</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#BDBDBD" />
          <Text style={styles.emptyText}>Kendaraan tidak ditemukan</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Kendaraan</Text>
        <TouchableOpacity
          onPress={() => router.push(`/(beranda)/kendaraan/${kendaraanId}/edit`)}
        >
          <Ionicons name="create-outline" size={22} color="#1565C0" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="bicycle" size={40} color="#1565C0" />
          </View>
          <Text style={styles.heroNama}>{kendaraan.merek} {kendaraan.model}</Text>
          <View style={styles.platBadge}>
            <Text style={styles.platText}>{kendaraan.nomor_polisi}</Text>
          </View>
          <Text style={styles.heroTahun}>Tahun {kendaraan.tahun}</Text>
        </View>

        {/* Detail Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Kendaraan</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Merek</Text>
            <Text style={styles.infoValue}>{kendaraan.merek}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Text style={styles.infoLabel}>Model</Text>
            <Text style={styles.infoValue}>{kendaraan.model}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Text style={styles.infoLabel}>Tahun</Text>
            <Text style={styles.infoValue}>{kendaraan.tahun}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Text style={styles.infoLabel}>Nomor Polisi</Text>
            <Text style={styles.infoValue}>{kendaraan.nomor_polisi}</Text>
          </View>
          {kendaraan.warna && (
            <View style={[styles.infoRow, styles.infoRowBorder]}>
              <Text style={styles.infoLabel}>Warna</Text>
              <Text style={styles.infoValue}>{kendaraan.warna}</Text>
            </View>
          )}
          {kendaraan.nomor_rangka && (
            <View style={[styles.infoRow, styles.infoRowBorder]}>
              <Text style={styles.infoLabel}>Nomor Rangka</Text>
              <Text style={[styles.infoValue, { fontSize: 12 }]}>{kendaraan.nomor_rangka}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push(`/(beranda)/kendaraan/${kendaraanId}/edit`)}
        >
          <Ionicons name="create-outline" size={18} color="#FFF" />
          <Text style={styles.editBtnText}>Edit Kendaraan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => setShowDeleteModal(true)}
        >
          <Ionicons name="trash-outline" size={18} color="#E53935" />
          <Text style={styles.deleteBtnText}>Hapus Kendaraan</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Delete Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="trash-outline" size={32} color="#E53935" />
            </View>
            <Text style={styles.modalTitle}>Hapus Kendaraan?</Text>
            <Text style={styles.modalMessage}>
              <Text style={{ fontWeight: "700" }}>{kendaraan.merek} {kendaraan.model}</Text>
              {" "}({kendaraan.nomor_polisi}) akan dihapus permanen.{"\n"}
              Kendaraan dengan servis aktif tidak dapat dihapus.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnBatal}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.btnBatalText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnHapus, deleteKendaraanMutation.isPending && { opacity: 0.6 }]}
                onPress={() => deleteKendaraanMutation.mutate(kendaraanId ?? "")}
                disabled={deleteKendaraanMutation.isPending}
              >
                <Text style={styles.btnHapusText}>
                  {deleteKendaraanMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  emptyText: { fontSize: 14, color: "#BDBDBD" },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },

  heroCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroNama: { fontSize: 20, fontWeight: "800", color: "#1A1A2E" },
  platBadge: {
    backgroundColor: "#1A1A2E",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  platText: { color: "#FFF", fontWeight: "700", fontSize: 16, letterSpacing: 2 },
  heroTahun: { fontSize: 13, color: "#888" },

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
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#1A1A2E", marginBottom: 14 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: "#F5F5F5" },
  infoLabel: { fontSize: 13, color: "#888" },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#1A1A2E" },

  editBtn: {
    backgroundColor: "#1565C0",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
    marginBottom: 10,
  },
  editBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },

  deleteBtn: {
    borderWidth: 1.5,
    borderColor: "#E53935",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    gap: 8,
  },
  deleteBtnText: { color: "#E53935", fontWeight: "700", fontSize: 15 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBox: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#1A1A2E" },
  modalMessage: { fontSize: 13, color: "#666", textAlign: "center", lineHeight: 20 },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 8, width: "100%" },
  btnBatal: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  btnBatalText: { color: "#555", fontWeight: "600" },
  btnHapus: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#E53935",
    alignItems: "center",
  },
  btnHapusText: { color: "#FFF", fontWeight: "700" },
});
