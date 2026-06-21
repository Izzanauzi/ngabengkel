import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/auth.context';

export default function LogoutButton() {
  const { logout } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // Komponen isi dari Modal Konfirmasi
  const modalBox = (
    <View style={styles.modalBox}>
      <View style={styles.iconWrap}>
        <Ionicons name="log-out-outline" size={32} color="#e74c3c" />
      </View>

      <Text style={styles.modalTitle}>Keluar dari Akun?</Text>

      <Text style={styles.modalMessage}>
        Apakah Anda yakin ingin keluar? Anda harus masuk kembali untuk menggunakan layanan Ngabengkel.
      </Text>

      <View style={styles.modalActions}>
        <TouchableOpacity
          style={styles.btnBatal}
          onPress={() => setShowModal(false)}
        >
          <Text style={styles.btnBatalText}>Batal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnKeluar}
          onPress={() => {
            setShowModal(false);
            logout();
          }}
        >
          <Text style={styles.btnKeluarText}>Ya, Keluar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      {/* Tombol Utama (Berdasarkan kode asli Anda) */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => setShowModal(true)}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Keluar dari Akun</Text>
      </TouchableOpacity>

      {/* Render Modal Konfirmasi */}
      {Platform.OS === 'web' ? (
        showModal && (
          <View style={styles.webOverlay}>
            {modalBox}
          </View>
        )
      ) : (
        <Modal
          visible={showModal}
          transparent
          statusBarTranslucent
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.overlay}>
            {modalBox}
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // Style Asli Anda
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#e74c3c',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Style Tambahan untuk Modal Konfirmasi
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
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
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fde8e8',
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
  btnKeluar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
  },
  btnKeluarText: {
    color: '#fff',
    fontWeight: '700',
  },
});