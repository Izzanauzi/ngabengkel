import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Modal, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useGetAllSlots,
  useGetQueue,
  useUpdateSlotStatus,
  useAssignSlot,
} from '../../../src/hooks/slot.hooks';
import type { Slot, QueueItem } from '../../../src/@types/slot.types';

export default function SlotScreen() {
  const [statusSlot, setStatusSlot] = useState<Slot | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('Tersedia');
  const [assignItem, setAssignItem] = useState<QueueItem | null>(null);
  const [assignSlotId, setAssignSlotId] = useState<string | null>(null);

  const { slots, isLoading: slotsLoading } = useGetAllSlots();
  const { queue, isLoading: queueLoading } = useGetQueue();
  const { updateSlotStatus } = useUpdateSlotStatus({ onSuccess: () => setStatusSlot(null) });
  const { assignSlot } = useAssignSlot({
    onSuccess: () => { setAssignItem(null); setAssignSlotId(null); },
  });

  const availableSlots = slots.filter(s => s.status === 'Tersedia');

  const RadioButton = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity style={styles.radioContainer} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.outerCircle, selected && styles.selectedOuterCircle]}>
        {selected && <View style={styles.innerCircle} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const slotStyle = (status: string) => {
    if (status === 'Tersedia') return styles.slotCardTersedia;
    if (status === 'Tidak Tersedia') return styles.slotCardTidakTersedia;
    return styles.slotCardTerisi;
  };

  const slotTextStyle = (status: string) => {
    if (status === 'Tersedia') return styles.textTersedia;
    if (status === 'Tidak Tersedia') return styles.textTidakTersedia;
    return styles.textTerisi;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Slot & Antrian</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* STATUS SLOT */}
        <Text style={styles.sectionTitle}>STATUS SLOT BENGKEL</Text>
        {slotsLoading ? (
          <ActivityIndicator color="#1a73e8" style={{ marginBottom: 25 }} />
        ) : (
          <View style={styles.slotRow}>
            {slots.map(slot => (
              <TouchableOpacity
                key={slot.slot_id}
                style={[styles.slotCard, slotStyle(slot.status)]}
                onPress={() => { setStatusSlot(slot); setSelectedStatus(slot.status); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.slotName, slotTextStyle(slot.status)]}>{slot.nama}</Text>
                <Text style={[styles.slotStatus, slotTextStyle(slot.status)]}>{slot.status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ANTRIAN MASUK */}
        <View style={styles.queueContainer}>
          <Text style={styles.sectionTitle}>
            ANTRIAN MASUK ({queueLoading ? '...' : queue.length} KENDARAAN)
          </Text>

          {queueLoading ? (
            <ActivityIndicator color="#1a73e8" />
          ) : queue.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tidak ada antrian saat ini</Text>
            </View>
          ) : (
            <View style={styles.queueCard}>
              {queue.map((item, index) => {
                const vehicleName = item.kendaraan
                  ? `${item.kendaraan.merek} ${item.kendaraan.model}`
                  : '-';
                const plate = item.kendaraan?.nomor_polisi ?? '-';
                return (
                  <View
                    key={item.wo_id}
                    style={[styles.queueItem, index !== queue.length - 1 && styles.queueItemBorder]}
                  >
                    <View style={styles.queueInfo}>
                      <Text style={styles.queueWo}>{item.wo_id}</Text>
                      <Text style={styles.queueVehicle}>{vehicleName}</Text>
                      <Text style={styles.queueMeta}>
                        {plate}{item.eta ? ` · Estimasi: ${item.eta}` : ''}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.btnAssign}
                      onPress={() => { setAssignItem(item); setAssignSlotId(null); }}
                    >
                      <Text style={styles.btnAssignText}>Assign Slot</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL UPDATE STATUS SLOT */}
      <Modal transparent visible={!!statusSlot} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Update Status {statusSlot?.nama}</Text>

            <View style={styles.modalDataGroup}>
              <Text style={styles.modalLabel}>Status Saat Ini</Text>
              <Text style={styles.modalValue}>{statusSlot?.status}</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.modalRadioTitle}>Ubah Status Menjadi:</Text>
            <View style={styles.radioGroup}>
              {(['Tersedia', 'Terisi', 'Tidak Tersedia'] as const).map(s => (
                <RadioButton
                  key={s}
                  label={s}
                  selected={selectedStatus === s}
                  onPress={() => setSelectedStatus(s)}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.btnSimpanStatus}
              onPress={() => statusSlot && updateSlotStatus.mutate({ id: statusSlot.slot_id, status: selectedStatus })}
              disabled={updateSlotStatus.isPending}
            >
              <Text style={styles.btnSimpanStatusText}>
                {updateSlotStatus.isPending ? 'Menyimpan...' : 'Simpan Status'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnBatalStatus} onPress={() => setStatusSlot(null)}>
              <Text style={styles.btnBatalStatusText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL ASSIGN SLOT */}
      <Modal transparent visible={!!assignItem} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Assign Slot</Text>

            {assignItem && (
              <View style={styles.modalDataGroup}>
                <Text style={styles.modalLabel}>Work Order</Text>
                <Text style={styles.modalValue}>{assignItem.wo_id}</Text>
                {assignItem.kendaraan && (
                  <Text style={styles.modalValue}>
                    {assignItem.kendaraan.merek} {assignItem.kendaraan.model} · {assignItem.kendaraan.nomor_polisi}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.divider} />

            <Text style={styles.modalRadioTitle}>Pilih Slot Tersedia:</Text>
            {availableSlots.length === 0 ? (
              <Text style={styles.noSlotText}>Tidak ada slot tersedia saat ini</Text>
            ) : (
              <View style={styles.radioGroup}>
                {availableSlots.map(slot => (
                  <RadioButton
                    key={slot.slot_id}
                    label={slot.nama}
                    selected={assignSlotId === slot.slot_id}
                    onPress={() => setAssignSlotId(slot.slot_id)}
                  />
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[styles.btnSimpanStatus, (!assignSlotId || assignSlot.isPending) && { opacity: 0.5 }]}
              onPress={() => assignItem && assignSlotId && assignSlot.mutate({ slotId: assignSlotId, wo_id: assignItem.wo_id })}
              disabled={!assignSlotId || assignSlot.isPending}
            >
              <Text style={styles.btnSimpanStatusText}>
                {assignSlot.isPending ? 'Memproses...' : 'Assign Slot'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnBatalStatus} onPress={() => { setAssignItem(null); setAssignSlotId(null); }}>
              <Text style={styles.btnBatalStatusText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  headerContainer: { backgroundColor: '#1a73e8', paddingTop: 15, paddingBottom: 15, paddingHorizontal: 15 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#888', marginBottom: 12, letterSpacing: 0.5 },
  slotRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  slotCard: { flex: 1, borderWidth: 1.5, borderRadius: 8, paddingVertical: 15, alignItems: 'center', marginHorizontal: 4 },
  slotCardTersedia: { backgroundColor: '#eafaf1', borderColor: '#4caf50' },
  slotCardTerisi: { backgroundColor: '#fde8e8', borderColor: '#e53935' },
  slotCardTidakTersedia: { backgroundColor: '#f5f5f5', borderColor: '#9e9e9e' },
  slotName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  slotStatus: { fontSize: 13, fontWeight: '600' },
  textTersedia: { color: '#4caf50' },
  textTerisi: { color: '#e53935' },
  textTidakTersedia: { color: '#9e9e9e' },
  queueContainer: { marginTop: 10 },
  queueCard: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  queueItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18 },
  queueItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  queueInfo: { flex: 1, paddingRight: 10 },
  queueWo: { color: '#1a73e8', fontWeight: 'bold', fontSize: 12, marginBottom: 4 },
  queueVehicle: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  queueMeta: { fontSize: 13, color: '#888' },
  btnAssign: { backgroundColor: '#1a73e8', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  btnAssignText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  emptyContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 30, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 14 },
  noSlotText: { color: '#e53935', marginBottom: 20, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '85%', backgroundColor: '#fff', borderRadius: 12, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 20 },
  modalDataGroup: { marginBottom: 12 },
  modalLabel: { fontSize: 13, color: '#888', marginBottom: 4 },
  modalValue: { fontSize: 15, color: '#222' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 15 },
  modalRadioTitle: { fontSize: 14, fontWeight: 'bold', color: '#222', marginBottom: 15 },
  radioGroup: { marginBottom: 25 },
  radioContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  outerCircle: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  selectedOuterCircle: { borderColor: '#1a73e8' },
  innerCircle: { height: 10, width: 10, borderRadius: 5, backgroundColor: '#1a73e8' },
  radioLabel: { fontSize: 15, color: '#333' },
  btnSimpanStatus: { backgroundColor: '#1a73e8', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  btnSimpanStatusText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  btnBatalStatus: { backgroundColor: '#fff', paddingVertical: 14, borderRadius: 8, borderWidth: 1, borderColor: '#1a73e8', alignItems: 'center' },
  btnBatalStatusText: { color: '#1a73e8', fontSize: 15, fontWeight: 'bold' },
});
