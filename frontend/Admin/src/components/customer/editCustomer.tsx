import React, { useState, useEffect } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Item di sini mengikuti format hasil toCardFormat() di index.tsx kamu
interface CardItem {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email?: string;
}

interface Props {
  visible: boolean;
  customer: CardItem | null;
  onClose: () => void;
  onSave: (userId: string, data: { nama: string; telepon: string }) => void;
  isLoading?: boolean;
}

export default function EditCustomerModal({ visible, customer, onClose, onSave, isLoading }: Props) {
  const [nama, setNama] = useState("");
  const [telepon, setTelepon] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && customer) {
      setNama(customer.name);
      setTelepon(customer.phone === "-" ? "" : customer.phone);
      setError(null);
    }
  }, [visible, customer]);

  const handleSave = () => {
    if (!customer) return;
    if (!nama.trim()) { setError("Nama wajib diisi"); return; }
    if (!telepon.trim()) { setError("Nomor telepon wajib diisi"); return; }
    setError(null);
    onSave(customer.user_id, { nama: nama.trim(), telepon: telepon.trim() });
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={s.overlay} />
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <KeyboardAvoidingView style={{ flex: 1, justifyContent: "flex-end" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={s.sheet}>
            <View style={s.handle} />

            <View style={s.header}>
              <View>
                <Text style={s.title}>Edit Customer</Text>
                <Text style={s.subtitle}>Perbarui data customer</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {error && (
              <View style={s.errorBox}>
                <Ionicons name="alert-circle" size={15} color="#DC2626" />
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <Text style={s.label}>Nama Lengkap <Text style={{ color: "#EF4444" }}>*</Text></Text>
            <View style={s.inputRow}>
              <Ionicons name="person-outline" size={18} color="#9CA3AF" />
              <TextInput
                style={s.input}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor="#9CA3AF"
                value={nama}
                onChangeText={setNama}
              />
            </View>

            <Text style={s.label}>Nomor Telepon <Text style={{ color: "#EF4444" }}>*</Text></Text>
            <View style={s.inputRow}>
              <Ionicons name="call-outline" size={18} color="#9CA3AF" />
              <TextInput
                style={s.input}
                placeholder="08xx-xxxx-xxxx"
                placeholderTextColor="#9CA3AF"
                value={telepon}
                onChangeText={setTelepon}
                keyboardType="phone-pad"
              />
            </View>

            {customer?.email && (
              <>
                <Text style={s.label}>Email</Text>
                <View style={[s.inputRow, { backgroundColor: "#F3F4F6" }]}>
                  <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
                  <Text style={s.readonlyText}>{customer.email}</Text>
                </View>
              </>
            )}

            <View style={s.btnRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
                <Text style={s.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.saveBtn, isLoading && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={s.saveText}>Simpan Perubahan</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: { backgroundColor: "#FFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: Platform.OS === "ios" ? 36 : 24 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "800", color: "#111827" },
  subtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FEF2F2", borderRadius: 8, padding: 10, marginBottom: 12 },
  errorText: { flex: 1, fontSize: 12, color: "#DC2626" },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6, marginTop: 4 },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB",
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12,
  },
  input: { flex: 1, fontSize: 14, color: "#111827" },
  readonlyText: { flex: 1, fontSize: 14, color: "#9CA3AF" },
  btnRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: "#E5E7EB", alignItems: "center" },
  cancelText: { fontSize: 15, fontWeight: "600", color: "#6B7280" },
  saveBtn: { flex: 2, paddingVertical: 13, borderRadius: 12, backgroundColor: "#3B82F6", alignItems: "center" },
  saveText: { fontSize: 15, fontWeight: "700", color: "#FFF" },
});