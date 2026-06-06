import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Customer } from '../../@types/customer';

interface CustomerCardProps {
  item: Customer;
  onView: (item: Customer) => void;
  onEdit: (item: Customer) => void;
  onDelete: (item: Customer) => void;
}

export default function CustomerCard({ item, onView, onEdit, onDelete }: CustomerCardProps) {
  // Fungsi otomatis untuk membuat inisial nama (Misal: "Fadly Ahmad" -> "FA")
  const getInitials = (name: string) => {
    if (!name) return 'C';
    const names = name.trim().split(' ');
    if (names.length > 1) return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.nama)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.nama}</Text>
          <View style={styles.row}>
            <Ionicons name="call-outline" size={14} color="#666" />
            <Text style={styles.phone}>{item.telepon}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="car-outline" size={16} color="#1a73e8" />
              {/* Menggunakan fallback 0 jika data dari backend belum tersedia */}
              <Text style={styles.statTextBlue}>{item.jumlah_kendaraan || 0} kendaraan</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statTextGrey}>{item.jumlah_wo || 0} WO selesai</Text>
            </View>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => onView(item)}>
            <Ionicons name="eye-outline" size={20} color="#1a73e8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(item)}>
            <Ionicons name="pencil" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtnRed} onPress={() => onDelete(item)}>
            <Ionicons name="trash-outline" size={20} color="#e53935" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Bagian tag plat nomor disembunyikan sementara 
          karena endpoint /customers dari backend belum menyertakan list plat nomor. */}
      {/* <View style={styles.vehicleTags}>
        <View style={styles.tag}>
          <Text style={styles.plateBadge}>D 1234 ABC</Text>
          <Text style={styles.carModel}>Contoh Kendaraan</Text>
        </View>
      </View> 
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15 },
  cardHeader: { flexDirection: 'row' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1a73e8', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 4 },
  phone: { color: '#666', fontSize: 13, marginLeft: 5 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
  statTextBlue: { color: '#1a73e8', fontSize: 12, marginLeft: 4 },
  statTextGrey: { color: '#888', fontSize: 12 },
  actionButtons: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBtn: { backgroundColor: '#f0f4f8', padding: 8, borderRadius: 20, marginLeft: 5 },
  iconBtnRed: { backgroundColor: '#fde8e8', padding: 8, borderRadius: 20, marginLeft: 5 },
  vehicleTags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 15 },
  tag: { flexDirection: 'row', alignItems: 'center', marginRight: 15, marginBottom: 5 },
  plateBadge: { backgroundColor: '#222', color: '#fff', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 5 },
  carModel: { fontSize: 12, color: '#666' },
});