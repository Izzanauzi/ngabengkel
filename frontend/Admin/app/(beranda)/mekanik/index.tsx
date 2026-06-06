import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AddMekanikModal from '../../../src/components/AddMekanikModal';
import DeleteModal from '../../../src/components/DeleteModal';
import MekanikCard from '../../../src/components/mekanik/MekanikCard';
import {
  useGetAllMekanik,
  useCreateMekanikMutation,
  useUpdateMekanikMutation,
  useDeleteMekanikMutation,
} from '../../../src/hooks/mekanik.hooks';
import type { Mekanik } from '../../../src/@types/mekanik.types';
import { useToast } from '../../../src/contexts/toast.context';

const toCardItem = (m: Mekanik) => ({
  id: m.mekanik_id,
  initials: m.nama.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2),
  name: m.nama,
  status: m.status,
  spec: m.keahlian,
  phone: m.telepon,
  rating: '-',
  wo: 0,
});

export default function MekanikScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormModalVisible, setFormModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMekanik, setSelectedMekanik] = useState<Mekanik | null>(null);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  const { showSuccess } = useToast();
  const { mekaniks, isLoading } = useGetAllMekanik();
  const { createMutation } = useCreateMekanikMutation({
    successAction: () => { showSuccess("Mekanik berhasil ditambahkan"); setFormModalVisible(false); },
  });
  const { updateMutation } = useUpdateMekanikMutation({
    successAction: () => { showSuccess("Mekanik berhasil diperbarui"); setFormModalVisible(false); },
  });
  const { deleteMutation } = useDeleteMekanikMutation({
    successAction: () => { showSuccess("Mekanik berhasil dihapus"); setDeleteModalVisible(false); },
  });

  const cardItems = mekaniks.map(toCardItem);
  const filteredItems = cardItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.spec.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClick = () => { setIsEditMode(false); setSelectedMekanik(null); setFormModalVisible(true); };

  const handleEditClick = (cardItem: any) => {
    const mekanik = mekaniks.find(m => m.mekanik_id === cardItem.id) ?? null;
    setIsEditMode(true);
    setSelectedMekanik(mekanik);
    setFormModalVisible(true);
  };

  const handleDeleteClick = (cardItem: any) => {
    const mekanik = mekaniks.find(m => m.mekanik_id === cardItem.id) ?? null;
    setSelectedMekanik(mekanik);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (selectedMekanik) deleteMutation.mutate(selectedMekanik.mekanik_id);
  };

  const handleSave = (data: { nama: string; telepon: string; keahlian: string; status: string }) => {
    if (isEditMode && selectedMekanik) {
      updateMutation.mutate({ id: selectedMekanik.mekanik_id, payload: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <View style={styles.container}>
      <View style={styles.topStats}>
        <View style={styles.topStatBox}>
          <Text style={styles.topStatNumber}>{mekaniks.length}</Text>
          <Text style={styles.topStatLabel}>Total Mekanik</Text>
        </View>
        <View style={styles.topStatBox}>
          <Text style={styles.topStatNumber}>{mekaniks.filter(m => m.status === 'tersedia').length}</Text>
          <Text style={styles.topStatLabel}>Tersedia</Text>
        </View>
        <View style={styles.topStatBox}>
          <Text style={styles.topStatNumber}>{mekaniks.filter(m => m.status !== 'tersedia').length}</Text>
          <Text style={styles.topStatLabel}>Tidak Tersedia</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput style={styles.searchInput} placeholder="Cari mekanik..." value={searchQuery} onChangeText={setSearchQuery} />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#ccc" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.addBtnSmall} onPress={handleAddClick}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnSmallText}>Tambah</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={({ item }) => (
              <MekanikCard item={item} onEdit={handleEditClick} onDelete={handleDeleteClick} />
            )}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={handleAddClick}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.fabText}>Tambah Mekanik</Text>
      </TouchableOpacity>

      <AddMekanikModal
        visible={isFormModalVisible}
        onClose={() => setFormModalVisible(false)}
        isEdit={isEditMode}
        mekanikData={selectedMekanik ? {
          name: selectedMekanik.nama,
          phone: selectedMekanik.telepon,
          spec: selectedMekanik.keahlian,
          status: selectedMekanik.status,
        } : null}
        onSave={handleSave}
        isLoading={isSaving}
      />
      <DeleteModal
        visible={isDeleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={confirmDelete}
        title="Hapus Mekanik?"
        itemName={selectedMekanik?.nama ?? ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  topStats: { flexDirection: 'row', backgroundColor: '#1a73e8', paddingBottom: 20, paddingTop: 15, paddingHorizontal: 10 },
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
