import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
}

export default function DeleteModal({ visible, onClose, onConfirm, title, itemName }: DeleteModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.deleteModalContainer}>
          <View style={styles.deleteIconContainer}>
            <Ionicons name="trash-outline" size={36} color="#e53935" />
          </View>
          <Text style={styles.deleteTitle}>{title}</Text>
          <Text style={styles.deleteSubtitle}>
            Data <Text style={styles.boldText}>{itemName}</Text> akan dihapus secara permanen dan tidak bisa dikembalikan.
          </Text>
          <View style={styles.deleteBtnRow}>
            <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
              <Text style={styles.btnCancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnConfirmDelete} onPress={onConfirm}>
              <Text style={styles.btnConfirmDeleteText}>Hapus</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  deleteModalContainer: { width: '85%', backgroundColor: '#fff', borderRadius: 24, padding: 25 },
  deleteIconContainer: { width: 64, height: 64, backgroundColor: '#fde8e8', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  deleteTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 10 },
  deleteSubtitle: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 25 },
  boldText: { fontWeight: 'bold', color: '#111' },
  deleteBtnRow: { flexDirection: 'row', justifyContent: 'space-between' },
  btnCancel: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center', marginRight: 10 },
  btnCancelText: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  btnConfirmDelete: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#e53935', alignItems: 'center', marginLeft: 10 },
  btnConfirmDeleteText: { fontSize: 16, fontWeight: 'bold', color: '#fff' }
});