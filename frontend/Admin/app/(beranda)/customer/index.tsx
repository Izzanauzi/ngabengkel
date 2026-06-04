import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { customers } from '../../../src/utils/dummydata';

// Menggunakan Komponen Modular
import DeleteModal from '../../../src/components/DeleteModal';
import CustomerCard from '../../../src/components/customer/CustomerCard';
import CustomerDetail from '../../../src/components/customer/CustomerDetail';

export default function CustomerScreen() {
  const [customerList, setCustomerList] = useState(customers);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null); // State detail view
  const [selectedForDelete, setSelectedForDelete] = useState<any>(null); // State modal hapus

  // Render Halaman Detail jika ada customer yang di-klik
  if (selectedCustomer) {
    return (
      <CustomerDetail 
        customer={selectedCustomer} 
        onBack={() => setSelectedCustomer(null)} 
      />
    );
  }

  // Fungsi Konfirmasi Hapus 
  const confirmDelete = () => {
    if (selectedForDelete) {
      setCustomerList(customerList.filter(item => item.id !== selectedForDelete.id));
    }
    setSelectedForDelete(null);
  };

  return (
    <View style={styles.container}>
      
      {/* PERBAIKAN: Komponen <Header /> Dihapus dari sini
         Maka kita beri sedikit paddingTop di styles.topStats agar tidak menabrak
      */}
      <View style={styles.topStats}>
        <View style={styles.topStatBox}>
          <Text style={styles.topStatNumber}>{customerList.length}</Text>
          <Text style={styles.topStatLabel}>Customer</Text>
        </View>
        <View style={styles.topStatBox}>
          <Text style={styles.topStatNumber}>
            {customerList.reduce((sum, customer) => sum + customer.vehicles, 0)}
          </Text>
          <Text style={styles.topStatLabel}>Kendaraan</Text>
        </View>
        <View style={styles.topStatBox}>
          <Text style={styles.topStatNumber}>
            {customerList.reduce((sum, customer) => sum + customer.wo, 0)}
          </Text>
          <Text style={styles.topStatLabel}>WO Total</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput style={styles.searchInput} placeholder="Cari nama atau nomor telepon..." />
          </View>
          <TouchableOpacity style={styles.addBtnSmall}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnSmallText}>Tambah</Text>
          </TouchableOpacity>
        </View>

        <FlatList 
          data={customerList} 
          renderItem={({ item }) => (
            <CustomerCard 
              item={item}
              onView={(data: any) => setSelectedCustomer(data)}
              onEdit={(data: any) => console.log('Klik Edit:', data)}
              onDelete={(data: any) => setSelectedForDelete(data)}
            />
          )}
          keyExtractor={item => item.id} 
          showsVerticalScrollIndicator={false} 
        />
      </View>

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.fabText}>Tambah Customer</Text>
      </TouchableOpacity>

      <DeleteModal 
         visible={!!selectedForDelete} 
         onClose={() => setSelectedForDelete(null)} 
         onConfirm={confirmDelete} 
         title="Hapus Customer?" 
         itemName={selectedForDelete?.name} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  topStats: { 
    flexDirection: 'row', 
    backgroundColor: '#1a73e8', 
    paddingBottom: 20, 
    paddingTop: 15, // PERBAIKAN: Memberi jarak pengganti Header
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