import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Komponen Modular
import AddMekanikModal from '../../../src/components/AddMekanikModal';
import DeleteModal from '../../../src/components/DeleteModal';
import MekanikCard from '../../../src/components/mekanik/MekanikCard';

// Hook API & Types
import { useGetAllMekanik, useDeleteMekanik } from '../../../src/hooks/mekanik.hooks';
import { Mekanik } from '../../../src/@types/mekanik';

export default function MekanikScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // 1. Fetch Data dari API menggunakan React Query
  const { data, isLoading, isError } = useGetAllMekanik();
  const mechanicsList = data || []; // Pastikan berbentuk array meskipun kosong
  
  // 2. Setup Mutasi untuk Hapus
  const deleteMutation = useDeleteMekanik();

  // States Modal
  const [isFormModalVisible, setFormModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMekanik, setSelectedMekanik] = useState<Mekanik | null>(null);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  // 3. Filter berdasarkan 'nama' atau 'keahlian' (sesuai struktur API)
  const filteredMechanics = mechanicsList.filter((mekanik: Mekanik) => 
    (mekanik.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (mekanik.keahlian || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClick = () => { setIsEditMode(false); setSelectedMekanik(null); setFormModalVisible(true); };
  const handleEditClick = (mekanik: Mekanik) => { setIsEditMode(true); setSelectedMekanik(mekanik); setFormModalVisible(true); };
  const handleDeleteClick = (mekanik: Mekanik) => { setSelectedMekanik(mekanik); setDeleteModalVisible(true); };

  // 4. Eksekusi Hapus ke Database
  const confirmDelete = () => {
    if (selectedMekanik) {
      deleteMutation.mutate(selectedMekanik.mekanik_id);
    }
    setDeleteModalVisible(false);
  };

  return (
    <View style={styles.container}>
      
      {/* Top Stats */}
      <View style={styles.topStats}>
        <View style={styles.topStatBox}>
          <Text style={styles.topStatNumber}>{mechanicsList.length}</Text>
          <Text style={styles.topStatLabel}>Total Mekanik</Text>
        </View>
        <View style={styles.topStatBox}>
          {/* Hitung yang 'tersedia' sesuai enum API */}
          <Text style={styles.topStatNumber}>{mechanicsList.filter(m => m.status === 'tersedia').length}</Text>
          <Text style={styles.topStatLabel}>Tersedia</Text>
        </View>
        <View style={styles.topStatBox}>
          {/* Hitung yang 'tidak_tersedia' sesuai enum API */}
          <Text style={styles.topStatNumber}>{mechanicsList.filter(m => m.status === 'tidak_tersedia').length}</Text>
          <Text style={styles.topStatLabel}>Tidak Tersedia</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput style={styles.searchInput} placeholder="Cari mekanik..." value={searchQuery} onChangeText={setSearchQuery} />
            {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={18} color="#ccc" /></TouchableOpacity>}
          </View>
          <TouchableOpacity style={styles.addBtnSmall} onPress={handleAddClick}>
            <Ionicons name="add" size={20} color="#fff" /><Text style={styles.addBtnSmallText}>Tambah</Text>
          </TouchableOpacity>
        </View>

        {/* 5. Tampilkan Loading, Error, atau List Data */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 50 }} />
        ) : isError ? (
          <Text style={{ textAlign: 'center', marginTop: 50, color: 'red' }}>Gagal memuat data mekanik.</Text>
        ) : (
          <FlatList 
            data={filteredMechanics} 
            renderItem={({ item }) => <MekanikCard item={item} onEdit={handleEditClick} onDelete={handleDeleteClick} />} 
            keyExtractor={item => item.mekanik_id} 
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30, color: '#999' }}>Tidak ada data mekanik</Text>}
          />
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={handleAddClick}>
        <Ionicons name="add" size={24} color="#fff" /><Text style={styles.fabText}>Tambah Mekanik</Text>
      </TouchableOpacity>

      <AddMekanikModal visible={isFormModalVisible} onClose={() => setFormModalVisible(false)} isEdit={isEditMode} mekanikData={selectedMekanik} />
      <DeleteModal visible={isDeleteModalVisible} onClose={() => setDeleteModalVisible(false)} onConfirm={confirmDelete} title="Hapus Mekanik?" itemName={selectedMekanik?.nama || ''} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  topStats: { 
    flexDirection: 'row', 
    backgroundColor: '#1a73e8', 
    paddingBottom: 20, 
    paddingTop: 15, 
    paddingHorizontal: 10 
  },
  topStatBox: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 10, paddingVertical: 12, marginHorizontal: 5 },
  topStatNumber: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  topStatLabel: { color: '#bbdefb', fontSize: 12 },
  content: { padding: 15, flex: 1, marginTop: -15, backgroundColor: '#f5f7fa', borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  searchRow: { flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
  searchContainer: { flex: 1, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 15, alignItems: 'center', height: 45, marginRight: 10 },
  searchInput: { flex: 1, marginLeft: 10 },
  addBtnSmall: { backgroundColor: '#1a73e8', flexDirection: 'row', borderRadius: 8, paddingHorizontal: 15, height: 45, alignItems: 'center' },
  addBtnSmallText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#1a73e8', flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30, elevation: 5 },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 5 },
});