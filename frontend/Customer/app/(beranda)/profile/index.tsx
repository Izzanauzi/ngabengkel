import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

// Import Komponen Modular
import ProfileCard from '../../../src/components/profile/ProfileCard'
import VehicleCard from '../../../src/components/profile/VehicleCard'
import MenuList from '../../../src/components/profile/MenuList'
import LogoutButton from '../../../src/components/profile/LogoutButton'

export default function ProfileScreen() {
  const isLogin = true // ubah false untuk lihat "Ketuk untuk masuk"

  // Data dummy kendaraan untuk dirender secara dinamis
  const myVehicles = [
    { id: '1', name: 'Honda Vario 150', year: '2022', type: '4-tak', plate: 'D 1234 ABC' },
    { id: '2', name: 'Yamaha NMAX 155', year: '2021', type: '4-tak', plate: 'B 5678 XYZ' },
  ]

  return (
    <ScrollView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Profil Saya</Text>
        <Ionicons name="create-outline" size={22} color="#3B7BF6" />
      </View>

      {/* Panggil Komponen ProfileCard */}
      <ProfileCard isLogin={isLogin} />

      {/* ===== KONTEN SETELAH LOGIN ===== */}
      {isLogin && (
        <>
          {/* KENDARAAN HEADER */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kendaraan Saya</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.link}>Lihat semua </Text>
              <Ionicons name="chevron-forward" size={14} color="#3B7BF6" />
            </TouchableOpacity>
          </View>

          {/* LIST KENDARAAN - Menggunakan Map dari data dummy */}
          {myVehicles.map((vehicle) => (
            <VehicleCard 
              key={vehicle.id}
              name={vehicle.name}
              year={vehicle.year}
              type={vehicle.type}
              plate={vehicle.plate}
            />
          ))}

          {/* TOMBOL TAMBAH KENDARAAN */}
          <TouchableOpacity style={styles.addButton}>
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