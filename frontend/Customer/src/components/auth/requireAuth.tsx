import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../../contexts/auth.context'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) return null

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.title}>Akses Terbatas</Text>
        <Text style={styles.message}>
          Anda perlu login terlebih dahulu untuk mengakses halaman ini.
        </Text>
        <TouchableOpacity
          style={styles.btnLogin}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.btnText}>Masuk Sekarang</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(beranda)/home')}>
          <Text style={styles.btnBack}>Kembali ke Beranda</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return <>{children}</>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#EEF2F7',
    gap: 12,
  },
  icon: { fontSize: 64 },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a2e' },
  message: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22 },
  btnLogin: {
    backgroundColor: '#3B7BF6',
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 12,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnBack: { color: '#3B7BF6', fontSize: 14, textDecorationLine: 'underline' },
})