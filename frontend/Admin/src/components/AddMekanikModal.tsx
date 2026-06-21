import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Modal, TouchableOpacity, 
  TextInput, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddMekanikModalProps {
  visible: boolean;
  onClose: () => void;
  isEdit?: boolean;
  mekanikData?: any;
  onSave?: (data: { nama: string; telepon: string; keahlian: string; status: string }) => void;
  isLoading?: boolean;
}

const specialties = [
  'Mesin & Transmisi',
  'Kelistrikan & AC',
  'Body & Cat',
  'Suspensi & Rem',
  'Kaki-Kaki & Ban',
  'Umum / Servis Ringan'
];

const AddMekanikModal: React.FC<AddMekanikModalProps> = ({ visible, onClose, isEdit = false, mekanikData = null, onSave, isLoading }) => {
  const [nama, setNama] = useState('');
  const [telepon, setTelepon] = useState('');
  const [spesialisasi, setSpesialisasi] = useState('');
  const [status, setStatus] = useState('tersedia');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [errors, setErrors] = useState({ nama: '', telepon: '', spesialisasi: '' });

  useEffect(() => {
    if (visible && isEdit && mekanikData) {
      setNama(mekanikData.name || '');
      setTelepon(mekanikData.phone || '');
      setSpesialisasi(mekanikData.spec || '');
      setStatus(mekanikData.status || 'tersedia');
      setErrors({ nama: '', telepon: '', spesialisasi: '' }); 
    } else if (visible && !isEdit) {
      setNama('');
      setTelepon('');
      setSpesialisasi('');
      setStatus('tersedia');
      setErrors({ nama: '', telepon: '', spesialisasi: '' }); 
    }
  }, [visible, isEdit, mekanikData]);

  const handleSave = () => {
    let isValid = true;
    const newErrors = { nama: '', telepon: '', spesialisasi: '' };

    if (!nama.trim()) {
      newErrors.nama = 'Nama mekanik wajib diisi';
      isValid = false;
    }
    if (!telepon.trim()) {
      newErrors.telepon = 'Nomor telepon wajib diisi';
      isValid = false;
    }
    if (!spesialisasi) {
      newErrors.spesialisasi = 'Spesialisasi wajib dipilih';
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) return;

    onSave?.({ nama: nama.trim(), telepon: telepon.trim(), keahlian: spesialisasi, status });
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
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
              <Text style={styles.title}>{isEdit ? 'Edit Mekanik' : 'Tambah Mekanik'}</Text>
              <Text style={styles.subtitle}>{isEdit ? 'Perbarui data mekanik' : 'Isi data mekanik baru'}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color="#555" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Keahlian / Spesialisasi <Text style={styles.asterisk}>*</Text></Text>
              <TouchableOpacity 
                style={[
                  styles.inputWrapper, 
                  dropdownVisible && styles.inputWrapperActive,
                  errors.spesialisasi ? styles.inputError : null
                ]} 
                onPress={() => setDropdownVisible(!dropdownVisible)}
                activeOpacity={0.7}
              >
                <Ionicons name="build-outline" size={20} color={errors.spesialisasi ? "#EF4444" : "#999"} style={styles.inputIcon} />
                <Text style={[styles.inputText, !spesialisasi && styles.placeholderText]}>
                  {spesialisasi || 'Pilih spesialisasi'}
                </Text>
                <Ionicons name={dropdownVisible ? "chevron-up" : "chevron-down"} size={20} color="#999" />
              </TouchableOpacity>
              {errors.spesialisasi ? <Text style={styles.errorText}>{errors.spesialisasi}</Text> : null}
              
              {dropdownVisible && (
                <View style={styles.dropdownContainer}>
                  {specialties.map((item, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[styles.dropdownItem, index === specialties.length - 1 && { borderBottomWidth: 0 }]}
                      onPress={() => {
                        setSpesialisasi(item);
                        setDropdownVisible(false);
                        if (errors.spesialisasi) setErrors({ ...errors, spesialisasi: '' });
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status Ketersediaan</Text>
              <View style={styles.statusRow}>
                <TouchableOpacity
                  style={[styles.statusBtn, status === 'tersedia' && styles.statusBtnActiveTersedia]}
                  onPress={() => setStatus('tersedia')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color={status === 'tersedia' ? "#fff" : "#999"} />
                  <Text style={[styles.statusBtnText, status === 'tersedia' && styles.statusBtnTextActive]}>Tersedia</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statusBtn, status === 'sibuk' && styles.statusBtnActiveTidakTersedia]}
                  onPress={() => setStatus('sibuk')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-circle-outline" size={20} color={status === 'sibuk' ? "#555" : "#999"} />
                  <Text style={[styles.statusBtnText, status === 'sibuk' && styles.statusBtnTextActiveDark]}>Tidak Tersedia</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.btnBatal} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.btnBatalText}>Batal</Text>
            </TouchableOpacity>
            
            {/* Tombol Simpan sekarang selalu menyala biru, hanya pudar saat loading (sedang simpan data) */}
            <TouchableOpacity 
              style={[styles.btnSimpan, isLoading && styles.btnSimpanDisabled]} 
              onPress={handleSave} 
              disabled={isLoading}
              activeOpacity={0.8}
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
  bottomSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%', paddingBottom: 20 },
  handleContainer: { alignItems: 'center', paddingTop: 10, paddingBottom: 5 },
  dragHandle: { width: 40, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  subtitle: { fontSize: 13, color: '#888', marginTop: 2 },
  closeButton: { backgroundColor: '#f5f5f5', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  formContainer: { paddingHorizontal: 20, paddingTop: 15 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  asterisk: { color: '#1a73e8' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, paddingHorizontal: 12, height: 50, backgroundColor: '#fcfcfc' },
  inputWrapperActive: { borderColor: '#1a73e8', backgroundColor: '#fff' },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' }, 
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4, fontWeight: '500' }, 
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#333' },
  inputText: { flex: 1, fontSize: 15, color: '#333' },
  placeholderText: { color: '#999' },
  dropdownContainer: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, marginTop: -5, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTopWidth: 0, backgroundColor: '#fff', overflow: 'hidden' },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dropdownItemText: { fontSize: 15, color: '#333' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statusBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e0e0e0', backgroundColor: '#f9f9f9', borderRadius: 10, height: 50, marginHorizontal: 4 },
  statusBtnActiveTersedia: { backgroundColor: '#1ea446', borderColor: '#1ea446' },
  statusBtnActiveTidakTersedia: { backgroundColor: '#f0f0f0', borderColor: '#ccc' },
  statusBtnText: { marginLeft: 8, fontSize: 14, fontWeight: '600', color: '#888' },
  statusBtnTextActive: { color: '#fff' },
  statusBtnTextActiveDark: { color: '#555' },
  footer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 10 },
  btnBatal: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, marginRight: 10 },
  btnBatalText: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  btnSimpan: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a73e8', borderRadius: 10 }, 
  btnSimpanDisabled: { backgroundColor: '#8cb4f5' },
  btnSimpanText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});

export default AddMekanikModal;