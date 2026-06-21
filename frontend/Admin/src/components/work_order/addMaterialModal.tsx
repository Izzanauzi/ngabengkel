import React, { useState } from "react";
import {
  Modal,
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useAddMaterialMutation } from "../../hooks/work_order.hooks";
import { useInventory } from "../../hooks/inventori.hooks";
import { useToast } from "../../contexts/toast.context";
import type { InventoryItem } from "../../@types/inventori.types";

interface AddMaterialModalProps {
  visible: boolean;
  woId: string;
  onClose: () => void;
}

export function AddMaterialModal({ visible, woId, onClose }: AddMaterialModalProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [jumlah, setJumlah] = useState("1");
  const [fieldError, setFieldError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const { showSuccess } = useToast();
  const { data: inventoryList, loading: inventoryLoading } = useInventory();

  const { addMaterialMutation } = useAddMaterialMutation({
    onSuccess: () => {
      showSuccess("Material berhasil ditambahkan");
      setSelectedItem(null);
      setJumlah("1");
      setFieldError("");
      onClose();
    },
  });

  React.useEffect(() => {
    if (!visible) {
      setSelectedItem(null);
      setJumlah("1");
      setFieldError("");
      setShowDropdown(false);
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!selectedItem) {
      setFieldError("Pilih item inventory terlebih dahulu.");
      return;
    }
    const qty = parseInt(jumlah, 10);
    if (!qty || qty <= 0) {
      setFieldError("Jumlah harus lebih dari 0.");
      return;
    }
    setFieldError("");
    addMaterialMutation.mutate(
      { woId, inventory_id: selectedItem.inventory_id, jumlah: qty },
      { onError: () => setFieldError("Gagal menambahkan material. Coba lagi.") }
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>Tambah Material</Text>

            <Text style={styles.fieldLabel}>Item Inventory *</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowDropdown((v) => !v)}
            >
              <Text
                style={selectedItem ? styles.dropdownSelected : styles.dropdownPlaceholder}
                numberOfLines={1}
              >
                {selectedItem
                  ? `${selectedItem.nama} (Stok: ${selectedItem.stok} ${selectedItem.satuan})`
                  : "Pilih item..."}
              </Text>
            </TouchableOpacity>

            {showDropdown && (
              <View style={styles.dropdownList}>
                <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
                  {inventoryLoading ? (
                    <ActivityIndicator
                      size="small"
                      color="#2563EB"
                      style={{ padding: 12 }}
                    />
                  ) : inventoryList.length === 0 ? (
                    <Text style={styles.emptyText}>Tidak ada item</Text>
                  ) : (
                    inventoryList.map((item) => (
                      <TouchableOpacity
                        key={item.inventory_id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedItem(item);
                          setShowDropdown(false);
                          if (fieldError) setFieldError("");
                        }}
                      >
                        <Text style={styles.dropdownItemName}>{item.nama}</Text>
                        <Text style={styles.dropdownItemMeta}>
                          Stok: {item.stok} {item.satuan} · Rp{" "}
                          {item.harga_satuan.toLocaleString("id-ID")}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            )}

            <Text style={styles.fieldLabel}>Jumlah *</Text>
            <TextInput
              style={styles.input}
              value={jumlah}
              onChangeText={(t) => {
                setJumlah(t);
                if (fieldError) setFieldError("");
              }}
              placeholder="1"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />

            {!!fieldError && (
              <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                {fieldError}
              </Text>
            )}

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  addMaterialMutation.isPending && { opacity: 0.6 },
                ]}
                onPress={handleSubmit}
                disabled={addMaterialMutation.isPending}
              >
                {addMaterialMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitText}>Tambah</Text>
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 4 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 8,
  },
  dropdown: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownSelected: { fontSize: 14, color: "#111827" },
  dropdownPlaceholder: { fontSize: 14, color: "#9CA3AF" },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    backgroundColor: "#FFF",
    marginTop: 4,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemName: { fontSize: 14, color: "#111827", fontWeight: "500" },
  dropdownItemMeta: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    padding: 12,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  btnRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  cancelText: { fontSize: 15, fontWeight: "600", color: "#6B7280" },
  submitBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#7C3AED",
    alignItems: "center",
  },
  submitText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});
