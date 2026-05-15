import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback } from 'react'

// Import Auth Context & Hooks
import { useAuth } from '../../../src/contexts/auth.context' 
import { useGetAllKendaraan } from '../../../src/hooks/kendaraan.hooks'


// Import Komponen Modular
import ProfileCard from '../../../src/components/profile/ProfileCard'
import VehicleCard from '../../../src/components/profile/VehicleCard'
import MenuList from '../../../src/components/profile/MenuList'
import LogoutButton from '../../../src/components/profile/LogoutButton'
import { Kendaraan } from '../../../src/@types/kendaraan.types'

export default function ProfileScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const isLogin = !!token;

  // 1. Memanggil hook kendaraan untuk mengambil data asli dari backend
  const { kendaraanList, isLoading } = useGetAllKendaraan();

  const handlePressDetail = useCallback((id: string) => {
    router.push(`/(beranda)/kendaraan/${id}`);
  }, [router]);
  
  const handlePressAdd = useCallback(() => {
    router.push("/(beranda)/kendaraan/create");
  }, [router]);

  return (
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
            kendaraanList.map((vehicle: Kendaraan) => (
              <VehicleCard 
                key={vehicle.kendaraan_id}
                name={`${vehicle.merek} ${vehicle.model}`} // Menggabungkan merek dan model
                year={vehicle.tahun.toString()}
                type={vehicle.warna || 'Standar'} // Menggunakan warna sebagai tipe, beri fallback jika kosong
                plate={vehicle.nomor_polisi}
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

    </ScrollView>
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
})
