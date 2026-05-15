import { Text, StyleSheet, ScrollView } from 'react-native'

// Import Komponen Modular dengan path yang benar
import HistoryCard from '../../../src/components/history/HistoryCard'
import EmptyState from '../../../src/components/history/EmptyState'

export default function HistoryScreen() {
  const isLogin = false // ubah sesuai kondisi
  const hasData = false // simulasi ada data / tidak

  // Data dummy
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
      <Text style={styles.title}>Riwayat Servis</Text>
      <Text style={styles.subtitle}>
        Riwayat semua servis kendaraan Anda
      </Text>

      {/* ===== KONDISI RENDER ===== */}
      {isLogin && hasData ? (
        data.map((item) => (
          <HistoryCard 
            key={item.id}
            title={item.title}
            code={item.code}
            services={item.services}
            date={item.date}
            price={item.price}
            status={item.status}
          />
        ))
      ) : (
        /* Panggil Komponen EmptyState */
        <EmptyState />
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
})