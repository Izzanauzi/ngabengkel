import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { useAuth } from '../../../src/contexts/auth.context'
import { useGetAllKendaraan, useDeleteKendaraanMutation } from '../../../src/hooks/kendaraan.hooks'
import { useToast } from '../../../src/contexts/toast.context'
import RequireAuth from '../../../src/components/auth/requireAuth'
import ProfileCard from '../../../src/components/profile/ProfileCard'
import VehicleCard from '../../../src/components/profile/VehicleCard'
import MenuList from '../../../src/components/profile/MenuList'
import LogoutButton from '../../../src/components/profile/LogoutButton'
import { Kendaraan } from '../../../src/@types/kendaraan.types'

export default function ProfileScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { showSuccess } = useToast();
  const isLogin = !!token;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Kendaraan | null>(null);

  const { kendaraanList, isLoading } = useGetAllKendaraan();

  const { deleteKendaraanMutation } = useDeleteKendaraanMutation({
    successAction: () => {
      setShowDeleteModal(false);
      showSuccess("Kendaraan berhasil dihapus!");
    },
    onError: (message) => {
      setShowDeleteModal(false);
      Alert.alert("Gagal", message);
    },
  });

  const handlePressAdd = useCallback(() => {
    router.push("/(beranda)/kendaraan/create");
  }, [router]);

  return (
    <RequireAuth>
    <ScrollView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Profil Saya</Text>
        <Ionicons name="create-outline" size={22} color="#3B7BF6" />
      </View>

      {/* 2. Panggil Komponen ProfileCard dan lemparkan data user serta jumlah kendaraan */}
      <ProfileCard 
        isLogin={isLogin} 
        userData={user} 
        vehicleCount={kendaraanList?.length || 0} 
      />

      {/* ===== KONTEN SETELAH LOGIN ===== */}
      {isLogin && (
        <>
          {/* KENDARAAN HEADER */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kendaraan Saya</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => router.push('/(beranda)/kendaraan')}>
              <Text style={styles.link}>Lihat semua </Text>
              <Ionicons name="chevron-forward" size={14} color="#3B7BF6" />
            </TouchableOpacity>
          </View>

          {/* 3. LIST KENDARAAN - Menggunakan data dari backend dengan indikator loading */}
          {isLoading ? (
            <ActivityIndicator size="large" color="#3B7BF6" style={{ marginVertical: 20 }} />
          ) : (
            kendaraanList.map((vehicle) => (
              <VehicleCard
  key={vehicle.kendaraan_id}
  name={`${vehicle.merek} ${vehicle.model}`}
  year={vehicle.tahun.toString()}
  type={vehicle.warna ?? 'Standar'}
  plate={vehicle.nomor_polisi}
  onPressEdit={() =>
    router.push(
      `/(beranda)/kendaraan/${vehicle.kendaraan_id}/edit`
    )
  }
  onPressDelete={() => {
    setSelectedVehicle(vehicle)
    setShowDeleteModal(true)
  }}
/>
            ))
          )}

          {/* TOMBOL TAMBAH KENDARAAN */}
          <TouchableOpacity style={styles.addButton} onPress={handlePressAdd}>
            <Text style={styles.addText}>+ Tambah Kendaraan</Text>
          </TouchableOpacity>

          {/* Panggil Komponen Menu & Logout */}
          <MenuList />
          <LogoutButton />
        </>
      )}
<Modal
  visible={showDeleteModal}
  transparent
  animationType="fade"
  onRequestClose={() => setShowDeleteModal(false)}
>
  <View style={styles.overlay}>
    <View style={styles.modalBox}>
      <View style={styles.iconWrap}>
        <Ionicons name="trash-outline" size={32} color="#EF4444" />
      </View>

      <Text style={styles.modalTitle}>Hapus Kendaraan?</Text>

      <Text style={styles.modalMessage}>
        <Text style={{ fontWeight: '700' }}>
          {selectedVehicle?.merek} {selectedVehicle?.model}
        </Text>
        {" "}({selectedVehicle?.nomor_polisi}) akan dihapus permanen.
      </Text>

      <View style={styles.modalActions}>
        <TouchableOpacity
          style={styles.btnBatal}
          onPress={() => setShowDeleteModal(false)}
        >
          <Text style={styles.btnBatalText}>Batal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnHapus}
          onPress={() => {
            if (!selectedVehicle?.kendaraan_id) return
          
            deleteKendaraanMutation.mutate(
              selectedVehicle.kendaraan_id
            )
          }}
        >
          <Text style={styles.btnHapusText}>Ya, Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </ScrollView>
    </RequireAuth>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  link: {
    color: '#3B7BF6',
  },
  addButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#3B7BF6',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 16,
  },
  addText: {
    color: '#3B7BF6',
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  
  modalMessage: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    width: '100%',
  },
  
  btnBatal: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  
  btnBatalText: {
    color: '#555',
    fontWeight: '600',
  },
  
  btnHapus: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  
  btnHapusText: {
    color: '#fff',
    fontWeight: '700',
  },
})
