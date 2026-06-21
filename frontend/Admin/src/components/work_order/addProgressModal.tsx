import React, { useState } from "react";
import { Modal, KeyboardAvoidingView, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform, StyleSheet } from "react-native";
import { useUploadProgressMutation } from "../../hooks/work_order.hooks";
import { useToast } from "../../contexts/toast.context";

interface AddProgressModalProps {
  visible: boolean;
  woId: string;
  onClose: () => void;
}

export function AddProgressModal({ visible, woId, onClose }: AddProgressModalProps) {
  const [deskripsi, setDeskripsi] = useState("");
  const [tipe, setTipe] = useState("catatan");
  const [fotoUrl, setFotoUrl] = useState("");
  const [biayaTambahan, setBiayaTambahan] = useState("");
  const [fieldError, setFieldError] = useState("");

  const { showSuccess } = useToast();

  const { uploadProgressMutation } = useUploadProgressMutation({
    successAction: () => {
      showSuccess("Progress berhasil ditambahkan");
      setDeskripsi("");
      setFotoUrl("");
      setBiayaTambahan("");
      setFieldError("");
      onClose();
    },
  });

  React.useEffect(() => {
    if (!visible) setFieldError("");
  }, [visible]);

  const handleSubmit = () => {
    if (!deskripsi.trim()) {
      setFieldError("Deskripsi wajib diisi.");
      return;
    }
    setFieldError("");
    uploadProgressMutation.mutate({
      woId,
      payload: {
        deskripsi: deskripsi.trim(),
        tipe,
        foto_url: fotoUrl.trim() || undefined,
        est_biaya_tambahan: biayaTambahan ? parseInt(biayaTambahan, 10) : undefined,
      },
    }, {
      onError: () => setFieldError("Gagal menambahkan progress. Coba lagi."),
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>Tambah Progress</Text>

            <Text style={styles.fieldLabel}>Deskripsi *</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={deskripsi}
              onChangeText={(t) => { setDeskripsi(t); if (fieldError) setFieldError(""); }}
              placeholder="Tulis catatan progress pengerjaan..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            {!!fieldError && (
              <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{fieldError}</Text>
            )}

            <Text style={styles.fieldLabel}>Tipe</Text>
            <View style={styles.tipeRow}>
              {["catatan", "foto", "material"].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tipeBtn, tipe === t && styles.tipeBtnActive]}
                  onPress={() => setTipe(t)}
                >
                  <Text style={[styles.tipeBtnText, tipe === t && styles.tipeBtnTextActive]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>URL Foto (opsional)</Text>
            <TextInput
              style={styles.input}
              value={fotoUrl}
              onChangeText={setFotoUrl}
              placeholder="https://..."
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.fieldLabel}>Est. Biaya Tambahan (opsional)</Text>
            <TextInput
              style={styles.input}
              value={biayaTambahan}
              onChangeText={setBiayaTambahan}
              placeholder="Contoh: 50000"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, uploadProgressMutation.isPending && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={uploadProgressMutation.isPending}
              >
                {uploadProgressMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: Platform.OS === "ios" ? 36 : 24 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16 },
  title: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 4 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#111827" },
  multiline: { minHeight: 80, paddingTop: 10 },
  tipeRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  tipeBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" },
  tipeBtnActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  tipeBtnText: { fontSize: 13, color: "#6B7280" },
  tipeBtnTextActive: { color: "#FFFFFF", fontWeight: "600" },
  btnRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: "#E5E7EB", alignItems: "center" },
  cancelText: { fontSize: 15, fontWeight: "600", color: "#6B7280" },
  submitBtn: { flex: 2, paddingVertical: 13, borderRadius: 12, backgroundColor: "#2563EB", alignItems: "center" },
  submitText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});