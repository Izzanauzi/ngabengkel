import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddCustomerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { nama: string; telepon: string }) => void;
  isLoading?: boolean;
  isEdit?: boolean;       // <-- Tambahan Prop untuk mode Edit
  customerData?: any;     // <-- Tambahan Prop untuk membawa data yang diklik
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ 
  visible, onClose, onSave, isLoading, isEdit = false, customerData = null 
}) => {
  const [nama, setNama] = useState('');
  const [telepon, setTelepon] = useState('');
  
  // State khusus untuk menampung pesan error
  const [errors, setErrors] = useState({ nama: '', telepon: '' });

  // Mengisi form otomatis jika dalam mode Edit
  useEffect(() => {
    if (visible && isEdit && customerData) {
      setNama(customerData.name || '');
      // Mencegah tanda '-' (default kosong) masuk ke input form
      setTelepon(customerData.phone === '-' ? '' : customerData.phone || '');
      setErrors({ nama: '', telepon: '' }); // Reset error
    } else if (visible && !isEdit) {
      setNama('');
      setTelepon('');
      setErrors({ nama: '', telepon: '' }); // Reset error
    }
  }, [visible, isEdit, customerData]);

  const handleSave = () => {
    let isValid = true;
    const newErrors = { nama: '', telepon: '' };

    if (!nama.trim()) {
      newErrors.nama = 'Nama customer wajib diisi';
      isValid = false;
    }
    if (!telepon.trim()) {
      newErrors.telepon = 'Nomor telepon wajib diisi';
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) return;

    onSave({ nama: nama.trim(), telepon: telepon.trim() });
  };

  const handleClose = () => {
    setNama('');
    setTelepon('');
    setErrors({ nama: '', telepon: '' });
    onClose();
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.bottomSheet}>
          <View style={styles.handleContainer}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.header}>
            <View>
              {/* Judul berubah dinamis sesuai mode isEdit */}
              <Text style={styles.title}>{isEdit ? 'Edit Customer' : 'Tambah Customer'}</Text>
              <Text style={styles.subtitle}>{isEdit ? 'Perbarui data kontak customer' : 'Isi data customer walk-in'}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={20} color="#555" />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            {/* Input Nama */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Lengkap <Text style={styles.asterisk}>*</Text></Text>
              <View style={[styles.inputWrapper, errors.nama ? styles.inputError : null]}>
                <Ionicons name="person-outline" size={20} color={errors.nama ? "#EF4444" : "#999"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan nama lengkap"
                  value={nama}
                  onChangeText={(text) => {
                    setNama(text);
                    if (errors.nama) setErrors({ ...errors, nama: '' });
                  }}
                />
              </View>
              {errors.nama ? <Text style={styles.errorText}>{errors.nama}</Text> : null}
            </View>

            {/* Input Telepon */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nomor Telepon <Text style={styles.asterisk}>*</Text></Text>
              <View style={[styles.inputWrapper, errors.telepon ? styles.inputError : null]}>
                <Ionicons name="call-outline" size={20} color={errors.telepon ? "#EF4444" : "#999"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="08xx-xxxx-xxxx"
                  keyboardType="phone-pad"
                  value={telepon}
                  onChangeText={(text) => {
                    setTelepon(text);
                    if (errors.telepon) setErrors({ ...errors, telepon: '' });
                  }}
                />
              </View>
              {errors.telepon ? <Text style={styles.errorText}>{errors.telepon}</Text> : null}
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.btnBatal} onPress={handleClose}>
              <Text style={styles.btnBatalText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnSimpan, isLoading && styles.btnSimpanDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.btnSimpanText}>{isLoading ? 'Menyimpan...' : 'Simpan'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
  handleContainer: { alignItems: 'center', paddingTop: 10, paddingBottom: 5 },
  dragHandle: { width: 40, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  subtitle: { fontSize: 13, color: '#888', marginTop: 2 },
  closeButton: { backgroundColor: '#f5f5f5', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  formContainer: { paddingHorizontal: 20, paddingTop: 20 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  asterisk: { color: '#1a73e8' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, paddingHorizontal: 12, height: 50, backgroundColor: '#fcfcfc' },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4, fontWeight: '500' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#333' },
  footer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 10 },
  btnBatal: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, marginRight: 10 },
  btnBatalText: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  btnSimpan: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a73e8', borderRadius: 10 },
  btnSimpanDisabled: { backgroundColor: '#8cb4f5' },
  btnSimpanText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});

export default AddCustomerModal;