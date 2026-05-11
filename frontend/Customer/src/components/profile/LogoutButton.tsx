import { Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function LogoutButton() {
  return (
    <TouchableOpacity style={styles.logoutButton}>
      <Ionicons name="log-out-outline" size={20} color="#fff" />
      <Text style={styles.logoutText}>Keluar dari Akun</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
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