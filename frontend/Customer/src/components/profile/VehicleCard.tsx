import React, { useState } from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface VehicleCardProps {
  name: string;
  year: string;
  type: string;
  plate: string;
  onPressEdit?: () => void;
  onPressDelete?: () => void;
}

export default function VehicleCard({ name, year, type, plate, onPressEdit, onPressDelete }: VehicleCardProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <View style={styles.vehicleCard}>
        <View style={styles.vehicleRow}>
          <View style={styles.iconBox}>
            <Ionicons name="car-outline" size={24} color="#3B7BF6" />
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.vehicleName}>{name}</Text>
            <Text style={styles.subText}>Tahun {year} · {type}</Text>
            <Text style={styles.plate}>{plate}</Text>
          </View>

          <View>
            <TouchableOpacity style={styles.btnEdit} onPress={onPressEdit}>
              <Text style={styles.textEdit}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
  style={styles.btnDelete}
  onPress={onPressDelete}
>
  <Text style={styles.textDelete}>Hapus</Text>
</TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal konfirmasi hapus
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.iconWrap}>
              <Ionicons name="trash-outline" size={32} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Hapus Kendaraan?</Text>
            <Text style={styles.modalMessage}>
              <Text style={{ fontWeight: '700' }}>{name}</Text>
              {" "}({plate}) akan dihapus permanen.{"\n"}
              Kendaraan dengan servis aktif tidak dapat dihapus.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnBatal} onPress={() => setShowModal(false)}>
                <Text style={styles.btnBatalText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnHapus}
                onPress={() => {
                  setShowModal(false)
                  onPressDelete?.()
                }}
              >
                <Text style={styles.btnHapusText}>Ya, Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal> */}
    </>
  )
}

const styles = StyleSheet.create({
  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  vehicleRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    backgroundColor: '#F0F5FF', padding: 12, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  vehicleName: { fontWeight: 'bold' },
  subText: { color: '#666' },
  plate: {
    backgroundColor: '#F0F5FF', color: '#3B7BF6',
    paddingHorizontal: 10, borderRadius: 4, marginTop: 6,
    alignSelf: 'flex-start', fontSize: 12, fontWeight: 'bold',
  },
  btnEdit: {
    borderWidth: 1, borderColor: '#3B7BF6',
    paddingVertical: 6, paddingHorizontal: 16,
    borderRadius: 6, marginBottom: 6, alignItems: 'center',
  },
  textEdit: { color: '#3B7BF6', fontSize: 12 },
  btnDelete: {
    backgroundColor: '#e74c3c',
    paddingVertical: 6, paddingHorizontal: 16,
    borderRadius: 6, alignItems: 'center',
  },
  textDelete: { color: '#fff', fontSize: 12 },

  // Modal
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalBox: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    width: '100%', alignItems: 'center', gap: 12,
  },
  iconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a2e' },
  modalMessage: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8, width: '100%' },
  btnBatal: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center',
  },
  btnBatalText: { color: '#555', fontWeight: '600' },
  btnHapus: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#EF4444', alignItems: 'center',
  },
  btnHapusText: { color: '#fff', fontWeight: '700' },
})