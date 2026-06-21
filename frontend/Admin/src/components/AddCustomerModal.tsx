import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AddCustomerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { nama: string; telepon: string }) => void;
  isLoading?: boolean;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  visible,
  onClose,
  onSave,
  isLoading,
}) => {
  const [nama, setNama] = useState("");
  const [telepon, setTelepon] = useState("");

  const handleSave = () => {
    if (!nama.trim() || !telepon.trim()) return;
    onSave({ nama: nama.trim(), telepon: telepon.trim() });
  };

  const handleClose = () => {
    setNama("");
    setTelepon("");
    onClose();
  };
  if (!visible) return null;
  return (
    <View
      animationType="slide"
      transparent
      visible={visible}
      style={styles.overlay}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.bottomSheet}>
          <View style={styles.handleContainer}>
          </View>

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Tambah Customer</Text>
              <Text style={styles.subtitle}>Isi data customer walk-in</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={20} color="#555" />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Nama Lengkap <Text style={styles.asterisk}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#999"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan nama lengkap"
                  value={nama}
                  onChangeText={setNama}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Nomor Telepon <Text style={styles.asterisk}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color="#999"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="08xx-xxxx-xxxx"
                  keyboardType="phone-pad"
                  value={telepon}
                  onChangeText={setTelepon}
                />
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.btnBatal} onPress={handleClose}>
              <Text style={styles.btnBatalText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btnSimpan,
                (!nama.trim() || !telepon.trim() || isLoading) &&
                  styles.btnSimpanDisabled,
              ]}
              onPress={handleSave}
              disabled={!nama.trim() || !telepon.trim() || isLoading}
            >
              <Text style={styles.btnSimpanText}>
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    zIndex: 999,
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingBottom: 30,
  },
  handleContainer: { alignItems: "center", paddingTop: 10, paddingBottom: 5 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#111" },
  subtitle: { fontSize: 13, color: "#888", marginTop: 2 },
  closeButton: {
    backgroundColor: "#f5f5f5",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: { paddingHorizontal: 20, paddingTop: 20 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  asterisk: { color: "#1a73e8" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: "#fcfcfc",
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: "#333", outlineStyle: 'none' },
  footer: { flexDirection: "row", paddingHorizontal: 20, paddingTop: 10 },
  btnBatal: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    marginRight: 10,
  },
  btnBatalText: { fontSize: 16, fontWeight: "bold", color: "#555" },
  btnSimpan: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a73e8",
    borderRadius: 10,
  },
  btnSimpanDisabled: { backgroundColor: "#8cb4f5" },
  btnSimpanText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
});

export default AddCustomerModal;
