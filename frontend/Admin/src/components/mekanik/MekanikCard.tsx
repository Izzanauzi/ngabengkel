import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MekanikCard({ item, onEdit, onDelete }: any) {
  return (
    <View style={styles.card}>
      {item.status === 'Tersedia' && <View style={styles.indicatorTersedia} />}
      <View style={styles.avatar}><Text style={styles.avatarText}>{item.initials}</Text></View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: item.status === 'Tersedia' ? '#4caf50' : '#9e9e9e' }]} />
            <Text style={[styles.statusText, { color: item.status === 'Tersedia' ? '#4caf50' : '#9e9e9e' }]}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="build-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{item.spec}</Text>
        </View>
        <View style={styles.bottomInfoRow}>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{item.phone}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#ffb300" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.woText}> •   {item.wo} WO</Text> 
          </View>
        </View>
      </View>
      <View style={styles.actionColumn}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(item)}><Ionicons name="pencil" size={18} color="#1a73e8" /></TouchableOpacity>
        <TouchableOpacity style={styles.iconBtnRed} onPress={() => onDelete(item)}><Ionicons name="trash-outline" size={18} color="#e53935" /></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, flexDirection: 'row', position: 'relative', overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  indicatorTersedia: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: '#00b050' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1a73e8', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  info: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333', marginRight: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f7fa', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  detailText: { color: '#666', fontSize: 13, marginLeft: 5 },
  bottomInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { color: '#333', fontWeight: 'bold', fontSize: 13, marginLeft: 4 },
  woText: { color: '#999', fontSize: 12, marginLeft: 8 }, 
  actionColumn: { justifyContent: 'space-between', paddingLeft: 10 },
  iconBtn: { backgroundColor: '#f0f4f8', padding: 8, borderRadius: 20, marginBottom: 5 },
  iconBtnRed: { backgroundColor: '#fde8e8', padding: 8, borderRadius: 20 },
});