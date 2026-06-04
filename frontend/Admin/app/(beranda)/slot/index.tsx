import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- DATA DUMMY ---
const dummySlots = [
  { id: '1', name: 'Slot 1', status: 'Tersedia' },
  { id: '2', name: 'Slot 2', status: 'Terisi' },
  { id: '3', name: 'Slot 3', status: 'Terisi' },
];

const dummyQueue = [
  { id: '1', wo: 'WO-2025-0045', vehicle: 'Yamaha NMAX 155', plate: 'D 9012 GHI', eta: '±30 mnt' },
  { id: '2', wo: 'WO-2025-0046', vehicle: 'Honda PCX 160', plate: 'B 3456 JKL', eta: '±45 mnt' },
];

export default function SlotScreen() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Terisi');

  // Komponen custom untuk Radio Button
  const RadioButton = ({ label, selected, onPress }: { label: string, selected: boolean, onPress: () => void }) => (
    <TouchableOpacity style={styles.radioContainer} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.outerCircle, selected && styles.selectedOuterCircle]}>
        {selected && <View style={styles.innerCircle} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Slot & Antrian</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* SECTION: STATUS SLOT BENGKEL */}
        <Text style={styles.sectionTitle}>STATUS SLOT BENGKEL</Text>
        <View style={styles.slotRow}>
          {dummySlots.map((slot) => {
            const isTersedia = slot.status === 'Tersedia';
            return (
              <View 
                key={slot.id} 
                style={[
                  styles.slotCard, 
                  isTersedia ? styles.slotCardTersedia : styles.slotCardTerisi
                ]}
              >
                <Text style={[styles.slotName, isTersedia ? styles.textTersedia : styles.textTerisi]}>
                  {slot.name}
                </Text>
                <Text style={[styles.slotStatus, isTersedia ? styles.textTersedia : styles.textTerisi]}>
                  {slot.status}
                </Text>
              </View>
            );
          })}
        </View>

        {/* SECTION: ANTRIAN MASUK */}
        <View style={styles.queueContainer}>
          <Text style={styles.sectionTitle}>ANTRIAN MASUK (4 KENDARAAN)</Text>
          
          <View style={styles.queueCard}>
            {dummyQueue.map((item, index) => (
              <View key={item.id} style={[styles.queueItem, index !== dummyQueue.length - 1 && styles.queueItemBorder]}>
                <View style={styles.queueInfo}>
                  <Text style={styles.queueWo}>{item.wo}</Text>
                  <Text style={styles.queueVehicle}>{item.vehicle}</Text>
                  <Text style={styles.queueMeta}>{item.plate} · Estimasi: {item.eta}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.btnAssign} 
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.btnAssignText}>Assign Slot</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* MODAL UPDATE STATUS SLOT */}
      <Modal transparent visible={isModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Update Status Slot 2</Text>

            <View style={styles.modalDataGroup}>
              <Text style={styles.modalLabel}>Status Saat Ini</Text>
              <Text style={styles.modalValue}>Terisi – Honda Vario · D 1234 ABC</Text>
            </View>

            <View style={styles.modalDataGroup}>
              <Text style={styles.modalLabel}>WO Aktif</Text>
              <Text style={styles.modalValue}>WO-2025-0042</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.modalRadioTitle}>Ubah Status Menjadi:</Text>
            
            <View style={styles.radioGroup}>
              <RadioButton 
                label="Tersedia" 
                selected={selectedStatus === 'Tersedia'} 
                onPress={() => setSelectedStatus('Tersedia')} 
              />
              <RadioButton 
                label="Terisi" 
                selected={selectedStatus === 'Terisi'} 
                onPress={() => setSelectedStatus('Terisi')} 
              />
              <RadioButton 
                label="Tidak Tersedia" 
                selected={selectedStatus === 'Tidak Tersedia'} 
                onPress={() => setSelectedStatus('Tidak Tersedia')} 
              />
            </View>

            <TouchableOpacity style={styles.btnSimpanStatus} onPress={() => setModalVisible(false)}>
              <Text style={styles.btnSimpanStatusText}>Simpan Status</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.btnBatalStatus} onPress={() => setModalVisible(false)}>
              <Text style={styles.btnBatalStatusText}>Batal</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  headerContainer: {
    backgroundColor: '#1a73e8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  slotCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  slotCardTersedia: {
    backgroundColor: '#eafaf1',
    borderColor: '#4caf50',
  },
  slotCardTerisi: {
    backgroundColor: '#fde8e8',
    borderColor: '#e53935',
  },
  slotName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  slotStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  textTersedia: { color: '#4caf50' },
  textTerisi: { color: '#e53935' },
  
  queueContainer: {
    marginTop: 10,
  },
  queueCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  queueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  queueItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  queueInfo: {
    flex: 1,
    paddingRight: 10,
  },
  queueWo: {
    color: '#1a73e8',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 4,
  },
  queueVehicle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  queueMeta: {
    fontSize: 13,
    color: '#888',
  },
  btnAssign: {
    backgroundColor: '#1a73e8',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnAssignText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  /* --- STYLES MODAL --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
  },
  modalDataGroup: {
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 15,
    color: '#222',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 15,
  },
  modalRadioTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15,
  },
  radioGroup: {
    marginBottom: 25,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  outerCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedOuterCircle: {
    borderColor: '#1a73e8',
  },
  innerCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#1a73e8',
  },
  radioLabel: {
    fontSize: 15,
    color: '#333',
  },
  btnSimpanStatus: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnSimpanStatusText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  btnBatalStatus: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1a73e8',
    alignItems: 'center',
  },
  btnBatalStatusText: {
    color: '#1a73e8',
    fontSize: 15,
    fontWeight: 'bold',
  },
});