import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Hooks API
import { useGetAdminSlots, useUpdateSlotStatus, useAssignSlot } from '../../../src/hooks/slot.hooks';
import { Slot } from '../../../src/@types/slot';

export default function SlotScreen() {
  // 1. Fetch Data API
  const { data, isLoading, isError } = useGetAdminSlots();
  const slotsList = data?.slots || [];
  const queueList = data?.antrian || [];

  // 2. Setup Mutasi
  const updateStatusMutation = useUpdateSlotStatus();
  const assignSlotMutation = useAssignSlot();

  // State untuk Modal Update Status
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'tersedia' | 'terisi' | 'tidak_tersedia'>('tersedia');

  // Buka modal saat slot diklik
  const handleSlotClick = (slot: Slot) => {
    setSelectedSlot(slot);
    setSelectedStatus(slot.status);
    setModalVisible(true);
  };

  // Simpan perubahan status manual
  const handleSaveStatus = () => {
    if (selectedSlot) {
      updateStatusMutation.mutate({
        id: selectedSlot.slot_id,
        // TS: selectedStatus can include 'terisi' but API types expect different union;
        // cast to any to satisfy type checker without changing external types here.
        data: { status: selectedStatus as any }
      });
    }
    setModalVisible(false);
  };

  // Fungsi Assign otomatis ke slot yang kosong
  const handleAssignClick = (woId: string) => {
    // Cari slot pertama yang tersedia
    const availableSlot = slotsList.find((s: Slot) => s.status === 'tersedia');
    
    if (!availableSlot) {
      Alert.alert("Gagal", "Tidak ada slot yang tersedia saat ini.");
      return;
    }

    Alert.alert(
      "Assign Slot",
      `Masukkan kendaraan ini ke ${availableSlot.nomor_slot}?`,
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Ya, Assign", 
          onPress: () => {
            assignSlotMutation.mutate({ wo_id: woId, slot_id: availableSlot.slot_id });
          } 
        }
      ]
    );
  };

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
      {/* HEADER MANUAL DIHAPUS */}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 50 }} />
        ) : isError ? (
          <Text style={{ textAlign: 'center', marginTop: 50, color: 'red' }}>Gagal memuat data slot.</Text>
        ) : (
          <>
            {/* SECTION: STATUS SLOT BENGKEL */}
            <Text style={styles.sectionTitle}>STATUS SLOT BENGKEL</Text>
            <View style={styles.slotRow}>
              {slotsList.map((slot: Slot) => {
                const isTersedia = slot.status === 'tersedia';
                // Teks status untuk UI agar huruf awalnya kapital
                const statusLabel = slot.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

                return (
                  <TouchableOpacity 
                    key={slot.slot_id} 
                    activeOpacity={0.7}
                    onPress={() => handleSlotClick(slot)}
                    style={[
                      styles.slotCard, 
                      isTersedia ? styles.slotCardTersedia : styles.slotCardTerisi
                    ]}
                  >
                    <Text style={[styles.slotName, isTersedia ? styles.textTersedia : styles.textTerisi]}>
                      {slot.nomor_slot}
                    </Text>
                    <Text style={[styles.slotStatus, isTersedia ? styles.textTersedia : styles.textTerisi]}>
                      {statusLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* SECTION: ANTRIAN MASUK */}
            <View style={styles.queueContainer}>
              <Text style={styles.sectionTitle}>ANTRIAN MASUK ({queueList.length} KENDARAAN)</Text>
              
              <View style={styles.queueCard}>
                {queueList.length === 0 ? (
                  <Text style={{ padding: 20, textAlign: 'center', color: '#888' }}>Tidak ada antrian saat ini.</Text>
                ) : (
                  queueList.map((item: any, index: number) => (
                    <View key={item.wo_id} style={[styles.queueItem, index !== queueList.length - 1 && styles.queueItemBorder]}>
                      <View style={styles.queueInfo}>
                        <Text style={styles.queueWo}>{item.nomor_wo}</Text>
                        <Text style={styles.queueVehicle}>
                          {item.kendaraan?.merek} {item.kendaraan?.model}
                        </Text>
                        <Text style={styles.queueMeta}>{item.kendaraan?.nomor_polisi} · Menunggu</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.btnAssign} 
                        onPress={() => handleAssignClick(item.wo_id)}
                      >
                        <Text style={styles.btnAssignText}>Assign Slot</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* MODAL UPDATE STATUS SLOT */}
      <Modal transparent visible={isModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Update Status {selectedSlot?.nomor_slot}</Text>

            <View style={styles.modalDataGroup}>
              <Text style={styles.modalLabel}>WO Aktif</Text>
              <Text style={styles.modalValue}>{selectedSlot?.wo_id ? selectedSlot.wo_id : 'Kosong'}</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.modalRadioTitle}>Ubah Status Menjadi:</Text>
            
            <View style={styles.radioGroup}>
              <RadioButton 
                label="Tersedia" 
                selected={selectedStatus === 'tersedia'} 
                onPress={() => setSelectedStatus('tersedia')} 
              />
              <RadioButton 
                label="Terisi" 
                selected={selectedStatus === 'terisi'} 
                onPress={() => setSelectedStatus('terisi')} 
              />
              <RadioButton 
                label="Tidak Tersedia" 
                selected={selectedStatus === 'tidak_tersedia'} 
                onPress={() => setSelectedStatus('tidak_tersedia')} 
              />
            </View>

            <TouchableOpacity style={styles.btnSimpanStatus} onPress={handleSaveStatus}>
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
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 15, // Pengganti jarak header
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