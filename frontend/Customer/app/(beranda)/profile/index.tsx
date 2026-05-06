import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function ProfileScreen() {
  const isLogin = true // ubah false untuk lihat "Ketuk untuk masuk"

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Profil Saya</Text>
        <Ionicons name="create-outline" size={22} color="#3B7BF6" />
      </View>

      {/* PROFILE CARD */}
      <View style={styles.card}>
        {isLogin ? (
          <>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>BS</Text>
              </View>

              <View>
                <Text style={styles.name}>Budi Santoso</Text>
                <Text style={styles.subText}>budi@gmail.com</Text>
                <Text style={styles.subText}>08123456789</Text>
              </View>
            </View>

            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Total Servis</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>Kendaraan</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>450</Text>
                <Text style={styles.statLabel}>Poin Reward</Text>
              </View>
            </View>
          </>
        ) : (
          <TouchableOpacity style={styles.loginBox}>
            <Ionicons name="person-circle-outline" size={60} color="#3B7BF6" />
            <Text style={styles.loginText}>Ketuk untuk masuk</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ===== KONTEN SETELAH LOGIN ===== */}
      {isLogin && (
        <>
          {/* KENDARAAN */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kendaraan Saya</Text>
            <Text style={styles.link}>Lihat semua</Text>
          </View>

          {[1, 2].map((item, index) => (
            <View key={index} style={styles.vehicleCard}>
              <View style={styles.vehicleRow}>
                
                <Ionicons name="car-outline" size={30} color="#3B7BF6" />

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.vehicleName}>
                    {index === 0 ? 'Honda Vario 150' : 'Yamaha NMAX 155'}
                  </Text>
                  <Text style={styles.subText}>Tahun 2022 · 4-tak</Text>
                  <Text style={styles.plate}>
                    {index === 0 ? 'D 1234 ABC' : 'B 5678 XYZ'}
                  </Text>
                </View>

                <View>
                  <TouchableOpacity style={styles.btnEdit}>
                    <Text style={styles.textEdit}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.btnDelete}>
                    <Text style={styles.textDelete}>Hapus</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          ))}

          {/* TAMBAH */}
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addText}>+ Tambah Kendaraan</Text>
          </TouchableOpacity>

          {/* MENU */}
          <View style={styles.menuContainer}>

            <View style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <Ionicons name="notifications-outline" size={20} color="#f4b400" />
                <Text style={styles.menuText}>Notifikasi</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </View>

            <View style={styles.divider} />

            <View style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <Ionicons name="document-text-outline" size={20} color="#888" />
                <Text style={styles.menuText}>Syarat & Ketentuan</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </View>

            <View style={styles.divider} />

            <View style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <Ionicons name="help-circle-outline" size={20} color="#e74c3c" />
                <Text style={styles.menuText}>Bantuan</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </View>

          </View>

          {/* LOGOUT */}
          <TouchableOpacity style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Keluar dari Akun</Text>
          </TouchableOpacity>

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

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },

  profileRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B7BF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },

  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  subText: {
    color: '#666',
  },

  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statItem: {
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B7BF6',
  },

  statLabel: {
    fontSize: 12,
    color: '#777',
  },

  loginBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },

  loginText: {
    marginTop: 10,
    fontSize: 14,
    color: '#3B7BF6',
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

  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  vehicleName: {
    fontWeight: 'bold',
  },

  plate: {
    backgroundColor: '#e6f0ff',
    color: '#3B7BF6',
    paddingHorizontal: 6,
    borderRadius: 6,
    marginTop: 4,
  },

  btnEdit: {
    borderWidth: 1,
    borderColor: '#3B7BF6',
    padding: 6,
    borderRadius: 6,
    marginBottom: 6,
  },

  textEdit: {
    color: '#3B7BF6',
    fontSize: 12,
  },

  btnDelete: {
    backgroundColor: '#e74c3c',
    padding: 6,
    borderRadius: 6,
  },

  textDelete: {
    color: '#fff',
    fontSize: 12,
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

  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 10,
    overflow: 'hidden',
  },

  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  menuText: {
    fontSize: 14,
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 16,
  },

  logoutButton: {
    marginTop: 20,
    backgroundColor: '#e74c3c',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
})