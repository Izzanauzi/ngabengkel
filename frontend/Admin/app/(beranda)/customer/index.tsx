import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DeleteModal from '../../../src/components/DeleteModal';
import CustomerCard from '../../../src/components/customer/CustomerCard';
import CustomerDetail from '../../../src/components/customer/CustomerDetail';
import AddCustomerModal from '../../../src/components/AddCustomerModal';
import { useGetAllCustomers, useCreateCustomerMutation, useUpdateCustomerMutation, useDeleteCustomerMutation } from '../../../src/hooks/customer.hooks';
import { useGetAllKendaraan, useGetAllWorkOrders } from '../../../src/hooks/work_order.hooks';
import type { Customer } from '../../../src/@types/customer.types';

export default function CustomerScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // State untuk melihat detail
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  // State untuk menghapus
  const [selectedForDelete, setSelectedForDelete] = useState<any>(null);
  
  // State untuk form modal (Tambah/Edit)
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<any>(null);

  const { customers, isLoading: loadingCust } = useGetAllCustomers();
  const { kendaraanList, isLoading: loadingKend } = useGetAllKendaraan();
  const { workOrders, isLoading: loadingWO } = useGetAllWorkOrders();

  // Status loading gabungan
  const isDataLoading = loadingCust || loadingKend || loadingWO;
  
  // Hooks mutasi
  const { createMutation } = useCreateCustomerMutation({ 
    onSuccess: () => {
      setAddModalVisible(false);
      Alert.alert("Berhasil", "Customer baru berhasil ditambahkan", [{ text: "OK" }]);
    } 
  });

  const { updateMutation } = useUpdateCustomerMutation({ 
    onSuccess: () => {
      setAddModalVisible(false);
      Alert.alert("Berhasil", "Data customer diperbarui", [{ text: "OK" }]);
    } 
  });

  const { deleteMutation } = useDeleteCustomerMutation({
    onSuccess: () => {
      setSelectedForDelete(null); 
      Alert.alert("Berhasil", "Customer berhasil dihapus", [{ text: "OK" }]);
    },
    onError: (msg) => {
      setSelectedForDelete(null); 
      Alert.alert("Gagal Menghapus", msg, [{ text: "Mengerti" }]);
    }
  });

  // Mapping data customer dan gabungkan dengan data kendaraan & WO yang sesuai
  const cardItems = customers.map(c => {
    const custVehicles = kendaraanList?.filter((k: any) => k.user_id === c.user_id) || [];
    const custWOs = workOrders?.filter((wo: any) => wo.user_id === c.user_id || wo.user?.user_id === c.user_id) || [];
    const woSelesai = custWOs.filter((wo: any) => wo.status === 'selesai' || wo.status === 'lunas').length;

    return {
      id: c.user_id,
      user_id: c.user_id,
      initials: c.nama.split(' ').filter(Boolean).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2),
      name: c.nama,
      phone: c.telepon ?? '-',
      email: c.email,
      vehicles: custVehicles.length,
      wo: woSelesai,
      plate1: custVehicles[0]?.nomor_polisi ?? '',
      car1: custVehicles[0] ? `${custVehicles[0].merek} ${custVehicles[0].model}` : '',
      plate2: custVehicles[1]?.nomor_polisi,
      car2: custVehicles[1] ? `${custVehicles[1].merek} ${custVehicles[1].model}` : undefined,
    };
  });

  const filteredItems = cardItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.phone.includes(searchQuery)
  );

  // --- Handlers ---
  const handleAddClick = () => {
    setIsEditMode(false);
    setCustomerToEdit(null);
    setAddModalVisible(true);
  };

  const handleEditClick = (data: any) => {
    setIsEditMode(true);
    setCustomerToEdit(data);
    setAddModalVisible(true);
  };

  const handleSaveModal = (formData: any) => {
    if (isEditMode && customerToEdit) {
      updateMutation.mutate({ id: customerToEdit.user_id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

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
            {kendaraanList?.length || 0}
          </Text>
          <Text style={styles.topStatLabel}>Kendaraan</Text>
        </View>
        <View style={styles.topStatBox}>
          <Text style={styles.topStatNumber}>
            {workOrders?.length || 0}
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
          <TouchableOpacity style={styles.addBtnSmall} onPress={handleAddClick}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnSmallText}>Tambah</Text>
          </TouchableOpacity>
        </View>

        {isDataLoading ? (
          <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={({ item }) => (
              <CustomerCard
                item={item}
                onView={(data: any) => setSelectedCustomer(data)}
                onEdit={(data: any) => handleEditClick(data)}
                onDelete={(data: any) => setSelectedForDelete(data)}
              />
            )}
            keyExtractor={item => item.user_id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <AddCustomerModal
        visible={isAddModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={handleSaveModal}
        isLoading={createMutation.isPending || updateMutation.isPending}
        isEdit={isEditMode}
        customerData={customerToEdit}
      />

      <DeleteModal
        visible={!!selectedForDelete}
        onClose={() => setSelectedForDelete(null)}
        onConfirm={() => {
          if (selectedForDelete) {
            deleteMutation.mutate(selectedForDelete.user_id);
          }
        }} 
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
});