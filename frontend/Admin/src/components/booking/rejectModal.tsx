import React, { useState } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RejectModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (alasan_tolak: string) => void;
  isLoading: boolean;
}

export default function RejectModal({
  visible, onClose, onSubmit, isLoading,
}: RejectModalProps) {
  const [alasan, setAlasan] = useState("");
  const [alasanError, setAlasanError] = useState("");

  const handleClose = () => {
    setAlasan("");
    onClose();
  };

  const handleSubmit = () => {
    if (!alasan.trim()) {
      setAlasanError("Alasan penolakan wajib diisi");
      return;
    }
    setAlasanError("");
    onSubmit(alasan.trim());
  };

  React.useEffect(() => {
    if (!visible) { setAlasan(""); setAlasanError(""); }
  }, [visible]);
  if (!visible) return null;
  return (
    <View
      style={styles.overlay}
    >
      <TouchableOpacity
        style={StyleSheet.absoluteFillObject}
        activeOpacity={1}
        onPress={handleClose}
      />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* Container — stop propagasi tap supaya tidak close saat tap isi */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.container}
          >

            <View style={styles.header}>
              <Text style={styles.title}>Tolak Booking</Text>
              <TouchableOpacity
                onPress={handleClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>
              Alasan Penolakan <Text style={{ color: "#EF4444" }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Slot penuh, jadwal tidak tersedia..."
              placeholderTextColor="#9CA3AF"
              value={alasan}
              onChangeText={(t) => { setAlasan(t); if (alasanError) setAlasanError(""); }}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            {!!alasanError && (
              <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 8, marginTop: -8 }}>{alasanError}</Text>
            )}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, isLoading && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.submitText}>Tolak Booking</Text>}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    zIndex: 999,
  },
  keyboardView: {
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: "700", color: "#111827" },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    minHeight: 80,
    marginBottom: 16,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } as any : {}),
  },
  actions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  cancelText: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  submitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#DC2626",
    alignItems: "center",
  },
  submitText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});