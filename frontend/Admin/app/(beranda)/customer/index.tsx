import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Komponen Modular
import DeleteModal from '../../../src/components/DeleteModal';
import CustomerCard from '../../../src/components/customer/CustomerCard';
import CustomerDetail from '../../../src/components/customer/CustomerDetail';

// Hooks & Types
import { useGetAllCustomer, useDeleteCustomer } from '../../../src/hooks/customer.hooks';
import { Customer } from '../../../src/@types/customer';

export default function CustomerScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // FETCH DATA API
  // Menggunakan searchQuery langsung ke backend (sesuai docs API: /customers?q=...)
  const { data, isLoading, isError } = useGetAllCustomer(searchQuery);
  const customerList = data || [];
  
  const deleteMutation = useDeleteCustomer();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null); 
  const [selectedForDelete, setSelectedForDelete] = useState<Customer | null>(null);

  if (selectedCustomer) {
    // Catatan: Anda perlu update CustomerDetail.tsx nanti agar menerima data item.nama, dll
    return <CustomerDetail customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />;
  }

  const confirmDelete = () => {
    if (selectedForDelete) {
      deleteMutation.mutate(selectedForDelete.user_id);
    }
    setSelectedForDelete(null);
  };

  const handleAddCustomer = () => {
    Alert.alert(
      "Informasi", 
      "Penambahan customer baru dilakukan saat registrasi di Aplikasi Customer atau saat membuat Work Order Walk-in."
    );
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.topStats}>
        <View style={styles.topStatBox}>
          <Text style={styles.topStatNumber}>{customerList.length}</Text>
          <Text style={styles.topStatLabel}>Total Customer</Text>
        </View>
        <View style={styles.topStatBox}>
          <Text style={styles.topStatNumber}>
            {customerList.reduce((sum, c) => sum + (c.jumlah_kendaraan || 0), 0)}
          </Text>
          <Text style={styles.topStatLabel}>Kendaraan</Text>
        </View>
        <View style={styles.topStatBox}>
          <Text style={styles.topStatNumber}>
            {customerList.reduce((sum, c) => sum + (c.jumlah_wo || 0), 0)}
          </Text>
          <Text style={styles.topStatLabel}>WO Total</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Cari nama atau nomor..." 
              value={searchQuery}
              onChangeText={setSearchQuery} // Saat diketik, React Query akan otomatis nge-fetch ulang ke API!
            />
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 50 }} />
        ) : isError ? (
          <Text style={{ textAlign: 'center', marginTop: 50, color: 'red' }}>Gagal memuat data customer.</Text>
        ) : (
          <FlatList 
            data={customerList} 
            renderItem={({ item }) => (
              <CustomerCard 
                item={item} 
                onView={(data: Customer) => setSelectedCustomer(data)} 
                onEdit={(data: Customer) => console.log('Edit', data)} 
                onDelete={(data: Customer) => setSelectedForDelete(data)} 
              />
            )} 
            keyExtractor={item => item.user_id} 
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30, color: '#999' }}>Tidak ada data customer</Text>}
          />
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={handleAddCustomer}>
        <Ionicons name="information-circle" size={24} color="#fff" />
        <Text style={styles.fabText}>Info Customer</Text>
      </TouchableOpacity>

      <DeleteModal 
         visible={!!selectedForDelete} 
         onClose={() => setSelectedForDelete(null)} 
         onConfirm={confirmDelete} 
         title="Hapus Customer?" 
         itemName={selectedForDelete?.nama || ''} 
      />
    </View>
  );
}

// ... COPY STYLES DARI CUSTOMER INDEX LAMA KE SINI ...
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