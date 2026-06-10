import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DeleteModal from '../../../src/components/DeleteModal';
import CustomerCard from '../../../src/components/customer/CustomerCard';
import CustomerDetail from '../../../src/components/customer/CustomerDetail';
import AddCustomerModal from '../../../src/components/AddCustomerModal';
import { useGetAllCustomers, useCreateCustomerMutation } from '../../../src/hooks/customer.hooks';
import type { Customer } from '../../../src/@types/customer.types';

const toCardFormat = (c: Customer) => ({
  id: c.user_id,
  user_id: c.user_id,
  initials: c.nama.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2),
  name: c.nama,
  phone: c.telepon ?? '-',
  email: c.email,
  vehicles: c.kendaraan?.length ?? 0,
  wo: c.jumlah_wo ?? 0,
  plate1: c.kendaraan?.[0]?.nomor_polisi ?? '',
  car1: c.kendaraan?.[0] ? `${c.kendaraan[0].merek} ${c.kendaraan[0].model}` : '',
  plate2: c.kendaraan?.[1]?.nomor_polisi,
  car2: c.kendaraan?.[1] ? `${c.kendaraan[1].merek} ${c.kendaraan[1].model}` : undefined,
});

export default function CustomerScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<any>(null);
  const [isAddModalVisible, setAddModalVisible] = useState(false);

  const { customers, isLoading } = useGetAllCustomers();
  const { createMutation } = useCreateCustomerMutation({ onSuccess: () => setAddModalVisible(false) });

  const cardItems = customers.map(toCardFormat);
  const filteredItems = cardItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.phone.includes(searchQuery)
  );

  if (selectedCustomer) {
    return (
      <CustomerDetail
        customer={selectedCustomer}
        onBack={() => setSelectedCustomer(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topStats}>
        <View style={styles.topStatBox}>
          <Text style={styles.topStatNumber}>{customers.length}</Text>
          <Text style={styles.topStatLabel}>Customer</Text>
        </View>
        <View style={styles.topStatBox}>
          <Text style={styles.topStatNumber}>
            {customers.reduce((sum, c) => sum + (c.kendaraan?.length ?? 0), 0)}
          </Text>
          <Text style={styles.topStatLabel}>Kendaraan</Text>
        </View>
        <View style={styles.topStatBox}>
          <Text style={styles.topStatNumber}>
            {customers.reduce((sum, c) => sum + (c.jumlah_wo ?? 0), 0)}
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
              placeholder="Cari nama atau nomor telepon..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#ccc" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.addBtnSmall} onPress={() => setAddModalVisible(true)}>
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
              <CustomerCard
                item={item}
                onView={(data: any) => setSelectedCustomer(data)}
                onEdit={(data: any) => console.log('Edit:', data)}
                onDelete={(data: any) => setSelectedForDelete(data)}
              />
            )}
            keyExtractor={item => item.user_id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.fabText}>Tambah Customer</Text>
      </TouchableOpacity>

      <AddCustomerModal
        visible={isAddModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      <DeleteModal
        visible={!!selectedForDelete}
        onClose={() => setSelectedForDelete(null)}
        onConfirm={() => setSelectedForDelete(null)}
        title="Hapus Customer?"
        itemName={selectedForDelete?.name ?? ''}
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
