import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dummyAccounts } from '../../../src/utils/dummydata';

export default function ProfileScreen() {
  const renderItem = ({ item }: any) => (
    <View style={styles.accountCard}>
      <View style={styles.accountIcon}>
        <Text style={styles.accountIconText}>{item.title}</Text>
      </View>
      <View style={styles.placeholderLines}>
        <View style={styles.lineLong} />
        <View style={styles.lineShort} />
      </View>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>Aktif</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      
      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.profileIconContainer}>
            <Ionicons name="person-outline" size={32} color="#8b0000" />
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileTitle}>Akun</Text>
            <Text style={styles.profileDesc}>Kelola profil admin, password, dan pengaturan aplikasi.</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput style={styles.searchInput} placeholder="Cari akun..." />
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Tambah Akun</Text>
        </TouchableOpacity>

        <FlatList
          data={dummyAccounts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<Text style={styles.footerText}>Halaman Akun — dalam pengembangan</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  content: { 
    padding: 15, 
    paddingTop: 20, // PERBAIKAN: Ditambahkan agar konten memiliki jarak dari atas
    flex: 1 
  },
  profileCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, alignItems: 'center' },
  profileIconContainer: { backgroundColor: '#fde8e8', padding: 15, borderRadius: 10, marginRight: 15 },
  profileText: { flex: 1 },
  profileTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  profileDesc: { fontSize: 13, color: '#666', marginTop: 5 },
  searchContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 15, alignItems: 'center', marginBottom: 15, height: 45 },
  searchInput: { flex: 1, marginLeft: 10 },
  addButton: { backgroundColor: '#8b0000', flexDirection: 'row', borderRadius: 8, paddingVertical: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 5 },
  accountCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 10, alignItems: 'center' },
  accountIcon: { backgroundColor: '#fde8e8', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  accountIconText: { color: '#8b0000', fontWeight: 'bold' },
  placeholderLines: { flex: 1 },
  lineLong: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, width: '80%', marginBottom: 8 },
  lineShort: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, width: '50%' },
  statusBadge: { backgroundColor: '#fde8e8', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { color: '#8b0000', fontSize: 12 },
  footerText: { textAlign: 'center', color: '#aaa', marginTop: 20, fontSize: 12 },
});