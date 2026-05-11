import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ProfileCardProps {
  isLogin: boolean;
}

export default function ProfileCard({ isLogin }: ProfileCardProps) {
  return (
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

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Kendaraan</Text>
            </View>

            <View style={styles.statDivider} />

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