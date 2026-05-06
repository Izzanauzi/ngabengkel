import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function HistoryScreen() {
  const isLogin = true // ubah sesuai kondisi
  const hasData = true // simulasi ada data / tidak

  const data = [
    {
      id: 1,
      title: 'Honda Beat 2020',
      code: 'WO-20250715-002',
      services: ['Ganti oli mesin', 'Tune up'],
      date: '15 Jul 2025',
      price: 'Rp 180.000',
      status: 'Selesai',
    },
    {
      id: 2,
      title: 'Honda Vario 150',
      code: 'WO-20250601-003',
      services: ['Ganti ban depan', 'Periksa rem'],
      date: '01 Jun 2025',
      price: 'Rp 350.000',
      status: 'Selesai',
    },
  ]

  return (
    <ScrollView style={styles.container}>
      
      {/* HEADER */}
      <Text style={styles.title}>Histori Servis</Text>
      <Text style={styles.subtitle}>
        Riwayat semua servis kendaraan Anda
      </Text>

      {/* ===== KONDISI ===== */}
      {isLogin && hasData ? (
        data.map((item) => (
          <View key={item.id} style={styles.card}>

            {/* HEADER CARD */}
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.vehicle}>{item.title}</Text>
                <Text style={styles.code}>{item.code}</Text>
              </View>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>✓ {item.status}</Text>
              </View>
            </View>

            {/* LIST SERVICE */}
            <View style={styles.list}>
              {item.services.map((srv, index) => (
                <Text key={index} style={styles.serviceItem}>
                  • {srv}
                </Text>
              ))}
            </View>

            {/* FOOTER */}
            <View style={styles.footer}>
              <View>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.price}>{item.price}</Text>
              </View>

              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Lihat Detail</Text>
              </TouchableOpacity>
            </View>

          </View>
        ))
      ) : (
        /* ===== EMPTY STATE ===== */
        <View style={styles.emptyBox}>
          <Ionicons name="clipboard-outline" size={50} color="#bbb" />
          <Text style={styles.emptyText}>Belum ada riwayat servis</Text>
        </View>
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

  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#777',
    marginBottom: 16,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  vehicle: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  code: {
    color: '#888',
    fontSize: 12,
  },

  badge: {
    backgroundColor: '#e6f7ec',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  badgeText: {
    color: '#2ecc71',
    fontSize: 12,
  },

  list: {
    marginVertical: 10,
  },

  serviceItem: {
    color: '#555',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  date: {
    color: '#888',
    fontSize: 12,
  },

  price: {
    color: '#3B7BF6',
    fontWeight: 'bold',
    fontSize: 16,
  },

  button: {
    borderWidth: 1,
    borderColor: '#3B7BF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  buttonText: {
    color: '#3B7BF6',
    fontSize: 12,
  },

  /* EMPTY STATE */
  emptyBox: {
    marginTop: 50,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
  },

  emptyText: {
    marginTop: 10,
    color: '#999',
  },
})