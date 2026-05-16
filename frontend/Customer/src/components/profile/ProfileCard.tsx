import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../contexts/auth.context';
import { useRouter } from 'expo-router/build/exports';

// 1. Definisikan tipe data User yang akan diterima dari halaman profil
export interface UserData {
  user_id: string;
  nama: string;
  email: string;
  telepon?: string;
  role: string;
}

// 2. Tambahkan userData ke dalam Properties (Props)
interface ProfileCardProps {
  isLogin: boolean;
  userData?: UserData | null;
  vehicleCount?: number; 
}

export default function ProfileCard({ isLogin, userData, vehicleCount = 0 }: ProfileCardProps) {

    const router = useRouter();
    // const [isLoggedIn, setIsLoggedIn] = useState(false);
    // const handleLogout = () => setIsLoggedIn(false);
    // const handleLogin = () => setIsLoggedIn(true);
    const { token } = useAuth();
  
  // 3. Fungsi pembantu untuk membuat inisial dinamis
  const getInitials = (name?: string) => {
    if (!name) return 'U'; // Huruf U untuk User (jika nama kosong)
    const names = name.trim().split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  return (
    <View style={styles.card}>
      {/* 4. Pastikan isLogin true DAN data userData tersedia */}
      {isLogin && userData ? (
        <>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              {/* Tampilkan inisial secara dinamis */}
              <Text style={styles.avatarText}>{getInitials(userData.nama)}</Text>
            </View>

            <View>
              {/* Tampilkan data dinamis dengan fallback jika kosong */}
              <Text style={styles.name}>{userData.nama || 'Pengguna'}</Text>
              <Text style={styles.subText}>{userData.email || 'Email tidak tersedia'}</Text>
              <Text style={styles.subText}>{userData.telepon || '-'}</Text>
            </View>
          </View>

          {/* <View style={styles.stats}>
            <View style={styles.statItem}>
              <Ionicons name="bicycle-outline" size={22} color="#3B7BF6" />
              <Text style={styles.statNumber}>{vehicleCount}</Text>
              <Text style={styles.statLabel}>Kendaraan</Text>
            </View>
          </View> */}
        </>
      ) : (
        <TouchableOpacity style={styles.loginBox} onPress={() => router.push('/(auth)/login')}>
            <Ionicons name="person-circle-outline" size={60} color="#3B7BF6" />
            <Text style={[styles.loginText, { textDecorationLine: 'underline' }]}>Ketuk untuk masuk</Text>
          </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
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
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
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
})