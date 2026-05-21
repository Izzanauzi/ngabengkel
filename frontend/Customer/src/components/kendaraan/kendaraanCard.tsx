import React, { useState } from "react";
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Kendaraan } from "../../@types/kendaraan.types";
import { Ionicons } from "@expo/vector-icons";
 
 interface KendaraanCardProps {
  kendaraan: Kendaraan;
  onPressDetail: (kendaraanId: string) => void;
  onPressEdit: (kendaraanId: string) => void;
  onPressDelete: (kendaraanId: string) => void;
}
 
export function KendaraanCard({
  kendaraan, onPressDetail, onPressEdit, onPressDelete,
}: KendaraanCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const modalBox = (
    <View style={styles.modalBox}>
      <View style={styles.modalIconWrap}>
        <Ionicons name="trash-outline" size={32} color="#EF4444" />
      </View>
      <Text style={styles.modalTitle}>Hapus Kendaraan?</Text>
      <Text style={styles.modalMessage}>
        <Text style={{ fontWeight: '700' }}>
          {kendaraan.merek} {kendaraan.model}
        </Text>
        {" "}({kendaraan.nomor_polisi}) akan dihapus secara permanen.{"\n"}
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
          style={styles.btnHapus}
          onPress={() => {
            setShowDeleteModal(false)
            onPressDelete(kendaraan.kendaraan_id)
          }}
        >
          <Text style={styles.btnHapusText}>Ya, Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPressDetail(kendaraan.kendaraan_id)}
        activeOpacity={0.8}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.namaKendaraan}>
            {kendaraan.merek} {kendaraan.model}
          </Text>
          <Text style={styles.tahun}>{kendaraan.tahun}</Text>
        </View>

        {/* Nomor polisi */}
        <View style={styles.platContainer}>
          <Text style={styles.platText}>{kendaraan.nomor_polisi}</Text>
        </View>

        {/* Info tambahan */}
        {kendaraan.warna && (
          <Text style={styles.infoText}>Warna: {kendaraan.warna}</Text>
        )}
        {kendaraan.nomor_rangka && (
          <Text style={styles.infoText}>No. Rangka: {kendaraan.nomor_rangka}</Text>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.btnEdit]}
            onPress={() => onPressEdit(kendaraan.kendaraan_id)}
          >
            <Text style={styles.btnEditText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnDelete]}
            onPress={() => setShowDeleteModal(true)}
          >
            <Text style={styles.btnDeleteText}>Hapus</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {Platform.OS === 'web' ? (
        showDeleteModal && (
          <View style={styles.webOverlay}>
            {modalBox}
          </View>
        )
      ) : (
        <Modal
          visible={showDeleteModal}
          transparent
          statusBarTranslucent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalOverlay}>
            {modalBox}
          </View>
        </Modal>
      )}
    </>
  )
}
 
 const styles = StyleSheet.create({
   card: {
     backgroundColor: "#FFFFFF",
     borderRadius: 12,
     padding: 16,
     marginBottom: 12,
     shadowColor: "#000",
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.06,
     shadowRadius: 8,
     elevation: 2,
   },
   header: {
     flexDirection: "row",
     justifyContent: "space-between",
     alignItems: "center",
     marginBottom: 10,
   },
   namaKendaraan: {
     fontSize: 16,
     fontWeight: "700",
     color: "#1a1a2e",
   },
   tahun: {
     fontSize: 14,
     color: "#6B7280",
   },
   platContainer: {
     alignSelf: "flex-start",
     backgroundColor: "#1a1a2e",
     borderRadius: 6,
     paddingHorizontal: 12,
     paddingVertical: 4,
     marginBottom: 10,
   },
   platText: {
     color: "#FFFFFF",
     fontWeight: "700",
     fontSize: 14,
     letterSpacing: 1,
   },
   infoText: {
     fontSize: 13,
     color: "#6B7280",
     marginBottom: 4,
   },
   actions: {
     flexDirection: "row",
     gap: 8,
     marginTop: 12,
   },
   btn: {
     flex: 1,
     paddingVertical: 8,
     borderRadius: 8,
     alignItems: "center",
   },
   btnEdit: {
     borderWidth: 1,
     borderColor: "#3B7BF6",
   },
   btnEditText: {
     color: "#3B7BF6",
     fontWeight: "600",
     fontSize: 14,
   },
  btnDelete: {
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  btnDeleteText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 14,
  },

  // Modal styles
  webOverlay: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 9999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  modalMessage: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    width: '100%',
  },
  btnBatal: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  btnBatalText: {
    color: '#555',
    fontWeight: '600',
  },
  btnHapus: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  btnHapusText: {
    color: '#fff',
    fontWeight: '700',
  },
});